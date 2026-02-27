import app from './app.js';
import logger from './utils/logger.js';
import { validateEnvironment } from './utils/envValidator.js';

// Validate environment before starting
validateEnvironment();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`, {
    env: process.env.NODE_ENV || 'development',
    port: PORT,
    timestamp: new Date().toISOString(),
  });

  // Log service endpoints
  logger.info('📍 Service Endpoints:', {
    api_server: `http://localhost:${PORT}`,
    frontend: process.env.FRONTEND_URL || 'http://localhost:5173',
    ml_service: process.env.ML_SERVICE_URL || 'http://localhost:8000',
    health_check: `http://localhost:${PORT}/health`,
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('❌ Uncaught Exception:', {
    message: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('❌ Unhandled Rejection:', {
    reason,
    promise: promise.toString(),
  });
  process.exit(1);
});

