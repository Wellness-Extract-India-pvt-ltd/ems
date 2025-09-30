/**
 * Chat Routes
 * API endpoints for AI assistant chat functionality
 * @fileoverview Express router for chat management endpoints
 */

import express from 'express'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { body, param } from 'express-validator'
import { authMiddleware } from '../middleware/authMiddleware.js'
import validateRequest from '../middleware/validateRequest.js'
import {
  sendMessage,
  getChatHistory,
  getUserSessions,
  deleteSession,
  generateSessionTitleEndpoint
} from '../controllers/chatController.js'

const router = express.Router()

// Security middleware
router.use(helmet())

// Rate limiting for chat endpoints
const chatRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Increased limit for chat endpoints
  message: {
    success: false,
    error: 'Too many chat requests',
    message: 'Please wait before sending another message'
  },
  standardHeaders: true,
  legacyHeaders: false
})

// More lenient rate limiting for sessions endpoint
const sessionsRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Much higher limit for session listing
  message: {
    success: false,
    error: 'Too many session requests',
    message: 'Please wait before requesting sessions again'
  },
  standardHeaders: true,
  legacyHeaders: false
})

// Apply specific rate limiting to different endpoints
router.use('/sessions', sessionsRateLimit)
router.use('/send', chatRateLimit)
router.use('/history/:sessionId', chatRateLimit)
router.use('/session/:sessionId', chatRateLimit)

// Global Authentication for all chat routes
router.use(authMiddleware)

// Chat message validation rules - only for POST /send
const sendMessageValidation = [
  body('message')
    .notEmpty()
    .withMessage('Message content is required')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message must be between 1 and 2000 characters')
    .trim()
    .escape(),
  body('sessionId')
    .optional()
    .isString()
    .withMessage('Session ID must be a string')
    .isLength({ min: 1, max: 255 })
    .withMessage('Session ID must be between 1 and 255 characters')
]

// Session ID validation - for GET routes
const sessionIdValidation = [
  param('sessionId')
    .isString()
    .withMessage('Session ID must be a string')
    .isLength({ min: 1, max: 255 })
    .withMessage('Session ID must be between 1 and 255 characters')
]


/**
 * @route POST /api/v1/chat/send
 * @desc Send a message to the AI assistant
 * @access Private
 * @param {string} message - User message content (required)
 * @param {string} sessionId - Chat session identifier (optional)
 * @returns {Object} Assistant response with conversation history
 */
router.post(
  '/send',
  sendMessageValidation,
  validateRequest,
  sendMessage
)

/**
 * @route GET /api/v1/chat/sessions
 * @desc Get all chat sessions for the authenticated user
 * @access Private
 * @returns {Object} List of user's chat sessions
 */
router.get(
  '/sessions',
  getUserSessions
)

/**
 * @route GET /api/v1/chat/history/:sessionId
 * @desc Get chat history for a specific session
 * @access Private
 * @param {string} sessionId - Chat session identifier
 * @returns {Object} Chat history for the session
 */
router.get(
  '/history/:sessionId',
  sessionIdValidation,
  validateRequest,
  getChatHistory
)

/**
 * @route POST /api/v1/chat/generate-title/:sessionId
 * @desc Generate a title for a chat session
 * @access Private
 * @param {string} sessionId - Chat session identifier
 * @returns {Object} Title generation confirmation
 */
router.post(
  '/generate-title/:sessionId',
  generateSessionTitleEndpoint
)

/**
 * @route DELETE /api/v1/chat/session/:sessionId
 * @desc Delete a chat session
 * @access Private
 * @param {string} sessionId - Chat session identifier
 * @returns {Object} Deletion confirmation
 */
router.delete(
  '/session/:sessionId',
  deleteSession
)

export default router
