import express from 'express';
import { logExpenditure, getExpenditureHistory } from '../controllers/expenditureController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

import {
  authorizeRoles,
  enforceBaseScope
} from '../middlewares/rbacMiddleware.js';

const router = express.Router();

// Record consumed/expended assets (ADMIN & BASE_COMMANDER only)
router.post(
  '/',
  authenticateToken,
  authorizeRoles('ADMIN', 'BASE_COMMANDER'),
  logExpenditure
);

// Fetch expenditure history
router.get(
  '/',
  authenticateToken,
  enforceBaseScope,
  getExpenditureHistory
);

export default router;