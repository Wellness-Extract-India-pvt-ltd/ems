/**
 * License Routes
 * API endpoints for software license management and operations
 * @fileoverview Express router for software license management endpoints
 */

import express from 'express'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { body, param, query } from 'express-validator'
import { authMiddleware, requiresRole } from '../middleware/authMiddleware.js'
import validateRequest from '../middleware/validateRequest.js'
import {
  addLicense,
  listLicenses,
  getLicenseById,
  updateLicense,
  deleteLicense,
  getLicensesByEmployee
} from '../controllers/licenseController.js'

const router = express.Router()

// Security middleware
router.use(helmet())

// Rate limiting configurations
const createLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 license creation requests per windowMs
  message: {
    success: false,
    error: 'Rate limit exceeded',
    message: 'Too many license creation attempts, please try again later.',
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
    message: 'Too many license update attempts, please try again later.',
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
    message: 'Too many license list requests, please try again later.',
    retryAfter: Math.ceil((15 * 60 * 1000) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false
})

// Apply authentication globally to license routes
router.use(authMiddleware)

// Comprehensive license validation rules
const licenseValidation = [
  // Basic Information
  body('license_key')
    .notEmpty()
    .withMessage('License key is required')
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('License key must be between 3 and 255 characters')
    .escape(),
  body('software_id')
    .notEmpty()
    .withMessage('Software ID is required')
    .isInt({ min: 1 })
    .withMessage('Software ID must be a positive integer'),
  body('license_type')
    .notEmpty()
    .withMessage('License type is required')
    .isIn([
      'Single User',
      'Multi User',
      'Site License',
      'Volume License',
      'Enterprise',
      'Trial',
      'Open Source',
      'Freeware'
    ])
    .withMessage('Invalid license type'),

  // License Capacity
  body('max_users')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Maximum users must be a positive integer'),
  body('current_users')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Current users must be a non-negative integer'),

  // Dates
  body('purchase_date')
    .optional()
    .isISO8601()
    .withMessage('Purchase date must be a valid date'),
  body('expiry_date')
    .optional()
    .isISO8601()
    .withMessage('Expiry date must be a valid date'),
  body('assigned_date')
    .optional()
    .isISO8601()
    .withMessage('Assigned date must be a valid date'),

  // Financial Information
  body('cost')
    .optional()
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage('Cost must be a valid decimal number'),

  // Status and Assignment
  body('status')
    .optional()
    .isIn([
      'Active',
      'Expired',
      'Suspended',
      'Available',
      'Maintenance',
      'Deprecated'
    ])
    .withMessage('Invalid license status'),
  body('assigned_to')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Assigned to must be a positive integer'),
  body('vendor')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Vendor must be less than 200 characters')
    .escape(),

  // Additional Information
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Notes must be less than 2000 characters')
    .escape(),

  // New Fields
  body('renewal_date')
    .optional()
    .isISO8601()
    .withMessage('Renewal date must be a valid date'),
  body('support_level')
    .optional()
    .isIn(['Basic', 'Standard', 'Premium', 'Enterprise', 'None'])
    .withMessage('Invalid support level'),
  body('compliance_status')
    .optional()
    .isIn(['Compliant', 'Non-Compliant', 'Pending', 'Under Review'])
    .withMessage('Invalid compliance status')
]

/**
 * @route POST /api/v1/licenses/add
 * @desc Create a new software license with comprehensive information
 * @access Private (Admin only)
 * @param {string} license_key.body.required - Unique license key for the software
 * @param {number} software_id.body.required - Software ID this license belongs to
 * @param {string} license_type.body.required - Type of license (Single User, Multi User, etc.)
 * @param {number} max_users.body.optional - Maximum number of users allowed
 * @param {number} current_users.body.optional - Current number of users
 * @param {string} purchase_date.body.optional - Purchase date (ISO8601)
 * @param {string} expiry_date.body.optional - Expiry date (ISO8601)
 * @param {string} assigned_date.body.optional - Assignment date (ISO8601)
 * @param {number} cost.body.optional - License cost
 * @param {string} status.body.optional - License status
 * @param {number} assigned_to.body.optional - Employee ID if assigned
 * @param {string} vendor.body.optional - License vendor
 * @param {string} notes.body.optional - Additional notes
 * @param {string} renewal_date.body.optional - Renewal date (ISO8601)
 * @param {string} support_level.body.optional - Support level
 * @param {string} compliance_status.body.optional - Compliance status
 * @returns {Object} Created license with assigned ID
 */
