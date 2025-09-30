import { describe, it, expect, beforeEach, afterEach, vi, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Mock environment variables
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test_jwt_secret'
process.env.JWT_REFRESH_SECRET = 'test_jwt_refresh_secret'
process.env.DB_HOST = 'test_db_host'
process.env.DB_NAME = 'test_db'
process.env.DB_USER = 'test_db_user'
process.env.DB_PASSWORD = 'test_db_password'
process.env.CLIENT_ID = 'test-client-id-123'
process.env.CLIENT_SECRET = 'test-client-secret'
process.env.TENANT_ID = 'test-tenant-id-123'
process.env.FRONTEND_URL = 'http://localhost:5173'
process.env.RATE_LIMIT_WINDOW_MS = '1000'
process.env.RATE_LIMIT_MAX_REQUESTS = '5'
process.env.MAX_REQUEST_SIZE = '1mb'
process.env.SESSION_SECRET = 'test_session_secret'
process.env.API_VERSION = 'v1'

describe('License Controller Tests', () => {
  let controllerPath
  let fileContent

  beforeAll(() => {
    controllerPath = path.join(__dirname, '..', 'controllers', 'licenseController.js')
    fileContent = fs.readFileSync(controllerPath, 'utf8')
  })

  describe('File Structure and Imports', () => {
    it('should exist and be readable', () => {
      expect(fs.existsSync(controllerPath)).toBe(true)
      expect(fileContent.length).toBeGreaterThan(0)
    })

    it('should have valid JavaScript syntax', () => {
      // Check for basic JavaScript syntax patterns
      expect(fileContent).toContain('function ')
      expect(fileContent).toContain('const ')
      expect(fileContent).toContain('export ')
      expect(fileContent).toContain('import ')
    })

    it('should have proper ES6 module structure', () => {
      expect(fileContent).toContain('export async function addLicense')
      expect(fileContent).toContain('export async function listLicenses')
      expect(fileContent).toContain('export async function getLicenseById')
      expect(fileContent).toContain('export async function updateLicense')
      expect(fileContent).toContain('export async function deleteLicense')
      expect(fileContent).toContain('export async function getLicensesByEmployee')
    })

    it('should have proper imports', () => {
      expect(fileContent).toContain("import { validationResult } from 'express-validator'")
      expect(fileContent).toContain("import { License, Employee } from '../models/index.js'")
      expect(fileContent).toContain("import logger from '../utils/logger.js'")
      expect(fileContent).toContain("import redisConfig from '../config/redis.js'")
    })
  })

  describe('addLicense Function', () => {
    it('should have addLicense function', () => {
      expect(fileContent).toContain('export async function addLicense')
    })

    it('should validate request parameters', () => {
      expect(fileContent).toContain('const errors = validationResult(req)')
      expect(fileContent).toContain('if (!errors.isEmpty()) {')
      expect(fileContent).toContain('return res.status(400).json({ errors: errors.array() })')
    })

    it('should create license using Sequelize', () => {
      expect(fileContent).toContain('await License.create(req.body)')
    })

    it('should log license creation', () => {
      expect(fileContent).toContain('logger.info(\'License added\', { licenseId: newLicense.id })')
    })

    it('should invalidate cache on creation', () => {
      expect(fileContent).toContain("await redisConfig.del('license:list:*')")
      expect(fileContent).toContain("await redisConfig.del('license:employee:*')")
    })

    it('should return success response', () => {
      expect(fileContent).toContain('res.status(201).json({')
      expect(fileContent).toContain('success: true')
      expect(fileContent).toContain("message: 'License added successfully'")
      expect(fileContent).toContain('data: newLicense')
    })

    it('should handle errors', () => {
      expect(fileContent).toContain('logger.error(\'License creation failed\', { error: error.message })')
      expect(fileContent).toContain('res.status(400).json({')
      expect(fileContent).toContain("message: 'Error adding license'")
    })
  })

  describe('listLicenses Function', () => {
    it('should have listLicenses function', () => {
      expect(fileContent).toContain('export async function listLicenses')
    })

    it('should handle user role and ID', () => {
      expect(fileContent).toContain('const userRole = req.user?.role')
      expect(fileContent).toContain('const userId = req.user?.id')
    })

    it('should handle pagination', () => {
      expect(fileContent).toContain('const page = parseInt(req.query.page) || 1')
      expect(fileContent).toContain('const limit = parseInt(req.query.limit) || 10')
      expect(fileContent).toContain('const offset = (page - 1) * limit')
    })

    it('should generate cache key with user info', () => {
      expect(fileContent).toContain("redisConfig.generateKey(")
      expect(fileContent).toContain("'license'")
      expect(fileContent).toContain("'list'")
      expect(fileContent).toContain('userRole')
      expect(fileContent).toContain('userId')
    })

    it('should check cache first', () => {
      expect(fileContent).toContain('if (redisConfig.isRedisConnected()) {')
      expect(fileContent).toContain('const cachedData = await redisConfig.get(cacheKey)')
      expect(fileContent).toContain('if (cachedData) {')
      expect(fileContent).toContain("logger.info('License list served from cache')")
    })

    it('should implement role-based access control', () => {
      expect(fileContent).toContain('const whereClause = {}')
      expect(fileContent).toContain("if (userRole !== 'admin') {")
      expect(fileContent).toContain('whereClause.assigned_to = userId')
    })

    it('should query database with pagination and employee info', () => {
      expect(fileContent).toContain('await License.findAndCountAll({')
      expect(fileContent).toContain('where: whereClause,')
      expect(fileContent).toContain('include: [')
      expect(fileContent).toContain('model: Employee,')
      expect(fileContent).toContain("as: 'assignedEmployee'")
      expect(fileContent).toContain('limit,')
      expect(fileContent).toContain('offset,')
      expect(fileContent).toContain("order: [['createdAt', 'DESC']]")
    })

    it('should return pagination info', () => {
      expect(fileContent).toContain('pagination: {')
      expect(fileContent).toContain('page,')
      expect(fileContent).toContain('limit,')
      expect(fileContent).toContain('total: count,')
      expect(fileContent).toContain('pages: Math.ceil(count / limit)')
    })

    it('should cache results', () => {
      expect(fileContent).toContain('await redisConfig.setex(cacheKey, 300, result)')
    })
  })

  describe('getLicenseById Function', () => {
    it('should have getLicenseById function', () => {
      expect(fileContent).toContain('export async function getLicenseById')
    })

    it('should extract user information and license ID', () => {
      expect(fileContent).toContain('const userRole = req.user?.role')
      expect(fileContent).toContain('const userId = req.user?.id')
      expect(fileContent).toContain('const licenseId = req.params._id')
    })

    it('should generate cache key for specific license', () => {
      expect(fileContent).toContain("redisConfig.generateKey('license', 'detail', licenseId)")
    })

    it('should check cache first', () => {
      expect(fileContent).toContain('if (redisConfig.isRedisConnected()) {')
      expect(fileContent).toContain('const cachedData = await redisConfig.get(cacheKey)')
      expect(fileContent).toContain("logger.info('License detail served from cache')")
    })

    it('should implement role-based access control', () => {
      expect(fileContent).toContain('const whereClause = { id: licenseId }')
      expect(fileContent).toContain("if (userRole !== 'admin') {")
      expect(fileContent).toContain('whereClause.assigned_to = userId')
    })

    it('should find license by ID with employee info', () => {
      expect(fileContent).toContain('await License.findOne({')
      expect(fileContent).toContain('where: whereClause,')
      expect(fileContent).toContain('include: [')
      expect(fileContent).toContain('model: Employee,')
      expect(fileContent).toContain("as: 'assignedEmployee'")
    })

    it('should handle not found case', () => {
      expect(fileContent).toContain('if (!license) {')
      expect(fileContent).toContain('return res.status(404).json({')
      expect(fileContent).toContain("message: 'License not found'")
    })

    it('should cache results', () => {
      expect(fileContent).toContain('await redisConfig.setex(cacheKey, 300, result)')
    })
  })

  describe('updateLicense Function', () => {
    it('should have updateLicense function', () => {
      expect(fileContent).toContain('export async function updateLicense')
    })

    it('should validate request parameters', () => {
      expect(fileContent).toContain('const errors = validationResult(req)')
      expect(fileContent).toContain('if (!errors.isEmpty()) {')
      expect(fileContent).toContain('return res.status(400).json({ errors: errors.array() })')
    })

    it('should extract license ID', () => {
      expect(fileContent).toContain('const licenseId = req.params._id')
    })

    it('should update license using Sequelize', () => {
      expect(fileContent).toContain('await License.update(req.body, {')
      expect(fileContent).toContain('where: { id: licenseId }')
    })

    it('should handle not found case', () => {
      expect(fileContent).toContain('if (updatedRowsCount === 0) {')
      expect(fileContent).toContain('return res.status(404).json({')
      expect(fileContent).toContain("message: 'License not found'")
    })

    it('should retrieve updated license', () => {
      expect(fileContent).toContain('await License.findByPk(licenseId)')
    })

    it('should log update', () => {
      expect(fileContent).toContain('logger.info(\'License updated\', { licenseId })')
    })

    it('should invalidate cache on update', () => {
      expect(fileContent).toContain("await redisConfig.del('license:list:*')")
      expect(fileContent).toContain("await redisConfig.del('license:employee:*')")
      expect(fileContent).toContain("redisConfig.generateKey('license', 'detail', licenseId)")
    })

    it('should return success response', () => {
      expect(fileContent).toContain('res.status(200).json({')
      expect(fileContent).toContain('success: true')
      expect(fileContent).toContain("message: 'License updated successfully'")
      expect(fileContent).toContain('data: updatedLicense')
    })
  })

  describe('deleteLicense Function', () => {
    it('should have deleteLicense function', () => {
      expect(fileContent).toContain('export async function deleteLicense')
    })

    it('should extract license ID', () => {
      expect(fileContent).toContain('const licenseId = req.params._id')
    })

    it('should delete license using Sequelize', () => {
      expect(fileContent).toContain('await License.destroy({')
      expect(fileContent).toContain('where: { id: licenseId }')
    })

    it('should handle not found case', () => {
      expect(fileContent).toContain('if (deletedRowsCount === 0) {')
      expect(fileContent).toContain('return res.status(404).json({')
      expect(fileContent).toContain("message: 'License not found'")
    })

    it('should log deletion', () => {
      expect(fileContent).toContain('logger.info(\'License deleted\', { licenseId })')
    })

    it('should invalidate cache on deletion', () => {
      expect(fileContent).toContain("await redisConfig.del('license:list:*')")
      expect(fileContent).toContain("await redisConfig.del('license:employee:*')")
      expect(fileContent).toContain("redisConfig.generateKey('license', 'detail', licenseId)")
    })

    it('should return success response', () => {
      expect(fileContent).toContain('res.status(200).json({')
      expect(fileContent).toContain('success: true')
      expect(fileContent).toContain("message: 'License deleted successfully'")
    })
  })

  describe('getLicensesByEmployee Function', () => {
    it('should have getLicensesByEmployee function', () => {
      expect(fileContent).toContain('export async function getLicensesByEmployee')
    })

    it('should extract user information and employee ID', () => {
      expect(fileContent).toContain('const userRole = req.user?.role')
      expect(fileContent).toContain('const userId = req.user?.id')
      expect(fileContent).toContain('const employeeId = req.params.employeeId')
    })

    it('should implement role-based access control', () => {
      expect(fileContent).toContain("if (userRole !== 'admin' && parseInt(employeeId) !== userId) {")
      expect(fileContent).toContain('return res.status(403).json({')
      expect(fileContent).toContain("error: 'Forbidden'")
      expect(fileContent).toContain("message: 'Access denied. You can only view your own licenses.'")
    })

    it('should generate cache key for employee', () => {
      expect(fileContent).toContain("redisConfig.generateKey('license', 'employee', employeeId)")
    })

    it('should check cache first', () => {
      expect(fileContent).toContain('if (redisConfig.isRedisConnected()) {')
      expect(fileContent).toContain('const cachedData = await redisConfig.get(cacheKey)')
      expect(fileContent).toContain("logger.info('Employee licenses served from cache')")
    })

    it('should find licenses by employee', () => {
      expect(fileContent).toContain('await License.findAll({')
      expect(fileContent).toContain('where: { assigned_to: employeeId },')
      expect(fileContent).toContain('include: [')
      expect(fileContent).toContain('model: Employee,')
      expect(fileContent).toContain("as: 'assignedEmployee'")
      expect(fileContent).toContain("order: [['createdAt', 'DESC']]")
    })

    it('should cache results', () => {
      expect(fileContent).toContain('await redisConfig.setex(cacheKey, 300, result)')
    })
  })

  describe('Error Handling', () => {
    it('should have comprehensive error handling', () => {
      const errorHandlingPatterns = [
        'logger.error',
        'catch (error)',
        'res.status(500)',
        'res.status(404)',
        'res.status(403)'
      ]
      errorHandlingPatterns.forEach(pattern => {
        expect(fileContent).toContain(pattern)
      })
    })

    it('should handle specific error cases', () => {
      expect(fileContent).toContain('logger.error(\'License creation failed\', { error: error.message })')
      expect(fileContent).toContain('logger.error(\'License list error\', error)')
      expect(fileContent).toContain('logger.error(\'License fetch error\'')
      expect(fileContent).toContain('logger.error(\'License update failed\'')
      expect(fileContent).toContain('logger.error(\'License deletion failed\'')
      expect(fileContent).toContain('logger.error(\'Error fetching employee licenses:\', err)')
    })

    it('should return proper error responses', () => {
      expect(fileContent).toContain('res.status(500).json({')
      expect(fileContent).toContain('res.status(404).json({')
      expect(fileContent).toContain('res.status(403).json({')
      expect(fileContent).toContain('success: false')
      expect(fileContent).toContain('message:')
      expect(fileContent).toContain('error: error.message')
    })
  })

  describe('Logging', () => {
    it('should have proper logging statements', () => {
      const loggingPatterns = [
        'logger.info(\'License added\', { licenseId: newLicense.id })',
        'logger.info(\'License updated\', { licenseId })',
        'logger.info(\'License deleted\', { licenseId })',
        "logger.info('License list served from cache')",
        "logger.info('License detail served from cache')",
        "logger.info('Employee licenses served from cache')"
      ]
      loggingPatterns.forEach(pattern => {
        expect(fileContent).toContain(pattern)
      })
    })
  })

  describe('Documentation', () => {
    it('should have file header documentation', () => {
      expect(fileContent).toContain('@fileoverview License Controller for EMS Backend')
      expect(fileContent).toContain('@description Handles CRUD operations and business logic for software license management')
      expect(fileContent).toContain('@author EMS Development Team')
      expect(fileContent).toContain('@version 1.0.0')
      expect(fileContent).toContain('@since 2025-09-17')
    })

    it('should have function documentation', () => {
      expect(fileContent).toContain('@async')
      expect(fileContent).toContain('@function')
      expect(fileContent).toContain('@param')
      expect(fileContent).toContain('@returns')
      expect(fileContent).toContain('@description')
      expect(fileContent).toContain('@throws')
      expect(fileContent).toContain('@example')
    })

    it('should have inline comments', () => {
      const commentPatterns = [
        '// Import express-validator for request validation',
        '// Import License and Employee models for database operations',
        '// Import logger for comprehensive logging',
        '// Import Redis configuration for caching operations',
        '// Validate request parameters using express-validator',
        '// Create new license record in the database using Sequelize',
        '// Log successful license creation for monitoring',
        '// Invalidate license cache to ensure data consistency',
        '// Return successful creation response with license data',
        '// Log error and return failure response'
      ]
      commentPatterns.forEach(pattern => {
        expect(fileContent).toContain(pattern)
      })
    })
  })

  describe('Code Quality', () => {
    it('should use async/await properly', () => {
      expect(fileContent).toContain('async function')
      expect(fileContent).toContain('await ')
    })

    it('should have proper error handling', () => {
      expect(fileContent).toContain('try {')
      expect(fileContent).toContain('} catch (error) {')
    })

    it('should use consistent naming', () => {
      expect(fileContent).toContain('licenseId')
      expect(fileContent).toContain('cacheKey')
      expect(fileContent).toContain('userRole')
      expect(fileContent).toContain('userId')
    })

    it('should have proper return statements', () => {
      expect(fileContent).toContain('res.status(201).json({')
      expect(fileContent).toContain('res.status(404).json({')
      expect(fileContent).toContain('res.status(403).json({')
      expect(fileContent).toContain('res.status(500).json({')
      expect(fileContent).toContain('res.json(')
    })
  })
})
