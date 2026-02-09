from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict
import numpy as np
import joblib
import shap
import os
from datetime import datetime

app = FastAPI(title="Loan Risk Prediction Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response models
class LoanApplicationRequest(BaseModel):
    income: float = Field(..., gt=0, description="Annual income")
    loanAmount: float = Field(..., gt=0, description="Requested loan amount")
    tenure: int = Field(..., gt=0, description="Loan tenure in months")
    employmentType: str = Field(..., description="Employment type")
    existingEmis: float = Field(..., ge=0, description="Existing EMIs")
    creditScore: int = Field(..., ge=300, le=850, description="Credit score")
    age: int = Field(..., gt=0, description="Applicant age")
    dependents: int = Field(..., ge=0, description="Number of dependents")

class FeatureExplanation(BaseModel):
    feature: str
    impact: str  # "positive" or "negative"
    value: float
    contribution: float

class PredictionResponse(BaseModel):
    probability: float = Field(..., ge=0, le=1, description="Default probability")
    risk_band: str = Field(..., description="Risk band: LOW, MEDIUM, or HIGH")
    explanations: List[FeatureExplanation]
    model_version: str

# Load or create model
MODEL_PATH = "model.pkl"
MODEL_VERSION = "v1.0"

def create_and_train_model():
    """
    Creates a simple trained model for demonstration.
    In production, this would be trained on real data.
    """
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.preprocessing import LabelEncoder
    
    # Generate synthetic training data
    np.random.seed(42)
    n_samples = 1000
    
    # Feature ranges based on typical loan applications
    income = np.random.uniform(15000, 200000, n_samples)
    loan_amount = np.random.uniform(50000, 5000000, n_samples)
    tenure = np.random.randint(12, 120, n_samples)
    employment_types = ['SALARIED', 'SELF_EMPLOYED', 'BUSINESS']
    employment_type = np.random.choice(employment_types, n_samples)
    existing_emis = np.random.uniform(0, 50000, n_samples)
    credit_score = np.random.randint(300, 850, n_samples)
    age = np.random.randint(21, 70, n_samples)
    dependents = np.random.randint(0, 5, n_samples)
    
    # Encode employment type
    le = LabelEncoder()
    employment_encoded = le.fit_transform(employment_type)
    
    # Calculate debt-to-income ratio
    monthly_income = income / 12
    debt_to_income = (existing_emis / monthly_income) * 100
    
    # Create features
    X = np.column_stack([
        income,
        loan_amount,
        tenure,
        employment_encoded,
        existing_emis,
        credit_score,
        age,
        dependents,
        debt_to_income,
        loan_amount / income,  # Loan-to-income ratio
    ])
    
    # Create target (default probability)
    # Higher risk if: low credit score, high debt-to-income, high loan-to-income
    default_prob = (
        0.3 * (1 - (credit_score - 300) / 550) +  # Credit score impact
        0.3 * np.clip(debt_to_income / 100, 0, 1) +  # Debt-to-income impact
        0.2 * np.clip((loan_amount / income) / 5, 0, 1) +  # Loan-to-income impact
        0.2 * np.random.random(n_samples)  # Random component
    )
    y = (default_prob > 0.5).astype(int)
    
    # Train model
    model = RandomForestClassifier(n_estimators=100, random_state=42, max_depth=10)
    model.fit(X, y)
    
    # Save model and label encoder
    joblib.dump({
        'model': model,
        'label_encoder': le,
        'feature_names': [
            'income', 'loan_amount', 'tenure', 'employment_type',
            'existing_emis', 'credit_score', 'age', 'dependents',
            'debt_to_income', 'loan_to_income'
        ]
    }, MODEL_PATH)
    
    return model, le

def load_model():
    """Load model from file or create if it doesn't exist"""
    if os.path.exists(MODEL_PATH):
        data = joblib.load(MODEL_PATH)
        return data['model'], data['label_encoder'], data['feature_names']
    else:
        model, le = create_and_train_model()
        data = joblib.load(MODEL_PATH)
        return data['model'], data['label_encoder'], data['feature_names']

# Load model on startup
model, label_encoder, feature_names = load_model()

# Create SHAP explainer (TreeExplainer for RandomForest)
explainer = shap.TreeExplainer(model)

def encode_employment_type(emp_type: str) -> int:
    """Encode employment type"""
    try:
        return label_encoder.transform([emp_type])[0]
    except ValueError:
        # If new employment type, use most common
        return label_encoder.transform(['SALARIED'])[0]

def prepare_features(request: LoanApplicationRequest) -> np.ndarray:
    """Prepare features for model prediction"""
    monthly_income = request.income / 12
    debt_to_income = (request.existingEmis / monthly_income) * 100 if monthly_income > 0 else 0
    loan_to_income = request.loanAmount / request.income if request.income > 0 else 0
    
    employment_encoded = encode_employment_type(request.employmentType)
    
    features = np.array([[
        request.income,
        request.loanAmount,
        request.tenure,
        employment_encoded,
        request.existingEmis,
        request.creditScore,
        request.age,
        request.dependents,
        debt_to_income,
        loan_to_income,
    ]])
    
    return features

def get_risk_band(probability: float) -> str:
    """Determine risk band based on probability"""
    if probability < 0.3:
        return "LOW"
    elif probability < 0.6:
        return "MEDIUM"
    else:
        return "HIGH"

@app.get("/")
def root():
    return {
        "service": "Loan Risk Prediction Service",
        "version": MODEL_VERSION,
        "status": "operational"
    }

@app.get("/health")
def health():
    return {"status": "healthy", "model_version": MODEL_VERSION}

@app.post("/predict", response_model=PredictionResponse)
def predict(request: LoanApplicationRequest):
    """
    Predict loan default risk and provide explanations
    """
    try:
        # Prepare features
        features = prepare_features(request)
        
        # Get prediction probability
        probability = model.predict_proba(features)[0][1]  # Probability of default (class 1)
        
        # Get SHAP values for explanations
        shap_values = explainer.shap_values(features)[1]  # SHAP values for class 1
        
        # Determine risk band
        risk_band = get_risk_band(probability)
        
        # Create feature explanations
        explanations = []
        feature_values = features[0]
        
        # Map SHAP values to feature explanations
        for i, (feature_name, shap_value, feature_value) in enumerate(
            zip(feature_names, shap_values, feature_values)
        ):
            impact = "positive" if shap_value < 0 else "negative"
            explanations.append(FeatureExplanation(
                feature=feature_name,
                impact=impact,
                value=float(feature_value),
                contribution=float(shap_value)
            ))
        
        # Sort by absolute contribution (most impactful first)
        explanations.sort(key=lambda x: abs(x.contribution), reverse=True)
        
        return PredictionResponse(
            probability=float(probability),
            risk_band=risk_band,
            explanations=explanations,
            model_version=MODEL_VERSION
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

