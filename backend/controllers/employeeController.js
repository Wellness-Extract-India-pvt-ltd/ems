/**
 * @fileoverview Employee Controller for EMS Backend
 * @description Handles CRUD operations and business logic for employee resources.
 * Provides comprehensive employee management including creation, retrieval, updates,
 * and deletion with Microsoft Graph integration for user provisioning.
 * 
 * @author EMS Development Team
 * @version 1.0.0
 * @since 2025-09-17
 * 
 * @features
 * - Employee CRUD operations with validation
 * - Microsoft Graph user provisioning
 * - File upload handling for documents
 * - Search and pagination capabilities
 * - Secure password generation
 * - License assignment management
 * - Comprehensive error handling and logging
 */

// Import validation utilities for request validation
import { validationResult } from 'express-validator'
// Import crypto for secure password generation
import crypto from 'crypto'
// Import axios for HTTP requests to Microsoft Graph
import axios from 'axios'
// Import Sequelize operators for database queries
import { Op } from 'sequelize'

// Import models through index to ensure associations are loaded
import { Employee, Department, UserRoleMap } from '../models/index.js'
// Import Microsoft Graph service for user provisioning
import graphService from '../utils/graphService.js'
// Import logger for comprehensive logging
import logger from '../utils/logger.js'

/**
 * Maps uploaded files to document paths in the employee payload
 * 
 * @function mapFilesToDoc
 * @param {Array} files - Array of uploaded files from multer
 * @param {Object} payload - Employee data payload
 * @returns {Object} Mapped payload with file paths
 * 
 * @description
 * This utility function maps uploaded files to their corresponding document paths
 * in the employee data structure, handling avatar, bank documents, education
 * certificates, and organization experience letters.
 * 
 * @example
 * const mappedData = mapFilesToDoc(uploadedFiles, employeePayload)
 * // Returns: { ...payload, avatarPath: '/uploads/avatar.jpg', ... }
 */
function mapFilesToDoc (files, payload) {
  // Create lookup map for file field names to file paths
  const lookup = Object.fromEntries(files.map((f) => [f.fieldname, f.path]))

  return {
    ...payload,
    // Map avatar file if uploaded
    avatarPath: lookup.avatar || payload.avatarPath,
    // Map bank documents if bank data exists
    bank: payload.bank
      ? {
          ...payload.bank,
          passbookUrl: lookup.passbook || payload.bank.passbookUrl
        }
      : undefined,
    // Map education certificates for each education record
    educations: (payload.educations || []).map((edu, i) => ({
      ...edu,
      certificatePath: lookup[`education_${i}`] || edu.certificatePath
    })),
    // Map experience letters for each organization record
    organisations: (payload.organisations || []).map((org, i) => ({
      ...org,
      experienceLetterPath:
        lookup[`organisation_${i}`] || org.experienceLetterPath
    }))
  }
}

/**
 * Creates a new employee with Microsoft Graph user provisioning
 * 
 * @async
 * @function addEmployee
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing employee data
 * @param {string} req.body.payload - JSON string containing employee information
 * @param {Array} req.files - Array of uploaded files from multer
 * @param {Object} res - Express response object
 * 
 * @description
 * Creates a new employee record with the following features:
 * 1. Validates request data using express-validator
 * 2. Generates secure temporary password for Microsoft Graph user
 * 3. Provisions user in Microsoft Graph with license assignment
 * 4. Maps uploaded files to document paths
 * 5. Creates employee record in local database
 * 6. Returns employee information (excluding sensitive data)
 * 
 * @returns {Promise<void>} JSON response with employee creation status
 * 
 * @throws {Error} If validation fails or employee creation fails
 * 
 * @example
 * // Request: POST /api/v1/employees
 * // Body: { "payload": "{\"personal\": {...}, \"contact\": {...}}" }
 * // Files: avatar, passbook, education certificates, experience letters
 * // Response: { "message": "Employee created successfully", "employee": {...} }
 */
