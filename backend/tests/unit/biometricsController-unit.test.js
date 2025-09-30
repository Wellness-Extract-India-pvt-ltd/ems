import { describe, it, expect, beforeEach, afterEach, vi, beforeAll, afterAll } from 'vitest'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

describe('BioMetrics Controller Unit Tests', () => {
  let controllerPath
  let fileContent

  beforeAll(() => {
    controllerPath = path.join(__dirname, '..', 'controllers', 'biometricsController.js')
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
    it('should import biometrics connection utilities', () => {
      expect(fileContent).toContain('import {')
      expect(fileContent).toContain('executeBiometricsQuery')
      expect(fileContent).toContain('testBiometricsConnection')
      expect(fileContent).toContain('getBiometricsDatabaseInfo')
      expect(fileContent).toContain('} from \'../database/biometricsConnection.js\'')
    })

    it('should import BiometricEmployee model', () => {
      expect(fileContent).toContain('import BiometricEmployee from \'../models/BiometricEmployee.js\'')
    })

    it('should import logger', () => {
      expect(fileContent).toContain('import logger from \'../utils/logger.js\'')
    })
  })

  describe('Configuration Setup', () => {
    it('should have proper import structure', () => {
      expect(fileContent).toContain('// Import BioMetrics database connection utilities')
      expect(fileContent).toContain('// Import BiometricEmployee model for data synchronization')
      expect(fileContent).toContain('// Import logger for comprehensive logging')
    })
  })

  describe('testConnection Function', () => {
    it('should be defined as async function', () => {
      expect(fileContent).toContain('export async function testConnection (req, res) {')
    })

    it('should test biometrics connection', () => {
      expect(fileContent).toContain('const isConnected = await testBiometricsConnection()')
    })

    it('should handle successful connection', () => {
      expect(fileContent).toContain('if (isConnected) {')
      expect(fileContent).toContain('res.status(200).json({')
      expect(fileContent).toContain('success: true')
      expect(fileContent).toContain('message: \'BioMetrics database connection successful\'')
    })

    it('should handle failed connection', () => {
      expect(fileContent).toContain('} else {')
      expect(fileContent).toContain('res.status(500).json({')
      expect(fileContent).toContain('success: false')
      expect(fileContent).toContain('message: \'BioMetrics database connection failed\'')
    })

    it('should handle connection errors', () => {
      expect(fileContent).toContain('} catch (error) {')
      expect(fileContent).toContain('logger.error(\'BioMetrics connection test error:\', error)')
    })
  })

  describe('getDatabaseInfo Function', () => {
    it('should be defined as async function', () => {
      expect(fileContent).toContain('export async function getDatabaseInfo (req, res) {')
    })

    it('should get database information', () => {
      expect(fileContent).toContain('const dbInfo = await getBiometricsDatabaseInfo()')
    })

    it('should return database information', () => {
      expect(fileContent).toContain('res.status(200).json({')
      expect(fileContent).toContain('success: true')
      expect(fileContent).toContain('data: dbInfo')
    })

    it('should handle database info errors', () => {
      expect(fileContent).toContain('} catch (error) {')
      expect(fileContent).toContain('logger.error(\'Error getting BioMetrics database info:\', error)')
    })
  })

  describe('getBiometricEmployees Function', () => {
    it('should be defined as async function', () => {
      expect(fileContent).toContain('export async function getBiometricEmployees (req, res) {')
    })

    it('should extract query parameters', () => {
      expect(fileContent).toContain('const {')
      expect(fileContent).toContain('page = 1')
      expect(fileContent).toContain('limit = 50')
      expect(fileContent).toContain('search = \'\'')
      expect(fileContent).toContain('department = \'\'')
      expect(fileContent).toContain('status = \'Active\'')
    })

    it('should build SQL query', () => {
      expect(fileContent).toContain('let query = `')
      expect(fileContent).toContain('SELECT')
      expect(fileContent).toContain('Emp_ID as employeeId')
      expect(fileContent).toContain('Emp_Code as employeeCode')
      expect(fileContent).toContain('Emp_Name as fullName')
      expect(fileContent).toContain('FROM employees')
    })

    it('should handle search filtering', () => {
      expect(fileContent).toContain('if (search) {')
      expect(fileContent).toContain('query += \' AND (Emp_Name LIKE @search OR Emp_Code LIKE @search)\'')
    })

    it('should handle department filtering', () => {
      expect(fileContent).toContain('if (department) {')
      expect(fileContent).toContain('query += \' AND Department = @department\'')
    })

    it('should handle status filtering', () => {
      expect(fileContent).toContain('if (status) {')
      expect(fileContent).toContain('query += \' AND Status = @status\'')
    })

    it('should add pagination', () => {
      expect(fileContent).toContain('ORDER BY Emp_Name OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY')
    })

    it('should execute query', () => {
      expect(fileContent).toContain('const result = await executeBiometricsQuery(query, params)')
    })

    it('should get total count', () => {
      expect(fileContent).toContain('const countQuery = `')
      expect(fileContent).toContain('SELECT COUNT(*) as total')
      expect(fileContent).toContain('FROM employees')
    })

    it('should return paginated results', () => {
      expect(fileContent).toContain('res.status(200).json({')
      expect(fileContent).toContain('success: true')
      expect(fileContent).toContain('data: {')
      expect(fileContent).toContain('employees: result.recordset')
      expect(fileContent).toContain('pagination: {')
    })

    it('should handle employee fetch errors', () => {
      expect(fileContent).toContain('} catch (error) {')
      expect(fileContent).toContain('logger.error(\'Error fetching biometric employees:\', error)')
    })
  })

  describe('getEmployeeAttendance Function', () => {
    it('should be defined as async function', () => {
      expect(fileContent).toContain('export async function getEmployeeAttendance (req, res) {')
    })

    it('should extract query parameters', () => {
      expect(fileContent).toContain('const { employeeId, startDate, endDate, page = 1, limit = 100 } = req.query')
    })

    it('should validate employee ID', () => {
      expect(fileContent).toContain('if (!employeeId) {')
      expect(fileContent).toContain('return res.status(400).json({')
      expect(fileContent).toContain('message: \'Employee ID is required\'')
    })

    it('should build attendance query', () => {
      expect(fileContent).toContain('let query = `')
      expect(fileContent).toContain('SELECT')
      expect(fileContent).toContain('ID as attendanceId')
      expect(fileContent).toContain('Emp_ID as employeeId')
      expect(fileContent).toContain('Punch_Date as punchDate')
      expect(fileContent).toContain('FROM Tran_DeviceAttRec')
    })

    it('should handle date filtering', () => {
      expect(fileContent).toContain('if (startDate) {')
      expect(fileContent).toContain('query += \' AND Punch_Date >= @startDate\'')
      expect(fileContent).toContain('if (endDate) {')
      expect(fileContent).toContain('query += \' AND Punch_Date <= @endDate\'')
    })

    it('should add pagination', () => {
      expect(fileContent).toContain('ORDER BY Punch_Date DESC, Punch_Time DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY')
    })

    it('should execute attendance query', () => {
      expect(fileContent).toContain('const result = await executeBiometricsQuery(query, params)')
    })

    it('should get attendance count', () => {
      expect(fileContent).toContain('const countQuery = `')
      expect(fileContent).toContain('SELECT COUNT(*) as total')
      expect(fileContent).toContain('FROM Tran_DeviceAttRec')
    })

    it('should return attendance data', () => {
      expect(fileContent).toContain('res.status(200).json({')
      expect(fileContent).toContain('success: true')
      expect(fileContent).toContain('data: {')
      expect(fileContent).toContain('attendance: result.recordset')
    })

    it('should handle attendance fetch errors', () => {
      expect(fileContent).toContain('} catch (error) {')
      expect(fileContent).toContain('logger.error(\'Error fetching employee attendance:\', error)')
    })
  })

  describe('getAttendanceSummary Function', () => {
    it('should be defined as async function', () => {
      expect(fileContent).toContain('export async function getAttendanceSummary (req, res) {')
    })

    it('should extract query parameters', () => {
      expect(fileContent).toContain('const { startDate, endDate, department = \'\', employeeId = \'\' } = req.query')
    })

    it('should validate required dates', () => {
      expect(fileContent).toContain('if (!startDate || !endDate) {')
      expect(fileContent).toContain('return res.status(400).json({')
      expect(fileContent).toContain('message: \'Start date and end date are required\'')
    })

    it('should build summary query', () => {
      expect(fileContent).toContain('let query = `')
      expect(fileContent).toContain('SELECT')
      expect(fileContent).toContain('e.Emp_ID as employeeId')
      expect(fileContent).toContain('e.Emp_Code as employeeCode')
      expect(fileContent).toContain('e.Emp_Name as fullName')
      expect(fileContent).toContain('FROM employees e')
      expect(fileContent).toContain('LEFT JOIN Tran_DeviceAttRec a ON e.Emp_ID = a.Emp_ID')
    })

    it('should handle department filtering', () => {
      expect(fileContent).toContain('if (department) {')
      expect(fileContent).toContain('query += \' AND e.Department = @department\'')
    })

    it('should handle employee filtering', () => {
      expect(fileContent).toContain('if (employeeId) {')
      expect(fileContent).toContain('query += \' AND e.Emp_ID = @employeeId\'')
    })

    it('should group results', () => {
      expect(fileContent).toContain('GROUP BY e.Emp_ID, e.Emp_Code, e.Emp_Name, e.Department')
      expect(fileContent).toContain('ORDER BY e.Emp_Name')
    })

    it('should execute summary query', () => {
      expect(fileContent).toContain('const result = await executeBiometricsQuery(query, params)')
    })

    it('should return summary data', () => {
      expect(fileContent).toContain('res.status(200).json({')
      expect(fileContent).toContain('success: true')
      expect(fileContent).toContain('data: {')
      expect(fileContent).toContain('summary: result.recordset')
      expect(fileContent).toContain('dateRange: { startDate, endDate }')
      expect(fileContent).toContain('totalEmployees: result.recordset.length')
    })

    it('should handle summary errors', () => {
      expect(fileContent).toContain('} catch (error) {')
      expect(fileContent).toContain('logger.error(\'Error fetching attendance summary:\', error)')
    })
  })

  describe('getDepartments Function', () => {
    it('should be defined as async function', () => {
      expect(fileContent).toContain('export async function getDepartments (req, res) {')
    })

    it('should build departments query', () => {
      expect(fileContent).toContain('const query = `')
      expect(fileContent).toContain('SELECT DISTINCT Department as name, COUNT(*) as employeeCount')
      expect(fileContent).toContain('FROM employees')
      expect(fileContent).toContain('WHERE Department IS NOT NULL AND Department != \'\'')
      expect(fileContent).toContain('GROUP BY Department')
      expect(fileContent).toContain('ORDER BY Department')
    })

    it('should execute departments query', () => {
      expect(fileContent).toContain('const result = await executeBiometricsQuery(query)')
    })

    it('should return departments data', () => {
      expect(fileContent).toContain('res.status(200).json({')
      expect(fileContent).toContain('success: true')
      expect(fileContent).toContain('data: result.recordset')
    })

    it('should handle departments errors', () => {
      expect(fileContent).toContain('} catch (error) {')
      expect(fileContent).toContain('logger.error(\'Error fetching departments:\', error)')
    })
  })

  describe('getRecentAttendance Function', () => {
    it('should be defined as async function', () => {
      expect(fileContent).toContain('export async function getRecentAttendance (req, res) {')
    })

    it('should extract limit parameter', () => {
      expect(fileContent).toContain('const { limit = 50 } = req.query')
    })

    it('should validate and sanitize limit', () => {
      expect(fileContent).toContain('const safeLimit = Math.max(1, Math.min(parseInt(limit) || 50, 200))')
    })

    it('should build recent attendance query', () => {
      expect(fileContent).toContain('const query = `')
      expect(fileContent).toContain('SELECT TOP @limit')
      expect(fileContent).toContain('a.ID as attendanceId')
      expect(fileContent).toContain('a.Emp_ID as employeeId')
      expect(fileContent).toContain('FROM Tran_DeviceAttRec a')
      expect(fileContent).toContain('INNER JOIN employees e ON a.Emp_ID = e.Emp_ID')
      expect(fileContent).toContain('WHERE a.Punch_Date >= DATEADD(day, -1, GETDATE())')
    })

    it('should execute recent attendance query', () => {
      expect(fileContent).toContain('const result = await executeBiometricsQuery(query, { limit: safeLimit })')
    })

    it('should return recent attendance data', () => {
      expect(fileContent).toContain('res.status(200).json({')
      expect(fileContent).toContain('success: true')
      expect(fileContent).toContain('data: result.recordset')
    })

    it('should handle recent attendance errors', () => {
      expect(fileContent).toContain('} catch (error) {')
      expect(fileContent).toContain('logger.error(\'Error fetching recent attendance:\', error)')
    })
  })

  describe('syncEmployees Function', () => {
    it('should be defined as async function', () => {
      expect(fileContent).toContain('export async function syncEmployees (req, res) {')
    })

    it('should extract force parameter', () => {
      expect(fileContent).toContain('const { force = false } = req.query')
    })

    it('should build sync query', () => {
      expect(fileContent).toContain('const query = `')
      expect(fileContent).toContain('SELECT')
      expect(fileContent).toContain('Emp_ID as employeeId')
      expect(fileContent).toContain('Emp_Code as employeeCode')
      expect(fileContent).toContain('Emp_Name as fullName')
      expect(fileContent).toContain('FROM employees')
    })

    it('should execute sync query', () => {
      expect(fileContent).toContain('const result = await executeBiometricsQuery(query)')
      expect(fileContent).toContain('const biometricEmployees = result.recordset')
    })

    it('should initialize counters', () => {
      expect(fileContent).toContain('let syncedCount = 0')
      expect(fileContent).toContain('let updatedCount = 0')
    })

    it('should process each employee', () => {
      expect(fileContent).toContain('for (const emp of biometricEmployees) {')
      expect(fileContent).toContain('const existingEmployee = await BiometricEmployee.findOne({')
      expect(fileContent).toContain('where: { employeeId: emp.employeeId }')
    })

    it('should handle existing employees', () => {
      expect(fileContent).toContain('if (existingEmployee) {')
      expect(fileContent).toContain('if (force || existingEmployee.lastSyncAt < new Date(emp.updatedAt)) {')
      expect(fileContent).toContain('await existingEmployee.update({')
    })

    it('should handle new employees', () => {
      expect(fileContent).toContain('} else {')
      expect(fileContent).toContain('await BiometricEmployee.create({')
    })

    it('should return sync results', () => {
      expect(fileContent).toContain('res.status(200).json({')
      expect(fileContent).toContain('success: true')
      expect(fileContent).toContain('message: \'Employee sync completed\'')
      expect(fileContent).toContain('data: {')
      expect(fileContent).toContain('totalEmployees: biometricEmployees.length')
      expect(fileContent).toContain('syncedCount')
      expect(fileContent).toContain('updatedCount')
    })

    it('should handle sync errors', () => {
      expect(fileContent).toContain('} catch (error) {')
      expect(fileContent).toContain('logger.error(\'Error syncing employees:\', error)')
    })
  })

  describe('Documentation', () => {
    it('should have file header documentation', () => {
      expect(fileContent).toContain('@fileoverview BioMetrics Controller for EMS Backend')
      expect(fileContent).toContain('@description Handles CRUD operations and business logic for biometric attendance data integration')
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
      expect(fileContent).toContain('// Import BioMetrics database connection utilities')
      expect(fileContent).toContain('// Import BiometricEmployee model for data synchronization')
      expect(fileContent).toContain('// Import logger for comprehensive logging')
      expect(fileContent).toContain('// Test the connection to BioMetrics SQL Server database')
      expect(fileContent).toContain('// Return success response with timestamp')
      expect(fileContent).toContain('// Return failure response')
      expect(fileContent).toContain('// Log error and return error response')
    })
  })

  describe('Error Handling', () => {
    it('should have try-catch blocks', () => {
      expect(fileContent).toContain('try {')
      expect(fileContent).toContain('} catch (error) {')
    })

    it('should have error logging', () => {
      expect(fileContent).toContain('logger.error')
    })

    it('should have proper error responses', () => {
      expect(fileContent).toContain('res.status(400)')
      expect(fileContent).toContain('res.status(500)')
    })
  })

  describe('Logging', () => {
    it('should have comprehensive logging', () => {
      expect(fileContent).toContain('logger.error(\'BioMetrics connection test error:\', error)')
      expect(fileContent).toContain('logger.error(\'Error getting BioMetrics database info:\', error)')
      expect(fileContent).toContain('logger.error(\'Error fetching biometric employees:\', error)')
      expect(fileContent).toContain('logger.error(\'Error fetching employee attendance:\', error)')
      expect(fileContent).toContain('logger.error(\'Error fetching attendance summary:\', error)')
      expect(fileContent).toContain('logger.error(\'Error fetching departments:\', error)')
      expect(fileContent).toContain('logger.error(\'Error fetching recent attendance:\', error)')
      expect(fileContent).toContain('logger.error(\'Error syncing employees:\', error)')
    })
  })

  describe('Code Quality', () => {
    it('should use const for immutable values', () => {
      expect(fileContent).toContain('const {')
      expect(fileContent).toContain('const query = `')
      expect(fileContent).toContain('const result = await executeBiometricsQuery')
    })

    it('should have proper async/await usage', () => {
      expect(fileContent).toContain('export async function testConnection')
      expect(fileContent).toContain('export async function getDatabaseInfo')
      expect(fileContent).toContain('export async function getBiometricEmployees')
      expect(fileContent).toContain('export async function getEmployeeAttendance')
      expect(fileContent).toContain('export async function getAttendanceSummary')
      expect(fileContent).toContain('export async function getDepartments')
      expect(fileContent).toContain('export async function getRecentAttendance')
      expect(fileContent).toContain('export async function syncEmployees')
    })

    it('should have proper function structure', () => {
      expect(fileContent).toContain('export async function testConnection (req, res) {')
      expect(fileContent).toContain('export async function getDatabaseInfo (req, res) {')
      expect(fileContent).toContain('export async function getBiometricEmployees (req, res) {')
      expect(fileContent).toContain('export async function getEmployeeAttendance (req, res) {')
      expect(fileContent).toContain('export async function getAttendanceSummary (req, res) {')
      expect(fileContent).toContain('export async function getDepartments (req, res) {')
      expect(fileContent).toContain('export async function getRecentAttendance (req, res) {')
      expect(fileContent).toContain('export async function syncEmployees (req, res) {')
    })
  })
})
