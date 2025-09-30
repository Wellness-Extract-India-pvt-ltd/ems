import express from 'express'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { authMiddleware } from '../middleware/authMiddleware.js'
import { getDashboardStats } from '../controllers/dashboardController.js'

const router = express.Router()

// Security middleware
router.use(helmet())

// Rate limiting for dashboard endpoints
const dashboardRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit to 100 requests per 15 minutes
  message: {
    success: false,
    error: 'Too many dashboard requests',
    message: 'Please wait before requesting dashboard data again'
  },
  standardHeaders: true,
  legacyHeaders: false
})

// Apply rate limiting
router.use(dashboardRateLimit)

// Global Authentication for all dashboard routes
router.use(authMiddleware)

/**
 * @route GET /api/v1/dashboard/stats
 * @desc Get dashboard statistics
 * @access Private
 * @returns {Object} Dashboard statistics including employees, assets, software, licenses, tickets, biometrics, and chat data
 */
router.get('/stats', getDashboardStats)

export default router