router.post(
  '/add',
  createLimiter,
  requiresRole('admin'),
  licenseValidation,
  validateRequest,
  addLicense
)

/**
 * @route GET /api/v1/licenses/all
 * @desc Get paginated list of software licenses with optional filtering and search
 * @access Private (Admin, Manager, Employee - role-based access)
 * @param {number} page.query.optional - Page number for pagination (default: 1)
 * @param {number} limit.query.optional - Number of records per page (default: 10, max: 100)
 * @param {string} search.query.optional - Search term for license key or vendor
 * @param {string} license_type.query.optional - Filter by license type
 * @param {string} status.query.optional - Filter by license status
 * @param {string} vendor.query.optional - Filter by vendor
 * @param {number} software_id.query.optional - Filter by software ID
 * @param {number} assigned_to.query.optional - Filter by assigned employee ID
 * @returns {Object} Paginated list of licenses with metadata
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
    query('license_type')
      .optional()
      .isIn([
        'Single User',
        'Multi User',
        'Site License',
        'Volume License',
        'Enterprise',
        'Trial',
        'Open Source',
        'Freeware'
      ])
      .withMessage('Invalid license type'),
    query('status')
      .optional()
      .isIn([
        'Active',
        'Expired',
        'Suspended',
        'Available',
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
    query('software_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Software ID must be a positive integer'),
    query('assigned_to')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Assigned to must be a positive integer')
  ],
  validateRequest,
  listLicenses
)

/**
 * @route GET /api/v1/licenses/employee/:employeeId
 * @desc Get software licenses assigned to a specific employee
 * @access Private (Admin, Manager, Employee - own records only)
 * @param {number} employeeId.path.required - Employee ID
 * @param {number} page.query.optional - Page number for pagination
 * @param {number} limit.query.optional - Number of records per page
 * @returns {Object} List of licenses assigned to the employee
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
  getLicensesByEmployee
)

/**
 * @route GET /api/v1/licenses/:_id
 * @desc Get software license details by ID
 * @access Private (Admin, Manager, Employee - role-based access)
 * @param {number} _id.path.required - License ID
 * @returns {Object} Complete license information
 */
router.get(
  '/:_id',
  [param('_id').isInt({ min: 1 }).withMessage('Invalid license ID')],
  validateRequest,
  getLicenseById
)

/**
 * @route PUT /api/v1/licenses/update/:_id
 * @desc Update software license information
 * @access Private (Admin only)
 * @param {number} _id.path.required - License ID to update
 * @param {string} license_key.body.optional - Updated license key
 * @param {number} software_id.body.optional - Updated software ID
 * @param {string} license_type.body.optional - Updated license type
 * @param {number} max_users.body.optional - Updated maximum users
 * @param {number} current_users.body.optional - Updated current users
 * @param {string} purchase_date.body.optional - Updated purchase date
 * @param {string} expiry_date.body.optional - Updated expiry date
 * @param {string} assigned_date.body.optional - Updated assignment date
 * @param {number} cost.body.optional - Updated cost
 * @param {string} status.body.optional - Updated license status
 * @param {number} assigned_to.body.optional - Updated assigned employee
 * @param {string} vendor.body.optional - Updated vendor
 * @param {string} notes.body.optional - Updated notes
 * @param {string} renewal_date.body.optional - Updated renewal date
 * @param {string} support_level.body.optional - Updated support level
 * @param {string} compliance_status.body.optional - Updated compliance status
 * @returns {Object} Updated license data
 */
router.put(
  '/update/:_id',
  updateLimiter,
  requiresRole('admin'),
  [
    param('_id').isInt({ min: 1 }).withMessage('Invalid license ID'),
    ...licenseValidation.map((rule) => rule.optional())
  ],
  validateRequest,
  updateLicense
)

/**
 * @route DELETE /api/v1/licenses/delete/:_id
 * @desc Delete software license record (soft delete - marks as deprecated)
 * @access Private (Admin only)
 * @param {number} _id.path.required - License ID to delete
 * @returns {Object} Success message with deletion confirmation
 */
router.delete(
  '/delete/:_id',
  requiresRole('admin'),
  [param('_id').isInt({ min: 1 }).withMessage('Invalid license ID')],
  validateRequest,
  deleteLicense
)

export default router
