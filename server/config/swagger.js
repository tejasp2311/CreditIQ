import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CreditIQ - Loan Underwriting Platform API',
      version: '1.0.0',
      description: 'AI-Powered Credit Risk & Loan Underwriting Platform REST API',
      contact: {
        name: 'CreditIQ Support',
        email: 'support@creditiq.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
      {
        url: 'http://localhost:5000/api',
        description: 'Development API',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token obtained from login endpoint',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            role: { type: 'string', enum: ['USER', 'ADMIN'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        LoanApplication: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            status: {
              type: 'string',
              enum: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'],
            },
            income: { type: 'number', minimum: 0 },
            loanAmount: { type: 'number', minimum: 0 },
            tenure: { type: 'integer', minimum: 1 },
            employmentType: { type: 'string' },
            existingEmis: { type: 'number', minimum: 0 },
            creditScore: { type: 'integer', minimum: 300, maximum: 850 },
            age: { type: 'integer', minimum: 18 },
            dependents: { type: 'integer', minimum: 0 },
            submittedAt: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        LoanDecision: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            applicationId: { type: 'string', format: 'uuid' },
            decision: { type: 'string', enum: ['APPROVED', 'REJECTED'] },
            probability: { type: 'number', nullable: true },
            riskBand: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'], nullable: true },
            policyPassed: { type: 'boolean' },
            policyReason: { type: 'string', nullable: true },
            modelVersion: { type: 'string', nullable: true },
            explanations: {
              type: 'array',
              nullable: true,
              items: {
                type: 'object',
                properties: {
                  feature: { type: 'string' },
                  impact: { type: 'string' },
                  value: { type: 'number' },
                  contribution: { type: 'number' },
                },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        AuditLog: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            actorId: { type: 'string', format: 'uuid', nullable: true },
            action: { type: 'string' },
            entityType: { type: 'string', nullable: true },
            entityId: { type: 'string', format: 'uuid', nullable: true },
            metadata: { type: 'object', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string' },
            details: { type: 'array', items: { type: 'object' } },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' },
            message: { type: 'string' },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        ForbiddenError: {
          description: 'User does not have permission',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/*.js'], // Path to the API routes
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
