import express, { Request, Response, NextFunction } from 'express';
import { registerUser, loginUser, getAllUsers } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
router.post('/register', async (req: Request, res: Response) => {
    return await registerUser(req, res);
});

router.post('/login', async (req: Request, res: Response) => {
    return await loginUser(req, res);
});

// Protected route to get all users
router.get('/users', authMiddleware, async (req: Request, res: Response) => {
    return await getAllUsers(req, res);
});

export default router;
