import express from 'express';
import { getLogs } from '../controllers/auditController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Only admins can view audit logs
router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/', getLogs);

export default router;

