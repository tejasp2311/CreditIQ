import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import loanRoutes from './routes/loanRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import { errorHandler } from './utils/errors.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import logger from './utils/logger.js';
import { checkMLServiceHealth } from './services/mlService.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Rate limiting
app.use('/api', apiLimiter);

// Health check endpoint (includes dependency checks)
app.get('/health', async (req, res) => {
  try {
    const mlHealthy = await checkMLServiceHealth();
    
    res.status(200).json({
      success: true,
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      services: {
        api: 'healthy',
        ml_service: mlHealthy ? 'healthy' : 'unhealthy',
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message,
    });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/audit', auditRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Error handler
app.use(errorHandler);

export default app;

