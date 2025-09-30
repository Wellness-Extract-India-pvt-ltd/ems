import { validationResult } from 'express-validator'
import logger from '../utils/logger.js'

/**
 * Enhanced request validation middleware with comprehensive error handling
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export default (req, res, next) => {
  try {
    const errors = validationResult(req)

  if (!errors.isEmpty()) {
      const errorArray = errors.array()

      // Log validation failures for security monitoring
      logger.warn('Request validation failed', {
        path: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id,
        errorCount: errorArray.length,
        errors: errorArray.map((error) => ({
          field: error.path || error.param,
          message: error.msg,
          value: error.value,
          location: error.location
        })),
        timestamp: new Date().toISOString()
      })

      // Classify validation errors
      const classifiedErrors = classifyValidationErrors(errorArray)

      // Determine appropriate HTTP status code
      const statusCode = determineStatusCode(classifiedErrors)

      // Sanitize error messages to prevent information leakage
      const sanitizedErrors = sanitizeErrorMessages(errorArray)

      // Create standardized error response
      const errorResponse = {
        success: false,
        error: 'Validation Failed',
        message: 'Request validation failed. Please check your input data.',
        details: sanitizedErrors,
        metadata: {
          errorCount: errorArray.length,
          errorTypes: classifiedErrors,
          timestamp: new Date().toISOString(),
          path: req.path,
          method: req.method
        }
      }

      // Add additional context for debugging in development
      if (process.env.NODE_ENV === 'development') {
        errorResponse.debug = {
          originalErrors: errorArray,
          requestBody: req.body,
          requestParams: req.params,
          requestQuery: req.query
        }
      }

      return res.status(statusCode).json(errorResponse)
    }

    // Log successful validation for monitoring
    logger.debug('Request validation successful', {
      path: req.path,
      method: req.method,
      userId: req.user?.id,
      timestamp: new Date().toISOString()
    })

    next()
  } catch (error) {
    // Handle unexpected validation errors
    logger.error('Validation middleware error', {
      error: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method,
      ip: req.ip,
      timestamp: new Date().toISOString()
    })

    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Request validation service error',
      timestamp: new Date().toISOString()
    })
  }
}

/**
 * Classify validation errors by type
 * @param {Array} errors - Array of validation errors
 * @returns {Object} Classified error types
 */
function classifyValidationErrors (errors) {
  const classification = {
    required: 0,
    format: 0,
    type: 0,
    length: 0,
    range: 0,
    custom: 0,
    security: 0
  }

  errors.forEach((error) => {
    const msg = error.msg.toLowerCase()

    if (msg.includes('required') || msg.includes('must be provided')) {
      classification.required++
    } else if (
      msg.includes('format') ||
      msg.includes('invalid format') ||
      msg.includes('must be')
    ) {
      classification.format++
    } else if (msg.includes('must be a') || msg.includes('must be an')) {
      classification.type++
    } else if (
      msg.includes('length') ||
      msg.includes('too long') ||
      msg.includes('too short')
    ) {
      classification.length++
    } else if (
      msg.includes('between') ||
      msg.includes('minimum') ||
      msg.includes('maximum')
    ) {
      classification.range++
    } else if (
      msg.includes('security') ||
      msg.includes('injection') ||
      msg.includes('malicious')
    ) {
      classification.security++
    } else {
      classification.custom++
    }
  })

  return classification
}

/**
 * Determine appropriate HTTP status code based on error types
 * @param {Object} classifiedErrors - Classified error types
 * @returns {number} HTTP status code
 */
function determineStatusCode (classifiedErrors) {
  // Security-related validation errors should return 400 (Bad Request)
  if (classifiedErrors.security > 0) {
    return 400
  }

  // Required field errors are typically 422 (Unprocessable Entity)
  if (classifiedErrors.required > 0) {
    return 422
  }

  // Format and type errors are typically 422
  if (classifiedErrors.format > 0 || classifiedErrors.type > 0) {
    return 422
  }

  // Length and range errors are typically 422
  if (classifiedErrors.length > 0 || classifiedErrors.range > 0) {
    return 422
  }

  // Default to 422 for validation errors
  return 422
}

/**
 * Sanitize error messages to prevent information leakage
 * @param {Array} errors - Array of validation errors
 * @returns {Array} Sanitized error messages
 */
