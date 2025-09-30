/**
 * Ticket Routes
 * API endpoints for ticket management and operations
 * @fileoverview Express router for ticket management endpoints
 */

import express from 'express'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { body, param, query } from 'express-validator'
import ticketUpload from '../middleware/ticketUpload.js'
import { authMiddleware, requiresRole } from '../middleware/authMiddleware.js'
import validateRequest from '../middleware/validateRequest.js'
import {
  addTicket,
  uploadAttachments,
  listTickets,
  getTicketById,
  updateTicket,
  deleteTicket
} from '../controllers/ticketController.js'

const router = express.Router()

// Security middleware
router.use(helmet())

// Rate limiting configurations
const createLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 ticket creation requests per windowMs
  message: {
    success: false,
    error: 'Rate limit exceeded',
    message: 'Too many ticket creation attempts, please try again later.',
    retryAfter: Math.ceil((15 * 60 * 1000) / 1000) // seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false
})

const updateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 update requests per windowMs
  message: {
    success: false,
    error: 'Rate limit exceeded',
    message: 'Too many ticket update attempts, please try again later.',
    retryAfter: Math.ceil((15 * 60 * 1000) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false
})

const listLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 list requests per windowMs
  message: {
    success: false,
    error: 'Rate limit exceeded',
    message: 'Too many ticket list requests, please try again later.',
    retryAfter: Math.ceil((15 * 60 * 1000) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false
})

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 upload requests per windowMs
  message: {
    success: false,
    error: 'Rate limit exceeded',
    message: 'Too many file upload attempts, please try again later.',
    retryAfter: Math.ceil((15 * 60 * 1000) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false
})

// Apply authentication globally to ticket routes
router.use(authMiddleware)

// Comprehensive ticket validation rules
const ticketValidation = [
  // Basic Information
  body('ticket_number')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Ticket number must be between 3 and 50 characters')
    .escape(),
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters')
    .escape(),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Description must be between 10 and 5000 characters')
    .escape(),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn([
      'Hardware',
      'Software',
      'Network',
      'Account',
      'Security',
      'Access',
      'Email',
      'VPN',
      'Printer',
      'Phone',
      'Mobile',
      'Other'
    ])
    .withMessage('Invalid ticket category'),

  // Priority and Status
  body('priority')
    .notEmpty()
    .withMessage('Priority is required')
    .isIn(['Low', 'Medium', 'High', 'Critical', 'Emergency'])
    .withMessage('Invalid priority level'),
  body('status')
    .optional()
    .isIn([
      'Open',
      'In Progress',
      'Resolved',
      'Closed',
      'Cancelled',
      'On Hold',
      'Escalated'
    ])
    .withMessage('Invalid ticket status'),

  // Assignment and Dates
  body('assigned_to')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Assigned to must be a positive integer'),
  body('due_date')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  body('resolved_date')
    .optional()
    .isISO8601()
    .withMessage('Resolved date must be a valid date'),

  // Resolution Information
  body('resolution')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Resolution must be less than 5000 characters')
    .escape(),

  // Time Tracking
  body('estimated_hours')
    .optional()
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage('Estimated hours must be a valid decimal number'),
  body('actual_hours')
    .optional()
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage('Actual hours must be a valid decimal number'),

  // Escalation Information
  body('escalation_level')
    .optional()
    .isIn(['None', 'Level 1', 'Level 2', 'Management'])
    .withMessage('Invalid escalation level'),
  body('escalation_date')
    .optional()
    .isISO8601()
    .withMessage('Escalation date must be a valid date'),
  body('sla_deadline')
    .optional()
    .isISO8601()
    .withMessage('SLA deadline must be a valid date'),

  // Additional Information
  body('tags')
    .optional()
    .custom((value) => {
      if (value !== null && !Array.isArray(value)) {
        throw new Error('Tags must be a valid JSON array')
      }
      return true
    }),
  body('impact')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Critical'])
    .withMessage('Invalid impact level'),
  body('urgency')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Critical'])
    .withMessage('Invalid urgency level')
]

/**
 * @route POST /api/v1/tickets/add
 * @desc Create a new support ticket with comprehensive information
 * @access Private (Admin, Manager, Employee)
 * @param {string} title.body.required - Ticket title/summary
 * @param {string} description.body.required - Detailed ticket description
 * @param {string} category.body.required - Ticket category (Hardware, Software, etc.)
 * @param {string} priority.body.required - Priority level (Low, Medium, High, Critical, Emergency)
 * @param {string} status.body.optional - Ticket status
 * @param {number} assigned_to.body.optional - Employee ID if assigned
 * @param {string} due_date.body.optional - Due date (ISO8601)
 * @param {string} resolution.body.optional - Resolution description
 * @param {number} estimated_hours.body.optional - Estimated hours to resolve
 * @param {number} actual_hours.body.optional - Actual hours spent
 * @param {string} escalation_level.body.optional - Escalation level
 * @param {string} escalation_date.body.optional - Escalation date (ISO8601)
 * @param {string} sla_deadline.body.optional - SLA deadline (ISO8601)
 * @param {Array} tags.body.optional - Tags array (JSON)
 * @param {string} impact.body.optional - Impact level
 * @param {string} urgency.body.optional - Urgency level
 * @returns {Object} Created ticket with assigned ID
 */
