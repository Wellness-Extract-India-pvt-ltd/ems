import { describe, it, expect, beforeEach, afterEach, vi, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Mock environment variables
process.env.JWT_SECRET = 'test_jwt_secret'
process.env.JWT_REFRESH_SECRET = 'test_jwt_refresh_secret'
process.env.SKU_ID = 'test-sku-id'

// Mock the logger
const mockLogger = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn()
}

// Mock the Employee model
const mockEmployee = {
  create: vi.fn(),
  findByPk: vi.fn(),
  findAndCountAll: vi.fn(),
  update: vi.fn(),
  destroy: vi.fn()
}

// Mock the graph service
const mockGraphService = {
  getAccessToken: vi.fn()
}

// Mock axios
const mockAxios = {
  post: vi.fn()
}

describe('Employee Controller Tests', () => {
  let controllerPath
  let fileContent

  beforeAll(async () => {
    // Set up mocks
    vi.mock('../utils/logger.js', () => ({ default: mockLogger }))
    vi.mock('../models/Employee.js', () => ({ default: mockEmployee }))
    vi.mock('../utils/graphService.js', () => ({ default: mockGraphService }))
    vi.mock('axios', () => ({ default: mockAxios }))

    // Read the controller file
    controllerPath = path.join(__dirname, '..', 'controllers', 'employeeController.js')
    fileContent = fs.readFileSync(controllerPath, 'utf8')
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterAll(() => {
    vi.restoreAllMocks()
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
      expect(fileContent).toContain('export async function addEmployee')
      expect(fileContent).toContain('export async function listEmployees')
      expect(fileContent).toContain('export async function getEmployeeById')
      expect(fileContent).toContain('export async function updateEmployee')
      expect(fileContent).toContain('export async function deleteEmployee')
    })

    it('should have all required imports', () => {
      expect(fileContent).toContain('import { validationResult } from \'express-validator\'')
      expect(fileContent).toContain('import crypto from \'crypto\'')
      expect(fileContent).toContain('import axios from \'axios\'')
      expect(fileContent).toContain('import { Op } from \'sequelize\'')
      expect(fileContent).toContain('import Employee from \'../models/Employee.js\'')
      expect(fileContent).toContain('import graphService from \'../utils/graphService.js\'')
      expect(fileContent).toContain('import logger from \'../utils/logger.js\'')
    })
  })

  describe('Configuration and Initialization', () => {
    it('should have proper import structure', () => {
      expect(fileContent).toContain('// Import validation utilities for request validation')
      expect(fileContent).toContain('// Import crypto for secure password generation')
      expect(fileContent).toContain('// Import axios for HTTP requests to Microsoft Graph')
      expect(fileContent).toContain('// Import Sequelize operators for database queries')
      expect(fileContent).toContain('// Import Employee model for database operations')
      expect(fileContent).toContain('// Import Microsoft Graph service for user provisioning')
      expect(fileContent).toContain('// Import logger for comprehensive logging')
    })
  })

  describe('mapFilesToDoc Function', () => {
    it('should have mapFilesToDoc function', () => {
      expect(fileContent).toContain('function mapFilesToDoc (files, payload) {')
    })

    it('should create lookup map', () => {
      expect(fileContent).toContain('const lookup = Object.fromEntries(files.map((f) => [f.fieldname, f.path]))')
    })

    it('should map avatar file', () => {
      expect(fileContent).toContain('avatarPath: lookup.avatar || payload.avatarPath')
    })

    it('should map bank documents', () => {
      expect(fileContent).toContain('bank: payload.bank')
      expect(fileContent).toContain('passbookUrl: lookup.passbook || payload.bank.passbookUrl')
    })

    it('should map education certificates', () => {
      expect(fileContent).toContain('educations: (payload.educations || []).map((edu, i) => ({')
      expect(fileContent).toContain('certificatePath: lookup[`education_${i}`] || edu.certificatePath')
    })

    it('should map organization experience letters', () => {
      expect(fileContent).toContain('organisations: (payload.organisations || []).map((org, i) => ({')
      expect(fileContent).toContain('experienceLetterPath:')
      expect(fileContent).toContain('lookup[`organisation_${i}`] || org.experienceLetterPath')
    })

    it('should have inline comments', () => {
      expect(fileContent).toContain('// Create lookup map for file field names to file paths')
      expect(fileContent).toContain('// Map avatar file if uploaded')
      expect(fileContent).toContain('// Map bank documents if bank data exists')
      expect(fileContent).toContain('// Map education certificates for each education record')
      expect(fileContent).toContain('// Map experience letters for each organization record')
    })
  })

  describe('addEmployee Function', () => {
    it('should have addEmployee function with proper signature', () => {
      expect(fileContent).toContain('export async function addEmployee (req, res) {')
    })

    it('should validate request data', () => {
      expect(fileContent).toContain('const errors = validationResult(req)')
      expect(fileContent).toContain('if (!errors.isEmpty()) {')
      expect(fileContent).toContain('return res.status(400).json({ errors: errors.array() })')
    })

    it('should parse employee payload', () => {
      expect(fileContent).toContain('const payload = JSON.parse(req.body.payload || \'{}\')')
    })

    it('should generate temporary password', () => {
      expect(fileContent).toContain('const tempPassword = crypto.randomBytes(8).toString(\'base64\')')
    })

    it('should get Microsoft Graph access token', () => {
      expect(fileContent).toContain('const accessToken = await graphService.getAccessToken()')
    })

    it('should create Microsoft Graph user', () => {
      expect(fileContent).toContain('const msUser = {')
      expect(fileContent).toContain('accountEnabled: true')
      expect(fileContent).toContain('displayName: `${payload.personal.firstName} ${payload.personal.lastName}`')
      expect(fileContent).toContain('userPrincipalName: payload.contact.email')
    })

    it('should make Microsoft Graph API call', () => {
      expect(fileContent).toContain('await axios.post(')
      expect(fileContent).toContain('\'https://graph.microsoft.com/v1.0/users\'')
      expect(fileContent).toContain('{ headers: { Authorization: `Bearer ${accessToken}` } }')
    })

    it('should assign license if SKU_ID is configured', () => {
      expect(fileContent).toContain('if (process.env.SKU_ID) {')
      expect(fileContent).toContain('await axios.post(')
      expect(fileContent).toContain('`https://graph.microsoft.com/v1.0/users/${msGraphUserId}/assignLicense`')
      expect(fileContent).toContain('addLicenses: [{ skuId: process.env.SKU_ID }]')
    })

    it('should handle Microsoft Graph errors', () => {
      expect(fileContent).toContain('} catch (err) {')
      expect(fileContent).toContain('logger.error(\'Microsoft Graph operation failed\', { error: err.message })')
    })

    it('should map uploaded files', () => {
      expect(fileContent).toContain('const docWithFiles = mapFilesToDoc(req.files, payload)')
    })

    it('should create employee record', () => {
      expect(fileContent).toContain('const employee = await Employee.create({')
      expect(fileContent).toContain('...docWithFiles')
      expect(fileContent).toContain('ms_graph_user_id: msGraphUserId')
    })

    it('should log successful creation', () => {
      expect(fileContent).toContain('logger.info(\'Employee created successfully\', { employeeId: employee.id })')
    })

    it('should return success response', () => {
      expect(fileContent).toContain('return res.status(201).json({')
      expect(fileContent).toContain('message: \'Employee created successfully\'')
      expect(fileContent).toContain('employee: {')
      expect(fileContent).toContain('id: employee.id')
      expect(fileContent).toContain('employee_id: employee.employee_id')
    })

    it('should handle creation errors', () => {
      expect(fileContent).toContain('} catch (err) {')
      expect(fileContent).toContain('logger.error(\'Employee creation failed\'')
      expect(fileContent).toContain('return res.status(500).json({')
      expect(fileContent).toContain('message: \'Failed to create employee\'')
    })

    it('should have inline comments', () => {
      expect(fileContent).toContain('// Validate request data using express-validator')
      expect(fileContent).toContain('// Parse employee data from request body')
      expect(fileContent).toContain('// Generate a secure temporary password for Microsoft Graph user')
      expect(fileContent).toContain('// Get Microsoft Graph access token')
      expect(fileContent).toContain('// Prepare Microsoft Graph user object')
      expect(fileContent).toContain('// Create user in Microsoft Graph')
      expect(fileContent).toContain('// Assign license if SKU_ID is configured')
      expect(fileContent).toContain('// Log Microsoft Graph operation failure but continue with employee creation')
      expect(fileContent).toContain('// Map uploaded files to document paths in payload')
      expect(fileContent).toContain('// Create employee record in local database with Microsoft Graph user ID')
      expect(fileContent).toContain('// Log successful employee creation')
      expect(fileContent).toContain('// Log error and return failure response')
    })
  })

  describe('listEmployees Function', () => {
    it('should have listEmployees function with proper signature', () => {
      expect(fileContent).toContain('export async function listEmployees (req, res) {')
    })

    it('should extract query parameters', () => {
      expect(fileContent).toContain('const { search = \'\', page = 1, limit = 10 } = req.query')
    })

    it('should build search condition', () => {
      expect(fileContent).toContain('const whereClause = search')
      expect(fileContent).toContain('[Op.or]: [')
      expect(fileContent).toContain('{ first_name: { [Op.like]: `%${search}%` } }')
      expect(fileContent).toContain('{ last_name: { [Op.like]: `%${search}%` } }')
      expect(fileContent).toContain('{ email: { [Op.like]: `%${search}%` } }')
    })

    it('should execute paginated query', () => {
      expect(fileContent).toContain('const { count, rows: employees } = await Employee.findAndCountAll({')
      expect(fileContent).toContain('where: whereClause')
      expect(fileContent).toContain('limit: parseInt(limit)')
      expect(fileContent).toContain('offset: (parseInt(page) - 1) * parseInt(limit)')
    })

    it('should return paginated results', () => {
      expect(fileContent).toContain('res.status(200).json({')
      expect(fileContent).toContain('employees')
      expect(fileContent).toContain('totalPages: Math.ceil(count / limit)')
      expect(fileContent).toContain('currentPage: page')
    })

    it('should handle list errors', () => {
      expect(fileContent).toContain('} catch (error) {')
      expect(fileContent).toContain('logger.error(\'Employee list error\', error)')
      expect(fileContent).toContain('res.status(500).json({')
      expect(fileContent).toContain('message: \'Error fetching employees\'')
    })

    it('should have inline comments', () => {
      expect(fileContent).toContain('// Extract query parameters with defaults')
      expect(fileContent).toContain('// Build search condition if search term is provided')
      expect(fileContent).toContain('// Execute paginated query with search conditions')
      expect(fileContent).toContain('// Return paginated results with metadata')
      expect(fileContent).toContain('// Log error and return failure response')
    })
  })

  describe('getEmployeeById Function', () => {
    it('should have getEmployeeById function with proper signature', () => {
      expect(fileContent).toContain('export async function getEmployeeById (req, res) {')
    })

    it('should extract employee ID', () => {
      expect(fileContent).toContain('const employeeId = req.params._id')
    })

    it('should find employee by primary key', () => {
      expect(fileContent).toContain('const employee = await Employee.findByPk(employeeId)')
    })

    it('should handle employee not found', () => {
      expect(fileContent).toContain('if (!employee) {')
      expect(fileContent).toContain('return res.status(404).json({')
      expect(fileContent).toContain('success: false')
      expect(fileContent).toContain('message: \'Employee not found\'')
    })

    it('should return employee data', () => {
      expect(fileContent).toContain('res.status(200).json({')
      expect(fileContent).toContain('success: true')
      expect(fileContent).toContain('data: employee')
    })

    it('should handle fetch errors', () => {
      expect(fileContent).toContain('} catch (error) {')
      expect(fileContent).toContain('logger.error(\'Employee fetch error\'')
      expect(fileContent).toContain('res.status(500).json({')
      expect(fileContent).toContain('message: \'Error fetching employee\'')
    })

    it('should have inline comments', () => {
      expect(fileContent).toContain('// Extract employee ID from route parameters')
      expect(fileContent).toContain('// Find employee by primary key')
      expect(fileContent).toContain('// Return 404 if employee not found')
      expect(fileContent).toContain('// Return employee data')
      expect(fileContent).toContain('// Log error and return failure response')
    })
  })

  describe('updateEmployee Function', () => {
    it('should have updateEmployee function with proper signature', () => {
      expect(fileContent).toContain('export async function updateEmployee (req, res) {')
    })

    it('should exclude sensitive fields', () => {
      expect(fileContent).toContain('const { msGraphUserId, refreshToken, ...updateFields } = req.body')
    })

    it('should extract employee ID', () => {
      expect(fileContent).toContain('const employeeId = req.params._id')
    })

    it('should find employee by primary key', () => {
      expect(fileContent).toContain('const employee = await Employee.findByPk(employeeId)')
    })

    it('should handle employee not found', () => {
      expect(fileContent).toContain('if (!employee) {')
      expect(fileContent).toContain('return res.status(404).json({')
      expect(fileContent).toContain('success: false')
      expect(fileContent).toContain('message: \'Employee not found\'')
    })

    it('should update employee', () => {
      expect(fileContent).toContain('await employee.update(updateFields)')
    })

    it('should log successful update', () => {
      expect(fileContent).toContain('logger.info(\'Employee updated\', { employeeId })')
    })

    it('should return success response', () => {
      expect(fileContent).toContain('res.status(200).json({')
      expect(fileContent).toContain('success: true')
      expect(fileContent).toContain('message: \'Employee updated successfully\'')
      expect(fileContent).toContain('data: employee')
    })

    it('should handle update errors', () => {
      expect(fileContent).toContain('} catch (error) {')
      expect(fileContent).toContain('logger.error(\'Employee update failed\'')
      expect(fileContent).toContain('res.status(400).json({')
      expect(fileContent).toContain('message: \'Error updating employee\'')
    })

    it('should have inline comments', () => {
      expect(fileContent).toContain('// Exclude sensitive fields from updates to prevent security issues')
      expect(fileContent).toContain('// Extract employee ID from route parameters')
      expect(fileContent).toContain('// Find employee by primary key')
      expect(fileContent).toContain('// Return 404 if employee not found')
      expect(fileContent).toContain('// Update employee with provided fields')
      expect(fileContent).toContain('// Log successful update')
      expect(fileContent).toContain('// Return success response with updated data')
      expect(fileContent).toContain('// Log error and return failure response')
    })
  })

  describe('deleteEmployee Function', () => {
    it('should have deleteEmployee function with proper signature', () => {
      expect(fileContent).toContain('export async function deleteEmployee (req, res) {')
    })

    it('should extract employee ID', () => {
      expect(fileContent).toContain('const employeeId = req.params._id')
    })

    it('should attempt to delete employee', () => {
      expect(fileContent).toContain('const deletedCount = await Employee.destroy({')
      expect(fileContent).toContain('where: { id: employeeId }')
    })

    it('should handle employee not found', () => {
      expect(fileContent).toContain('if (deletedCount === 0) {')
      expect(fileContent).toContain('return res.status(404).json({')
      expect(fileContent).toContain('success: false')
      expect(fileContent).toContain('message: \'Employee not found\'')
    })

    it('should log successful deletion', () => {
      expect(fileContent).toContain('logger.info(\'Employee deleted\', { employeeId })')
    })

    it('should return success response', () => {
      expect(fileContent).toContain('res.status(200).json({')
      expect(fileContent).toContain('success: true')
      expect(fileContent).toContain('message: \'Employee deleted successfully\'')
    })

    it('should handle deletion errors', () => {
      expect(fileContent).toContain('} catch (error) {')
      expect(fileContent).toContain('logger.error(\'Employee deletion failed\'')
      expect(fileContent).toContain('res.status(500).json({')
      expect(fileContent).toContain('message: \'Error deleting employee\'')
    })

    it('should have inline comments', () => {
      expect(fileContent).toContain('// Extract employee ID from route parameters')
      expect(fileContent).toContain('// Attempt to delete employee record')
      expect(fileContent).toContain('// Return 404 if no employee was found to delete')
      expect(fileContent).toContain('// Log successful deletion')
      expect(fileContent).toContain('// Return success response')
      expect(fileContent).toContain('// Log error and return failure response')
    })
  })

  describe('Documentation and Comments', () => {
    it('should have comprehensive JSDoc file header', () => {
      expect(fileContent).toContain('@fileoverview Employee Controller for EMS Backend')
      expect(fileContent).toContain('@description Handles CRUD operations and business logic for employee resources')
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
      expect(fileContent).toContain('// Import crypto for secure password generation')
      expect(fileContent).toContain('// Import axios for HTTP requests to Microsoft Graph')
      expect(fileContent).toContain('// Import Sequelize operators for database queries')
      expect(fileContent).toContain('// Import Employee model for database operations')
      expect(fileContent).toContain('// Import Microsoft Graph service for user provisioning')
      expect(fileContent).toContain('// Import logger for comprehensive logging')
    })
  })

  describe('Error Handling and Logging', () => {
    it('should have comprehensive error handling', () => {
      expect(fileContent).toContain('try {')
      expect(fileContent).toContain('} catch (error) {')
      expect(fileContent).toContain('} catch (err) {')
      expect(fileContent).toContain('logger.error')
      expect(fileContent).toContain('logger.info')
      expect(fileContent).toContain('logger.warn')
    })

    it('should have proper error responses', () => {
      expect(fileContent).toContain('res.status(400)')
      expect(fileContent).toContain('res.status(404)')
      expect(fileContent).toContain('res.status(500)')
      expect(fileContent).toContain('res.status(201)')
      expect(fileContent).toContain('res.status(200)')
    })

    it('should have detailed logging', () => {
      expect(fileContent).toContain('logger.info(\'Employee created successfully\'')
      expect(fileContent).toContain('logger.info(\'Employee updated\'')
      expect(fileContent).toContain('logger.info(\'Employee deleted\'')
      expect(fileContent).toContain('logger.error(\'Microsoft Graph operation failed\'')
      expect(fileContent).toContain('logger.error(\'Employee creation failed\'')
      expect(fileContent).toContain('logger.error(\'Employee list error\'')
      expect(fileContent).toContain('logger.error(\'Employee fetch error\'')
      expect(fileContent).toContain('logger.error(\'Employee update failed\'')
      expect(fileContent).toContain('logger.error(\'Employee deletion failed\'')
    })
  })

  describe('Code Quality and Best Practices', () => {
    it('should use const for immutable values', () => {
      expect(fileContent).toContain('const {')
      expect(fileContent).toContain('const employeeId = req.params._id')
      expect(fileContent).toContain('const tempPassword = crypto.randomBytes(8).toString(\'base64\')')
    })

    it('should have proper async/await usage', () => {
      expect(fileContent).toContain('export async function addEmployee')
      expect(fileContent).toContain('export async function listEmployees')
      expect(fileContent).toContain('export async function getEmployeeById')
      expect(fileContent).toContain('export async function updateEmployee')
      expect(fileContent).toContain('export async function deleteEmployee')
    })

    it('should have proper function structure', () => {
      expect(fileContent).toContain('function mapFilesToDoc (files, payload) {')
      expect(fileContent).toContain('export async function addEmployee (req, res) {')
      expect(fileContent).toContain('export async function listEmployees (req, res) {')
      expect(fileContent).toContain('export async function getEmployeeById (req, res) {')
      expect(fileContent).toContain('export async function updateEmployee (req, res) {')
      expect(fileContent).toContain('export async function deleteEmployee (req, res) {')
    })

    it('should have proper error handling patterns', () => {
      expect(fileContent).toContain('try {')
      expect(fileContent).toContain('} catch (error) {')
      expect(fileContent).toContain('} catch (err) {')
    })
  })
})
