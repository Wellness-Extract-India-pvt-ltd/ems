import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { query, validationResult } from 'express-validator';

import { login, redirectHandler } from '../controllers/authController.js';

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

export default router;