function sanitizeErrorMessages (errors) {
  return errors.map((error) => {
    const sanitizedError = {
      field: error.path || error.param || 'unknown',
      message: sanitizeErrorMessage(error.msg),
      location: error.location || 'body'
    }

    // Only include value in development mode
    if (process.env.NODE_ENV === 'development' && error.value !== undefined) {
      sanitizedError.value = error.value
    }

    return sanitizedError
  })
}

/**
 * Sanitize individual error message
 * @param {string} message - Error message to sanitize
 * @returns {string} Sanitized error message
 */
function sanitizeErrorMessage (message) {
  if (!message || typeof message !== 'string') {
    return 'Invalid input'
  }

  // Remove sensitive information patterns
  let sanitized = message
    .replace(/password/gi, '***')
    .replace(/token/gi, '***')
    .replace(/secret/gi, '***')
    .replace(/key/gi, '***')

  // Limit message length
  if (sanitized.length > 200) {
    sanitized = sanitized.substring(0, 197) + '...'
  }

  return sanitized
}

/**
 * Middleware to validate request size
 * @param {number} maxSize - Maximum request size in bytes
 * @returns {Function} Express middleware
 */
export const validateRequestSize = (maxSize = 1024 * 1024) => {
  // 1MB default
  return (req, res, next) => {
    const contentLength = parseInt(req.get('content-length') || '0')

    if (contentLength > maxSize) {
      logger.warn('Request size exceeded limit', {
        contentLength,
        maxSize,
        path: req.path,
        method: req.method,
        ip: req.ip,
        userId: req.user?.id
      })

      return res.status(413).json({
        success: false,
        error: 'Payload Too Large',
        message: `Request size exceeds limit of ${Math.round(maxSize / 1024)}KB`,
        metadata: {
          contentLength,
          maxSize,
          timestamp: new Date().toISOString()
        }
      })
    }

    next()
  }
}

/**
 * Middleware to validate request rate (basic rate limiting for validation)
 * @param {number} maxRequests - Maximum requests per window
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Function} Express middleware
 */
export const validateRequestRate = (
  maxRequests = 100,
  windowMs = 15 * 60 * 1000
) => {
  const requests = new Map()

  return (req, res, next) => {
    const key = req.ip || 'unknown'
    const now = Date.now()
    const windowStart = now - windowMs

    // Clean old entries
    for (const [ip, timestamps] of requests.entries()) {
      const validTimestamps = timestamps.filter(
        (timestamp) => timestamp > windowStart
      )
      if (validTimestamps.length === 0) {
        requests.delete(ip)
      } else {
        requests.set(ip, validTimestamps)
      }
    }

    // Check current request
    const userRequests = requests.get(key) || []
    const recentRequests = userRequests.filter(
      (timestamp) => timestamp > windowStart
    )

    if (recentRequests.length >= maxRequests) {
      logger.warn('Request rate limit exceeded', {
        ip: key,
        requestCount: recentRequests.length,
        maxRequests,
        windowMs,
        path: req.path,
        method: req.method,
        userId: req.user?.id
      })

      return res.status(429).json({
        success: false,
        error: 'Too Many Requests',
        message: 'Request rate limit exceeded. Please try again later.',
        metadata: {
          retryAfter: Math.ceil(windowMs / 1000),
          timestamp: new Date().toISOString()
        }
      })
    }

    // Add current request
    recentRequests.push(now)
    requests.set(key, recentRequests)

    next()
  }
}

/**
 * Middleware to validate required headers
 * @param {Array} requiredHeaders - Array of required header names
 * @returns {Function} Express middleware
 */
export const validateRequiredHeaders = (requiredHeaders = []) => {
  return (req, res, next) => {
    const missingHeaders = requiredHeaders.filter((header) => !req.get(header))

    if (missingHeaders.length > 0) {
      logger.warn('Required headers missing', {
        missingHeaders,
        path: req.path,
        method: req.method,
        ip: req.ip,
        userId: req.user?.id
      })

      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Required headers missing',
        details: missingHeaders.map((header) => ({
          field: header,
          message: `Header '${header}' is required`,
          location: 'headers'
        })),
        metadata: {
          missingHeaders,
          timestamp: new Date().toISOString()
        }
      })
    }

    next()
  }
}
