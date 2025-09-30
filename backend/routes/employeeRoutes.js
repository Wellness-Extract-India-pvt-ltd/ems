/**
 * Employee Routes
 * API endpoints for employee management and operations
 * @fileoverview Express router for employee management endpoints
 */

import express from 'express'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { body, param, query } from 'express-validator'
import { requiresRole, authMiddleware } from '../middleware/authMiddleware.js'
import validateRequest from '../middleware/validateRequest.js'
import {
  upload,
  validateUploadedFiles,
  cleanupOnError
} from '../utils/multerConfig.js'

import {
  addEmployee,
  listEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee
} from '../controllers/employeeController.js'

const router = express.Router()

// Security middleware
router.use(helmet())

// Rate limiting configurations
const createLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 employee creation requests per windowMs
  message: {
    success: false,
    error: 'Rate limit exceeded',
    message: 'Too many employee creation attempts, please try again later.',
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
    message: 'Too many employee update attempts, please try again later.',
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
    message: 'Too many employee list requests, please try again later.',
    retryAfter: Math.ceil((15 * 60 * 1000) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false
})

// Global Authentication for all employee routes
router.use(authMiddleware)

// Comprehensive employee validation rules
const employeeValidationRules = [
  // Personal Information
  body('personal.firstName')
    .notEmpty()
    .withMessage('First name is required')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('First name must be between 2 and 100 characters')
    .escape(),
  body('personal.lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Last name must be between 2 and 100 characters')
    .escape(),
  body('personal.middleName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Middle name must be less than 100 characters')
    .escape(),
  body('personal.dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid date'),
  body('personal.gender')
    .optional()
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Invalid gender value'),
  body('personal.maritalStatus')
    .optional()
    .isIn(['Single', 'Married', 'Divorced', 'Widowed'])
    .withMessage('Invalid marital status'),

  // Contact Information
  body('contact.email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email must be less than 255 characters'),
  body('contact.contactEmail')
    .optional()
    .isEmail()
    .withMessage('Invalid contact email format')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Contact email must be less than 255 characters'),
  body('contact.phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Invalid phone number format'),
  body('contact.address')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Address must be less than 1000 characters')
    .escape(),
  body('contact.city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City must be less than 100 characters')
    .escape(),
  body('contact.state')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('State must be less than 100 characters')
    .escape(),
  body('contact.zipCode')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Zip code must be less than 20 characters')
    .escape(),
  body('contact.country')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Country must be less than 100 characters')
    .escape(),

  // Employment Information
  body('employment.employeeId')
    .notEmpty()
    .withMessage('Employee ID is required')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Employee ID must be between 3 and 50 characters')
    .isAlphanumeric()
    .withMessage('Employee ID must contain only alphanumeric characters')
    .escape(),
  body('employment.joinDate')
    .notEmpty()
    .withMessage('Join date is required')
    .isISO8601()
    .withMessage('Join date must be a valid date'),
  body('employment.employmentType')
    .notEmpty()
    .withMessage('Employment type is required')
    .isIn(['Full-time', 'Part-time', 'Intern', 'Contractor'])
    .withMessage('Invalid employment type'),
  body('employment.departmentId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Department ID must be a positive integer'),
  body('employment.position')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Position must be less than 100 characters')
    .escape(),
  body('employment.salary')
    .optional()
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage('Salary must be a valid decimal number'),
  body('employment.status')
    .optional()
    .isIn(['Active', 'Inactive', 'Onboarding', 'Suspended', 'Terminated'])
    .withMessage('Invalid employment status'),
  body('employment.managerId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Manager ID must be a positive integer'),
  body('employment.workLocation')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Work location must be less than 200 characters')
    .escape(),
  body('employment.workSchedule')
    .optional()
    .isIn(['Regular', 'Flexible', 'Remote', 'Hybrid'])
    .withMessage('Invalid work schedule'),

  // Emergency Contact
  body('emergency.contactName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Emergency contact name must be less than 100 characters')
    .escape(),
  body('emergency.contactPhone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Invalid emergency contact phone number format'),
  body('emergency.contactRelationship')
    .optional()
    .isIn(['Spouse', 'Parent', 'Sibling', 'Child', 'Friend', 'Other'])
    .withMessage('Invalid emergency contact relationship'),

  // Banking Information
  body('banking.bankName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Bank name must be less than 100 characters')
    .escape(),
  body('banking.accountNumber')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Account number must be less than 50 characters')
    .isNumeric()
    .withMessage('Account number must contain only numbers'),
  body('banking.ifscCode')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('IFSC code must be less than 20 characters')
    .isAlphanumeric()
    .withMessage('IFSC code must contain only alphanumeric characters')
    .escape()
]

