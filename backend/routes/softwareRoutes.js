/**
 * Software Routes
 * API endpoints for software asset management and operations
 * @fileoverview Express router for software asset management endpoints
 */

import express from 'express'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { body, param, query } from 'express-validator'
import { authMiddleware, requiresRole } from '../middleware/authMiddleware.js'
import validateRequest from '../middleware/validateRequest.js'
import {
  addSoftware,
  listSoftware,
  getSoftwareById,
  updateSoftware,
  deleteSoftware,
  getSoftwareByEmployee
} from '../controllers/softwareController.js'

const router = express.Router()

// Security middleware
router.use(helmet())

// Rate limiting configurations
const createLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 software creation requests per windowMs
  message: {
    success: false,
    error: 'Rate limit exceeded',
    message: 'Too many software creation attempts, please try again later.',
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
    message: 'Too many software update attempts, please try again later.',
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
    message: 'Too many software list requests, please try again later.',
    retryAfter: Math.ceil((15 * 60 * 1000) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false
})

// Apply authentication globally to software routes
router.use(authMiddleware)

// Comprehensive software validation rules
const softwareValidation = [
  // Basic Information
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Name must be between 2 and 200 characters')
    .escape(),
  body('version')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Version must be less than 50 characters')
    .escape(),
  body('vendor')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Vendor must be less than 200 characters')
    .escape(),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn([
      'Operating System',
      'Office Suite',
      'Development Tools',
      'Design Software',
      'Database',
      'Security',
      'Web Browser',
      'Media Player',
      'Antivirus',
      'Backup Software',
      'Cloud Service',
      'Other'
    ])
    .withMessage('Invalid software category'),

  // License Information
  body('license_type')
    .notEmpty()
    .withMessage('License type is required')
    .isIn([
      'Perpetual',
      'Subscription',
      'Open Source',
      'Freeware',
      'Trial',
      'Enterprise',
      'Volume License'
    ])
    .withMessage('Invalid license type'),

  // Dates
  body('purchase_date')
    .optional()
    .isISO8601()
    .withMessage('Purchase date must be a valid date'),
  body('renewal_date')
    .optional()
    .isISO8601()
    .withMessage('Renewal date must be a valid date'),

  // Financial Information
  body('purchase_price')
    .optional()
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage('Purchase price must be a valid decimal number'),

  // Status and Assignment
  body('status')
    .optional()
    .isIn([
      'Active',
      'Inactive',
      'Expired',
      'Suspended',
      'Maintenance',
      'Deprecated'
    ])
    .withMessage('Invalid software status'),
  body('assigned_to')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Assigned to must be a positive integer'),
  body('assigned_date')
    .optional()
    .isISO8601()
    .withMessage('Assigned date must be a valid date'),
  body('installation_path')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Installation path must be less than 500 characters')
    .escape(),

  // Additional Information
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Notes must be less than 2000 characters')
    .escape(),
  body('system_requirements')
    .optional()
    .custom((value) => {
      if (value !== null && typeof value !== 'object') {
        throw new Error('System requirements must be a valid JSON object')
      }
      return true
    }),

  // New Fields
  body('support_level')
    .optional()
    .isIn(['Basic', 'Standard', 'Premium', 'Enterprise', 'None'])
    .withMessage('Invalid support level'),
  body('compliance_status')
    .optional()
    .isIn(['Compliant', 'Non-Compliant', 'Pending', 'Under Review'])
    .withMessage('Invalid compliance status'),
  body('department_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Department ID must be a positive integer')
]

/**
 * @route POST /api/v1/software/add
 * @desc Create a new software asset with comprehensive information
 * @access Private (Admin only)
 * @param {string} name.body.required - Software name/description
 * @param {string} version.body.optional - Software version
 * @param {string} vendor.body.optional - Software vendor
 * @param {string} category.body.required - Software category (Operating System, Office Suite, etc.)
 * @param {string} license_type.body.required - License type (Perpetual, Subscription, etc.)
 * @param {string} purchase_date.body.optional - Purchase date (ISO8601)
 * @param {string} renewal_date.body.optional - Renewal date (ISO8601)
 * @param {number} purchase_price.body.optional - Purchase price
 * @param {string} status.body.optional - Software status
 * @param {number} assigned_to.body.optional - Employee ID if assigned
 * @param {string} assigned_date.body.optional - Assignment date (ISO8601)
 * @param {string} installation_path.body.optional - Installation path
 * @param {string} notes.body.optional - Additional notes
 * @param {Object} system_requirements.body.optional - System requirements (JSON)
 * @param {string} support_level.body.optional - Support level
 * @param {string} compliance_status.body.optional - Compliance status
 * @param {number} department_id.body.optional - Department ID
 * @returns {Object} Created software asset with assigned ID
 */
