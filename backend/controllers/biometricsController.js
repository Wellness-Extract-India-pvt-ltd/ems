/**
 * @fileoverview BioMetrics Controller for EMS Backend
 * @description Handles CRUD operations and business logic for biometric attendance data integration.
 * Provides comprehensive biometric system integration including employee management, attendance tracking,
 * and data synchronization between biometric devices and the EMS system.
 * 
 * @author EMS Development Team
 * @version 1.0.0
 * @since 2025-09-17
 * 
 * @features
 * - BioMetrics database connection testing and management
 * - Employee data retrieval and synchronization
 * - Attendance record tracking and analysis
 * - Department and organizational structure management
 * - Real-time attendance monitoring
 * - Data synchronization between biometric and EMS systems
 * - Comprehensive error handling and logging
 */

// Import BioMetrics database connection utilities
import {
  executeBiometricsQuery,
  testBiometricsConnection,
  getBiometricsDatabaseInfo
} from '../database/biometricsConnection.js'
// Import BiometricEmployee model for data synchronization
import BiometricEmployee from '../models/BiometricEmployee.js'
// Import logger for comprehensive logging
import logger from '../utils/logger.js'

/**
 * Test BioMetrics database connection
 * 
 * @async
 * @function testConnection
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * 
 * @description
 * Tests the connection to the BioMetrics SQL Server database to ensure
 * the system can communicate with the biometric devices and data.
 * 
 * @returns {Promise<void>} JSON response with connection status
 * 
 * @throws {Error} If database connection fails
 * 
 * @example
 * // Request: GET /api/v1/biometrics/test-connection
 * // Response: { "success": true, "message": "BioMetrics database connection successful" }
 */
export async function testConnection (req, res) {
  try {
    // Test the connection to BioMetrics SQL Server database
    const isConnected = await testBiometricsConnection()

    if (isConnected) {
      // Return success response with timestamp
      res.status(200).json({
        success: true,
        message: 'BioMetrics database connection successful',
        timestamp: new Date().toISOString()
      })
    } else {
      // Return failure response
      res.status(500).json({
        success: false,
        message: 'BioMetrics database connection failed'
      })
    }
  } catch (error) {
    // Log error and return error response
    logger.error('BioMetrics connection test error:', error)
    res.status(500).json({
      success: false,
      message: 'BioMetrics database connection error',
      error: error.message
    })
  }
}

/**
 * Get BioMetrics database information and table structure
 * 
 * @async
 * @function getDatabaseInfo
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * 
 * @description
 * Retrieves comprehensive information about the BioMetrics database including
 * table structure, schema details, and database metadata for system integration.
 * 
 * @returns {Promise<void>} JSON response with database information
 * 
 * @throws {Error} If database query fails
 * 
 * @example
 * // Request: GET /api/v1/biometrics/database-info
 * // Response: { "success": true, "data": { "tables": [...], "schema": {...} } }
 */
