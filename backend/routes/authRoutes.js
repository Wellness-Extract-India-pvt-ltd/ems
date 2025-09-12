import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { query, validationResult } from 'express-validator';

import { login, redirectHandler, logout, refreshToken } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(helmet());

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many login attempts, please try again later.',
});

router.get('/login', authLimiter, [
    query('identifier').trim().notEmpty().withMessage('Identifier is required')
], login);

router.get('/redirect', redirectHandler);

// Logout route - requires authentication
router.post('/logout', authMiddleware, logout);

// Refresh token route
router.post('/refresh', refreshToken);

export default router;