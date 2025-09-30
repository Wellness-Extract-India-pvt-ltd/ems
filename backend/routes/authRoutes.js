/**
 * Authentication Routes
 * Handles user authentication, authorization, and session management
 * @fileoverview Express router for authentication endpoints
 */

import express from 'express'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { query, body } from 'express-validator'

import {
  login,
  redirectHandler,
  logout,
  refreshToken
} from '../controllers/authController.js'
import {
  authMiddleware,
  validateRefreshToken
} from '../middleware/authMiddleware.js'

const router = express.Router()

// Security middleware
router.use(helmet())

// Rate limiting configurations
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs (temporarily increased for testing)
  message: {
    success: false,
    error: 'Rate limit exceeded',
    message: 'Too many login attempts, please try again later.',
    retryAfter: Math.ceil((15 * 60 * 1000) / 1000) // seconds
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: false, // Count successful requests
  skipFailedRequests: false // Count failed requests
})

const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 refresh requests per windowMs (increased for development)
  message: {
    success: false,
    error: 'Rate limit exceeded',
    message: 'Too many refresh token requests, please try again later.',
    retryAfter: Math.ceil((15 * 60 * 1000) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false
})

const logoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 logout requests per windowMs
  message: {
    success: false,
    error: 'Rate limit exceeded',
    message: 'Too many logout requests, please try again later.',
    retryAfter: Math.ceil((15 * 60 * 1000) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false
})

/**
 * @route GET /auth/login
 * @desc Initiate Microsoft OAuth login flow
 * @access Public
 * @param {string} identifier.query.required - Employee code or email address
 * @returns {Object} Redirect to Microsoft OAuth or error
 */
router.get(
  '/login',
  // authLimiter, // Temporarily disabled for testing
  [
    query('identifier')
      .trim()
      .notEmpty()
      .withMessage('Identifier is required')
      .isLength({ min: 3, max: 255 })
      .withMessage('Identifier must be between 3 and 255 characters')
      .escape() // Prevent XSS
  ],
  login
)

/**
 * @route GET /auth/redirect
 * @desc Handle Microsoft OAuth callback
 * @access Public
 * @param {string} code.query - Authorization code from Microsoft
 * @param {string} state.query - State parameter for security
 * @returns {Object} JWT tokens or error
 */
router.get('/redirect', redirectHandler)

/**
 * @route POST /auth/logout
 * @desc Logout user and invalidate tokens
 * @access Private (requires authentication)
 * @returns {Object} Success message or error
 */
router.post('/logout', logoutLimiter, authMiddleware, logout)

/**
 * @route POST /auth/refresh
 * @desc Refresh access token using refresh token
 * @access Public (but requires valid refresh token)
 * @param {string} refreshToken.body.required - Valid refresh token
 * @returns {Object} New access token or error
 */
router.post(
  '/refresh',
  refreshLimiter,
  [
    body('refreshToken')
      .trim()
      .notEmpty()
      .withMessage('Refresh token is required')
      .isLength({ min: 10, max: 2000 })
      .withMessage('Refresh token must be between 10 and 2000 characters')
      .escape() // Prevent XSS
  ],
  validateRefreshToken,
  refreshToken
)

export default router
