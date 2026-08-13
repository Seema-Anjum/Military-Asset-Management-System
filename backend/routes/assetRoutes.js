import express from 'express';
import { getDashboardMetrics } from '../controllers/assetController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

import {
  authorizeRoles,
  enforceBaseScope
} from '../middlewares/rbacMiddleware.js';

const router = express.Router();

// Protected route: Fetch inventory aggregates & dashboard metrics

router.get(
  '/dashboard-metrics',
  authenticateToken,
  enforceBaseScope,
  getDashboardMetrics
);

export default router;