export async function addEmployee (req, res) {
  // Validate request data using express-validator
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  try {
    // Parse employee data from request body
    const payload = JSON.parse(req.body.payload || '{}')

    // Generate a secure temporary password for Microsoft Graph user
    const tempPassword = crypto.randomBytes(8).toString('base64')
    let msGraphUserId

    try {
      // Get Microsoft Graph access token
      const accessToken = await graphService.getAccessToken()
      
      // Prepare Microsoft Graph user object
      const msUser = {
        accountEnabled: true,
        displayName: `${payload.personal.firstName} ${payload.personal.lastName}`,
        mailNickname:
          `${payload.personal.firstName}${payload.personal.lastName}`.toLowerCase(),
        userPrincipalName: payload.contact.email,
        usageLocation: 'CA',
        passwordProfile: {
          forceChangePasswordNextSignIn: true,
          password: tempPassword
        }
      }

      // Create user in Microsoft Graph
      const { data } = await axios.post(
        'https://graph.microsoft.com/v1.0/users',
        msUser,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )

      msGraphUserId = data.id

      // Assign license if SKU_ID is configured
      if (process.env.SKU_ID) {
        await axios.post(
          `https://graph.microsoft.com/v1.0/users/${msGraphUserId}/assignLicense`,
          {
            addLicenses: [{ skuId: process.env.SKU_ID }],
            removeLicenses: []
          },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        )
      } else {
        logger.warn('SKU_ID not configured, skipping license assignment')
      }
    } catch (err) {
      // Log Microsoft Graph operation failure but continue with employee creation
      logger.error('Microsoft Graph operation failed', { error: err.message })
    }

    // Map uploaded files to document paths in payload
    const docWithFiles = mapFilesToDoc(req.files, payload)

    // Create employee record in local database with Microsoft Graph user ID
    const employee = await Employee.create({
      ...docWithFiles,
      ms_graph_user_id: msGraphUserId
    })

    // Log successful employee creation
    logger.info('Employee created successfully', { employeeId: employee.id })

    return res.status(201).json({
      message: 'Employee created successfully',
      employee: {
        id: employee.id,
        employee_id: employee.employee_id,
        first_name: employee.first_name,
        last_name: employee.last_name,
        email: employee.email,
        ms_graph_user_id: employee.ms_graph_user_id
      }
      // Note: Temporary password should be sent via secure channel (email/SMS)
    })
  } catch (err) {
    // Log error and return failure response
    logger.error('Employee creation failed', {
      error: err.message,
      stack: err.stack
    })
    return res.status(500).json({
      message: 'Failed to create employee',
      error: err.message
    })
  }
}

/**
 * Retrieves a paginated list of employees with optional search functionality
 * 
 * @async
 * @function listEmployees
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string} req.query.search - Search term for employee name or email (optional)
 * @param {number} req.query.page - Page number for pagination (default: 1)
 * @param {number} req.query.limit - Number of records per page (default: 10)
 * @param {Object} res - Express response object
 * 
 * @description
 * Retrieves a paginated list of employees with optional search functionality.
 * Supports searching by first name, last name, or email address.
 * Returns pagination metadata including total pages and current page.
 * 
 * @returns {Promise<void>} JSON response with employee list and pagination info
 * 
 * @throws {Error} If database query fails
 * 
 * @example
 * // Request: GET /api/v1/employees?search=john&page=1&limit=20
 * // Response: { "employees": [...], "totalPages": 5, "currentPage": 1 }
 */
export async function listEmployees (req, res) {
  // Extract query parameters with defaults
  const { search = '', page = 1, limit = 10 } = req.query

  try {
    // Build search condition if search term is provided
    const whereClause = search
      ? {
          [Op.or]: [
            { first_name: { [Op.like]: `%${search}%` } },
            { last_name: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } }
          ]
        }
      : {}

    // Execute paginated query with search conditions and include related data
    const { count, rows: employees } = await Employee.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['name'],
          required: false
        },
        {
          model: UserRoleMap,
          as: 'roleMap',
          attributes: ['role'],
          required: false
        }
      ]
    })

    // Transform employees data to include department name and role
    const transformedEmployees = employees.map(employee => {
      const employeeData = employee.toJSON()
      return {
        ...employeeData,
        department: employeeData.department?.name || 'Not Assigned',
        role: employeeData.roleMap?.role || 'employee',
        // Remove the nested objects to keep response clean
        department_id: undefined,
        roleMap: undefined
      }
    })

    // Return paginated results with metadata
    res.status(200).json({
      employees: transformedEmployees,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    })
  } catch (error) {
    // Log error and return failure response
    logger.error('Employee list error', error)
    res.status(500).json({
      message: 'Error fetching employees',
      error: error.message
    })
  }
}

