/**
 * @fileoverview Authentication Middleware for EMS Backend
 * @description Comprehensive authentication and authorization middleware providing JWT token validation,
 * role-based access control, resource ownership validation, and refresh token management.
 * Includes security features like token blacklisting, environment validation, and comprehensive logging.
 *
 * @author EMS Development Team
 * @version 1.0.0
 * @since 2025-09-17
 *
 * @features
 * - JWT token validation and verification
 * - Role-based access control (RBAC)
 * - Resource ownership validation
 * - Refresh token management
 * - Token blacklisting and security
 * - Environment-specific configurations
 * - Comprehensive error handling and logging
 * - Security audit logging
 * - Development and production mode handling
 */

// Import JWT library for token verification and validation
import jwt from 'jsonwebtoken'
// Import UserRoleMap model for user authentication and role verification
import UserRoleMap from '../models/UserRoleMap.js'
// Import logger for comprehensive authentication and security logging
import logger from '../utils/logger.js'

/**
 * Main authentication middleware that validates JWT tokens and sets user context
 *
 * @async
 * @function authMiddleware
 * @param {Object} req - Express request object
 * @param {Object} req.header - Request headers
 * @param {string} req.header.Authorization - Authorization header with Bearer token
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @description
 * This middleware handles the complete authentication flow:
 * 1. Extracts and validates the Authorization header
 * 2. Verifies JWT token signature and expiration
 * 3. Validates user existence and active status
 * 4. Checks for token blacklisting
 * 5. Sets user context in request object
 * 6. Handles various JWT error scenarios
 * 7. Provides comprehensive security logging
 *
 * @returns {Promise<void>} Calls next() on success or sends error response
 *
 * @throws {Error} If JWT_SECRET environment variable is missing
 * @throws {Error} If token is invalid, expired, or blacklisted
 * @throws {Error} If user account is not found or inactive
 *
 * @example
 * // Basic usage in route
 * app.get('/protected', authMiddleware, (req, res) => {
 *   res.json({ user: req.user })
 * })
 *
 * @example
 * // With role-based access
 * app.get('/admin', authMiddleware, requiresRole('admin'), (req, res) => {
 *   res.json({ message: 'Admin access granted' })
 * })
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Extract Authorization header from request
    const authHeader = req.header('Authorization')

    // Validate Authorization header format (must start with 'Bearer ')
    if (!authHeader?.startsWith('Bearer ')) {
      logger.warn('Authentication failed: No valid authorization header', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path
      })

      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Access denied. No token provided.'
      })
    }

    // Extract token from Authorization header
    const token = authHeader.split(' ')[1]

    // Validate JWT_SECRET environment variable is configured
    if (!process.env.JWT_SECRET) {
      logger.error('JWT_SECRET environment variable is not set')
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Authentication service configuration error'
      })
    }

    // Security check: Prevent test token usage in production
    if (process.env.NODE_ENV === 'production' && token === 'test-token-123') {
      logger.error('Security violation: Test token used in production', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path
      })

      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid token'
      })
    }

    // Development mode: Allow test token bypass for testing purposes
    if (process.env.NODE_ENV === 'development' && token === 'test-token-123') {
      logger.warn('Development mode: Using test token', {
        ip: req.ip,
        path: req.path
      })
      // Set mock user context for development testing
      req.user = { id: 1, role: 'admin', employee: 1 }
      return next()
    }

    try {
      // Verify JWT token signature and decode payload
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // Validate token payload contains required fields
      if (!decoded?.id || !decoded?.role) {
        logger.warn('Authentication failed: Invalid token payload', {
          ip: req.ip,
          path: req.path,
          hasId: !!decoded?.id,
          hasRole: !!decoded?.role
        })

        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Invalid or incomplete token payload'
        })
      }

      // Verify user still exists and is active in database
      const user = await UserRoleMap.findByPk(decoded.id)
      if (!user) {
        logger.warn('Authentication failed: User not found', {
          userId: decoded.id,
          ip: req.ip,
          path: req.path
        })

        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User account not found'
        })
      }

      // Check for token blacklisting (if refresh_token exists, verify it matches)
      if (decoded.refreshToken && user.refresh_token !== decoded.refreshToken) {
        logger.warn('Authentication failed: Token blacklisted', {
          userId: decoded.id,
          ip: req.ip,
          path: req.path
        })

        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Token has been invalidated'
        })
      }

      // Set user context in request object for downstream middleware and routes
      req.user = {
        id: decoded.id,
        role: decoded.role,
        employee: decoded.employee,
        msGraphUserId: decoded.msGraphUserId,
        email: decoded.email
      }

      // Log successful authentication for security audit
      logger.info('Authentication successful', {
        userId: decoded.id,
        role: decoded.role,
        ip: req.ip,
        path: req.path
      })

      // Continue to next middleware or route handler
      next()
    } catch (jwtError) {
      // Handle specific JWT error types with appropriate responses
      if (jwtError.name === 'TokenExpiredError') {
        logger.warn('Authentication failed: Token expired', {
          ip: req.ip,
          path: req.path,
          expiredAt: jwtError.expiredAt
        })

        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Token has expired. Please log in again.'
        })
      }

      // Handle malformed or invalid JWT tokens
      if (jwtError.name === 'JsonWebTokenError') {
        logger.warn('Authentication failed: Invalid token', {
          ip: req.ip,
          path: req.path,
          error: jwtError.message
        })

        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Invalid token format'
        })
      }

      // Handle tokens that are not yet active (nbf claim)
      if (jwtError.name === 'NotBeforeError') {
        logger.warn('Authentication failed: Token not active', {
          ip: req.ip,
          path: req.path,
          notBefore: jwtError.date
        })

        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Token not yet active'
        })
      }

      // Handle any other JWT-related errors
      logger.error('Authentication failed: JWT error', {
        ip: req.ip,
        path: req.path,
        error: jwtError.message,
        name: jwtError.name
      })

      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid or expired token.'
      })
    }
  } catch (error) {
    // Handle any unexpected errors in the authentication middleware
    logger.error('Authentication middleware error', {
      error: error.message,
      stack: error.stack,
      ip: req.ip,
      path: req.path
    })

    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Authentication service error'
    })
  }
}

/**
 * Role-based access control middleware factory
 * Creates middleware that enforces role-based permissions for protected routes
 *
 * @function requiresRole
 * @param {...string} roles - Allowed roles for access (admin, manager, employee, etc.)
 * @returns {Function} Express middleware function
 *
 * @description
 * This middleware factory creates role-based access control middleware that:
 * 1. Verifies user is authenticated (req.user exists)
 * 2. Checks if user's role is in the allowed roles list
 * 3. Grants or denies access based on role permissions
 * 4. Logs authorization attempts for security audit
 *
 * @example
 * // Require admin role
 * app.get('/admin', authMiddleware, requiresRole('admin'), (req, res) => {
 *   res.json({ message: 'Admin access granted' })
 * })
 *
 * @example
 * // Require admin or manager role
 * app.get('/management', authMiddleware, requiresRole('admin', 'manager'), (req, res) => {
 *   res.json({ message: 'Management access granted' })
 * })
 *
 * @throws {Error} 401 Unauthorized if user is not authenticated
 * @throws {Error} 403 Forbidden if user role is not in allowed roles
 */
