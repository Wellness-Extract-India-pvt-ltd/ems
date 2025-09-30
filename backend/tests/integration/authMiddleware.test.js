/**
 * Authentication Middleware Tests
 * Comprehensive test suite for authMiddleware.js functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import express from 'express'
import jwt from 'jsonwebtoken'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Mock the logger
const mockLogger = {
  warn: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  debug: vi.fn()
}

// Mock the UserRoleMap model
const mockUserRoleMap = {
  findByPk: vi.fn()
}

// Mock environment variables
const originalEnv = process.env

describe('Authentication Middleware Tests', () => {
  let app
  let middlewarePath
  let fileContent

  beforeAll(async () => {
    // Set up test environment variables
    process.env.JWT_SECRET = 'test-jwt-secret'
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret'
    process.env.NODE_ENV = 'test'

    // Create Express app for testing
    app = express()
    app.use(express.json())

    // Get the middleware file path
    middlewarePath = path.join(__dirname, '..', 'middleware', 'authMiddleware.js')
    fileContent = fs.readFileSync(middlewarePath, 'utf8')

    // Mock required modules
    vi.mock('../utils/logger.js', () => ({ default: mockLogger }))
    vi.mock('../models/UserRoleMap.js', () => ({ default: mockUserRoleMap }))

    // Dynamically import the middleware after mocks are set up
    const authModule = await import('../middleware/authMiddleware.js')
    const { authMiddleware, requiresRole, requiresOwnershipOrAdmin, validateRefreshToken } = authModule

    // Set up test routes
    app.get('/protected', authMiddleware, (req, res) => {
      res.json({ user: req.user, message: 'Protected route accessed' })
    })

    app.get('/admin', authMiddleware, requiresRole('admin'), (req, res) => {
      res.json({ message: 'Admin access granted' })
    })

    app.get('/management', authMiddleware, requiresRole('admin', 'manager'), (req, res) => {
      res.json({ message: 'Management access granted' })
    })

    app.get('/profile/:userId', authMiddleware, requiresOwnershipOrAdmin('userId'), (req, res) => {
      res.json({ user: req.user, profileId: req.params.userId })
    })

    app.post('/auth/refresh', validateRefreshToken, (req, res) => {
      res.json({ message: 'Token refreshed', user: req.refreshTokenUser })
    })
  })

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks()
  })

  afterAll(() => {
    // Restore original environment
    process.env = originalEnv
    vi.restoreAllMocks()
  })

  describe('File Structure and Documentation', () => {
    it('should have proper file structure', () => {
      expect(fileContent).toContain('@fileoverview Authentication Middleware for EMS Backend')
      expect(fileContent).toContain('@author EMS Development Team')
      expect(fileContent).toContain('@version 1.0.0')
      expect(fileContent).toContain('@since 2025-09-17')
    })

    it('should have comprehensive JSDoc documentation', () => {
      expect(fileContent).toContain('@function authMiddleware')
      expect(fileContent).toContain('@function requiresRole')
      expect(fileContent).toContain('@function requiresOwnershipOrAdmin')
      expect(fileContent).toContain('@function validateRefreshToken')
    })

    it('should have inline comments', () => {
      expect(fileContent).toContain('// Import JWT library for token verification and validation')
      expect(fileContent).toContain('// Extract Authorization header from request')
      expect(fileContent).toContain('// Validate Authorization header format')
      expect(fileContent).toContain('// Verify JWT token signature and decode payload')
      expect(fileContent).toContain('// Set user context in request object')
    })

    it('should export all middleware functions', () => {
      expect(fileContent).toContain('export {')
      expect(fileContent).toContain('authMiddleware,')
      expect(fileContent).toContain('requiresRole,')
      expect(fileContent).toContain('requiresOwnershipOrAdmin,')
      expect(fileContent).toContain('validateRefreshToken')
    })
  })

  describe('AuthMiddleware - Token Validation', () => {
    it('should reject requests without Authorization header', async () => {
      const response = await request(app)
        .get('/protected')
        .expect(401)

      expect(response.body).toEqual({
        success: false,
        error: 'Unauthorized',
        message: 'Access denied. No token provided.'
      })
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Authentication failed: No valid authorization header',
        expect.objectContaining({
          ip: expect.any(String),
          path: '/protected'
        })
      )
    })

    it('should reject requests with invalid Authorization header format', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'Invalid token')
        .expect(401)

      expect(response.body).toEqual({
        success: false,
        error: 'Unauthorized',
        message: 'Access denied. No token provided.'
      })
    })

    it('should handle missing JWT_SECRET environment variable', async () => {
      const originalSecret = process.env.JWT_SECRET
      delete process.env.JWT_SECRET

      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer valid-token')
        .expect(500)

      expect(response.body).toEqual({
        success: false,
        error: 'Internal Server Error',
        message: 'Authentication service configuration error'
      })
      expect(mockLogger.error).toHaveBeenCalledWith('JWT_SECRET environment variable is not set')

      // Restore environment
      process.env.JWT_SECRET = originalSecret
    })

    it('should reject test token in production environment', async () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer test-token-123')
        .expect(401)

      expect(response.body).toEqual({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid token'
      })
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Security violation: Test token used in production',
        expect.objectContaining({
          ip: expect.any(String),
          path: '/protected'
        })
      )

      // Restore environment
      process.env.NODE_ENV = originalEnv
    })

    it('should allow test token in development environment', async () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer test-token-123')
        .expect(200)

      expect(response.body).toEqual({
        user: { id: 1, role: 'admin', employee: 1 },
        message: 'Protected route accessed'
      })
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Development mode: Using test token',
        expect.objectContaining({
          ip: expect.any(String),
          path: '/protected'
        })
      )

      // Restore environment
      process.env.NODE_ENV = originalEnv
    })

    it('should reject invalid JWT tokens', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer invalid-jwt-token')
        .expect(401)

      expect(response.body).toEqual({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid token format'
      })
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Authentication failed: Invalid token',
        expect.objectContaining({
          ip: expect.any(String),
          path: '/protected',
          error: expect.any(String)
        })
      )
    })

    it('should reject expired JWT tokens', async () => {
      const expiredToken = jwt.sign(
        { id: 1, role: 'admin', employee: 1 },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' } // Expired 1 hour ago
      )

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401)

      expect(response.body).toEqual({
        success: false,
        error: 'Unauthorized',
        message: 'Token has expired. Please log in again.'
      })
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Authentication failed: Token expired',
        expect.objectContaining({
          ip: expect.any(String),
          path: '/protected',
          expiredAt: expect.any(Date)
        })
      )
    })

    it('should reject tokens with invalid payload', async () => {
      const invalidToken = jwt.sign(
        { invalid: 'payload' }, // Missing required fields
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      )

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(401)

      expect(response.body).toEqual({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid or incomplete token payload'
      })
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Authentication failed: Invalid token payload',
        expect.objectContaining({
          ip: expect.any(String),
          path: '/protected',
          hasId: false,
          hasRole: false
        })
      )
    })

    it('should reject tokens for non-existent users', async () => {
      const validToken = jwt.sign(
        { id: 999, role: 'admin', employee: 1 },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      )

      mockUserRoleMap.findByPk.mockResolvedValue(null)

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(401)

      expect(response.body).toEqual({
        success: false,
        error: 'Unauthorized',
        message: 'User account not found'
      })
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Authentication failed: User not found',
        expect.objectContaining({
          userId: 999,
          ip: expect.any(String),
          path: '/protected'
        })
      )
    })

    it('should reject blacklisted tokens', async () => {
      const validToken = jwt.sign(
        { id: 1, role: 'admin', employee: 1, refreshToken: 'old-refresh-token' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      )

      mockUserRoleMap.findByPk.mockResolvedValue({
        id: 1,
        refresh_token: 'different-refresh-token'
      })

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(401)

      expect(response.body).toEqual({
        success: false,
        error: 'Unauthorized',
        message: 'Token has been invalidated'
      })
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Authentication failed: Token blacklisted',
        expect.objectContaining({
          userId: 1,
          ip: expect.any(String),
          path: '/protected'
        })
      )
    })

    it('should accept valid tokens and set user context', async () => {
      const validToken = jwt.sign(
        { id: 1, role: 'admin', employee: 1, msGraphUserId: 'graph-123', email: 'test@example.com' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      )

      mockUserRoleMap.findByPk.mockResolvedValue({
        id: 1,
        refresh_token: null
      })

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200)

      expect(response.body).toEqual({
        user: {
          id: 1,
          role: 'admin',
          employee: 1,
          msGraphUserId: 'graph-123',
          email: 'test@example.com'
        },
        message: 'Protected route accessed'
      })
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Authentication successful',
        expect.objectContaining({
          userId: 1,
          role: 'admin',
          ip: expect.any(String),
          path: '/protected'
        })
      )
    })
  })

  describe('RequiresRole Middleware', () => {
    it('should reject unauthenticated users', async () => {
      const response = await request(app)
        .get('/admin')
        .expect(401)

      expect(response.body).toEqual({
        success: false,
        error: 'Unauthorized',
        message: 'Access denied. No token provided.'
      })
    })

    it('should reject users with insufficient privileges', async () => {
      const employeeToken = jwt.sign(
        { id: 2, role: 'employee', employee: 2 },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      )

      mockUserRoleMap.findByPk.mockResolvedValue({
        id: 2,
        refresh_token: null
      })

      const response = await request(app)
        .get('/admin')
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(403)

      expect(response.body).toEqual({
        success: false,
        error: 'Forbidden',
        message: 'Access denied. Insufficient privileges.'
      })
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Authorization failed: Insufficient privileges',
        expect.objectContaining({
          userId: 2,
          userRole: 'employee',
          requiredRoles: ['admin'],
          ip: expect.any(String),
          path: '/admin'
        })
      )
    })

    it('should allow admin users to access admin routes', async () => {
      const adminToken = jwt.sign(
        { id: 1, role: 'admin', employee: 1 },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      )

      mockUserRoleMap.findByPk.mockResolvedValue({
        id: 1,
        refresh_token: null
      })

      const response = await request(app)
        .get('/admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      expect(response.body).toEqual({
        message: 'Admin access granted'
      })
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Authorization successful',
        expect.objectContaining({
          userId: 1,
          role: 'admin',
          path: '/admin'
        })
      )
    })

    it('should allow multiple roles', async () => {
      const managerToken = jwt.sign(
        { id: 3, role: 'manager', employee: 3 },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      )

      mockUserRoleMap.findByPk.mockResolvedValue({
        id: 3,
        refresh_token: null
      })

      const response = await request(app)
        .get('/management')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200)

      expect(response.body).toEqual({
        message: 'Management access granted'
      })
    })
  })

  describe('RequiresOwnershipOrAdmin Middleware', () => {
    it('should reject unauthenticated users', async () => {
      const response = await request(app)
        .get('/profile/1')
        .expect(401)

      expect(response.body).toEqual({
        success: false,
        error: 'Unauthorized',
        message: 'Access denied. No token provided.'
      })
    })

    it('should allow admin users to access any resource', async () => {
      const adminToken = jwt.sign(
        { id: 1, role: 'admin', employee: 1 },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      )

      mockUserRoleMap.findByPk.mockResolvedValue({
        id: 1,
        refresh_token: null
      })

      const response = await request(app)
        .get('/profile/999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      expect(response.body).toEqual({
        user: {
          id: 1,
          role: 'admin',
          employee: 1,
          msGraphUserId: undefined,
          email: undefined
        },
        profileId: '999'
      })
    })

    it('should allow users to access their own resources', async () => {
      const userToken = jwt.sign(
        { id: 2, role: 'employee', employee: 2 },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      )

      mockUserRoleMap.findByPk.mockResolvedValue({
        id: 2,
        refresh_token: null
      })

      const response = await request(app)
        .get('/profile/2')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)

      expect(response.body).toEqual({
        user: {
          id: 2,
          role: 'employee',
          employee: 2,
          msGraphUserId: undefined,
          email: undefined
        },
        profileId: '2'
      })
    })

    it('should reject users trying to access other users resources', async () => {
      const userToken = jwt.sign(
        { id: 2, role: 'employee', employee: 2 },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      )

      mockUserRoleMap.findByPk.mockResolvedValue({
        id: 2,
        refresh_token: null
      })

      const response = await request(app)
        .get('/profile/999')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403)

      expect(response.body).toEqual({
        success: false,
        error: 'Forbidden',
        message: 'Access denied. You can only access your own resources.'
      })
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Authorization failed: Resource ownership denied',
        expect.objectContaining({
          userId: 2,
          resourceUserId: '999',
          ip: expect.any(String),
          path: '/profile/999'
        })
      )
    })
  })

  describe('ValidateRefreshToken Middleware', () => {
    it('should reject requests without refresh token', async () => {
      const response = await request(app)
        .post('/auth/refresh')
        .expect(500)

      expect(response.body).toEqual({
        success: false,
        error: 'Internal Server Error',
        message: 'Authentication service error'
      })
    })

    it('should handle missing JWT_REFRESH_SECRET environment variable', async () => {
      const originalSecret = process.env.JWT_REFRESH_SECRET
      delete process.env.JWT_REFRESH_SECRET

      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: 'valid-token' })
        .expect(500)

      expect(response.body).toEqual({
        success: false,
        error: 'Internal Server Error',
        message: 'Authentication service configuration error'
      })
      expect(mockLogger.error).toHaveBeenCalledWith('JWT_REFRESH_SECRET environment variable is not set')

      // Restore environment
      process.env.JWT_REFRESH_SECRET = originalSecret
    })

    it('should reject invalid refresh tokens', async () => {
      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401)

      expect(response.body).toEqual({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid or expired refresh token'
      })
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Refresh token validation failed',
        expect.objectContaining({
          error: expect.any(String),
          ip: expect.any(String)
        })
      )
    })

    it('should reject refresh tokens for non-existent users', async () => {
      const validRefreshToken = jwt.sign(
        { id: 999, role: 'admin' },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      )

      mockUserRoleMap.findByPk.mockResolvedValue(null)

      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: validRefreshToken })
        .expect(401)

      expect(response.body).toEqual({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid refresh token'
      })
    })

    it('should reject refresh tokens that do not match stored tokens', async () => {
      const validRefreshToken = jwt.sign(
        { id: 1, role: 'admin' },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      )

      mockUserRoleMap.findByPk.mockResolvedValue({
        id: 1,
        refresh_token: 'different-token'
      })

      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: validRefreshToken })
        .expect(401)

      expect(response.body).toEqual({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid refresh token'
      })
    })

    it('should accept valid refresh tokens', async () => {
      const validRefreshToken = jwt.sign(
        { id: 1, role: 'admin', employee: 1 },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      )

      mockUserRoleMap.findByPk.mockResolvedValue({
        id: 1,
        refresh_token: validRefreshToken
      })

      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: validRefreshToken })
        .expect(200)

      expect(response.body).toEqual({
        message: 'Token refreshed',
        user: expect.objectContaining({
          id: 1,
          role: 'admin',
          employee: 1
        })
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle unexpected middleware errors', async () => {
      // Mock an error in the middleware
      const originalFindByPk = mockUserRoleMap.findByPk
      mockUserRoleMap.findByPk.mockRejectedValue(new Error('Database connection failed'))

      const validToken = jwt.sign(
        { id: 1, role: 'admin', employee: 1 },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      )

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(401)

      expect(response.body).toEqual({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid or expired token.'
      })

      // Restore original function
      mockUserRoleMap.findByPk = originalFindByPk
    })
  })
})