router.post(
  '/add',
  createLimiter,
  requiresRole('admin'),
  softwareValidation,
  validateRequest,
  addSoftware
)

/**
 * @route GET /api/v1/software/all
 * @desc Get paginated list of software assets with optional filtering and search
 * @access Private (Admin, Manager, Employee - role-based access)
 * @param {number} page.query.optional - Page number for pagination (default: 1)
 * @param {number} limit.query.optional - Number of records per page (default: 10, max: 100)
 * @param {string} search.query.optional - Search term for software name or vendor
 * @param {string} category.query.optional - Filter by software category
 * @param {string} status.query.optional - Filter by software status
 * @param {string} vendor.query.optional - Filter by vendor
 * @param {string} license_type.query.optional - Filter by license type
 * @param {number} assigned_to.query.optional - Filter by assigned employee ID
 * @param {number} department_id.query.optional - Filter by department ID
 * @returns {Object} Paginated list of software assets with metadata
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
        'Operating System',
        'Office Suite',
        'Development Tools',
        'Design Software',
        'Database',
        'Security',
        'Web Browser',
        'Media Player',
        'Antivirus',
        'Backup Software',
        'Cloud Service',
        'Other'
      ])
      .withMessage('Invalid category'),
    query('status')
      .optional()
      .isIn([
        'Active',
        'Inactive',
        'Expired',
        'Suspended',
        'Maintenance',
        'Deprecated'
      ])
      .withMessage('Invalid status'),
    query('vendor')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Vendor name too long')
      .escape(),
    query('license_type')
      .optional()
      .isIn([
        'Perpetual',
        'Subscription',
        'Open Source',
        'Freeware',
        'Trial',
        'Enterprise',
        'Volume License'
      ])
      .withMessage('Invalid license type'),
    query('assigned_to')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Assigned to must be a positive integer'),
    query('department_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Department ID must be a positive integer')
  ],
  validateRequest,
  listSoftware
)

/**
 * @route GET /api/v1/software/employee/:employeeId
 * @desc Get software assets assigned to a specific employee
 * @access Private (Admin, Manager, Employee - own records only)
 * @param {number} employeeId.path.required - Employee ID
 * @param {number} page.query.optional - Page number for pagination
 * @param {number} limit.query.optional - Number of records per page
 * @returns {Object} List of software assets assigned to the employee
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
  getSoftwareByEmployee
)

/**
 * @route GET /api/v1/software/:_id
 * @desc Get software asset details by ID
 * @access Private (Admin, Manager, Employee - role-based access)
 * @param {number} _id.path.required - Software asset ID
 * @returns {Object} Complete software asset information
 */
router.get(
  '/:_id',
  [param('_id').isInt({ min: 1 }).withMessage('Invalid software ID')],
  validateRequest,
  getSoftwareById
)

/**
 * @route PUT /api/v1/software/update/:_id
 * @desc Update software asset information
 * @access Private (Admin only)
 * @param {number} _id.path.required - Software asset ID to update
 * @param {string} name.body.optional - Updated software name
 * @param {string} version.body.optional - Updated software version
 * @param {string} vendor.body.optional - Updated vendor
 * @param {string} category.body.optional - Updated software category
 * @param {string} license_type.body.optional - Updated license type
 * @param {string} purchase_date.body.optional - Updated purchase date
 * @param {string} renewal_date.body.optional - Updated renewal date
 * @param {number} purchase_price.body.optional - Updated purchase price
 * @param {string} status.body.optional - Updated software status
 * @param {number} assigned_to.body.optional - Updated assigned employee
 * @param {string} assigned_date.body.optional - Updated assignment date
 * @param {string} installation_path.body.optional - Updated installation path
 * @param {string} notes.body.optional - Updated notes
 * @param {Object} system_requirements.body.optional - Updated system requirements
 * @param {string} support_level.body.optional - Updated support level
 * @param {string} compliance_status.body.optional - Updated compliance status
 * @param {number} department_id.body.optional - Updated department ID
 * @returns {Object} Updated software asset data
 */
router.put(
  '/update/:_id',
  updateLimiter,
  requiresRole('admin'),
  [
    param('_id').isInt({ min: 1 }).withMessage('Invalid software ID'),
    ...softwareValidation.map((rule) => rule.optional())
  ],
  validateRequest,
  updateSoftware
)

/**
 * @route DELETE /api/v1/software/delete/:_id
 * @desc Delete software asset record (soft delete - marks as deprecated)
 * @access Private (Admin only)
 * @param {number} _id.path.required - Software asset ID to delete
 * @returns {Object} Success message with deletion confirmation
 */
router.delete(
  '/delete/:_id',
  requiresRole('admin'),
  [param('_id').isInt({ min: 1 }).withMessage('Invalid software ID')],
  validateRequest,
  deleteSoftware
)

export default router
