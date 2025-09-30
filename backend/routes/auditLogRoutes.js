/**
 * Audit Log Routes
 * API endpoints for enterprise-level audit log management
 * @fileoverview Express router for audit log endpoints with comprehensive security and compliance features
 */

import express from 'express'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { query, body } from 'express-validator'
import { authMiddleware, requiresRole } from '../middleware/authMiddleware.js'
import validateRequest from '../middleware/validateRequest.js'
import {
  getAuditLogs,
  getAuditLogStats,
  exportAuditLogs,
  cleanupAuditLogs
} from '../controllers/auditLogController.js'

const router = express.Router()

// Security middleware
router.use(helmet())

// Rate limiting configurations
const isDevelopment = process.env.NODE_ENV === 'development'

const auditLogLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 10000 : 1000, // Much higher limit for development
  message: {
    success: false,
    error: 'Rate limit exceeded',
    message: 'Too many audit log requests, please try again later.',
    retryAfter: Math.ceil((15 * 60 * 1000) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting entirely in development if needed
  skip: (req) => isDevelopment && process.env.SKIP_RATE_LIMITS === 'true'
})

const exportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isDevelopment ? 1000 : 50, // Much higher limit for development
  message: {
    success: false,
    error: 'Rate limit exceeded',
    message: 'Too many export requests, please try again later.',
    retryAfter: Math.ceil((60 * 60 * 1000) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting entirely in development if needed
  skip: (req) => isDevelopment && process.env.SKIP_RATE_LIMITS === 'true'
})

// Apply authentication globally to audit log routes
router.use(authMiddleware)

// Apply rate limiting with development-friendly configuration
router.use(auditLogLimiter)

/**
 * @route GET /api/v1/audit-logs
 * @desc Get paginated audit logs with advanced filtering and search
 * @access Private (Admin, Manager, Employee - role-based access)
 * @param {number} page.query.optional - Page number for pagination (default: 1)
 * @param {number} limit.query.optional - Number of records per page (default: 50, max: 100)
 * @param {string} search.query.optional - Search term for user name, email, action, or description
 * @param {string} action.query.optional - Filter by specific action
 * @param {string} resource_type.query.optional - Filter by resource type
 * @param {string} severity.query.optional - Filter by severity level (LOW, MEDIUM, HIGH, CRITICAL)
 * @param {string} status.query.optional - Filter by status (SUCCESS, FAILURE, WARNING)
 * @param {string} category.query.optional - Filter by category
 * @param {string} user_email.query.optional - Filter by user email
 * @param {string} date_from.query.optional - Filter from date (ISO 8601)
 * @param {string} date_to.query.optional - Filter to date (ISO 8601)
 * @param {string} ip_address.query.optional - Filter by IP address
 * @param {string} sort_by.query.optional - Sort field (created_at, user_name, action, severity, status, category)
 * @param {string} sort_order.query.optional - Sort order (ASC, DESC)
 * @returns {Object} Paginated audit logs with metadata and filters
 */
router.get(
  '/',
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
      .custom((value) => {
        if (!value || value === '') return true;
        return value.trim().length <= 200;
      })
      .withMessage('Search term too long'),
    query('action')
      .optional()
      .custom((value) => {
        if (!value || value === '') return true;
        return value.trim().length <= 100;
      })
      .withMessage('Action filter too long'),
    query('resource_type')
      .optional()
      .custom((value) => {
        if (!value || value === '') return true;
        return value.trim().length <= 50;
      })
      .withMessage('Resource type filter too long'),
    query('severity')
      .optional()
      .custom((value) => {
        if (!value || value === '') return true;
        return ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(value);
      })
      .withMessage('Invalid severity level'),
    query('status')
      .optional()
      .custom((value) => {
        if (!value || value === '') return true;
        return ['SUCCESS', 'FAILURE', 'WARNING'].includes(value);
      })
      .withMessage('Invalid status'),
    query('category')
      .optional()
      .custom((value) => {
        if (!value || value === '') return true;
        return value.trim().length <= 50;
      })
      .withMessage('Category filter too long'),
    query('user_email')
      .optional()
      .custom((value) => {
        if (!value || value === '') return true;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      })
      .withMessage('Invalid email format'),
    query('date_from')
      .optional()
      .custom((value) => {
        if (!value || value === '') return true;
        return !isNaN(Date.parse(value));
      })
      .withMessage('Invalid date format'),
    query('date_to')
      .optional()
      .custom((value) => {
        if (!value || value === '') return true;
        return !isNaN(Date.parse(value));
      })
      .withMessage('Invalid date format'),
    query('ip_address')
      .optional()
      .custom((value) => {
        if (!value || value === '') return true;
        return value.trim().length <= 45;
      })
      .withMessage('IP address too long'),
    query('sort_by')
      .optional()
      .custom((value) => {
        if (!value || value === '') return true;
        return ['created_at', 'user_name', 'action', 'severity', 'status', 'category'].includes(value);
      })
      .withMessage('Invalid sort field'),
    query('sort_order')
      .optional()
      .custom((value) => {
        if (!value || value === '') return true;
        return ['ASC', 'DESC'].includes(value);
      })
      .withMessage('Invalid sort order')
  ],
  validateRequest,
  getAuditLogs
)

/**
 * @route GET /api/v1/audit-logs/stats
 * @desc Get audit log statistics and analytics
 * @access Private (Admin, Manager, Employee - role-based access)
 * @returns {Object} Audit log statistics and breakdowns
 */
router.get(
  '/stats',
  getAuditLogStats
)

/**
 * @route GET /api/v1/audit-logs/export
 * @desc Export audit logs to CSV format
 * @access Private (Admin, Manager - role-based access)
 * @returns {File} CSV file download
 */
router.get(
  '/export',
  exportLimiter,
  requiresRole('admin', 'manager'),
  exportAuditLogs
)

/**
 * @route POST /api/v1/audit-logs/cleanup
 * @desc Clean up old audit logs based on retention policy
 * @access Private (Admin only)
 * @param {number} retention_days.body.optional - Number of days to retain logs (default: 365)
 * @returns {Object} Cleanup results and statistics
 */
router.post(
  '/cleanup',
  requiresRole('admin'),
  [
    body('retention_days')
      .optional()
      .isInt({ min: 30, max: 3650 })
      .withMessage('Retention days must be between 30 and 3650')
      .toInt()
  ],
  validateRequest,
  cleanupAuditLogs
)

export default router
