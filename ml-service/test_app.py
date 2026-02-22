import pytest
from fastapi.testclient import TestClient
from app import app

client = TestClient(app)

def test_root_endpoint():
    """Test the root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    assert "service" in response.json()
    assert response.json()["status"] == "operational"

def test_health_endpoint():
    """Test the health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
    assert "model_version" in response.json()

def test_predict_endpoint_valid_data():
    """Test prediction with valid data"""
    payload = {
        "income": 500000,
        "loanAmount": 2000000,
        "tenure": 60,
        "employmentType": "SALARIED",
        "existingEmis": 15000,
        "creditScore": 750,
        "age": 35,
        "dependents": 2
    }
    
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    
    data = response.json()
    assert "probability" in data
    assert "risk_band" in data
    assert "explanations" in data
    assert "model_version" in data
    assert 0 <= data["probability"] <= 1
    assert data["risk_band"] in ["LOW", "MEDIUM", "HIGH"]

def test_predict_endpoint_invalid_credit_score():
    """Test prediction with invalid credit score"""
    payload = {
        "income": 500000,
        "loanAmount": 2000000,
        "tenure": 60,
        "employmentType": "SALARIED",
        "existingEmis": 15000,
        "creditScore": 900,  # Invalid: max 850
        "age": 35,
        "dependents": 2
    }
    
    response = client.post("/predict", json=payload)
    assert response.status_code == 422  # Validation error

def test_predict_endpoint_negative_income():
    """Test prediction with negative income"""
    payload = {
        "income": -500000,
        "loanAmount": 2000000,
        "tenure": 60,
        "employmentType": "SALARIED",
        "existingEmis": 15000,
        "creditScore": 750,
        "age": 35,
        "dependents": 2
    }
    
    response = client.post("/predict", json=payload)
    assert response.status_code == 422  # Validation error