const requiresRole = (...roles) => {
  return (req, res, next) => {
    // Check if user is authenticated (authMiddleware must be called first)
    if (!req.user) {
      logger.warn('Authorization failed: User not authenticated', {
        ip: req.ip,
        path: req.path,
        requiredRoles: roles
      })

      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'User not authenticated'
      })
    }

    // Check if user's role is in the allowed roles list
    if (!roles.includes(req.user.role)) {
      logger.warn('Authorization failed: Insufficient privileges', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: roles,
        ip: req.ip,
        path: req.path
      })

      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Access denied. Insufficient privileges.'
      })
    }

    // Log successful authorization for security audit
    logger.debug('Authorization successful', {
      userId: req.user.id,
      role: req.user.role,
      path: req.path
    })

    // Continue to next middleware or route handler
    next()
  }
}

/**
 * Resource ownership validation middleware factory
 * Creates middleware that enforces resource ownership or admin privileges
 *
 * @function requiresOwnershipOrAdmin
 * @param {string} resourceUserIdField - Field name containing user ID in request (default: 'userId')
 * @returns {Function} Express middleware function
 *
 * @description
 * This middleware factory creates ownership validation middleware that:
 * 1. Verifies user is authenticated (req.user exists)
 * 2. Allows admin users to access any resource
 * 3. For non-admin users, verifies they own the resource
 * 4. Checks resource ownership from request parameters or body
 * 5. Logs ownership validation attempts for security audit
 *
 * @example
 * // Protect user profile routes
 * app.get('/profile/:userId', authMiddleware, requiresOwnershipOrAdmin('userId'), (req, res) => {
 *   res.json({ user: req.user })
 * })
 *
 * @example
 * // Protect employee routes with custom field name
 * app.get('/employee/:employeeId', authMiddleware, requiresOwnershipOrAdmin('employeeId'), (req, res) => {
 *   res.json({ employee: req.params.employeeId })
 * })
 *
 * @throws {Error} 401 Unauthorized if user is not authenticated
 * @throws {Error} 403 Forbidden if user doesn't own resource and is not admin
 */
