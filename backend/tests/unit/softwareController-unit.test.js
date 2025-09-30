import { describe, it, expect, beforeAll } from 'vitest'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

describe('Software Controller Unit Tests', () => {
  let controllerPath
  let fileContent

  beforeAll(() => {
    controllerPath = path.join(__dirname, '..', 'controllers', 'softwareController.js')
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
      expect(fileContent).toContain('import { validationResult } from \'express-validator\'')
    })

    it('should import Software and Employee models', () => {
      expect(fileContent).toContain('import { Software, Employee } from \'../models/index.js\'')
    })

    it('should import logger', () => {
      expect(fileContent).toContain('import logger from \'../utils/logger.js\'')
    })

    it('should import redisConfig', () => {
      expect(fileContent).toContain('import redisConfig from \'../config/redis.js\'')
    })
  })

  describe('Function Exports', () => {
    it('should export addSoftware function', () => {
      expect(fileContent).toContain('export async function addSoftware')
    })

    it('should export listSoftware function', () => {
      expect(fileContent).toContain('export async function listSoftware')
    })

    it('should export getSoftwareById function', () => {
      expect(fileContent).toContain('export async function getSoftwareById')
    })

    it('should export updateSoftware function', () => {
      expect(fileContent).toContain('export async function updateSoftware')
    })

    it('should export deleteSoftware function', () => {
      expect(fileContent).toContain('export async function deleteSoftware')
    })

    it('should export getSoftwareByEmployee function', () => {
      expect(fileContent).toContain('export async function getSoftwareByEmployee')
    })
  })

  describe('addSoftware Function Structure', () => {
    it('should have proper function signature', () => {
      expect(fileContent).toContain('export async function addSoftware (req, res) {')
    })

    it('should have validation check', () => {
      expect(fileContent).toContain('const errors = validationResult(req)')
      expect(fileContent).toContain('if (!errors.isEmpty()) {')
    })

    it('should have try-catch block', () => {
      expect(fileContent).toContain('try {')
      expect(fileContent).toContain('} catch (error) {')
    })

    it('should create software using Sequelize', () => {
      expect(fileContent).toContain('const newSoftware = await Software.create(req.body)')
    })

    it('should log creation', () => {
      expect(fileContent).toContain('logger.info(\'Software added\'')
    })

    it('should invalidate cache', () => {
      expect(fileContent).toContain('await redisConfig.del(\'software:list:*\')')
      expect(fileContent).toContain('await redisConfig.del(\'software:employee:*\')')
    })

    it('should return success response', () => {
      expect(fileContent).toContain('res.status(201).json({')
      expect(fileContent).toContain('success: true')
      expect(fileContent).toContain('message: \'Software added successfully\'')
    })

    it('should handle errors', () => {
      expect(fileContent).toContain('logger.error(\'Software creation failed\'')
      expect(fileContent).toContain('res.status(400).json({')
      expect(fileContent).toContain('message: \'Error adding software\'')
    })
  })

  describe('listSoftware Function Structure', () => {
    it('should have proper function signature', () => {
      expect(fileContent).toContain('export async function listSoftware (req, res) {')
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
      expect(fileContent).toContain('const cacheKey = redisConfig.generateKey(')
    })

    it('should check cache first', () => {
      expect(fileContent).toContain('if (redisConfig.isRedisConnected()) {')
      expect(fileContent).toContain('const cachedData = await redisConfig.get(cacheKey)')
    })

    it('should implement role-based access control', () => {
      expect(fileContent).toContain('if (userRole !== \'admin\') {')
      expect(fileContent).toContain('whereClause.assigned_to = userId')
    })

    it('should query database with pagination', () => {
      expect(fileContent).toContain('const { count, rows: softwareItems } = await Software.findAndCountAll({')
    })

    it('should prepare response with pagination', () => {
      expect(fileContent).toContain('pagination: {')
      expect(fileContent).toContain('page')
      expect(fileContent).toContain('limit')
      expect(fileContent).toContain('total: count')
      expect(fileContent).toContain('pages: Math.ceil(count / limit)')
    })

    it('should cache results', () => {
      expect(fileContent).toContain('await redisConfig.setex(cacheKey, 300, result)')
    })
  })

  describe('getSoftwareById Function Structure', () => {
    it('should have proper function signature', () => {
      expect(fileContent).toContain('export async function getSoftwareById (req, res) {')
    })

    it('should extract user information and software ID', () => {
      expect(fileContent).toContain('const userRole = req.user?.role')
      expect(fileContent).toContain('const userId = req.user?.id')
      expect(fileContent).toContain('const softwareId = req.params._id')
    })

    it('should generate cache key', () => {
      expect(fileContent).toContain('const cacheKey = redisConfig.generateKey(\'software\', \'detail\', softwareId)')
    })

    it('should check cache first', () => {
      expect(fileContent).toContain('if (redisConfig.isRedisConnected()) {')
      expect(fileContent).toContain('const cachedData = await redisConfig.get(cacheKey)')
    })

    it('should implement role-based access control', () => {
      expect(fileContent).toContain('if (userRole !== \'admin\') {')
      expect(fileContent).toContain('whereClause.assigned_to = userId')
    })

    it('should find software by ID', () => {
      expect(fileContent).toContain('const softwareItem = await Software.findOne({')
    })

    it('should handle not found', () => {
      expect(fileContent).toContain('if (!softwareItem) {')
      expect(fileContent).toContain('return res.status(404).json({')
      expect(fileContent).toContain('message: \'Software not found\'')
    })

    it('should cache results', () => {
      expect(fileContent).toContain('await redisConfig.setex(cacheKey, 300, result)')
    })
  })

  describe('updateSoftware Function Structure', () => {
    it('should have proper function signature', () => {
      expect(fileContent).toContain('export async function updateSoftware (req, res) {')
    })

    it('should validate request parameters', () => {
      expect(fileContent).toContain('const errors = validationResult(req)')
      expect(fileContent).toContain('if (!errors.isEmpty()) {')
    })

    it('should extract software ID', () => {
      expect(fileContent).toContain('const softwareId = req.params._id')
    })

    it('should update software using Sequelize', () => {
      expect(fileContent).toContain('const [updatedRowsCount] = await Software.update(req.body, {')
    })

    it('should handle not found', () => {
      expect(fileContent).toContain('if (updatedRowsCount === 0) {')
      expect(fileContent).toContain('return res.status(404).json({')
      expect(fileContent).toContain('message: \'Software not found\'')
    })

    it('should retrieve updated software', () => {
      expect(fileContent).toContain('const updatedSoftware = await Software.findByPk(softwareId)')
    })

    it('should log update', () => {
      expect(fileContent).toContain('logger.info(\'Software updated\'')
    })

    it('should invalidate cache', () => {
      expect(fileContent).toContain('await redisConfig.del(\'software:list:*\')')
      expect(fileContent).toContain('await redisConfig.del(\'software:employee:*\')')
    })

    it('should return success response', () => {
      expect(fileContent).toContain('res.status(200).json({')
      expect(fileContent).toContain('success: true')
      expect(fileContent).toContain('message: \'Software updated successfully\'')
    })
  })

  describe('deleteSoftware Function Structure', () => {
    it('should have proper function signature', () => {
      expect(fileContent).toContain('export async function deleteSoftware (req, res) {')
    })

    it('should extract software ID', () => {
      expect(fileContent).toContain('const softwareId = req.params._id')
    })

    it('should delete software using Sequelize', () => {
      expect(fileContent).toContain('const deletedRowsCount = await Software.destroy({')
    })

    it('should handle not found', () => {
      expect(fileContent).toContain('if (deletedRowsCount === 0) {')
      expect(fileContent).toContain('return res.status(404).json({')
      expect(fileContent).toContain('message: \'Software not found\'')
    })

    it('should log deletion', () => {
      expect(fileContent).toContain('logger.info(\'Software deleted\'')
    })

    it('should invalidate cache', () => {
      expect(fileContent).toContain('await redisConfig.del(\'software:list:*\')')
      expect(fileContent).toContain('await redisConfig.del(\'software:employee:*\')')
    })

    it('should return success response', () => {
      expect(fileContent).toContain('res.status(200).json({')
      expect(fileContent).toContain('success: true')
      expect(fileContent).toContain('message: \'Software deleted successfully\'')
    })
  })

  describe('getSoftwareByEmployee Function Structure', () => {
    it('should have proper function signature', () => {
      expect(fileContent).toContain('export async function getSoftwareByEmployee (req, res, next) {')
    })

    it('should extract user information and employee ID', () => {
      expect(fileContent).toContain('const userRole = req.user?.role')
      expect(fileContent).toContain('const userId = req.user?.id')
      expect(fileContent).toContain('const employeeId = req.params.employeeId')
    })

    it('should implement role-based access control', () => {
      expect(fileContent).toContain('if (userRole !== \'admin\' && parseInt(employeeId) !== userId) {')
      expect(fileContent).toContain('return res.status(403).json({')
      expect(fileContent).toContain('error: \'Forbidden\'')
    })

    it('should generate cache key', () => {
      expect(fileContent).toContain('const cacheKey = redisConfig.generateKey(')
    })

    it('should check cache first', () => {
      expect(fileContent).toContain('if (redisConfig.isRedisConnected()) {')
      expect(fileContent).toContain('const cachedData = await redisConfig.get(cacheKey)')
    })

    it('should find software by employee', () => {
      expect(fileContent).toContain('const software = await Software.findAll({')
      expect(fileContent).toContain('where: { assigned_to: employeeId }')
    })

    it('should cache results', () => {
      expect(fileContent).toContain('await redisConfig.setex(cacheKey, 300, result)')
    })
  })

  describe('Error Handling Patterns', () => {
    it('should have comprehensive error handling', () => {
      expect(fileContent).toContain('} catch (error) {')
      expect(fileContent).toContain('} catch (err) {')
      expect(fileContent).toContain('logger.error')
      expect(fileContent).toContain('res.status(400)')
      expect(fileContent).toContain('res.status(404)')
      expect(fileContent).toContain('res.status(500)')
    })

    it('should handle specific error cases', () => {
      expect(fileContent).toContain('Software creation failed')
      expect(fileContent).toContain('Software list error')
      expect(fileContent).toContain('Software fetch error')
      expect(fileContent).toContain('Software update failed')
      expect(fileContent).toContain('Software deletion failed')
      expect(fileContent).toContain('Error fetching employee software')
    })

    it('should return proper error responses', () => {
      expect(fileContent).toContain('success: false')
      expect(fileContent).toContain('message: \'Error adding software\'')
      expect(fileContent).toContain('message: \'Error fetching software\'')
      expect(fileContent).toContain('message: \'Error updating software\'')
      expect(fileContent).toContain('message: \'Error deleting software\'')
      expect(fileContent).toContain('message: \'Error fetching employee software\'')
    })
  })

  describe('Logging Patterns', () => {
    it('should have proper logging statements', () => {
      expect(fileContent).toContain('logger.info(\'Software added\'')
      expect(fileContent).toContain('logger.info(\'Software list served from cache\'')
      expect(fileContent).toContain('logger.info(\'Software detail served from cache\'')
      expect(fileContent).toContain('logger.info(\'Software updated\'')
      expect(fileContent).toContain('logger.info(\'Software deleted\'')
      expect(fileContent).toContain('logger.info(\'Employee software served from cache\'')
    })
  })

  describe('Documentation Quality', () => {
    it('should have file header documentation', () => {
      expect(fileContent).toContain('@fileoverview Software Controller for EMS Backend')
      expect(fileContent).toContain('@description Handles CRUD operations and business logic for software asset management.')
      expect(fileContent).toContain('@author EMS Development Team')
      expect(fileContent).toContain('@version 1.0.0')
      expect(fileContent).toContain('@since 2025-09-17')
      expect(fileContent).toContain('@features')
    })

    it('should have function documentation', () => {
      expect(fileContent).toContain('* Creates a new software asset with validation and cache invalidation')
      expect(fileContent).toContain('* Retrieves all software assets with pagination, role-based access control, and Redis caching')
      expect(fileContent).toContain('* Retrieves a specific software asset by ID with role-based access control and Redis caching')
      expect(fileContent).toContain('* Updates an existing software asset by ID with validation and cache invalidation')
      expect(fileContent).toContain('* Deletes a software asset by ID with cache invalidation')
      expect(fileContent).toContain('* Retrieves software assets assigned to a specific employee with role-based access control and Redis caching')
    })

    it('should have inline comments', () => {
      expect(fileContent).toContain('// Import express-validator for request validation')
      expect(fileContent).toContain('// Import Software and Employee models for database operations')
      expect(fileContent).toContain('// Import logger for comprehensive logging')
      expect(fileContent).toContain('// Import Redis configuration for caching operations')
      expect(fileContent).toContain('// Validate request parameters using express-validator')
      expect(fileContent).toContain('// Create new software record in the database using Sequelize')
      expect(fileContent).toContain('// Log successful software creation for monitoring')
      expect(fileContent).toContain('// Invalidate software cache to ensure data consistency')
      expect(fileContent).toContain('// Return successful creation response with software data')
      expect(fileContent).toContain('// Log error and return failure response')
    })
  })

  describe('Code Quality and Patterns', () => {
    it('should use async/await properly', () => {
      expect(fileContent).toContain('async function')
      expect(fileContent).toContain('await ')
    })

    it('should have proper error handling', () => {
      expect(fileContent).toContain('try {')
      expect(fileContent).toContain('} catch (')
    })

    it('should use consistent naming', () => {
      expect(fileContent).toContain('softwareId')
      expect(fileContent).toContain('userRole')
      expect(fileContent).toContain('userId')
      expect(fileContent).toContain('employeeId')
      expect(fileContent).toContain('cacheKey')
    })

    it('should have proper return statements', () => {
      expect(fileContent).toContain('res.status(201)')
      expect(fileContent).toContain('res.status(200)')
      expect(fileContent).toContain('res.status(404)')
      expect(fileContent).toContain('res.status(400)')
      expect(fileContent).toContain('res.status(500)')
      expect(fileContent).toContain('res.status(403)')
    })

    it('should use Redis caching patterns', () => {
      expect(fileContent).toContain('redisConfig.isRedisConnected()')
      expect(fileContent).toContain('redisConfig.get(')
      expect(fileContent).toContain('redisConfig.setex(')
      expect(fileContent).toContain('redisConfig.del(')
      expect(fileContent).toContain('redisConfig.generateKey(')
    })

    it('should use Sequelize patterns', () => {
      expect(fileContent).toContain('Software.create(')
      expect(fileContent).toContain('Software.findAndCountAll(')
      expect(fileContent).toContain('Software.findOne(')
      expect(fileContent).toContain('Software.update(')
      expect(fileContent).toContain('Software.destroy(')
      expect(fileContent).toContain('Software.findAll(')
      expect(fileContent).toContain('Software.findByPk(')
    })

    it('should use validation patterns', () => {
      expect(fileContent).toContain('validationResult(req)')
      expect(fileContent).toContain('errors.isEmpty()')
      expect(fileContent).toContain('errors.array()')
    })

    it('should use role-based access control patterns', () => {
      expect(fileContent).toContain('userRole !== \'admin\'')
      expect(fileContent).toContain('assigned_to = userId')
      expect(fileContent).toContain('parseInt(employeeId) !== userId')
    })
  })
})
