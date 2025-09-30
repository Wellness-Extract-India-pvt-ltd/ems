/**
 * Hardware Routes
 * API endpoints for hardware asset management and operations
 * @fileoverview Express router for hardware asset management endpoints
 */

import express from 'express'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { body, param, query } from 'express-validator'
import { requiresRole, authMiddleware } from '../middleware/authMiddleware.js'
import validateRequest from '../middleware/validateRequest.js'
import {
  addHardware,
  listHardware,
  getHardwareById,
  updateHardware,
  deleteHardware,
  getHardwareByEmployee
} from '../controllers/hardwareController.js'

const router = express.Router()

// Security middleware
router.use(helmet())

// Rate limiting configurations
const createLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 hardware creation requests per windowMs
  message: {
    success: false,
    error: 'Rate limit exceeded',
    message: 'Too many hardware creation attempts, please try again later.',
    retryAfter: Math.ceil((15 * 60 * 1000) / 1000) // seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false
})

const updateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 update requests per windowMs
  message: {
    success: false,
    error: 'Rate limit exceeded',
    message: 'Too many hardware update attempts, please try again later.',
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
    message: 'Too many hardware list requests, please try again later.',
    retryAfter: Math.ceil((15 * 60 * 1000) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false
})

// Apply authentication globally to hardware routes
router.use(authMiddleware)

