import express from 'express'
import { body, query, param } from 'express-validator'
import { authMiddleware } from '../middleware/authMiddleware.js'
import validateRequest from '../middleware/validateRequest.js'
import {
  testCheckIn,
  getTimeTrackingStatus,
  checkIn,
  checkOut,
  getTimeTrackingHistory,
  getTeamTimeTracking,
  getTimeTrackingStats
} from '../controllers/timeTrackingController.js'

const router = express.Router()

// Global Authentication for all time tracking routes
router.use(authMiddleware)

// Validation rules
const checkInValidation = [
  body('location')
    .optional()
    .custom((value) => {
      // Allow null, undefined, or valid object
      if (value === null || value === undefined) {
        return true;
      }
      if (typeof value !== 'object') {
        throw new Error('Location must be an object');
      }
      // Only validate if coordinates are provided
      if (value.latitude !== undefined && (isNaN(value.latitude) || value.latitude < -90 || value.latitude > 90)) {
        throw new Error('Latitude must be a number between -90 and 90');
      }
      if (value.longitude !== undefined && (isNaN(value.longitude) || value.longitude < -180 || value.longitude > 180)) {
        throw new Error('Longitude must be a number between -180 and 180');
      }
      return true;
    }),
  body('notes')
    .optional()
    .custom((value) => {
      if (value === null || value === undefined) {
        return true;
      }
      if (typeof value !== 'string') {
        throw new Error('Notes must be a string');
      }
      if (value.length > 1000) {
        throw new Error('Notes must be less than 1000 characters');
      }
      return true;
    }),
  body('deviceInfo')
    .optional()
    .custom((value) => {
      if (value === null || value === undefined) {
        return true;
      }
      if (typeof value !== 'object') {
        throw new Error('Device info must be an object');
      }
      return true;
    })
]

const checkOutValidation = [
  body('location')
    .optional()
    .custom((value) => {
      // Allow null, undefined, or valid object
      if (value === null || value === undefined) {
        return true;
      }
      if (typeof value !== 'object') {
        throw new Error('Location must be an object');
      }
      // Only validate if coordinates are provided
      if (value.latitude !== undefined && (isNaN(value.latitude) || value.latitude < -90 || value.latitude > 90)) {
        throw new Error('Latitude must be a number between -90 and 90');
      }
      if (value.longitude !== undefined && (isNaN(value.longitude) || value.longitude < -180 || value.longitude > 180)) {
        throw new Error('Longitude must be a number between -180 and 180');
      }
      return true;
    }),
  body('notes')
    .optional()
    .custom((value) => {
      if (value === null || value === undefined) {
        return true;
      }
      if (typeof value !== 'string') {
        throw new Error('Notes must be a string');
      }
      if (value.length > 1000) {
        throw new Error('Notes must be less than 1000 characters');
      }
      return true;
    })
]

const historyValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  query('status')
    .optional()
    .isIn(['checked_in', 'checked_out', 'on_break', 'completed'])
    .withMessage('Invalid status filter')
]

const teamValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  query('employeeId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Employee ID must be a positive integer'),
  query('departmentId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Department ID must be a positive integer')
]

const statsValidation = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  query('employeeId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Employee ID must be a positive integer')
]

/**
 * @route POST /api/v1/time-tracking/test-checkin
 * @desc Test endpoint for check-in without validation
 * @access Private
 */
router.post(
  '/test-checkin',
  testCheckIn
)

/**
 * @route GET /api/v1/time-tracking/status
 * @desc Get current time tracking status for the user
 * @access Private
 */
router.get(
  '/status',
  getTimeTrackingStatus
)

/**
 * @route POST /api/v1/time-tracking/check-in
 * @desc Check in for work
 * @access Private
 */
router.post(
  '/check-in',
  checkInValidation,
  validateRequest,
  checkIn
)

/**
 * @route POST /api/v1/time-tracking/check-out
 * @desc Check out from work
 * @access Private
 */
router.post(
  '/check-out',
  checkOutValidation,
  validateRequest,
  checkOut
)

/**
 * @route GET /api/v1/time-tracking/history
 * @desc Get time tracking history for the user
 * @access Private
 */
router.get(
  '/history',
  historyValidation,
  validateRequest,
  getTimeTrackingHistory
)

/**
 * @route GET /api/v1/time-tracking/team
 * @desc Get team time tracking data (for managers/admins)
 * @access Private
 */
router.get(
  '/team',
  teamValidation,
  validateRequest,
  getTeamTimeTracking
)

/**
 * @route GET /api/v1/time-tracking/stats
 * @desc Get time tracking statistics
 * @access Private
 */
router.get(
  '/stats',
  statsValidation,
  validateRequest,
  getTimeTrackingStats
)

export default router