router.post(
  '/add',
  createLimiter,
  requiresRole('admin', 'manager', 'employee'),
  ticketValidation,
  validateRequest,
  addTicket
)

/**
 * @route POST /api/v1/tickets/:_id/attachments
 * @desc Upload attachments to a specific ticket
 * @access Private (Admin, Manager, Employee)
 * @param {number} _id.path.required - Ticket ID
 * @param {File[]} attachments.formData.required - Attachment files (max 5 files)
 * @returns {Object} Upload confirmation with file details
 */
router.post(
  '/:_id/attachments',
  uploadLimiter,
  requiresRole('admin', 'manager', 'employee'),
  [param('_id').isInt({ min: 1 }).withMessage('Invalid ticket ID')],
  validateRequest,
  ticketUpload.array('attachments', 5), // max 5 files
  uploadAttachments
)

/**
 * @route GET /api/v1/tickets/all
 * @desc Get paginated list of tickets with optional filtering and search
 * @access Private (Admin, Manager, Employee - role-based access)
 * @param {number} page.query.optional - Page number for pagination (default: 1)
 * @param {number} limit.query.optional - Number of records per page (default: 10, max: 100)
 * @param {string} search.query.optional - Search term for ticket title or description
 * @param {string} category.query.optional - Filter by ticket category
 * @param {string} status.query.optional - Filter by ticket status
 * @param {string} priority.query.optional - Filter by priority level
 * @param {number} assigned_to.query.optional - Filter by assigned employee ID
 * @param {string} created_by.query.optional - Filter by creator employee ID
 * @returns {Object} Paginated list of tickets with metadata
 */
router.get(
  '/all',
  listLimiter,
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer')
      .toInt(),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
      .toInt(),
    query('search')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Search term too long')
      .escape(),
    query('category')
      .optional()
      .isIn([
        'Hardware',
        'Software',
        'Network',
        'Account',
        'Security',
        'Access',
        'Email',
        'VPN',
        'Printer',
        'Phone',
        'Mobile',
        'Other'
      ])
      .withMessage('Invalid category'),
    query('status')
      .optional()
      .isIn([
        'Open',
        'In Progress',
        'Resolved',
        'Closed',
        'Cancelled',
        'On Hold',
        'Escalated'
      ])
      .withMessage('Invalid status'),
    query('priority')
      .optional()
      .isIn(['Low', 'Medium', 'High', 'Critical', 'Emergency'])
      .withMessage('Invalid priority'),
    query('assigned_to')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Assigned to must be a positive integer'),
    query('created_by')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Created by must be a positive integer')
  ],
  validateRequest,
  listTickets
)

/**
 * @route GET /api/v1/tickets/:_id
 * @desc Get ticket details by ID
 * @access Private (Admin, Manager, Employee - role-based access)
 * @param {number} _id.path.required - Ticket ID
 * @returns {Object} Complete ticket information
 */
router.get(
  '/:_id',
  [param('_id').isInt({ min: 1 }).withMessage('Invalid ticket ID')],
  validateRequest,
  getTicketById
)

/**
 * @route PUT /api/v1/tickets/update/:_id
 * @desc Update ticket information
 * @access Private (Admin, Manager, Employee - role-based access)
 * @param {number} _id.path.required - Ticket ID to update
 * @param {string} title.body.optional - Updated ticket title
 * @param {string} description.body.optional - Updated ticket description
 * @param {string} category.body.optional - Updated ticket category
 * @param {string} priority.body.optional - Updated priority level
 * @param {string} status.body.optional - Updated ticket status
 * @param {number} assigned_to.body.optional - Updated assigned employee
 * @param {string} due_date.body.optional - Updated due date
 * @param {string} resolved_date.body.optional - Updated resolved date
 * @param {string} resolution.body.optional - Updated resolution description
 * @param {number} estimated_hours.body.optional - Updated estimated hours
 * @param {number} actual_hours.body.optional - Updated actual hours
 * @param {string} escalation_level.body.optional - Updated escalation level
 * @param {string} escalation_date.body.optional - Updated escalation date
 * @param {string} sla_deadline.body.optional - Updated SLA deadline
 * @param {Array} tags.body.optional - Updated tags array
 * @param {string} impact.body.optional - Updated impact level
 * @param {string} urgency.body.optional - Updated urgency level
 * @returns {Object} Updated ticket data
 */
router.put(
  '/update/:_id',
  updateLimiter,
  requiresRole('admin', 'manager', 'employee'),
  [
    param('_id').isInt({ min: 1 }).withMessage('Invalid ticket ID'),
    ...ticketValidation.map((rule) => rule.optional())
  ],
  validateRequest,
  updateTicket
)

/**
 * @route DELETE /api/v1/tickets/delete/:_id
 * @desc Delete ticket record (soft delete - marks as cancelled)
 * @access Private (Admin only)
 * @param {number} _id.path.required - Ticket ID to delete
 * @returns {Object} Success message with deletion confirmation
 */
router.delete(
  '/delete/:_id',
  requiresRole('admin'),
  [param('_id').isInt({ min: 1 }).withMessage('Invalid ticket ID')],
  validateRequest,
  deleteTicket
)

export default router
