import express from 'express';
import {
  createApplication,
  updateApplication,
  submitApplication,
  getApplications,
  getApplication,
} from '../controllers/loanController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { z } from 'zod';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

const applicationSchema = z.object({
  body: z.object({
    income: z.number().positive(),
    loanAmount: z.number().positive(),
    tenure: z.number().int().positive(),
    employmentType: z.string().min(1),
    existingEmis: z.number().nonnegative(),
    creditScore: z.number().int().min(300).max(850),
    age: z.number().int().positive(),
    dependents: z.number().int().nonnegative(),
  }),
});

router.post('/', validate(applicationSchema), createApplication);
router.get('/', getApplications);
router.get('/:id', getApplication);
router.patch('/:id', validate(applicationSchema), updateApplication);
router.post('/:id/submit', submitApplication);

export default router;

