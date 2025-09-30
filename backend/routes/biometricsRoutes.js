/**
 * BioMetrics Routes
 * API endpoints for biometric attendance management and integration
 * @fileoverview Express router for biometric system integration endpoints
 */

import express from 'express'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { body, query, param } from 'express-validator'
import {
  testConnection,
  getDatabaseInfo,
  getBiometricEmployees,
  getEmployeeAttendance,
  getAttendanceSummary,
  getDepartments,
  getRecentAttendance,
  syncEmployees
} from '../controllers/biometricsController.js'
import { authMiddleware, requiresRole } from '../middleware/authMiddleware.js'
import validateRequest from '../middleware/validateRequest.js'

const router = express.Router()

// Security middleware
router.use(helmet())

// Rate limiting configurations
const biometricsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Rate limit exceeded',
    message: 'Too many biometric requests, please try again later.',
    retryAfter: Math.ceil((15 * 60 * 1000) / 1000) // seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false
})

const syncLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 sync requests per hour
  message: {
    success: false,
    error: 'Rate limit exceeded',
    message: 'Too many sync requests, please try again later.',
    retryAfter: Math.ceil((60 * 60 * 1000) / 1000) // seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false
})

// Apply authentication and rate limiting middleware to all routes
router.use(authMiddleware)
router.use(biometricsLimiter)

/**
 * @route GET /api/v1/biometrics/test-connection
 * @desc Test BioMetrics SQL Server database connection
 * @access Private (Admin only)
 * @returns {Object} Connection status and response time
 */
router.get('/test-connection', requiresRole('admin'), testConnection)

/**
 * @route GET /api/v1/biometrics/database-info
 * @desc Get BioMetrics database information and table structure
 * @access Private (Admin only)
 * @returns {Object} Database metadata, version, and table information
 */
router.get('/database-info', requiresRole('admin'), getDatabaseInfo)

/**
 * @route GET /api/v1/biometrics/employees
 * @desc Get all employees from biometric system with pagination and filtering
 * @access Private (Admin, Manager, HR)
 * @param {number} page.query.optional - Page number for pagination
 * @param {number} limit.query.optional - Number of records per page (1-100)
 * @param {string} search.query.optional - Search term for employee name/code
 * @param {string} department.query.optional - Filter by department name
 * @param {string} status.query.optional - Filter by employee status
 * @returns {Object} Paginated list of biometric employees
 */
router.get(
  '/employees',
  requiresRole('admin', 'manager', 'hr'),
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('search')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Search term too long')
      .escape(),
    query('department')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Department name too long')
      .escape(),
    query('status')
      .optional()
      .isIn(['Active', 'Inactive', 'Terminated'])
      .withMessage('Invalid status')
  ],
  validateRequest,
  getBiometricEmployees
)

/**
 * @route GET /api/v1/biometrics/employees/:employeeId/attendance
 * @desc Get attendance records for a specific employee with date filtering
 * @access Private (Admin, Manager, HR, Employee - own records only)
 * @param {string} employeeId.path.required - Employee ID from biometric system
 * @param {string} startDate.query.optional - Start date for attendance records (ISO8601)
 * @param {string} endDate.query.optional - End date for attendance records (ISO8601)
 * @param {number} page.query.optional - Page number for pagination
 * @param {number} limit.query.optional - Number of records per page (1-500)
 * @returns {Object} Paginated list of attendance records for the employee
 */
router.get(
  '/employees/:employeeId/attendance',
  requiresRole('admin', 'manager', 'hr', 'employee'),
  [
    param('employeeId')
      .isString()
      .notEmpty()
      .withMessage('Employee ID is required')
      .escape(),
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid date'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid date'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 500 })
      .withMessage('Limit must be between 1 and 500')
  ],
  validateRequest,
  getEmployeeAttendance
)

/**
 * @route GET /api/v1/biometrics/attendance/summary
 * @desc Get attendance summary for a date range with optional filtering
 * @access Private (Admin, Manager, HR)
 * @param {string} startDate.query.required - Start date for summary (ISO8601)
 * @param {string} endDate.query.required - End date for summary (ISO8601)
 * @param {string} department.query.optional - Filter by department name
 * @param {string} employeeId.query.optional - Filter by specific employee
 * @returns {Object} Attendance summary with statistics and metrics
 */
router.get(
  '/attendance/summary',
  requiresRole('admin', 'manager', 'hr'),
  [
    query('startDate')
      .isISO8601()
      .withMessage('Start date is required and must be a valid date'),
    query('endDate')
      .isISO8601()
      .withMessage('End date is required and must be a valid date'),
    query('department')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Department name too long')
      .escape(),
    query('employeeId')
      .optional()
      .isString()
      .notEmpty()
      .withMessage('Employee ID must be a valid string')
      .escape()
  ],
  validateRequest,
  getAttendanceSummary
)

/**
 * @route GET /api/v1/biometrics/departments
 * @desc Get all departments from biometric system
 * @access Private (Admin, Manager, HR)
 * @returns {Object} List of departments from biometric system
 */
router.get(
  '/departments',
  requiresRole('admin', 'manager', 'hr'),
  getDepartments
)

/**
 * @route GET /api/v1/biometrics/attendance/recent
 * @desc Get recent attendance records (last 24 hours) with optional limit
 * @access Private (Admin, Manager, HR)
 * @param {number} limit.query.optional - Number of records to return (1-200)
 * @returns {Object} List of recent attendance records
 */
router.get(
  '/attendance/recent',
  requiresRole('admin', 'manager', 'hr'),
  [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 200 })
      .withMessage('Limit must be between 1 and 200')
  ],
  validateRequest,
  getRecentAttendance
)

/**
 * @route POST /api/v1/biometrics/sync/employees
 * @desc Sync employee data from biometric system to local MySQL database
 * @access Private (Admin only)
 * @param {boolean} force.query.optional - Force sync even if data is up to date
 * @returns {Object} Sync operation results and statistics
 */
router.post(
  '/sync/employees',
  syncLimiter,
  requiresRole('admin'),
  [
    query('force')
      .optional()
      .isBoolean()
      .withMessage('Force must be a boolean value')
  ],
  validateRequest,
  syncEmployees
)

export default router
