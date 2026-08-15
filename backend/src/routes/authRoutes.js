import express from 'express';
import { adminLogin, verifyToken, changePassword } from '../controllers/authController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/login', adminLogin);

// Protected routes
router.get('/verify', authenticateAdmin, verifyToken);
router.post('/change-password', authenticateAdmin, changePassword);

export default router;
