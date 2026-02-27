import logger from '../utils/logger.js';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
let mlServiceHealthy = null;
let lastHealthCheckTime = null;

/**
 * Check if ML service is healthy
 * Cache result for 30 seconds to avoid excessive health checks
 */
export const checkMLServiceHealth = async () => {
  const now = Date.now();
  
  // Return cached result if checked within last 30 seconds
  if (mlServiceHealthy !== null && lastHealthCheckTime && (now - lastHealthCheckTime) < 30000) {
    return mlServiceHealthy;
  }

  try {
    const response = await fetch(`${ML_SERVICE_URL}/health`, {
      method: 'GET',
      timeout: 5000,
    });

    mlServiceHealthy = response.ok;
    lastHealthCheckTime = now;

    if (mlServiceHealthy) {
      logger.info('✅ ML Service is healthy');
    } else {
      logger.warn(`⚠️  ML Service health check failed: ${response.status}`);
    }

    return mlServiceHealthy;
  } catch (error) {
    logger.warn('⚠️  ML Service health check failed', {
      error: error.message,
      url: ML_SERVICE_URL,
    });
    mlServiceHealthy = false;
    lastHealthCheckTime = now;
    return false;
  }
};

/**
 * Calls the ML service to get risk prediction
 */
export const getMLPrediction = async (applicationData) => {
  try {
    // Check if ML service is available
    const isHealthy = await checkMLServiceHealth();
    if (!isHealthy) {
      throw new Error('ML service is not available. Rejecting application.');
    }

    const response = await fetch(`${ML_SERVICE_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        income: applicationData.income,
        loanAmount: applicationData.loanAmount,
        tenure: applicationData.tenure,
        employmentType: applicationData.employmentType,
        existingEmis: applicationData.existingEmis,
        creditScore: applicationData.creditScore,
        age: applicationData.age,
        dependents: applicationData.dependents,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('ML service error', {
        status: response.status,
        error: errorText,
      });
      throw new Error(`ML service error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    logger.info('ML prediction received', {
      probability: result.probability,
      riskBand: result.risk_band,
    });

    return result;
  } catch (error) {
    logger.error('Failed to call ML service', { error: error.message });
    throw error;
  }
};