export async function getDatabaseInfo (req, res) {
  try {
    const dbInfo = await getBiometricsDatabaseInfo()

    res.status(200).json({
      success: true,
      data: dbInfo,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    logger.error('Error getting BioMetrics database info:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get database information',
      error: error.message
    })
  }
}

/**
 * Get all employees from biometric system with pagination and filtering
 * 
 * @async
 * @function getBiometricEmployees
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {number} req.query.page - Page number for pagination (default: 1)
 * @param {number} req.query.limit - Number of records per page (default: 50)
 * @param {string} req.query.search - Search term for employee name or code
 * @param {string} req.query.department - Filter by department
 * @param {string} req.query.status - Filter by employee status (default: 'Active')
 * @param {Object} res - Express response object
 * 
 * @description
 * Retrieves employee data from the BioMetrics system with advanced filtering,
 * pagination, and search capabilities. Supports department filtering and status-based queries.
 * 
 * @returns {Promise<void>} JSON response with employee data and pagination info
 * 
 * @throws {Error} If database query fails
 * 
 * @example
 * // Request: GET /api/v1/biometrics/employees?page=1&limit=25&search=john&department=IT
 * // Response: { "success": true, "data": { "employees": [...], "pagination": {...} } }
 */
export async function getBiometricEmployees (req, res) {
  try {
    // Check if biometrics server is configured
    if (!process.env.BIOMETRICS_SERVER) {
      logger.warn('Biometrics server not configured, returning empty data')
      return res.status(200).json({
        success: true,
        data: {
          employees: [],
          pagination: {
            currentPage: parseInt(req.query.page) || 1,
            totalPages: 0,
            totalRecords: 0,
            limit: parseInt(req.query.limit) || 50
          },
          message: 'Biometrics server not configured. Please configure BIOMETRICS_SERVER environment variable.'
        }
      })
    }

    // Extract query parameters with defaults
    const {
      page = 1,
      limit = 50,
      search = '',
      department = '',
      status = 'Active'
    } = req.query

    // Build SQL query based on actual database schema
    let query = `
      SELECT 
        e.employee_id as employeeId,
        e.employee_code as employeeCode,
        CONCAT(e.employee_fname, ' ', ISNULL(e.employee_lname, '')) as fullName,
        e.employee_fname as firstName,
        e.employee_lname as lastName,
        'Department ' + CAST(e.department_id AS VARCHAR) as department,
        'Position ' + CAST(e.designation_id AS VARCHAR) as position,
        CASE WHEN e.is_active = 1 THEN 'Active' ELSE 'Inactive' END as status,
        e.email as email,
        e.res_mobile_no as phone,
        e.EmployeeRFIDNumber as biometricId,
        e.join_date as createdAt,
        e.join_date as updatedAt
      FROM employees e
      WHERE 1=1
    `

    const params = {}

    // Add search filter for employee name or code
    if (search) {
      query += ' AND (CONCAT(e.employee_fname, \' \', ISNULL(e.employee_lname, \'\')) LIKE @search OR e.employee_code LIKE @search)'
      params.search = `%${search}%`
    }

    // Add department filter
    if (department) {
      query += ' AND e.department_id = @department'
      params.department = department
    }

    // Add status filter
    if (status) {
      if (status === 'Active') {
        query += ' AND e.is_active = 1'
      } else if (status === 'Inactive') {
        query += ' AND e.is_active = 0'
      }
    }

    // Add pagination with OFFSET and FETCH
    query +=
      ' ORDER BY e.employee_fname OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY'
    params.offset = (parseInt(page) - 1) * parseInt(limit)
    params.limit = parseInt(limit)

    // Execute the main query
    const result = await executeBiometricsQuery(query, params)

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM employees e
      WHERE 1=1
      ${search ? 'AND (CONCAT(e.employee_fname, \' \', ISNULL(e.employee_lname, \'\')) LIKE @search OR e.employee_code LIKE @search)' : ''}
      ${department ? 'AND e.department_id = @department' : ''}
      ${status ? (status === 'Active' ? 'AND e.is_active = 1' : status === 'Inactive' ? 'AND e.is_active = 0' : '') : ''}
    `

    const countResult = await executeBiometricsQuery(countQuery, params)
    const total = countResult.recordset[0].total

    res.status(200).json({
      success: true,
      data: {
        employees: result.recordset,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalRecords: total,
          limit: parseInt(limit)
        }
      }
    })
  } catch (error) {
    logger.error('Error fetching biometric employees:', error)
    
    // Check if it's a connection error
    if (error.message.includes('connection') || error.message.includes('timeout') || error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
      return res.status(503).json({
        success: false,
        message: 'Biometrics server is not available. Please check the server configuration.',
        error: 'Service Unavailable',
        details: 'The biometrics server is not accessible. Please configure BIOMETRICS_SERVER environment variable.'
      })
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employees',
      error: error.message
    })
  }
}

/**
 * Get employee attendance records with date filtering and pagination
 * 
 * @async
 * @function getEmployeeAttendance
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string} req.query.employeeId - Employee ID (required)
 * @param {string} req.query.startDate - Start date for filtering (YYYY-MM-DD)
 * @param {string} req.query.endDate - End date for filtering (YYYY-MM-DD)
 * @param {number} req.query.page - Page number for pagination (default: 1)
 * @param {number} req.query.limit - Number of records per page (default: 100)
 * @param {Object} res - Express response object
 * 
 * @description
 * Retrieves attendance records for a specific employee with optional date range filtering.
 * Includes punch times, device information, work hours, and attendance status.
 * 
 * @returns {Promise<void>} JSON response with attendance data and pagination info
 * 
 * @throws {Error} If employee ID is missing or database query fails
 * 
 * @example
 * // Request: GET /api/v1/biometrics/attendance?employeeId=123&startDate=2025-01-01&endDate=2025-01-31
 * // Response: { "success": true, "data": { "attendance": [...], "pagination": {...} } }
 */
export async function getEmployeeAttendance (req, res) {
  try {
    const { employeeId, startDate, endDate, page = 1, limit = 100 } = req.query

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID is required'
      })
    }

    // Build query based on POC findings for Tran_DeviceAttRec table
    let query = `
      SELECT 
        ID as attendanceId,
        Emp_ID as employeeId,
        Emp_Code as employeeCode,
        Punch_Date as punchDate,
        Punch_Time as punchTime,
        Punch_Type as punchType,
        Device_ID as deviceId,
        Device_Name as deviceName,
        Location as location,
        Raw_Data as rawData,
        Status as status,
        Work_Hours as workHours,
        Overtime_Hours as overtimeHours,
        Attendance_Status as attendanceStatus,
        Remarks as remarks,
        Created_Date as createdAt,
        Updated_Date as updatedAt
      FROM Tran_DeviceAttRec 
      WHERE Emp_ID = @employeeId
    `

    const params = { employeeId }

    if (startDate) {
      query += ' AND Punch_Date >= @startDate'
      params.startDate = startDate
    }

    if (endDate) {
      query += ' AND Punch_Date <= @endDate'
      params.endDate = endDate
    }

    query +=
      ' ORDER BY Punch_Date DESC, Punch_Time DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY'
    params.offset = (parseInt(page) - 1) * parseInt(limit)
    params.limit = parseInt(limit)

    const result = await executeBiometricsQuery(query, params)

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM Tran_DeviceAttRec 
      WHERE Emp_ID = @employeeId
      ${startDate ? 'AND Punch_Date >= @startDate' : ''}
      ${endDate ? 'AND Punch_Date <= @endDate' : ''}
    `

    const countResult = await executeBiometricsQuery(countQuery, params)
    const total = countResult.recordset[0].total

    res.status(200).json({
      success: true,
      data: {
        attendance: result.recordset,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalRecords: total,
          limit: parseInt(limit)
        }
      }
    })
  } catch (error) {
    logger.error('Error fetching employee attendance:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance records',
      error: error.message
    })
  }
}

