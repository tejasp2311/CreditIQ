import { describe, it, expect, beforeEach } from '@jest/globals';
import { validateLoanApplication } from '../middleware/validation.js';

// Mock request and response
const mockRequest = (body) => ({ body });
const mockResponse = () => {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.body = data;
    return res;
  };
  return res;
};
const mockNext = () => {};

describe('Validation Middleware', () => {
  describe('validateLoanApplication', () => {
    it('should pass validation with valid data', () => {
      const req = mockRequest({
        income: 500000,
        loanAmount: 2000000,
        tenure: 60,
        employmentType: 'SALARIED',
        existingEmis: 15000,
        creditScore: 750,
        age: 35,
        dependents: 2,
      });
      const res = mockResponse();
      const next = mockNext;

      validateLoanApplication(req, res, next);
      
      // If validation passes, next() is called without modifying response
      expect(res.statusCode).toBeUndefined();
    });

    it('should fail validation with negative income', () => {
      const req = mockRequest({
        income: -500000,
        loanAmount: 2000000,
        tenure: 60,
        employmentType: 'SALARIED',
        existingEmis: 15000,
        creditScore: 750,
        age: 35,
        dependents: 2,
      });
      const res = mockResponse();
      const next = mockNext;

      validateLoanApplication(req, res, next);
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('success', false);
    });

    it('should fail validation with invalid credit score', () => {
      const req = mockRequest({
        income: 500000,
        loanAmount: 2000000,
        tenure: 60,
        employmentType: 'SALARIED',
        existingEmis: 15000,
        creditScore: 900, // Invalid: max 850
        age: 35,
        dependents: 2,
      });
      const res = mockResponse();
      const next = mockNext;

      validateLoanApplication(req, res, next);
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('success', false);
    });
  });
});
