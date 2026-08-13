import express from 'express';
import { createTransfer, getTransferHistory } from '../controllers/transferController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

import {
  authorizeRoles,
  enforceBaseScope
} from '../middlewares/rbacMiddleware.js';
const router = express.Router();

// BASE_COMMANDER, LOGISTICS_OFFICER, and ADMIN can initiate transfers
router.post(
  '/',
  authenticateToken,
  authorizeRoles('ADMIN', 'LOGISTICS_OFFICER', 'BASE_COMMANDER'),
  createTransfer
);

// Get movement history across bases
router.get(
  '/',
  authenticateToken,
  enforceBaseScope,
  getTransferHistory
);

export default router;