/**
 * Get attendance summary for a date range with department and employee filtering
 * 
 * @async
 * @function getAttendanceSummary
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string} req.query.startDate - Start date for summary (required, YYYY-MM-DD)
 * @param {string} req.query.endDate - End date for summary (required, YYYY-MM-DD)
 * @param {string} req.query.department - Filter by department (optional)
 * @param {string} req.query.employeeId - Filter by specific employee (optional)
 * @param {Object} res - Express response object
 * 
 * @description
 * Generates comprehensive attendance summary including total punches, work hours,
 * overtime hours, and working days for employees within the specified date range.
 * Supports department and individual employee filtering.
 * 
 * @returns {Promise<void>} JSON response with attendance summary data
 * 
 * @throws {Error} If start/end dates are missing or database query fails
 * 
 * @example
 * // Request: GET /api/v1/biometrics/summary?startDate=2025-01-01&endDate=2025-01-31&department=IT
 * // Response: { "success": true, "data": { "summary": [...], "dateRange": {...}, "totalEmployees": 25 } }
 */
export async function getAttendanceSummary (req, res) {
  try {
    // Check if biometrics server is configured
    if (!process.env.BIOMETRICS_SERVER) {
      logger.warn('Biometrics server not configured, returning empty data')
      return res.status(200).json({
        success: true,
        data: {
          summary: [],
          totalEmployees: 0,
          totalWorkHours: 0,
          totalOvertimeHours: 0,
          message: 'Biometrics server not configured. Please configure BIOMETRICS_SERVER environment variable.'
        }
      })
    }

    const { startDate, endDate, department = '', employeeId = '' } = req.query

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      })
    }

    // Build summary query
    let query = `
      SELECT 
        e.employee_id as employeeId,
        e.employee_code as employeeCode,
        CONCAT(e.employee_fname, ' ', ISNULL(e.employee_lname, '')) as fullName,
        'Department ' + CAST(e.department_id AS VARCHAR) as department,
        COUNT(a.Emp_id) as totalPunches,
        MIN(a.Att_PunchRecDate) as firstPunch,
        MAX(a.Att_PunchRecDate) as lastPunch,
        0 as totalWorkHours,
        0 as totalOvertimeHours,
        COUNT(DISTINCT CAST(a.Att_PunchRecDate AS DATE)) as workingDays
      FROM employees e
      LEFT JOIN Tran_DeviceAttRec a ON e.employee_id = a.Emp_id 
        AND CAST(a.Att_PunchRecDate AS DATE) BETWEEN @startDate AND @endDate
      WHERE 1=1
    `

    const params = { startDate, endDate }

    if (department) {
      query += ' AND e.department_id = @department'
      params.department = department
    }

    if (employeeId) {
      query += ' AND e.employee_id = @employeeId'
      params.employeeId = employeeId
    }

    query += ` GROUP BY e.employee_id, e.employee_code, e.employee_fname, e.employee_lname, e.department_id
               ORDER BY e.employee_fname`

    const result = await executeBiometricsQuery(query, params)

    res.status(200).json({
      success: true,
      data: {
        summary: result.recordset,
        dateRange: { startDate, endDate },
        totalEmployees: result.recordset.length
      }
    })
  } catch (error) {
    logger.error('Error fetching attendance summary:', error)
    
    // Check if it's a connection error
    if (error.message.includes('connection') || error.message.includes('timeout') || error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
      return res.status(503).json({
        success: false,
        message: 'Biometrics server is not available. Please check the server configuration.',
        error: 'Service Unavailable',
        details: 'The biometrics server is not accessible. Please configure BIOMETRICS_SERVER environment variable.'
      })
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance summary',
      error: error.message
    })
  }
}

