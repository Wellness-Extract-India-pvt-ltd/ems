/**
 * @fileoverview EMS Backend Application Entry Point
 * @description Main Express.js application configuration with comprehensive security,
 * middleware setup, error handling, and monitoring capabilities.
 * @author EMS Development Team
 * @version 1.0.0
 * @since 2025-09-17
 */

import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import routes from './routes/index.js' // Main router for all API endpoints
import logger from './utils/logger.js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

/**
 * Environment validation
 * Validates that all required environment variables are present
 * @throws {Error} If required environment variables are missing
 */
function validateEnvironment () {
  const requiredVars = [
    'PORT',
    'NODE_ENV',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'DB_HOST',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD',
    'CLIENT_ID',
    'CLIENT_SECRET',
    'TENANT_ID'
  ]

  const missingVars = requiredVars.filter((varName) => !process.env[varName])

  if (missingVars.length > 0) {
    const errorMessage = `Missing required environment variables: ${missingVars.join(', ')}`
    logger.error('Environment validation failed', { missingVars })
    throw new Error(errorMessage)
  }

  logger.info('Environment validation passed', {
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT
  })
}

// Validate environment before starting the application
try {
  validateEnvironment()
} catch (error) {
  logger.error(
    'Failed to start application due to environment validation error',
    { error: error.message }
  )
  process.exit(1)
}

const app = express()

/**
 * Trust proxy configuration for proper IP detection behind reverse proxies
 */
app.set('trust proxy', 1)

/**
 * Global rate limiting configuration
 * Protects against brute force attacks and DDoS
 */
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Rate limit exceeded',
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(
      (parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 1000
    )
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: false, // Count successful requests
  skipFailedRequests: false, // Count failed requests
  onLimitReached: (req, res, options) => {
    logger.security('Rate limit reached', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      endpoint: req.path,
      method: req.method
    })
  }
})

/**
 * Middleware setup with comprehensive security and performance optimizations
 */

// Apply global rate limiting
// app.use(globalLimiter) // Temporarily disabled for testing

// Enable compression for better performance
app.use(
  compression({
    level: 6,
    threshold: 1024, // Only compress responses larger than 1KB
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false
      }
      return compression.filter(req, res)
    }
  })
)

// Enhanced security headers with Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        scriptSrc: ["'self'", 'https://login.microsoftonline.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: [
          "'self'",
          'https://graph.microsoft.com',
          'https://login.microsoftonline.com'
        ],
        frameSrc: ["'self'", 'https://login.microsoftonline.com']
      }
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  })
)

// Enhanced CORS configuration with security
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'http://localhost:3000',
      'https://ems.wellnessextract.com'
    ].filter(Boolean)

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)

    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      logger.security('CORS blocked request', { origin, allowedOrigins })
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ]
}

app.use(cors(corsOptions))

// Request size limits for security
app.use(
  express.json({
    limit: process.env.MAX_REQUEST_SIZE || '10mb',
    verify: (req, res, buf) => {
      // Additional JSON validation can be added here
      try {
        JSON.parse(buf)
      } catch (e) {
        logger.security('Invalid JSON payload', {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          endpoint: req.path
        })
        throw new Error('Invalid JSON payload')
      }
    }
  })
)

app.use(
  express.urlencoded({
    extended: true,
    limit: process.env.MAX_REQUEST_SIZE || '10mb'
  })
)

// Enhanced cookie parser with security options
app.use(
  cookieParser(process.env.SESSION_SECRET, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  })
)

// Enhanced request logging with structured format
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev'

app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => {
        logger.http(message.trim())
      }
    }
  })
)

// Request timing middleware
app.use((req, res, next) => {
  const start = Date.now()

  res.on('finish', () => {
    const duration = Date.now() - start
    logger.performance('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    })
  })

  next()
})

/**
 * Mount API routes
 * All API endpoints are prefixed with /api/v1
 */
app.use('/api/v1', routes)

/**
 * Root endpoint with API information
 * Provides basic API information and available endpoints
 */
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'EMS Backend API',
    version: process.env.API_VERSION || 'v1',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/v1/health',
      status: '/api/v1/status',
      api: '/api/v1',
      docs: '/api/v1/docs'
    },
    uptime: process.uptime(),
    memory: process.memoryUsage()
  })
})

/**
 * Enhanced 404 handler for unknown routes
 * Provides helpful information about available endpoints
 */
app.use((req, res, next) => {
  logger.http('404 - Route not found', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  })

  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    availableEndpoints: {
      root: '/',
      health: '/health',
      status: '/status',
      api: '/api/v1'
    }
  })
})

/**
 * Enhanced global error handler
 * Catches errors thrown in routes/middleware with comprehensive logging
 */
app.use((err, req, res, next) => {
  // Log error details for debugging and monitoring
  const errorDetails = {
    message: err.message,
    stack: err.stack,
    status: err.status || 500,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
    body: req.body,
    params: req.params,
    query: req.query
  }

  // Log based on error severity
  if (err.status >= 500) {
    logger.error('Server error occurred', errorDetails)
  } else {
    logger.warn('Client error occurred', errorDetails)
  }

  // Prepare error response
  const isDevelopment = process.env.NODE_ENV === 'development'
  const errorResponse = {
    success: false,
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  }

  // Include stack trace in development
  if (isDevelopment && err.stack) {
    errorResponse.stack = err.stack
  }

  // Include additional details for specific error types
  if (err.name === 'ValidationError') {
    errorResponse.details = err.details || 'Validation failed'
    errorResponse.statusCode = 400
  } else if (err.name === 'UnauthorizedError') {
    errorResponse.details = 'Authentication required'
    errorResponse.statusCode = 401
  } else if (err.name === 'ForbiddenError') {
    errorResponse.details = 'Insufficient permissions'
    errorResponse.statusCode = 403
  }

  res.status(err.status || 500).json(errorResponse)
})

/**
 * Graceful shutdown handling
 * Ensures proper cleanup when the application is terminated
 */
function gracefulShutdown (signal) {
  logger.info(`Received ${signal}. Starting graceful shutdown...`)

  // Give ongoing requests time to complete
  setTimeout(() => {
    logger.info('Graceful shutdown completed')
    process.exit(0)
  }, 10000) // 10 seconds timeout
}

// Handle termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception occurred', {
    error: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString()
  })

  // Exit the process as it's in an undefined state
  process.exit(1)
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', {
    promise,
    reason,
    timestamp: new Date().toISOString()
  })

  // Exit the process as it's in an undefined state
  process.exit(1)
})

// Log application startup
logger.info('EMS Backend application configured successfully', {
  environment: process.env.NODE_ENV,
  port: process.env.PORT,
  version: process.env.API_VERSION || 'v1',
  timestamp: new Date().toISOString()
})

export default app
