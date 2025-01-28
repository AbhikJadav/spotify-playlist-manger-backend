import express from 'express';
import { registerUser, loginUser, getAllUsers } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected route to get all users
router.get('/users', authMiddleware, getAllUsers);

export default router;