/**
 * Get departments from biometric system with employee counts
 * 
 * @async
 * @function getDepartments
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * 
 * @description
 * Retrieves all departments from the BioMetrics system along with the number
 * of employees in each department. Useful for organizational structure analysis.
 * 
 * @returns {Promise<void>} JSON response with department data
 * 
 * @throws {Error} If database query fails
 * 
 * @example
 * // Request: GET /api/v1/biometrics/departments
 * // Response: { "success": true, "data": [{ "name": "IT", "employeeCount": 15 }, ...] }
 */
export async function getDepartments (req, res) {
  try {
    // Check if biometrics server is configured
    if (!process.env.BIOMETRICS_SERVER) {
      logger.warn('Biometrics server not configured, returning empty data')
      return res.status(200).json({
        success: true,
        data: [],
        message: 'Biometrics server not configured. Please configure BIOMETRICS_SERVER environment variable.'
      })
    }

    const query = `
      SELECT 
        'Department ' + CAST(department_id AS VARCHAR) as name, 
        COUNT(employee_id) as employeeCount
      FROM employees 
      WHERE department_id IS NOT NULL
      GROUP BY department_id
      ORDER BY department_id
    `

    const result = await executeBiometricsQuery(query)

    res.status(200).json({
      success: true,
      data: result.recordset
    })
  } catch (error) {
    logger.error('Error fetching departments:', error)
    
    // Check if it's a connection error
    if (error.message.includes('connection') || error.message.includes('timeout') || error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
      return res.status(503).json({
        success: false,
        message: 'Biometrics server is not available. Please check the server configuration.',
        error: 'Service Unavailable',
        details: 'The biometrics server is not accessible. Please configure BIOMETRICS_SERVER environment variable.'
      })
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch departments',
      error: error.message
    })
  }
}

/**
 * Get recent attendance records from the last 24 hours
 * 
 * @async
 * @function getRecentAttendance
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {number} req.query.limit - Maximum number of records to return (default: 50, max: 200)
 * @param {Object} res - Express response object
 * 
 * @description
 * Retrieves the most recent attendance records from the last 24 hours, including
 * employee information, punch times, device details, and location data.
 * Useful for real-time attendance monitoring and dashboard displays.
 * 
 * @returns {Promise<void>} JSON response with recent attendance data
 * 
 * @throws {Error} If database query fails
 * 
 * @example
 * // Request: GET /api/v1/biometrics/recent?limit=25
 * // Response: { "success": true, "data": [{ "attendanceId": 123, "employeeId": 456, ... }] }
 */
