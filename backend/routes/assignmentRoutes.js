import express from 'express';
import {
  createAssignment,
  returnAssignment,
  getAssignmentHistory
} from '../controllers/assignmentController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

import {
  authorizeRoles,
  enforceBaseScope
} from '../middlewares/rbacMiddleware.js';

const router = express.Router();

// Assign equipment to personnel (ADMIN & BASE_COMMANDER only)
router.post(
  '/',
  authenticateToken,
  authorizeRoles('ADMIN', 'BASE_COMMANDER'),
  createAssignment
);

// Mark an assignment as returned
router.patch(
  '/:id/return',
  authenticateToken,
  authorizeRoles('ADMIN', 'BASE_COMMANDER'),
  returnAssignment
);

// Fetch assignment history
router.get(
  '/',
  authenticateToken,
  enforceBaseScope,
  getAssignmentHistory
);

export default router;