/**
 * Retrieves a specific employee by their ID
 * 
 * @async
 * @function getEmployeeById
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params._id - Employee ID
 * @param {Object} res - Express response object
 * 
 * @description
 * Retrieves a specific employee record by their unique ID.
 * Returns the complete employee data including personal information,
 * contact details, and associated documents.
 * 
 * @returns {Promise<void>} JSON response with employee data or error
 * 
 * @throws {Error} If employee is not found or database query fails
 * 
 * @example
 * // Request: GET /api/v1/employees/123
 * // Response: { "success": true, "data": { "id": 123, "first_name": "John", ... } }
 */
export async function getEmployeeById (req, res) {
  try {
    // Extract employee ID from route parameters
    const employeeId = req.params._id
    
    // Find employee by primary key
    const employee = await Employee.findByPk(employeeId)

    if (!employee) {
      // Return 404 if employee not found
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      })
    }

    // Return employee data
    res.status(200).json({
      success: true,
      data: employee
    })
  } catch (error) {
    // Log error and return failure response
    logger.error('Employee fetch error', {
      employeeId: req.params._id,
      error: error.message
    })
    res.status(500).json({
      success: false,
      message: 'Error fetching employee',
      error: error.message
    })
  }
}

/**
 * Updates an existing employee record (admin only)
 * 
 * @async
 * @function updateEmployee
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params._id - Employee ID to update
 * @param {Object} req.body - Request body containing update data
 * @param {Object} res - Express response object
 * 
 * @description
 * Updates an existing employee record with the provided data.
 * Excludes sensitive fields like msGraphUserId and refreshToken from updates.
 * Validates that the employee exists before attempting to update.
 * 
 * @returns {Promise<void>} JSON response with update status
 * 
 * @throws {Error} If employee is not found or update fails
 * 
 * @example
 * // Request: PUT /api/v1/employees/123
 * // Body: { "first_name": "John", "last_name": "Doe", "email": "john.doe@company.com" }
 * // Response: { "success": true, "message": "Employee updated successfully", "data": {...} }
 */
export async function updateEmployee (req, res) {
  // Exclude sensitive fields from updates to prevent security issues
  const { msGraphUserId, refreshToken, ...updateFields } = req.body

  try {
    // Extract employee ID from route parameters
    const employeeId = req.params._id
    
    // Find employee by primary key
    const employee = await Employee.findByPk(employeeId)

    if (!employee) {
      // Return 404 if employee not found
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      })
    }

    // Update employee with provided fields
    await employee.update(updateFields)

    // Log successful update
    logger.info('Employee updated', { employeeId })
    
    // Return success response with updated data
    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: employee
    })
  } catch (error) {
    // Log error and return failure response
    logger.error('Employee update failed', {
      employeeId: req.params._id,
      error: error.message
    })
    res.status(400).json({
      success: false,
      message: 'Error updating employee',
      error: error.message
    })
  }
}

/**
 * Deletes an employee record (admin only)
 * 
 * @async
 * @function deleteEmployee
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params._id - Employee ID to delete
 * @param {Object} res - Express response object
 * 
 * @description
 * Permanently deletes an employee record from the database.
 * This operation cannot be undone and should be used with caution.
 * Validates that the employee exists before attempting deletion.
 * 
 * @returns {Promise<void>} JSON response with deletion status
 * 
 * @throws {Error} If employee is not found or deletion fails
 * 
 * @example
 * // Request: DELETE /api/v1/employees/123
 * // Response: { "success": true, "message": "Employee deleted successfully" }
 */
export async function deleteEmployee (req, res) {
  try {
    // Extract employee ID from route parameters
    const employeeId = req.params._id
    
    // Attempt to delete employee record
    const deletedCount = await Employee.destroy({
      where: { id: employeeId }
    })

    if (deletedCount === 0) {
      // Return 404 if no employee was found to delete
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      })
    }

    // Log successful deletion
    logger.info('Employee deleted', { employeeId })
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'Employee deleted successfully'
    })
  } catch (error) {
    // Log error and return failure response
    logger.error('Employee deletion failed', {
      employeeId: req.params._id,
      error: error.message
    })
    res.status(500).json({
      success: false,
      message: 'Error deleting employee',
      error: error.message
    })
  }
}