export async function getRecentAttendance (req, res) {
  try {
    // Check if biometrics server is configured
    if (!process.env.BIOMETRICS_SERVER) {
      logger.warn('Biometrics server not configured, returning empty data')
      return res.status(200).json({
        success: true,
        data: [],
        message: 'Biometrics server not configured. Please configure BIOMETRICS_SERVER environment variable.'
      })
    }

    const { limit = 50 } = req.query

    // Validate and sanitize limit parameter
    const safeLimit = Math.max(1, Math.min(parseInt(limit) || 50, 200))

    const query = `
      SELECT 
        a.tran_id as attendanceId,
        a.Emp_id as employeeId,
        e.employee_code as employeeCode,
        CONCAT(e.employee_fname, ' ', ISNULL(e.employee_lname, '')) as fullName,
        'Department ' + CAST(e.department_id AS VARCHAR) as department,
        CAST(a.Att_PunchRecDate AS DATE) as punchDate,
        a.Att_PunchRecDate as punchTime,
        a.Dev_Direction as punchType,
        a.Dev_Id as deviceName,
        a.Dev_Location as location,
        a.att_status as status
      FROM Tran_DeviceAttRec a
      INNER JOIN employees e ON a.Emp_id = e.employee_id
      WHERE CAST(a.Att_PunchRecDate AS DATE) >= DATEADD(day, -1, GETDATE())
      ORDER BY a.Att_PunchRecDate DESC
      OFFSET 0 ROWS FETCH NEXT @limit ROWS ONLY
    `

    const result = await executeBiometricsQuery(query, { limit: safeLimit })

    res.status(200).json({
      success: true,
      data: result.recordset
    })
  } catch (error) {
    logger.error('Error fetching recent attendance:', error)
    
    // Check if it's a connection error
    if (error.message.includes('connection') || error.message.includes('timeout') || error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
      return res.status(503).json({
        success: false,
        message: 'Biometrics server is not available. Please check the server configuration.',
        error: 'Service Unavailable',
        details: 'The biometrics server is not accessible. Please configure BIOMETRICS_SERVER environment variable.'
      })
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent attendance',
      error: error.message
    })
  }
}

/**
 * Sync employee data from biometric system to local MySQL database
 * 
 * @async
 * @function syncEmployees
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {boolean} req.query.force - Force sync even if data hasn't changed (default: false)
 * @param {Object} res - Express response object
 * 
 * @description
 * Synchronizes employee data from the BioMetrics system to the local MySQL database.
 * Performs intelligent sync by comparing timestamps and only updating changed records.
 * Supports force sync to update all records regardless of modification dates.
 * 
 * @returns {Promise<void>} JSON response with sync statistics
 * 
 * @throws {Error} If database operations fail
 * 
 * @example
 * // Request: POST /api/v1/biometrics/sync-employees?force=true
 * // Response: { "success": true, "data": { "totalEmployees": 100, "syncedCount": 5, "updatedCount": 10 } }
 */
export async function syncEmployees (req, res) {
  try {
    const { force = false } = req.query

    // Get all employees from biometric system
    const query = `
      SELECT 
        Emp_ID as employeeId,
        Emp_Code as employeeCode,
        Emp_Name as fullName,
        First_Name as firstName,
        Last_Name as lastName,
        Department as department,
        Position as position,
        Status as status,
        Email as email,
        Phone as phone,
        Biometric_ID as biometricId,
        Created_Date as createdAt,
        Updated_Date as updatedAt
      FROM employees
    `

    const result = await executeBiometricsQuery(query)
    const biometricEmployees = result.recordset

    let syncedCount = 0
    let updatedCount = 0

    for (const emp of biometricEmployees) {
      const existingEmployee = await BiometricEmployee.findOne({
        where: { employeeId: emp.employeeId }
      })

      if (existingEmployee) {
        if (force || existingEmployee.lastSyncAt < new Date(emp.updatedAt)) {
          await existingEmployee.update({
            ...emp,
            lastSyncAt: new Date()
          })
          updatedCount++
        }
      } else {
        await BiometricEmployee.create({
          ...emp,
          lastSyncAt: new Date()
        })
        syncedCount++
      }
    }

    res.status(200).json({
      success: true,
      message: 'Employee sync completed',
      data: {
        totalEmployees: biometricEmployees.length,
        syncedCount,
        updatedCount,
        skippedCount: biometricEmployees.length - syncedCount - updatedCount
      }
    })
  } catch (error) {
    logger.error('Error syncing employees:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to sync employees',
      error: error.message
    })
  }
}
