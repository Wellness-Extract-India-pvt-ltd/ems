import express from 'express'
import { body, param, query } from 'express-validator'
import rateLimit from 'express-rate-limit'
import { authMiddleware, requiresRole } from '../middleware/authMiddleware.js'
import {
  createIntegration,
  getIntegrations,
  getIntegrationById,
  updateIntegration,
  deleteIntegration
} from '../controllers/integrationController.js'

const router = express.Router()

// Apply authentication middleware for all integration routes
router.use(authMiddleware)

// Rate limiter for creation endpoint
const createLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many integration creation attempts, please try again later.'
})

// Validation rules for creating/updating integration
const integrationValidation = [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('provider').notEmpty().withMessage('Provider is required').trim(),
  body('description').optional().trim(),
  body('config').optional().isObject().withMessage('Config must be an object'),
  body('status')
    .optional()
    .isIn(['enabled', 'disabled', 'disconnected'])
    .withMessage('Invalid status'),
  body('connectedAt').optional().isISO8601().toDate(),
  body('lastSyncedAt').optional().isISO8601().toDate(),
  body('managedBy').optional().isArray(),
  body('managedBy.*')
    .optional()
    .isInt()
    .withMessage('Invalid employee ID in managedBy'),
  body('allowedRoles')
    .isArray({ min: 1 })
    .withMessage('At least one allowedRole is required'),
  body('allowedRoles.*')
    .isIn(['admin', 'manager', 'employee'])
    .withMessage('Invalid role in allowedRoles'),
  body('isDeleted').optional().isBoolean()
]

// POST /add - Create Integration (admin only)
router.post(
  '/add',
  createLimiter,
  requiresRole('admin'),
  integrationValidation,
  createIntegration
)

// GET /all - List integrations (all authenticated allowed)
router.get(
  '/all',
  requiresRole('admin', 'manager', 'employee'),
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('search').optional().trim()
  ],
  getIntegrations
)

// GET /:id - Get integration by ID
router.get(
  '/:_id',
  requiresRole('admin', 'manager', 'employee'),
  param('_id').isInt().withMessage('Invalid integration ID'),
  getIntegrationById
)

// PUT /update/:id - Update integration (admin only)
router.put(
  '/update/:_id',
  requiresRole('admin'),
  param('_id').isInt().withMessage('Invalid integration ID'),
  integrationValidation,
  updateIntegration
)

// DELETE /delete/:id - Soft-delete integration (admin only)
router.delete(
  '/delete/:_id',
  requiresRole('admin'),
  param('_id').isInt().withMessage('Invalid integration ID'),
  deleteIntegration
)

export default router
