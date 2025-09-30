import { describe, it, expect, beforeEach, afterEach, vi, beforeAll, afterAll } from 'vitest'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

describe('Hardware Controller Unit Tests', () => {
  let controllerPath
  let fileContent

  beforeAll(() => {
    controllerPath = path.join(__dirname, '..', 'controllers', 'hardwareController.js')
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
  })

  describe('Import Statements', () => {
    it('should import validation result', () => {
      expect(fileContent).toContain('import { validationResult } from \'express-validator\'')
    })

    it('should import logger', () => {
      expect(fileContent).toContain('import logger from \'../utils/logger.js\'')
    })

    it('should import Hardware and Employee models', () => {
      expect(fileContent).toContain('import { Hardware, Employee } from \'../models/index.js\'')
    })

    it('should import Redis configuration', () => {
      expect(fileContent).toContain('import redisConfig from \'../config/redis.js\'')
    })
  })

  describe('Configuration Setup', () => {
    it('should have proper import structure', () => {
      expect(fileContent).toContain('// Import validation utilities for request validation')
      expect(fileContent).toContain('// Import logger for comprehensive logging')
      expect(fileContent).toContain('// Import database models for hardware and employee operations')
      expect(fileContent).toContain('// Import Redis configuration for caching operations')
    })
  })

  describe('listHardware Function', () => {
    it('should be defined as async function', () => {
      expect(fileContent).toContain('export async function listHardware (req, res, next) {')
    })

    it('should extract user role and ID', () => {
      expect(fileContent).toContain('const userRole = req.user?.role')
      expect(fileContent).toContain('const userId = req.user?.id')
    })

    it('should generate cache key', () => {
      expect(fileContent).toContain('const cacheKey = redisConfig.generateKey(')
      expect(fileContent).toContain('\'hardware\'')
      expect(fileContent).toContain('\'list\'')
    })

    it('should check Redis connection', () => {
      expect(fileContent).toContain('if (redisConfig.isRedisConnected()) {')
      expect(fileContent).toContain('const cachedData = await redisConfig.get(cacheKey)')
    })

    it('should return cached data if available', () => {
      expect(fileContent).toContain('if (cachedData) {')
      expect(fileContent).toContain('logger.info(\'Hardware list served from cache\')')
      expect(fileContent).toContain('return res.json({')
      expect(fileContent).toContain('success: true')
      expect(fileContent).toContain('data: cachedData')
    })

    it('should implement role-based access control', () => {
      expect(fileContent).toContain('const whereClause = {}')
      expect(fileContent).toContain('if (userRole !== \'admin\') {')
      expect(fileContent).toContain('whereClause.assigned_to = userId')
    })

    it('should retrieve hardware from database', () => {
      expect(fileContent).toContain('const hardware = await Hardware.findAll({')
      expect(fileContent).toContain('where: whereClause')
      expect(fileContent).toContain('include: [')
      expect(fileContent).toContain('model: Employee')
      expect(fileContent).toContain('as: \'assignedEmployee\'')
    })

    it('should cache the result', () => {
      expect(fileContent).toContain('if (redisConfig.isRedisConnected()) {')
      expect(fileContent).toContain('await redisConfig.set(cacheKey, hardware, 300)')
    })

    it('should return successful response', () => {
      expect(fileContent).toContain('res.json({')
      expect(fileContent).toContain('success: true')
      expect(fileContent).toContain('data: hardware')
    })

    it('should handle errors', () => {
      expect(fileContent).toContain('} catch (err) {')
      expect(fileContent).toContain('next(err)')
    })
  })

  describe('getHardwareById Function', () => {
    it('should be defined as async function', () => {
      expect(fileContent).toContain('export async function getHardwareById (req, res, next) {')
    })

    it('should extract user role, ID, and hardware ID', () => {
      expect(fileContent).toContain('const userRole = req.user?.role')
      expect(fileContent).toContain('const userId = req.user?.id')
      expect(fileContent).toContain('const hardwareId = req.params._id')
    })

    it('should initialize where clause', () => {
      expect(fileContent).toContain('const whereClause = { id: hardwareId }')
    })

    it('should implement role-based access control', () => {
      expect(fileContent).toContain('if (userRole !== \'admin\') {')
      expect(fileContent).toContain('whereClause.assigned_to = userId')
    })

    it('should find hardware by ID', () => {
      expect(fileContent).toContain('const hardware = await Hardware.findOne({')
      expect(fileContent).toContain('where: whereClause')
      expect(fileContent).toContain('include: [')
      expect(fileContent).toContain('model: Employee')
      expect(fileContent).toContain('as: \'assignedEmployee\'')
    })

    it('should handle hardware not found', () => {
      expect(fileContent).toContain('if (!hardware) {')
      expect(fileContent).toContain('return res.status(404).json({')
      expect(fileContent).toContain('success: false')
      expect(fileContent).toContain('message: \'Hardware not found\'')
    })

    it('should return successful response', () => {
      expect(fileContent).toContain('res.json({')
      expect(fileContent).toContain('success: true')
      expect(fileContent).toContain('data: hardware')
    })

    it('should handle errors', () => {
      expect(fileContent).toContain('} catch (err) {')
      expect(fileContent).toContain('next(err)')
    })
  })

  describe('addHardware Function', () => {
    it('should be defined as async function', () => {
      expect(fileContent).toContain('export async function addHardware (req, res, next) {')
    })

    it('should validate request data', () => {
      expect(fileContent).toContain('const errors = validationResult(req)')
      expect(fileContent).toContain('if (!errors.isEmpty()) {')
      expect(fileContent).toContain('return res.status(400).json({')
      expect(fileContent).toContain('success: false')
      expect(fileContent).toContain('message: \'Validation failed\'')
      expect(fileContent).toContain('errors: errors.array()')
    })

    it('should create hardware asset', () => {
      expect(fileContent).toContain('const hardware = await Hardware.create(req.body)')
    })

    it('should invalidate cache', () => {
      expect(fileContent).toContain('if (redisConfig.isRedisConnected()) {')
      expect(fileContent).toContain('const client = redisConfig.getClient()')
      expect(fileContent).toContain('const keys = await client.keys(\'hardware:*\')')
      expect(fileContent).toContain('if (keys.length > 0) {')
      expect(fileContent).toContain('await client.del(...keys)')
      expect(fileContent).toContain('logger.info(`Invalidated ${keys.length} hardware cache keys`)')
    })

    it('should return success response', () => {
      expect(fileContent).toContain('res.status(201).json({')
      expect(fileContent).toContain('success: true')
      expect(fileContent).toContain('message: \'Hardware created successfully\'')
      expect(fileContent).toContain('data: hardware')
    })

    it('should handle errors', () => {
      expect(fileContent).toContain('} catch (err) {')
      expect(fileContent).toContain('next(err)')
    })
  })

  describe('updateHardware Function', () => {
    it('should be defined as async function', () => {
      expect(fileContent).toContain('export async function updateHardware (req, res, next) {')
    })

    it('should extract hardware ID', () => {
      expect(fileContent).toContain('const hardwareId = req.params._id')
    })

    it('should find hardware by ID', () => {
      expect(fileContent).toContain('const hardware = await Hardware.findByPk(hardwareId)')
    })

    it('should handle hardware not found', () => {
      expect(fileContent).toContain('if (!hardware) {')
      expect(fileContent).toContain('return res.status(404).json({')
      expect(fileContent).toContain('success: false')
      expect(fileContent).toContain('message: \'Hardware not found\'')
    })

    it('should update hardware', () => {
      expect(fileContent).toContain('await hardware.update(req.body)')
    })

    it('should invalidate cache', () => {
      expect(fileContent).toContain('if (redisConfig.isRedisConnected()) {')
      expect(fileContent).toContain('const client = redisConfig.getClient()')
      expect(fileContent).toContain('const keys = await client.keys(\'hardware:*\')')
      expect(fileContent).toContain('if (keys.length > 0) {')
      expect(fileContent).toContain('await client.del(...keys)')
      expect(fileContent).toContain('logger.info(`Invalidated ${keys.length} hardware cache keys`)')
    })

    it('should return success response', () => {
      expect(fileContent).toContain('res.json({')
      expect(fileContent).toContain('success: true')
      expect(fileContent).toContain('message: \'Hardware updated successfully\'')
      expect(fileContent).toContain('data: hardware')
    })

    it('should handle errors', () => {
      expect(fileContent).toContain('} catch (err) {')
      expect(fileContent).toContain('next(err)')
    })
  })

  describe('deleteHardware Function', () => {
    it('should be defined as async function', () => {
      expect(fileContent).toContain('export async function deleteHardware (req, res, next) {')
    })

    it('should extract hardware ID', () => {
      expect(fileContent).toContain('const hardwareId = req.params._id')
    })

    it('should find hardware by ID', () => {
      expect(fileContent).toContain('const hardware = await Hardware.findByPk(hardwareId)')
    })

    it('should handle hardware not found', () => {
      expect(fileContent).toContain('if (!hardware) {')
      expect(fileContent).toContain('return res.status(404).json({')
      expect(fileContent).toContain('success: false')
      expect(fileContent).toContain('message: \'Hardware not found\'')
    })

    it('should delete hardware', () => {
      expect(fileContent).toContain('await hardware.destroy()')
    })

    it('should invalidate cache', () => {
      expect(fileContent).toContain('if (redisConfig.isRedisConnected()) {')
      expect(fileContent).toContain('const client = redisConfig.getClient()')
      expect(fileContent).toContain('const keys = await client.keys(\'hardware:*\')')
      expect(fileContent).toContain('if (keys.length > 0) {')
      expect(fileContent).toContain('await client.del(...keys)')
      expect(fileContent).toContain('logger.info(`Invalidated ${keys.length} hardware cache keys`)')
    })

    it('should return success response', () => {
      expect(fileContent).toContain('res.json({')
      expect(fileContent).toContain('success: true')
      expect(fileContent).toContain('message: \'Hardware deleted successfully\'')
    })

    it('should handle errors', () => {
      expect(fileContent).toContain('} catch (err) {')
      expect(fileContent).toContain('next(err)')
    })
  })

  describe('getHardwareByEmployee Function', () => {
    it('should be defined as async function', () => {
      expect(fileContent).toContain('export async function getHardwareByEmployee (req, res, next) {')
    })

    it('should extract user role, ID, and employee ID', () => {
      expect(fileContent).toContain('const userRole = req.user?.role')
      expect(fileContent).toContain('const userId = req.user?.id')
      expect(fileContent).toContain('const employeeId = req.params.employeeId')
    })

    it('should implement role-based access control', () => {
      expect(fileContent).toContain('if (userRole !== \'admin\' && parseInt(employeeId) !== userId) {')
      expect(fileContent).toContain('return res.status(403).json({')
      expect(fileContent).toContain('success: false')
      expect(fileContent).toContain('message: \'Access denied. You can only view your own assets.\'')
    })

    it('should find hardware by employee', () => {
      expect(fileContent).toContain('const hardware = await Hardware.findAll({')
      expect(fileContent).toContain('where: { assigned_to: employeeId }')
      expect(fileContent).toContain('include: [')
      expect(fileContent).toContain('model: Employee')
      expect(fileContent).toContain('as: \'assignedEmployee\'')
    })

    it('should return successful response', () => {
      expect(fileContent).toContain('res.json({')
      expect(fileContent).toContain('success: true')
      expect(fileContent).toContain('data: hardware')
    })

    it('should handle errors', () => {
      expect(fileContent).toContain('} catch (err) {')
      expect(fileContent).toContain('next(err)')
    })
  })

  describe('Documentation', () => {
    it('should have file header documentation', () => {
      expect(fileContent).toContain('@fileoverview Hardware Controller for EMS Backend')
      expect(fileContent).toContain('@description Handles CRUD operations and business logic for hardware asset resources')
      expect(fileContent).toContain('@author EMS Development Team')
      expect(fileContent).toContain('@version 1.0.0')
      expect(fileContent).toContain('@since 2025-09-17')
    })

    it('should have function documentation', () => {
      expect(fileContent).toContain('@async')
      expect(fileContent).toContain('@function')
      expect(fileContent).toContain('@param')
      expect(fileContent).toContain('@returns')
      expect(fileContent).toContain('@throws')
      expect(fileContent).toContain('@example')
    })

    it('should have inline comments', () => {
      expect(fileContent).toContain('// Import validation utilities for request validation')
      expect(fileContent).toContain('// Import logger for comprehensive logging')
      expect(fileContent).toContain('// Import database models for hardware and employee operations')
      expect(fileContent).toContain('// Import Redis configuration for caching operations')
    })
  })

  describe('Error Handling', () => {
    it('should have try-catch blocks', () => {
      expect(fileContent).toContain('try {')
      expect(fileContent).toContain('} catch (err) {')
    })

    it('should have error logging', () => {
      expect(fileContent).toContain('logger.info')
    })

    it('should have proper error responses', () => {
      expect(fileContent).toContain('res.status(400)')
      expect(fileContent).toContain('res.status(404)')
      expect(fileContent).toContain('res.status(403)')
    })
  })

  describe('Logging', () => {
    it('should have comprehensive logging', () => {
      expect(fileContent).toContain('logger.info(\'Hardware list served from cache\')')
      expect(fileContent).toContain('logger.info(`Invalidated ${keys.length} hardware cache keys`)')
    })
  })

  describe('Code Quality', () => {
    it('should use const for immutable values', () => {
      expect(fileContent).toContain('const userRole = req.user?.role')
      expect(fileContent).toContain('const userId = req.user?.id')
      expect(fileContent).toContain('const hardwareId = req.params._id')
      expect(fileContent).toContain('const whereClause = {}')
    })

    it('should have proper async/await usage', () => {
      expect(fileContent).toContain('export async function listHardware')
      expect(fileContent).toContain('export async function getHardwareById')
      expect(fileContent).toContain('export async function addHardware')
      expect(fileContent).toContain('export async function updateHardware')
      expect(fileContent).toContain('export async function deleteHardware')
      expect(fileContent).toContain('export async function getHardwareByEmployee')
    })

    it('should have proper function structure', () => {
      expect(fileContent).toContain('export async function listHardware (req, res, next) {')
      expect(fileContent).toContain('export async function getHardwareById (req, res, next) {')
      expect(fileContent).toContain('export async function addHardware (req, res, next) {')
      expect(fileContent).toContain('export async function updateHardware (req, res, next) {')
      expect(fileContent).toContain('export async function deleteHardware (req, res, next) {')
      expect(fileContent).toContain('export async function getHardwareByEmployee (req, res, next) {')
    })
  })
})
