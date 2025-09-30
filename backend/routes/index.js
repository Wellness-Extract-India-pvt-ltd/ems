/**
 * Main API Routes Configuration
 * Central router for all EMS API endpoints with comprehensive security, validation, and monitoring
 * @fileoverview Express router configuration for EMS API with security middleware, rate limiting, and health monitoring
 */

import express from 'express'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { testConnection } from '../database/connection.js'
import { testBiometricsConnection } from '../database/biometricsConnection.js'
import redisConfig from '../config/redis.js'
import logger from '../utils/logger.js'

// Import all route modules
import authRoutes from './authRoutes.js'
import employeeRoutes from './employeeRoutes.js'
import hardwareRoutes from './hardwareRoutes.js'
import softwareRoutes from './softwareRoutes.js'
import licenseRoutes from './licenseRoutes.js'
import ticketRoutes from './ticketRoutes.js'
import integrationRoutes from './integrationRoutes.js'
import biometricsRoutes from './biometricsRoutes.js'
import chatRoutes from './chatRoutes.js'
import dashboardRoutes from './dashboardRoutes.js'
import auditLogRoutes from './auditLogRoutes.js'
import activityRoutes from './activityRoutes.js'
import timeTrackingRoutes from './timeTrackingRoutes.js'

const router = express.Router()

// Security middleware for all routes
router.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false
}))

// Global rate limiting for all API endpoints
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    error: 'Rate limit exceeded',
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(15 * 60 * 1000 / 1000) // seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  // Remove custom keyGenerator to avoid IPv6 issues
  // Use default IP-based rate limiting
})

// Apply global rate limiting
// router.use(globalLimiter) // Temporarily disabled for testing

// Request logging middleware
router.use((req, res, next) => {
  const startTime = Date.now()

  // Log request
  logger.info('API Request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  })

  // Override res.json to log response time
  const originalJson = res.json
  res.json = function (data) {
    const responseTime = Date.now() - startTime

    logger.info('API Response', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString()
    })

    return originalJson.call(this, data)
  }

  next()
})

/**
 * @route GET /api/v1/health
 * @desc Comprehensive health check endpoint with database and service status
 * @access Public
 * @returns {Object} Detailed system health status
 */
router.get('/health', async (req, res) => {
  try {
    const startTime = Date.now()

    // Test all connections
    const [mysqlHealthy, biometricsHealthy, redisHealthy] = await Promise.allSettled([
      testConnection(),
      testBiometricsConnection(),
      redisConfig.isRedisConnected()
    ])

    const responseTime = Date.now() - startTime

    const health = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      responseTime: `${responseTime}ms`,
      services: {
        mysql: {
          status: mysqlHealthy.status === 'fulfilled' && mysqlHealthy.value ? 'healthy' : 'unhealthy',
          error: mysqlHealthy.status === 'rejected' ? mysqlHealthy.reason?.message : null
        },
        biometrics: {
          status: biometricsHealthy.status === 'fulfilled' && biometricsHealthy.value ? 'healthy' : 'unhealthy',
          error: biometricsHealthy.status === 'rejected' ? biometricsHealthy.reason?.message : null
        },
        redis: {
          status: redisHealthy.status === 'fulfilled' && redisHealthy.value ? 'healthy' : 'unhealthy',
          error: redisHealthy.status === 'rejected' ? redisHealthy.reason?.message : null
        }
      },
      system: {
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        platform: process.platform,
        nodeVersion: process.version
      }
    }

    // Determine overall health status
    const allHealthy = health.services.mysql.status === 'healthy' &&
                      health.services.redis.status === 'healthy'

    const statusCode = allHealthy ? 200 : 503
    health.status = allHealthy ? 'OK' : 'DEGRADED'

    res.status(statusCode).json(health)
  } catch (error) {
    logger.error('Health check failed', { error: error.message })
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      message: error.message
    })
  }
})

/**
 * @route GET /api/v1/status
 * @desc Quick status check endpoint for load balancers and monitoring
 * @access Public
 * @returns {Object} Simple status response
 */
router.get('/status', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

/**
 * @route GET /api/v1/
 * @desc API information and available endpoints
 * @access Public
 * @returns {Object} API information and available endpoints
 */
router.get('/', (req, res) => {
  res.status(200).json({
    name: 'EMS Backend API',
    version: '1.0.0',
    description: 'Employee Management System Backend API',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/v1/health',
      status: '/api/v1/status',
      auth: '/api/v1/auth',
      employees: '/api/v1/employees',
      hardware: '/api/v1/hardware',
      software: '/api/v1/software',
      licenses: '/api/v1/licenses',
      tickets: '/api/v1/tickets',
      integrations: '/api/v1/integrations',
      biometrics: '/api/v1/biometrics'
    }
  })
})

/**
 * Route Mounting Configuration
 * All API endpoints are mounted with proper error handling and documentation
 */

// Mount authentication routes
router.use('/auth', authRoutes)

// Mount employee management routes
router.use('/employees', employeeRoutes)

// Mount hardware asset management routes
router.use('/hardware', hardwareRoutes)

// Mount software asset management routes
router.use('/software', softwareRoutes)

// Mount license management routes
router.use('/licenses', licenseRoutes)

// Mount ticket management routes
router.use('/tickets', ticketRoutes)

// Mount integration management routes
router.use('/integrations', integrationRoutes)

// Mount biometrics management routes
router.use('/biometrics', biometricsRoutes)

// Mount chat/AI assistant routes
router.use('/chat', chatRoutes)

// Mount dashboard routes
router.use('/dashboard', dashboardRoutes)

// Mount audit log routes
router.use('/audit-logs', auditLogRoutes)

// Mount activity tracking routes
router.use('/activities', activityRoutes)

// Mount time tracking routes
router.use('/time-tracking', timeTrackingRoutes)

/**
 * Centralized Error Handling Middleware
 * Handles all unhandled errors and provides consistent error responses
 */
router.use((err, req, res, next) => {
  logger.error('Unhandled route error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  })

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development'

  res.status(err.status || 500).json({
    success: false,
    error: err.name || 'Internal Server Error',
    message: isDevelopment ? err.message : 'An unexpected error occurred',
    ...(isDevelopment && { stack: err.stack }),
    timestamp: new Date().toISOString()
  })
})

/**
 * 404 Handler for undefined routes
 * Provides helpful information about available endpoints
 */
// 404 handler for any unmatched routes
router.use((req, res) => {
  logger.warn('404 - Route not found', {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  })

  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableEndpoints: [
      'GET /api/v1/health',
      'GET /api/v1/status',
      'GET /api/v1/auth/*',
      'GET /api/v1/employees/*',
      'GET /api/v1/hardware/*',
      'GET /api/v1/software/*',
      'GET /api/v1/licenses/*',
      'GET /api/v1/tickets/*',
      'GET /api/v1/integrations/*',
      'GET /api/v1/biometrics/*'
    ],
    timestamp: new Date().toISOString()
  })
})

export default router
