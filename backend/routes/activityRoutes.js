import express from 'express'
import { body, param, query } from 'express-validator'
import { authMiddleware } from '../middleware/authMiddleware.js'
import validateRequest from '../middleware/validateRequest.js'
import {
  getActivities,
  createActivity,
  getActivityStats,
  deleteActivity
} from '../controllers/activityController.js'

const router = express.Router()

// Global Authentication for all activity routes
router.use(authMiddleware)

// Validation rules
const createActivityValidation = [
  body('activity_type')
    .isIn(['employee_created', 'employee_updated', 'employee_deleted', 'asset_assigned', 'asset_unassigned', 'asset_created', 'asset_updated', 'license_created', 'license_updated', 'license_expiring', 'ticket_created', 'ticket_updated', 'ticket_resolved', 'biometric_checkin', 'biometric_checkout', 'system_login', 'system_logout', 'profile_updated', 'settings_changed', 'report_generated', 'data_exported', 'password_changed', 'role_assigned', 'permission_granted', 'permission_revoked'])
    .withMessage('Invalid activity type'),
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('entity_type')
    .optional()
    .isIn(['employee', 'asset', 'license', 'ticket', 'user', 'system', 'biometric'])
    .withMessage('Invalid entity type'),
  body('entity_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Entity ID must be a positive integer'),
  body('severity')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid severity level'),
  body('is_public')
    .optional()
    .isBoolean()
    .withMessage('is_public must be a boolean')
]

const getActivitiesValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('type')
    .optional()
    .isIn(['employee_created', 'employee_updated', 'employee_deleted', 'asset_assigned', 'asset_unassigned', 'asset_created', 'asset_updated', 'license_created', 'license_updated', 'license_expiring', 'ticket_created', 'ticket_updated', 'ticket_resolved', 'biometric_checkin', 'biometric_checkout', 'system_login', 'system_logout', 'profile_updated', 'settings_changed', 'report_generated', 'data_exported', 'password_changed', 'role_assigned', 'permission_granted', 'permission_revoked'])
    .withMessage('Invalid activity type filter'),
  query('entity_type')
    .optional()
    .isIn(['employee', 'asset', 'license', 'ticket', 'user', 'system', 'biometric'])
    .withMessage('Invalid entity type filter'),
  query('severity')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid severity filter'),
  query('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Days must be between 1 and 365')
]

const activityIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Activity ID must be a positive integer')
]

/**
 * @route GET /api/v1/activities
 * @desc Get recent activities with filtering and pagination
 * @access Private
 */
router.get(
  '/',
  getActivitiesValidation,
  validateRequest,
  getActivities
)

/**
 * @route POST /api/v1/activities
 * @desc Create a new activity
 * @access Private
 */
router.post(
  '/',
  createActivityValidation,
  validateRequest,
  createActivity
)

/**
 * @route GET /api/v1/activities/stats
 * @desc Get activity statistics
 * @access Private
 */
router.get(
  '/stats',
  getActivityStats
)

/**
 * @route DELETE /api/v1/activities/:id
 * @desc Delete an activity
 * @access Private
 */
router.delete(
  '/:id',
  activityIdValidation,
  validateRequest,
  deleteActivity
)

export default router
