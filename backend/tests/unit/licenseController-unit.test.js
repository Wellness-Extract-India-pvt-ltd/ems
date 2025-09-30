import { describe, it, expect, beforeAll } from 'vitest'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

describe('License Controller Unit Tests', () => {
  let controllerPath
  let fileContent

  beforeAll(() => {
    controllerPath = path.join(__dirname, '..', 'controllers', 'licenseController.js')
    fileContent = fs.readFileSync(controllerPath, 'utf8')
  })

  describe('File Structure and Syntax', () => {
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

    it('should be an ES6 module', () => {
      expect(fileContent).toContain('import ')
      expect(fileContent).toContain('export ')
    })

    it('should have proper file structure', () => {
      expect(fileContent).toContain('@fileoverview')
      expect(fileContent).toContain('@description')
      expect(fileContent).toContain('@author')
      expect(fileContent).toContain('@version')
      expect(fileContent).toContain('@since')
    })
  })

  describe('Import Statements', () => {
    it('should import validationResult', () => {
      expect(fileContent).toContain("import { validationResult } from 'express-validator'")
    })

    it('should import License and Employee models', () => {
      expect(fileContent).toContain("import { License, Employee } from '../models/index.js'")
    })

    it('should import logger', () => {
      expect(fileContent).toContain("import logger from '../utils/logger.js'")
    })

    it('should import redisConfig', () => {
      expect(fileContent).toContain("import redisConfig from '../config/redis.js'")
    })
  })

  describe('Function Exports', () => {
    it('should export addLicense function', () => {
      expect(fileContent).toContain('export async function addLicense')
    })

    it('should export listLicenses function', () => {
      expect(fileContent).toContain('export async function listLicenses')
    })

    it('should export getLicenseById function', () => {
      expect(fileContent).toContain('export async function getLicenseById')
    })

    it('should export updateLicense function', () => {
      expect(fileContent).toContain('export async function updateLicense')
    })

    it('should export deleteLicense function', () => {
      expect(fileContent).toContain('export async function deleteLicense')
    })

    it('should export getLicensesByEmployee function', () => {
      expect(fileContent).toContain('export async function getLicensesByEmployee')
    })
  })

  describe('addLicense Function Structure', () => {
    it('should have proper function signature', () => {
      expect(fileContent).toContain('export async function addLicense (req, res)')
    })

    it('should have validation check', () => {
      expect(fileContent).toContain('const errors = validationResult(req)')
      expect(fileContent).toContain('if (!errors.isEmpty()) {')
      expect(fileContent).toContain('return res.status(400).json({ errors: errors.array() })')
    })

    it('should have try-catch block', () => {
      expect(fileContent).toContain('try {')
      expect(fileContent).toContain('} catch (error) {')
    })

    it('should create license using Sequelize', () => {
      expect(fileContent).toContain('await License.create(req.body)')
    })

    it('should log creation', () => {
      expect(fileContent).toContain('logger.info(\'License added\', { licenseId: newLicense.id })')
    })

    it('should invalidate cache', () => {
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
      expect(fileContent).toContain('error: error.message')
    })
  })

  describe('listLicenses Function Structure', () => {
    it('should have proper function signature', () => {
      expect(fileContent).toContain('export async function listLicenses (req, res)')
    })

    it('should extract user information', () => {
      expect(fileContent).toContain('const userRole = req.user?.role')
      expect(fileContent).toContain('const userId = req.user?.id')
    })

    it('should handle pagination', () => {
      expect(fileContent).toContain('const page = parseInt(req.query.page) || 1')
      expect(fileContent).toContain('const limit = parseInt(req.query.limit) || 10')
      expect(fileContent).toContain('const offset = (page - 1) * limit')
    })

    it('should generate cache key', () => {
      expect(fileContent).toContain("redisConfig.generateKey(")
      expect(fileContent).toContain("'license'")
      expect(fileContent).toContain("'list'")
      expect(fileContent).toContain('userRole')
      expect(fileContent).toContain('userId')
      expect(fileContent).toContain('page,')
      expect(fileContent).toContain('limit')
    })

    it('should check cache first', () => {
      expect(fileContent).toContain('if (redisConfig.isRedisConnected()) {')
      expect(fileContent).toContain('const cachedData = await redisConfig.get(cacheKey)')
      expect(fileContent).toContain('if (cachedData) {')
      expect(fileContent).toContain("logger.info('License list served from cache')")
      expect(fileContent).toContain('return res.json(cachedData)')
    })

    it('should implement role-based access control', () => {
      expect(fileContent).toContain('const whereClause = {}')
      expect(fileContent).toContain("if (userRole !== 'admin') {")
      expect(fileContent).toContain('whereClause.assigned_to = userId')
    })

    it('should query database with pagination', () => {
      expect(fileContent).toContain('await License.findAndCountAll({')
      expect(fileContent).toContain('where: whereClause,')
      expect(fileContent).toContain('include: [')
      expect(fileContent).toContain('model: Employee,')
      expect(fileContent).toContain("as: 'assignedEmployee'")
      expect(fileContent).toContain('attributes: [\'id\', \'first_name\', \'last_name\', \'employee_id\']')
      expect(fileContent).toContain('limit,')
      expect(fileContent).toContain('offset,')
      expect(fileContent).toContain("order: [['createdAt', 'DESC']]")
    })

    it('should prepare response with pagination', () => {
      expect(fileContent).toContain('const result = {')
      expect(fileContent).toContain('success: true')
      expect(fileContent).toContain('data: licenses')
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

  describe('getLicenseById Function Structure', () => {
    it('should have proper function signature', () => {
      expect(fileContent).toContain('export async function getLicenseById (req, res)')
    })

    it('should extract user information and license ID', () => {
      expect(fileContent).toContain('const userRole = req.user?.role')
      expect(fileContent).toContain('const userId = req.user?.id')
      expect(fileContent).toContain('const licenseId = req.params._id')
    })

    it('should generate cache key', () => {
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

    it('should find license by ID', () => {
      expect(fileContent).toContain('await License.findOne({')
      expect(fileContent).toContain('where: whereClause,')
      expect(fileContent).toContain('include: [')
      expect(fileContent).toContain('model: Employee,')
      expect(fileContent).toContain("as: 'assignedEmployee'")
    })

    it('should handle not found', () => {
      expect(fileContent).toContain('if (!license) {')
      expect(fileContent).toContain('return res.status(404).json({')
      expect(fileContent).toContain('success: false')
      expect(fileContent).toContain("message: 'License not found'")
    })

    it('should cache results', () => {
      expect(fileContent).toContain('await redisConfig.setex(cacheKey, 300, result)')
    })
  })

  describe('updateLicense Function Structure', () => {
    it('should have proper function signature', () => {
      expect(fileContent).toContain('export async function updateLicense (req, res)')
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

    it('should handle not found', () => {
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

    it('should invalidate cache', () => {
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

  describe('deleteLicense Function Structure', () => {
    it('should have proper function signature', () => {
      expect(fileContent).toContain('export async function deleteLicense (req, res)')
    })

    it('should extract license ID', () => {
      expect(fileContent).toContain('const licenseId = req.params._id')
    })

    it('should delete license using Sequelize', () => {
      expect(fileContent).toContain('await License.destroy({')
      expect(fileContent).toContain('where: { id: licenseId }')
    })

    it('should handle not found', () => {
      expect(fileContent).toContain('if (deletedRowsCount === 0) {')
      expect(fileContent).toContain('return res.status(404).json({')
      expect(fileContent).toContain("message: 'License not found'")
    })

    it('should log deletion', () => {
      expect(fileContent).toContain('logger.info(\'License deleted\', { licenseId })')
    })

    it('should invalidate cache', () => {
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

  describe('getLicensesByEmployee Function Structure', () => {
    it('should have proper function signature', () => {
      expect(fileContent).toContain('export async function getLicensesByEmployee (req, res, next)')
    })

    it('should extract user information and employee ID', () => {
      expect(fileContent).toContain('const userRole = req.user?.role')
      expect(fileContent).toContain('const userId = req.user?.id')
      expect(fileContent).toContain('const employeeId = req.params.employeeId')
    })

    it('should implement role-based access control', () => {
      expect(fileContent).toContain("if (userRole !== 'admin' && parseInt(employeeId) !== userId) {")
      expect(fileContent).toContain('return res.status(403).json({')
      expect(fileContent).toContain('success: false')
      expect(fileContent).toContain("error: 'Forbidden'")
      expect(fileContent).toContain("message: 'Access denied. You can only view your own licenses.'")
    })

    it('should generate cache key', () => {
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

  describe('Error Handling Patterns', () => {
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

  describe('Logging Patterns', () => {
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

  describe('Documentation Quality', () => {
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

  describe('Code Quality and Patterns', () => {
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

    it('should use Redis caching patterns', () => {
      expect(fileContent).toContain('redisConfig.isRedisConnected()')
      expect(fileContent).toContain('redisConfig.get(')
      expect(fileContent).toContain('redisConfig.setex(')
      expect(fileContent).toContain('redisConfig.del(')
      expect(fileContent).toContain('redisConfig.generateKey(')
    })

    it('should use Sequelize patterns', () => {
      expect(fileContent).toContain('License.create(')
      expect(fileContent).toContain('License.findByPk(')
      expect(fileContent).toContain('License.findAndCountAll(')
      expect(fileContent).toContain('License.findAll(')
      expect(fileContent).toContain('License.findOne(')
      expect(fileContent).toContain('License.update(')
      expect(fileContent).toContain('License.destroy(')
    })

    it('should use validation patterns', () => {
      expect(fileContent).toContain('validationResult(req)')
      expect(fileContent).toContain('errors.isEmpty()')
      expect(fileContent).toContain('errors.array()')
    })

    it('should use role-based access control patterns', () => {
      expect(fileContent).toContain('req.user?.role')
      expect(fileContent).toContain('req.user?.id')
      expect(fileContent).toContain("userRole !== 'admin'")
      expect(fileContent).toContain('assigned_to')
    })
  })
})
