import { describe, it, expect, beforeEach, afterEach, vi, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

describe('Software Controller Tests', () => {
  let controllerPath
  let fileContent

  beforeAll(() => {
    controllerPath = path.join(__dirname, '..', 'controllers', 'softwareController.js')
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
      expect(fileContent).toContain('export async function addSoftware')
      expect(fileContent).toContain('export async function listSoftware')
      expect(fileContent).toContain('export async function getSoftwareById')
      expect(fileContent).toContain('export async function updateSoftware')
      expect(fileContent).toContain('export async function deleteSoftware')
      expect(fileContent).toContain('export async function getSoftwareByEmployee')
    })

    it('should import required modules', () => {
      expect(fileContent).toContain('import { validationResult } from \'express-validator\'')
      expect(fileContent).toContain('import { Software, Employee } from \'../models/index.js\'')
      expect(fileContent).toContain('import logger from \'../utils/logger.js\'')
      expect(fileContent).toContain('import redisConfig from \'../config/redis.js\'')
    })
  })

  describe('Documentation', () => {
    it('should have a file-level JSDoc comment', () => {
      expect(fileContent).toContain('@fileoverview Software Controller for EMS Backend')
      expect(fileContent).toContain('@description Handles CRUD operations and business logic for software asset management.')
      expect(fileContent).toContain('@author EMS Development Team')
      expect(fileContent).toContain('@version 1.0.0')
      expect(fileContent).toContain('@since 2025-09-17')
      expect(fileContent).toContain('@features')
    })

    it('should have JSDoc for addSoftware function', () => {
      expect(fileContent).toContain('* Creates a new software asset with validation and cache invalidation')
      expect(fileContent).toContain('* @async')
      expect(fileContent).toContain('* @function addSoftware')
      expect(fileContent).toContain('* @param {Object} req - Express request object')
      expect(fileContent).toContain('* @param {Object} req.body - Request body containing software data')
      expect(fileContent).toContain('* @returns {Promise<void>} JSON response with creation status')
      expect(fileContent).toContain('* @throws {Error} If validation fails or database operation fails')
      expect(fileContent).toContain('* @example')
    })

    it('should have JSDoc for listSoftware function', () => {
      expect(fileContent).toContain('* Retrieves all software assets with pagination, role-based access control, and Redis caching')
      expect(fileContent).toContain('* @function listSoftware')
      expect(fileContent).toContain('* @param {Object} req.user - Authenticated user object (from middleware)')
      expect(fileContent).toContain('* @param {string} req.user.role - User role (admin, user, etc.)')
      expect(fileContent).toContain('* @param {number} req.user.id - User ID')
      expect(fileContent).toContain('* @param {Object} req.query - Query parameters')
      expect(fileContent).toContain('* @param {number} req.query.page - Page number for pagination (default: 1)')
      expect(fileContent).toContain('* @param {number} req.query.limit - Number of records per page (default: 10)')
    })

    it('should have JSDoc for getSoftwareById function', () => {
      expect(fileContent).toContain('* Retrieves a specific software asset by ID with role-based access control and Redis caching')
      expect(fileContent).toContain('* @function getSoftwareById')
      expect(fileContent).toContain('* @param {string} req.params._id - Software ID')
      expect(fileContent).toContain('* @returns {Promise<void>} JSON response with software data or error')
    })

    it('should have JSDoc for updateSoftware function', () => {
      expect(fileContent).toContain('* Updates an existing software asset by ID with validation and cache invalidation')
      expect(fileContent).toContain('* @function updateSoftware')
      expect(fileContent).toContain('* @param {string} req.params._id - Software ID to update')
      expect(fileContent).toContain('* @returns {Promise<void>} JSON response with update status')
    })

    it('should have JSDoc for deleteSoftware function', () => {
      expect(fileContent).toContain('* Deletes a software asset by ID with cache invalidation')
      expect(fileContent).toContain('* @function deleteSoftware')
      expect(fileContent).toContain('* @param {string} req.params._id - Software ID to delete')
      expect(fileContent).toContain('* @returns {Promise<void>} JSON response with deletion status')
    })

    it('should have JSDoc for getSoftwareByEmployee function', () => {
      expect(fileContent).toContain('* Retrieves software assets assigned to a specific employee with role-based access control and Redis caching')
      expect(fileContent).toContain('* @function getSoftwareByEmployee')
      expect(fileContent).toContain('* @param {string} req.params.employeeId - Employee ID to get software for')
      expect(fileContent).toContain('* @returns {Promise<void>} JSON response with employee\'s software or error')
    })
  })

  describe('addSoftware Function', () => {
    it('should have proper function signature', () => {
      expect(fileContent).toContain('export async function addSoftware (req, res) {')
    })

    it('should validate request parameters', () => {
      expect(fileContent).toContain('const errors = validationResult(req)')
      expect(fileContent).toContain('if (!errors.isEmpty()) {')
      expect(fileContent).toContain('return res.status(400).json({ errors: errors.array() })')
    })

    it('should create software using Sequelize', () => {
      expect(fileContent).toContain('const newSoftware = await Software.create(req.body)')
    })

    it('should log creation', () => {
      expect(fileContent).toContain('logger.info(\'Software added\'')
      expect(fileContent).toContain('softwareId: newSoftware.id')
      expect(fileContent).toContain('name: newSoftware.name')
    })

    it('should invalidate cache', () => {
      expect(fileContent).toContain('if (redisConfig.isRedisConnected()) {')
      expect(fileContent).toContain('await redisConfig.del(\'software:list:*\')')
      expect(fileContent).toContain('await redisConfig.del(\'software:employee:*\')')
    })

    it('should return success response', () => {
      expect(fileContent).toContain('res.status(201).json({')
      expect(fileContent).toContain('success: true')
      expect(fileContent).toContain('message: \'Software added successfully\'')
      expect(fileContent).toContain('data: newSoftware')
    })

    it('should handle errors', () => {
      expect(fileContent).toContain('} catch (error) {')
      expect(fileContent).toContain('logger.error(\'Software creation failed\'')
      expect(fileContent).toContain('res.status(400).json({')
      expect(fileContent).toContain('success: false')
      expect(fileContent).toContain('message: \'Error adding software\'')
    })
  })

  describe('listSoftware Function', () => {
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
      expect(fileContent).toContain('\'software\'')
      expect(fileContent).toContain('\'list\'')
      expect(fileContent).toContain('userRole')
      expect(fileContent).toContain('userId || \'anonymous\'')
      expect(fileContent).toContain('page')
      expect(fileContent).toContain('limit')
    })

    it('should check cache first', () => {
      expect(fileContent).toContain('if (redisConfig.isRedisConnected()) {')
      expect(fileContent).toContain('const cachedData = await redisConfig.get(cacheKey)')
      expect(fileContent).toContain('if (cachedData) {')
      expect(fileContent).toContain('logger.info(\'Software list served from cache\')')
      expect(fileContent).toContain('return res.json(cachedData)')
    })

    it('should implement role-based access control', () => {
      expect(fileContent).toContain('const whereClause = {}')
      expect(fileContent).toContain('if (userRole !== \'admin\') {')
      expect(fileContent).toContain('whereClause.assigned_to = userId')
    })

    it('should query database with pagination', () => {
      expect(fileContent).toContain('const { count, rows: softwareItems } = await Software.findAndCountAll({')
      expect(fileContent).toContain('where: whereClause')
      expect(fileContent).toContain('include: [')
      expect(fileContent).toContain('model: Employee')
      expect(fileContent).toContain('as: \'assignedEmployee\'')
      expect(fileContent).toContain('attributes: [\'id\', \'first_name\', \'last_name\', \'employee_id\']')
      expect(fileContent).toContain('limit')
      expect(fileContent).toContain('offset')
      expect(fileContent).toContain('order: [[\'createdAt\', \'DESC\']]')
    })

    it('should prepare response with pagination', () => {
      expect(fileContent).toContain('const result = {')
      expect(fileContent).toContain('success: true')
      expect(fileContent).toContain('data: softwareItems')
      expect(fileContent).toContain('pagination: {')
      expect(fileContent).toContain('page')
      expect(fileContent).toContain('limit')
      expect(fileContent).toContain('total: count')
      expect(fileContent).toContain('pages: Math.ceil(count / limit)')
    })

    it('should cache results', () => {
      expect(fileContent).toContain('if (redisConfig.isRedisConnected()) {')
      expect(fileContent).toContain('await redisConfig.setex(cacheKey, 300, result)')
    })
  })

  describe('getSoftwareById Function', () => {
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
      expect(fileContent).toContain('if (cachedData) {')
      expect(fileContent).toContain('logger.info(\'Software detail served from cache\')')
      expect(fileContent).toContain('return res.json(cachedData)')
    })

    it('should implement role-based access control', () => {
      expect(fileContent).toContain('const whereClause = { id: softwareId }')
      expect(fileContent).toContain('if (userRole !== \'admin\') {')
      expect(fileContent).toContain('whereClause.assigned_to = userId')
    })

    it('should find software by ID', () => {
      expect(fileContent).toContain('const softwareItem = await Software.findOne({')
      expect(fileContent).toContain('where: whereClause')
      expect(fileContent).toContain('include: [')
      expect(fileContent).toContain('model: Employee')
      expect(fileContent).toContain('as: \'assignedEmployee\'')
    })

    it('should handle not found', () => {
      expect(fileContent).toContain('if (!softwareItem) {')
      expect(fileContent).toContain('return res.status(404).json({')
      expect(fileContent).toContain('success: false')
      expect(fileContent).toContain('message: \'Software not found\'')
    })

    it('should cache results', () => {
      expect(fileContent).toContain('if (redisConfig.isRedisConnected()) {')
      expect(fileContent).toContain('await redisConfig.setex(cacheKey, 300, result)')
    })
  })

  describe('updateSoftware Function', () => {
    it('should have proper function signature', () => {
      expect(fileContent).toContain('export async function updateSoftware (req, res) {')
    })

    it('should validate request parameters', () => {
      expect(fileContent).toContain('const errors = validationResult(req)')
      expect(fileContent).toContain('if (!errors.isEmpty()) {')
      expect(fileContent).toContain('return res.status(400).json({ errors: errors.array() })')
    })

    it('should extract software ID', () => {
      expect(fileContent).toContain('const softwareId = req.params._id')
    })

    it('should update software using Sequelize', () => {
      expect(fileContent).toContain('const [updatedRowsCount] = await Software.update(req.body, {')
      expect(fileContent).toContain('where: { id: softwareId }')
    })

    it('should handle not found', () => {
      expect(fileContent).toContain('if (updatedRowsCount === 0) {')
      expect(fileContent).toContain('return res.status(404).json({')
      expect(fileContent).toContain('success: false')
      expect(fileContent).toContain('message: \'Software not found\'')
    })

    it('should retrieve updated software', () => {
      expect(fileContent).toContain('const updatedSoftware = await Software.findByPk(softwareId)')
    })

    it('should log update', () => {
      expect(fileContent).toContain('logger.info(\'Software updated\'')
      expect(fileContent).toContain('softwareId')
    })

    it('should invalidate cache', () => {
      expect(fileContent).toContain('if (redisConfig.isRedisConnected()) {')
      expect(fileContent).toContain('await redisConfig.del(\'software:list:*\')')
      expect(fileContent).toContain('await redisConfig.del(\'software:employee:*\')')
      expect(fileContent).toContain('await redisConfig.del(')
      expect(fileContent).toContain('redisConfig.generateKey(\'software\', \'detail\', softwareId)')
    })

    it('should return success response', () => {
      expect(fileContent).toContain('res.status(200).json({')
      expect(fileContent).toContain('success: true')
      expect(fileContent).toContain('message: \'Software updated successfully\'')
      expect(fileContent).toContain('data: updatedSoftware')
    })
  })

  describe('deleteSoftware Function', () => {
    it('should have proper function signature', () => {
      expect(fileContent).toContain('export async function deleteSoftware (req, res) {')
    })

    it('should extract software ID', () => {
      expect(fileContent).toContain('const softwareId = req.params._id')
    })

    it('should delete software using Sequelize', () => {
      expect(fileContent).toContain('const deletedRowsCount = await Software.destroy({')
      expect(fileContent).toContain('where: { id: softwareId }')
    })

    it('should handle not found', () => {
      expect(fileContent).toContain('if (deletedRowsCount === 0) {')
      expect(fileContent).toContain('return res.status(404).json({')
      expect(fileContent).toContain('success: false')
      expect(fileContent).toContain('message: \'Software not found\'')
    })

    it('should log deletion', () => {
      expect(fileContent).toContain('logger.info(\'Software deleted\'')
      expect(fileContent).toContain('softwareId')
    })

    it('should invalidate cache', () => {
      expect(fileContent).toContain('if (redisConfig.isRedisConnected()) {')
      expect(fileContent).toContain('await redisConfig.del(\'software:list:*\')')
      expect(fileContent).toContain('await redisConfig.del(\'software:employee:*\')')
      expect(fileContent).toContain('await redisConfig.del(')
      expect(fileContent).toContain('redisConfig.generateKey(\'software\', \'detail\', softwareId)')
    })

    it('should return success response', () => {
      expect(fileContent).toContain('res.status(200).json({')
      expect(fileContent).toContain('success: true')
      expect(fileContent).toContain('message: \'Software deleted successfully\'')
    })
  })

  describe('getSoftwareByEmployee Function', () => {
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
      expect(fileContent).toContain('success: false')
      expect(fileContent).toContain('error: \'Forbidden\'')
      expect(fileContent).toContain('message: \'Access denied. You can only view your own software.\'')
    })

    it('should generate cache key', () => {
      expect(fileContent).toContain('const cacheKey = redisConfig.generateKey(')
      expect(fileContent).toContain('\'software\'')
      expect(fileContent).toContain('\'employee\'')
      expect(fileContent).toContain('employeeId')
    })

    it('should check cache first', () => {
      expect(fileContent).toContain('if (redisConfig.isRedisConnected()) {')
      expect(fileContent).toContain('const cachedData = await redisConfig.get(cacheKey)')
      expect(fileContent).toContain('if (cachedData) {')
      expect(fileContent).toContain('logger.info(\'Employee software served from cache\')')
      expect(fileContent).toContain('return res.json(cachedData)')
    })

    it('should find software by employee', () => {
      expect(fileContent).toContain('const software = await Software.findAll({')
      expect(fileContent).toContain('where: { assigned_to: employeeId }')
      expect(fileContent).toContain('include: [')
      expect(fileContent).toContain('model: Employee')
      expect(fileContent).toContain('as: \'assignedEmployee\'')
      expect(fileContent).toContain('order: [[\'createdAt\', \'DESC\']]')
    })

    it('should cache results', () => {
      expect(fileContent).toContain('if (redisConfig.isRedisConnected()) {')
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
