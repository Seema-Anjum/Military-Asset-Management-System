import express from 'express';
import { login, register, getAllUsers } from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

import {
  authorizeRoles,
} from '../middlewares/rbacMiddleware.js';

const router = express.Router();

// Public route: User Login
router.post('/login', login);

// Protected route: Register user (Restricted to ADMINs only)
router.post('/register', authenticateToken, authorizeRoles('ADMIN'), register);


// Protected route: List all users (Restricted to ADMINs only)
router.get('/users', authenticateToken, authorizeRoles('ADMIN'), getAllUsers);


export default router;