/**
 * @route POST /api/v1/employees/add
 * @desc Create a new employee with comprehensive information and file uploads
 * @access Private (Admin only)
 * @param {Object} personal.body.required - Personal information (firstName, lastName, etc.)
 * @param {Object} contact.body.required - Contact information (email, phone, address, etc.)
 * @param {Object} employment.body.required - Employment information (employeeId, joinDate, etc.)
 * @param {Object} emergency.body.optional - Emergency contact information
 * @param {Object} banking.body.optional - Banking information
 * @param {File[]} files.body.optional - Employee documents (profile picture, resume, etc.)
 * @returns {Object} Created employee data with assigned ID
 */
router.post(
  '/add',
  createLimiter,
  requiresRole('admin'),
  cleanupOnError,
  (req, res, next) => {
    upload.any()(req, res, (err) => {
      if (err) {
        if (err.name === 'MulterError') {
          return res.status(400).json({
            success: false,
            error: 'File upload error',
            message: err.message
          })
        } else {
          return res.status(400).json({
            success: false,
            error: 'File processing failed',
            message: err.message
          })
        }
      }
      next()
    })
  },
  validateUploadedFiles,
  employeeValidationRules,
  validateRequest,
  addEmployee
)

/**
 * @route GET /api/v1/employees/all
 * @desc Get paginated list of employees with optional filtering and search
 * @access Private (Admin, Manager)
 * @param {number} page.query.optional - Page number for pagination (default: 1)
 * @param {number} limit.query.optional - Number of records per page (default: 10, max: 100)
 * @param {string} search.query.optional - Search term for employee name or ID
 * @param {string} department.query.optional - Filter by department name
 * @param {string} status.query.optional - Filter by employment status
 * @param {string} employmentType.query.optional - Filter by employment type
 * @returns {Object} Paginated list of employees with metadata
 */
router.get(
  '/all',
  listLimiter,
  requiresRole('admin', 'manager'),
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
    query('department')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Department name too long')
      .escape(),
    query('status')
      .optional()
      .isIn(['Active', 'Inactive', 'Onboarding', 'Suspended', 'Terminated'])
      .withMessage('Invalid status'),
    query('employmentType')
      .optional()
      .isIn(['Full-time', 'Part-time', 'Intern', 'Contractor'])
      .withMessage('Invalid employment type')
  ],
  validateRequest,
  listEmployees
)

/**
 * @route GET /api/v1/employees/:_id
 * @desc Get employee details by ID with comprehensive information
 * @access Private (Admin, Manager, Employee - own record only)
 * @param {number} _id.path.required - Employee ID
 * @returns {Object} Complete employee information including personal, contact, employment, and banking details
 */
router.get(
  '/:_id',
  requiresRole('admin', 'manager', 'employee'),
  [param('_id').isInt({ min: 1 }).withMessage('Invalid employee ID')],
  validateRequest,
  getEmployeeById
)

/**
 * @route PUT /api/v1/employees/update/:_id
 * @desc Update employee information with comprehensive validation
 * @access Private (Admin only)
 * @param {number} _id.path.required - Employee ID to update
 * @param {Object} personal.body.optional - Updated personal information
 * @param {Object} contact.body.optional - Updated contact information
 * @param {Object} employment.body.optional - Updated employment information
 * @param {Object} emergency.body.optional - Updated emergency contact information
 * @param {Object} banking.body.optional - Updated banking information
 * @returns {Object} Updated employee data
 */
router.put(
  '/update/:_id',
  updateLimiter,
  requiresRole('admin'),
  [
    param('_id').isInt({ min: 1 }).withMessage('Invalid employee ID'),
    ...employeeValidationRules.map((rule) => rule.optional())
  ],
  validateRequest,
  updateEmployee
)

/**
 * @route DELETE /api/v1/employees/delete/:_id
 * @desc Delete employee record (soft delete - marks as terminated)
 * @access Private (Admin only)
 * @param {number} _id.path.required - Employee ID to delete
 * @returns {Object} Success message with deletion confirmation
 */
router.delete(
  '/delete/:_id',
  requiresRole('admin'),
  [param('_id').isInt({ min: 1 }).withMessage('Invalid employee ID')],
  validateRequest,
  deleteEmployee
)

export default router