// Comprehensive hardware validation rules
const hardwareValidation = [
  // Basic Information
  body('asset_tag')
    .notEmpty()
    .withMessage('Asset tag is required')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Asset tag must be between 3 and 50 characters')
    .isAlphanumeric()
    .withMessage('Asset tag must contain only alphanumeric characters')
    .escape(),
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Name must be between 2 and 200 characters')
    .escape(),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn([
      'Laptop',
      'Desktop',
      'Monitor',
      'Keyboard',
      'Mouse',
      'Printer',
      'Scanner',
      'Network Device',
      'Mobile Device',
      'Tablet',
      'Server',
      'Other'
    ])
    .withMessage('Invalid hardware category'),
  body('brand')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Brand must be less than 100 characters')
    .escape(),
  body('model')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Model must be less than 100 characters')
    .escape(),
  body('serial_number')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Serial number must be less than 100 characters')
    .escape(),

  // Purchase Information
  body('purchase_date')
    .optional()
    .isISO8601()
    .withMessage('Purchase date must be a valid date'),
  body('purchase_price')
    .optional()
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage('Purchase price must be a valid decimal number'),
  body('warranty_expiry')
    .optional()
    .isISO8601()
    .withMessage('Warranty expiry must be a valid date'),

  // Status and Assignment
  body('status')
    .optional()
    .isIn(['Available', 'Assigned', 'Maintenance', 'Retired', 'Lost', 'Stolen'])
    .withMessage('Invalid hardware status'),
  body('assigned_to')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Assigned to must be a positive integer'),
  body('assigned_date')
    .optional()
    .isISO8601()
    .withMessage('Assigned date must be a valid date'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Location must be less than 200 characters')
    .escape(),

  // Additional Information
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Notes must be less than 2000 characters')
    .escape(),
  body('specifications')
    .optional()
    .custom((value) => {
      if (value !== null && typeof value !== 'object') {
        throw new Error('Specifications must be a valid JSON object')
      }
      return true
    })
]

/**
 * @route POST /api/v1/hardware/add
 * @desc Create a new hardware asset with comprehensive information
 * @access Private (Admin only)
 * @param {string} asset_tag.body.required - Unique asset tag for the hardware
 * @param {string} name.body.required - Hardware name/description
 * @param {string} category.body.required - Hardware category (Laptop, Desktop, etc.)
 * @param {string} brand.body.optional - Hardware brand
 * @param {string} model.body.optional - Hardware model
 * @param {string} serial_number.body.optional - Hardware serial number
 * @param {string} purchase_date.body.optional - Purchase date (ISO8601)
 * @param {number} purchase_price.body.optional - Purchase price
 * @param {string} warranty_expiry.body.optional - Warranty expiry date (ISO8601)
 * @param {string} status.body.optional - Hardware status
 * @param {number} assigned_to.body.optional - Employee ID if assigned
 * @param {string} assigned_date.body.optional - Assignment date (ISO8601)
 * @param {string} location.body.optional - Hardware location
 * @param {string} notes.body.optional - Additional notes
 * @param {Object} specifications.body.optional - Hardware specifications (JSON)
 * @returns {Object} Created hardware asset with assigned ID
 */
router.post(
  '/add',
  createLimiter,
  requiresRole('admin'),
  hardwareValidation,
  validateRequest,
  addHardware
)

/**
 * @route GET /api/v1/hardware/all
 * @desc Get paginated list of hardware assets with optional filtering and search
 * @access Private (Admin, Manager, Employee - role-based access)
 * @param {number} page.query.optional - Page number for pagination (default: 1)
 * @param {number} limit.query.optional - Number of records per page (default: 10, max: 100)
 * @param {string} search.query.optional - Search term for hardware name or asset tag
 * @param {string} category.query.optional - Filter by hardware category
 * @param {string} status.query.optional - Filter by hardware status
 * @param {string} brand.query.optional - Filter by hardware brand
 * @param {number} assigned_to.query.optional - Filter by assigned employee ID
 * @returns {Object} Paginated list of hardware assets with metadata
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
        'Laptop',
        'Desktop',
        'Monitor',
        'Keyboard',
        'Mouse',
        'Printer',
        'Scanner',
        'Network Device',
        'Mobile Device',
        'Tablet',
        'Server',
        'Other'
      ])
      .withMessage('Invalid category'),
    query('status')
      .optional()
      .isIn([
        'Available',
        'Assigned',
        'Maintenance',
        'Retired',
        'Lost',
        'Stolen'
      ])
      .withMessage('Invalid status'),
    query('brand')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Brand name too long')
      .escape(),
    query('assigned_to')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Assigned to must be a positive integer')
  ],
  validateRequest,
  listHardware
)

/**
 * @route GET /api/v1/hardware/employee/:employeeId
 * @desc Get hardware assets assigned to a specific employee
 * @access Private (Admin, Manager, Employee - own records only)
 * @param {number} employeeId.path.required - Employee ID
 * @param {number} page.query.optional - Page number for pagination
 * @param {number} limit.query.optional - Number of records per page
 * @returns {Object} List of hardware assets assigned to the employee
 */
router.get(
  '/employee/:employeeId',
  [
    param('employeeId').isInt({ min: 1 }).withMessage('Invalid employee ID'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer')
      .toInt(),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
      .toInt()
  ],
  validateRequest,
  getHardwareByEmployee
)

/**
 * @route GET /api/v1/hardware/:_id
 * @desc Get hardware asset details by ID
 * @access Private (Admin, Manager, Employee - role-based access)
 * @param {number} _id.path.required - Hardware asset ID
 * @returns {Object} Complete hardware asset information
 */
router.get(
  '/:_id',
  [param('_id').isInt({ min: 1 }).withMessage('Invalid hardware ID')],
  validateRequest,
  getHardwareById
)

/**
 * @route PUT /api/v1/hardware/update/:_id
 * @desc Update hardware asset information
 * @access Private (Admin only)
 * @param {number} _id.path.required - Hardware asset ID to update
 * @param {string} asset_tag.body.optional - Updated asset tag
 * @param {string} name.body.optional - Updated hardware name
 * @param {string} category.body.optional - Updated hardware category
 * @param {string} brand.body.optional - Updated hardware brand
 * @param {string} model.body.optional - Updated hardware model
 * @param {string} serial_number.body.optional - Updated serial number
 * @param {string} purchase_date.body.optional - Updated purchase date
 * @param {number} purchase_price.body.optional - Updated purchase price
 * @param {string} warranty_expiry.body.optional - Updated warranty expiry
 * @param {string} status.body.optional - Updated hardware status
 * @param {number} assigned_to.body.optional - Updated assigned employee
 * @param {string} assigned_date.body.optional - Updated assignment date
 * @param {string} location.body.optional - Updated location
 * @param {string} notes.body.optional - Updated notes
 * @param {Object} specifications.body.optional - Updated specifications
 * @returns {Object} Updated hardware asset data
 */
router.put(
  '/update/:_id',
  updateLimiter,
  requiresRole('admin'),
  [
    param('_id').isInt({ min: 1 }).withMessage('Invalid hardware ID'),
    ...hardwareValidation.map((rule) => rule.optional())
  ],
  validateRequest,
  updateHardware
)

/**
 * @route DELETE /api/v1/hardware/delete/:_id
 * @desc Delete hardware asset record (soft delete - marks as retired)
 * @access Private (Admin only)
 * @param {number} _id.path.required - Hardware asset ID to delete
 * @returns {Object} Success message with deletion confirmation
 */
router.delete(
  '/delete/:_id',
  requiresRole('admin'),
  [param('_id').isInt({ min: 1 }).withMessage('Invalid hardware ID')],
  validateRequest,
  deleteHardware
)

export default router
