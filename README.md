# AI-Powered Credit Risk & Loan Underwriting Platform

A production-quality FinTech application for automated loan underwriting with AI-powered risk assessment, credit policy enforcement, and comprehensive audit logging.

## 🏗️ Architecture

```
React Frontend (localhost:5173)
    ↓
Node.js/Express API (localhost:5000)
    ↓
PostgreSQL Database
    ↓
Python FastAPI ML Service (localhost:8000)
```

## 🚀 Tech Stack

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database
- **Prisma ORM** for database management
- **JWT** for authentication
- **bcrypt** for password hashing
- **Zod** for validation
- **Winston** for logging
- **express-rate-limit** for API protection

### ML Service
- **Python** with FastAPI
- **scikit-learn** for machine learning
- **SHAP** for explainable AI

### Frontend
- **React** (JavaScript)
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Vite** as build tool

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- Python (v3.9 or higher)
- npm or yarn

## 🔧 Setup Instructions

### 1. Database Setup

Create a PostgreSQL database:

```bash
createdb fintech_loans
```

Or using psql:

```sql
CREATE DATABASE fintech_loans;
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/fintech_loans?schema=public"
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
ML_SERVICE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
```

Generate Prisma client and run migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

Start the backend server:

```bash
npm start
# or for development with auto-reload
npm run dev
```

### 3. ML Service Setup

```bash
cd ml-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Start the ML service:

```bash
python app.py
# or
uvicorn app:app --host 0.0.0.0 --port 8000
```

The ML service will automatically create and train a model on first run.

### 4. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory (optional):

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

## 📁 Project Structure

```
Fintech/
├── server/                 # Node.js backend
│   ├── controllers/       # Request handlers
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── middleware/        # Auth, validation, rate limiting
│   ├── utils/             # Utilities (logger, errors)
│   └── prisma/            # Database schema
├── frontend/              # React frontend
│   └── src/
│       ├── components/    # Reusable components
│       ├── pages/         # Page components
│       ├── services/      # API client
│       └── context/       # React context
└── ml-service/            # Python ML service
    └── app.py             # FastAPI application
```

## 🔐 Features

### Authentication
- User registration and login
- JWT-based authentication
- Role-based access control (USER, ADMIN)
- Secure password hashing with bcrypt

### Loan Application Lifecycle
- **DRAFT**: Application can be edited
- **SUBMITTED**: Application is locked and processed
- **UNDER_REVIEW**: Manual review (future feature)
- **APPROVED**: Loan approved
- **REJECTED**: Loan rejected

### Credit Policy Rules
Before ML evaluation, applications are checked against:
- Minimum credit score: 550
- Minimum age: 21 years
- Minimum income: ₹15,000
- Maximum debt-to-income ratio: 65%

### ML Risk Assessment
- Default probability prediction
- Risk band classification (LOW, MEDIUM, HIGH)
- SHAP-based feature explanations
- Model versioning

### Audit Logging
Comprehensive audit trail for:
- User registration and login
- Loan application creation and submission
- Policy rejections
- ML evaluations
- Decision creation
- Admin actions

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Loan Applications
- `POST /api/loans` - Create new application
- `GET /api/loans` - Get user's applications
- `GET /api/loans/:id` - Get application details
- `PATCH /api/loans/:id` - Update draft application
- `POST /api/loans/:id/submit` - Submit application

### Admin
- `GET /api/audit` - Get audit logs (ADMIN only)

## 🧪 Testing the Application

1. **Register a new user** at `/register`
2. **Create a loan application** with valid data
3. **Submit the application** - it will be evaluated automatically
4. **View the decision** with risk assessment and explanations

### Sample Application Data

```json
{
  "income": 500000,
  "loanAmount": 2000000,
  "tenure": 60,
  "employmentType": "SALARIED",
  "existingEmis": 15000,
  "creditScore": 750,
  "age": 35,
  "dependents": 2
}
```

## 🔒 Security Features

- Password hashing with bcrypt (12 rounds)
- JWT token authentication
- Rate limiting on authentication endpoints
- Input validation with Zod
- CORS protection
- SQL injection protection (Prisma)
- Audit logging for compliance

## 📊 Database Schema

- **User**: User accounts with roles
- **LoanApplication**: Loan application data
- **LoanDecision**: Decision records with ML results
- **AuditLog**: Comprehensive audit trail
- **ModelVersion**: ML model versioning

## 🚦 Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## 🛠️ Development

### Backend Development
```bash
cd server
npm run dev  # Auto-reload on changes
npm run prisma:studio  # Database GUI
```

### Frontend Development
```bash
cd frontend
npm run dev  # Vite dev server with HMR
```

### ML Service Development
```bash
cd ml-service
python app.py  # FastAPI with auto-reload
```

## 📝 Notes

- The ML model is trained on synthetic data for demonstration
- In production, replace with real trained models
- All sensitive data should be stored securely
- Environment variables should never be committed
- Use strong JWT secrets in production

## 📄 License

This project is for demonstration purposes.

## 👨‍💻 Development Best Practices

- Clean, modular code structure
- Separation of concerns (MVC pattern)
- Comprehensive error handling
- Input validation at all layers
- Professional logging
- Audit trail for compliance
- Production-ready code quality

---

Built with ❤️ for production-quality FinTech applications

