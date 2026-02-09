# API Reference

Base URL: `http://localhost:5000/api`

## Authentication

All endpoints except `/auth/register` and `/auth/login` require a Bearer token in the Authorization header:

```
Authorization: Bearer <token>
```

## Endpoints

### POST /auth/register

Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "USER"
    },
    "token": "jwt-token"
  }
}
```

### POST /auth/login

Login user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "USER"
    },
    "token": "jwt-token"
  }
}
```

### GET /auth/me

Get current authenticated user.

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "USER"
    }
  }
}
```

### POST /loans

Create a new loan application (DRAFT status).

**Request Body:**
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

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "status": "DRAFT",
    "income": 500000,
    "loanAmount": 2000000,
    "tenure": 60,
    "employmentType": "SALARIED",
    "existingEmis": 15000,
    "creditScore": 750,
    "age": 35,
    "dependents": 2,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### GET /loans

Get all loan applications for the current user (or all applications if ADMIN).

**Query Parameters:**
- `status` (optional): Filter by status (DRAFT, SUBMITTED, APPROVED, REJECTED)
- `limit` (optional): Limit results
- `skip` (optional): Skip results

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "status": "APPROVED",
      "income": 500000,
      "loanAmount": 2000000,
      "decisions": [
        {
          "id": "uuid",
          "decision": "APPROVED",
          "probability": 0.25,
          "riskBand": "LOW",
          "policyPassed": true,
          "modelVersion": "v1.0",
          "explanations": [
            {
              "feature": "credit_score",
              "impact": "positive",
              "value": 750,
              "contribution": -0.15
            }
          ]
        }
      ]
    }
  ],
  "count": 1
}
```

### GET /loans/:id

Get a specific loan application by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "APPROVED",
    "income": 500000,
    "loanAmount": 2000000,
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "decisions": [...]
  }
}
```

### PATCH /loans/:id

Update a DRAFT loan application.

**Request Body:** (same as POST /loans, all fields optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "DRAFT",
    ...
  }
}
```

### POST /loans/:id/submit

Submit a loan application for evaluation.

**Response:**
```json
{
  "success": true,
  "data": {
    "application": {
      "id": "uuid",
      "status": "APPROVED",
      ...
    },
    "decision": {
      "id": "uuid",
      "decision": "APPROVED",
      "probability": 0.25,
      "riskBand": "LOW",
      "policyPassed": true,
      "modelVersion": "v1.0",
      "explanations": [...]
    }
  }
}
```

### GET /audit (ADMIN only)

Get audit logs.

**Query Parameters:**
- `actorId` (optional): Filter by user ID
- `entityType` (optional): Filter by entity type
- `entityId` (optional): Filter by entity ID
- `action` (optional): Filter by action
- `startDate` (optional): Filter by start date
- `endDate` (optional): Filter by end date
- `limit` (optional): Limit results
- `skip` (optional): Skip results

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "action": "LOAN_SUBMITTED",
      "entityType": "LoanApplication",
      "entityId": "uuid",
      "user": {
        "id": "uuid",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe"
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "details": [...] // Optional validation errors
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## ML Service Endpoint

### POST http://localhost:8000/predict

**Request Body:**
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

**Response:**
```json
{
  "probability": 0.25,
  "risk_band": "LOW",
  "explanations": [
    {
      "feature": "credit_score",
      "impact": "positive",
      "value": 750,
      "contribution": -0.15
    }
  ],
  "model_version": "v1.0"
}
```

