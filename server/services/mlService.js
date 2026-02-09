import logger from '../utils/logger.js';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

/**
 * Calls the ML service to get risk prediction
 */
export const getMLPrediction = async (applicationData) => {
  try {
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