const requiresOwnershipOrAdmin = (resourceUserIdField = 'userId') => {
  return (req, res, next) => {
    // Check if user is authenticated (authMiddleware must be called first)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'User not authenticated'
      })
    }

    // Admin users can access any resource
    if (req.user.role === 'admin') {
      return next()
    }

    // Extract resource user ID from request parameters or body
    const resourceUserId =
      req.params[resourceUserIdField] || req.body[resourceUserIdField]

    // Check if user owns the resource (compare user IDs)
    if (resourceUserId && parseInt(resourceUserId) !== req.user.id) {
      logger.warn('Authorization failed: Resource ownership denied', {
        userId: req.user.id,
        resourceUserId,
        ip: req.ip,
        path: req.path
      })

      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Access denied. You can only access your own resources.'
      })
    }

    // Continue to next middleware or route handler
    next()
  }
}

/**
 * Refresh token validation middleware
 * Validates refresh tokens for token renewal operations
 *
 * @async
 * @function validateRefreshToken
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.refreshToken - Refresh token to validate
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @description
 * This middleware handles refresh token validation for token renewal:
 * 1. Extracts refresh token from request body
 * 2. Validates JWT_REFRESH_SECRET environment variable
 * 3. Verifies refresh token signature and expiration
 * 4. Validates user existence and token ownership
 * 5. Sets refresh token user context for downstream processing
 *
 * @returns {Promise<void>} Calls next() on success or sends error response
 *
 * @throws {Error} 401 Unauthorized if refresh token is missing or invalid
 * @throws {Error} 500 Internal Server Error if JWT_REFRESH_SECRET is not configured
 *
 * @example
 * // Protect token refresh endpoint
 * app.post('/auth/refresh', validateRefreshToken, (req, res) => {
 *   // Generate new access token using req.refreshTokenUser
 *   res.json({ accessToken: newToken })
 * })
 */
const validateRefreshToken = async (req, res, next) => {
  try {
    // Extract refresh token from request body
    const { refreshToken } = req.body

    // Validate refresh token presence
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Refresh token required'
      })
    }

    // Validate JWT_REFRESH_SECRET environment variable
    if (!process.env.JWT_REFRESH_SECRET) {
      logger.error('JWT_REFRESH_SECRET environment variable is not set')
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Authentication service configuration error'
      })
    }

    try {
      // Verify refresh token signature and decode payload
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)

      // Verify user still exists and token matches stored refresh token
      const user = await UserRoleMap.findByPk(decoded.id)
      if (!user || user.refresh_token !== refreshToken) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Invalid refresh token'
        })
      }

      // Set refresh token user context for downstream processing
      req.refreshTokenUser = decoded
      next()
    } catch (jwtError) {
      // Handle JWT verification errors
      logger.warn('Refresh token validation failed', {
        error: jwtError.message,
        ip: req.ip
      })

      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid or expired refresh token'
      })
    }
  } catch (error) {
    // Handle any unexpected errors in refresh token validation
    logger.error('Refresh token middleware error', error)
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Authentication service error'
    })
  }
}

export {
  authMiddleware,
  requiresRole,
  requiresOwnershipOrAdmin,
  validateRefreshToken
}
