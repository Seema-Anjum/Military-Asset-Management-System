import express from 'express';
import { logPurchase, getPurchaseHistory } from '../controllers/purchaseController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

import {
  authorizeRoles,
  enforceBaseScope
} from '../middlewares/rbacMiddleware.js';

const router = express.Router();

// Record incoming purchases (ADMIN & LOGISTICS_OFFICER only)
router.post(
  '/',
  authenticateToken,
  authorizeRoles('ADMIN', 'LOGISTICS_OFFICER'),
  logPurchase
);

// Fetch purchase history log
router.get(
  '/',
  authenticateToken,
  enforceBaseScope,
  getPurchaseHistory
);

export default router;