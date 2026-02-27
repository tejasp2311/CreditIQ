import logger from './logger.js';

/**
 * Validates that all required environment variables are set
 * Exit with clear error message if validation fails
 * This ensures we fail fast at startup, not during request handling
 */
export const validateEnvironment = () => {
  const requiredEnvVars = {
    DATABASE_URL: 'PostgreSQL connection string',
    JWT_SECRET: 'JWT signing secret key',
  };

  const optionalEnvVars = {
    ML_SERVICE_URL: 'Python ML service endpoint',
    PORT: 'Server port',
    NODE_ENV: 'Environment (development/production)',
    FRONTEND_URL: 'Frontend application URL',
  };

  const missingVars = [];
  const warnings = [];

  // Check required variables
  Object.entries(requiredEnvVars).forEach(([key, description]) => {
    if (!process.env[key]) {
      missingVars.push(`${key} - ${description}`);
    }
  });

  // Check optional variables with defaults
  Object.entries(optionalEnvVars).forEach(([key, description]) => {
    if (!process.env[key]) {
      const defaults = {
        ML_SERVICE_URL: 'http://localhost:8000',
        PORT: '5000',
        NODE_ENV: 'development',
        FRONTEND_URL: 'http://localhost:5173',
      };
      warnings.push(`${key} not set, using default: ${defaults[key]}`);
    }
  });

  // Exit if required variables are missing
  if (missingVars.length > 0) {
    console.error('❌ FATAL: Missing required environment variables:\n');
    missingVars.forEach(v => console.error(`   • ${v}`));
    console.error('\n📝 Create a .env file in the server directory with:\n');
    console.error('   DATABASE_URL=postgresql://user:password@localhost:5432/fintech_loans');
    console.error('   JWT_SECRET=your-secret-key-change-in-production\n');
    process.exit(1);
  }

  // Log warnings for optional variables
  if (warnings.length > 0) {
    logger.warn('Optional environment variables using defaults:', warnings);
  }

  // Validate JWT_SECRET strength (for resume projects, still good practice)
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    logger.warn('⚠️  JWT_SECRET is short. Consider using a stronger secret (32+ characters)');
  }

  // Log environment summary
  logger.info('✅ Environment validation passed', {
    node_env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5000,
    frontend_url: process.env.FRONTEND_URL || 'http://localhost:5173',
    ml_service_url: process.env.ML_SERVICE_URL || 'http://localhost:8000',
  });

  return true;
};
