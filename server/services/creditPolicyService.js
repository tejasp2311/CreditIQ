import logger from '../utils/logger.js';

/**
 * Evaluates credit policy rules before ML evaluation
 * Returns { passed: boolean, reason: string | null }
 */
export const evaluateCreditPolicy = (application) => {
  const { income, loanAmount, creditScore, age, existingEmis } = application;

  // Rule 1: Credit score must be at least 550
  if (creditScore < 550) {
    logger.info('Policy rejection: Low credit score', { creditScore });
    return {
      passed: false,
      reason: 'Credit score below minimum threshold (550)',
    };
  }

  // Rule 2: Age must be at least 21
  if (age < 21) {
    logger.info('Policy rejection: Age below minimum', { age });
    return {
      passed: false,
      reason: 'Applicant age below minimum threshold (21 years)',
    };
  }

  // Rule 3: Income must be at least 15000
  if (income < 15000) {
    logger.info('Policy rejection: Income below minimum', { income });
    return {
      passed: false,
      reason: 'Income below minimum threshold (₹15,000)',
    };
  }

  // Rule 4: Debt-to-income ratio must not exceed 65%
  const monthlyIncome = income / 12;
  const monthlyDebt = existingEmis;
  const debtToIncomeRatio = (monthlyDebt / monthlyIncome) * 100;

  if (debtToIncomeRatio > 65) {
    logger.info('Policy rejection: High debt-to-income ratio', {
      debtToIncomeRatio: debtToIncomeRatio.toFixed(2),
    });
    return {
      passed: false,
      reason: `Debt-to-income ratio exceeds maximum threshold (${debtToIncomeRatio.toFixed(2)}% > 65%)`,
    };
  }

  logger.info('Credit policy passed', {
    creditScore,
    age,
    income,
    debtToIncomeRatio: debtToIncomeRatio.toFixed(2),
  });

  return {
    passed: true,
    reason: null,
  };
};

