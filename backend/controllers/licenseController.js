/**
 * @fileoverview License Controller for EMS Backend
 * @description Handles CRUD operations and business logic for software license management.
 * Provides comprehensive license management including creation, retrieval, updates,
 * and deletion with Redis caching for optimal performance and role-based access control.
 * 
 * @author EMS Development Team
 * @version 1.0.0
 * @since 2025-09-17
 * 
 * @features
 * - License CRUD operations with validation
 * - Role-based access control (admin vs user permissions)
 * - Redis caching for performance optimization
 * - Employee-specific license filtering
 * - Pagination support for large datasets
 * - Cache invalidation on data changes
 * - Comprehensive error handling and logging
 */

// Import express-validator for request validation
import { validationResult } from 'express-validator'
// Import License and Employee models for database operations
import { License, Employee } from '../models/index.js'
// Import logger for comprehensive logging
import logger from '../utils/logger.js'
// Import Redis configuration for caching operations
import redisConfig from '../config/redis.js'

/**
 * Creates a new software license with validation and cache invalidation
 * 
 * @async
 * @function addLicense
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing license data
 * @param {string} req.body.software_name - Name of the software
 * @param {string} req.body.license_key - License key or serial number
 * @param {string} req.body.license_type - Type of license (perpetual, subscription, etc.)
 * @param {Date} req.body.expiry_date - License expiration date
 * @param {number} req.body.assigned_to - Employee ID assigned to the license
 * @param {string} req.body.notes - Additional notes about the license
 * @param {Object} res - Express response object
 * 
 * @description
 * Creates a new software license with the following features:
 * 1. Request validation using express-validator
 * 2. Database record creation using Sequelize
 * 3. Cache invalidation to ensure data consistency
 * 4. Comprehensive error handling and logging
 * 
 * @returns {Promise<void>} JSON response with creation status
 * 
 * @throws {Error} If validation fails or database operation fails
 * 
 * @example
 * // Request: POST /api/v1/licenses/add
 * // Body: { "software_name": "Microsoft Office", "license_key": "ABC123", "assigned_to": 1 }
 * // Response: { "success": true, "message": "License added successfully", "data": {...} }
 */
export async function addLicense (req, res) {
  // Validate request parameters using express-validator
  const errors = validationResult(req)
  if (!errors.isEmpty()) { 
    return res.status(400).json({ errors: errors.array() }) 
  }

  try {
    // Create new license record in the database using Sequelize
    const newLicense = await License.create(req.body)

    // Log successful license creation for monitoring
    logger.info('License added', { licenseId: newLicense.id })

    // Invalidate license cache to ensure data consistency
    if (redisConfig.isRedisConnected()) {
      await redisConfig.del('license:list:*')
      await redisConfig.del('license:employee:*')
    }

    // Return successful creation response with license data
    res.status(201).json({
      success: true,
      message: 'License added successfully',
      data: newLicense
    })
  } catch (error) {
    // Log error and return failure response
    logger.error('License creation failed', { error: error.message })
    res.status(400).json({
      success: false,
      message: 'Error adding license',
      error: error.message
    })
  }
}

/**
 * Retrieves all licenses with pagination, role-based access control, and Redis caching
 * 
 * @async
 * @function listLicenses
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object (from middleware)
 * @param {string} req.user.role - User role (admin, user, etc.)
 * @param {number} req.user.id - User ID
 * @param {Object} req.query - Query parameters
 * @param {number} req.query.page - Page number for pagination (default: 1)
 * @param {number} req.query.limit - Number of records per page (default: 10)
 * @param {Object} res - Express response object
 * 
 * @description
 * Retrieves licenses with the following features:
 * 1. Role-based access control (admin sees all, users see only their licenses)
 * 2. Pagination support for large datasets
 * 3. Redis caching for performance optimization (5-minute cache)
 * 4. Employee information included in response
 * 5. Ordered by creation date (newest first)
 * 
 * @returns {Promise<void>} JSON response with licenses list and pagination info
 * 
 * @throws {Error} If database query fails or Redis operations fail
 * 
 * @example
 * // Request: GET /api/v1/licenses/all?page=1&limit=20
 * // Response: { "success": true, "data": [...], "pagination": { "page": 1, "limit": 20, "total": 50, "pages": 3 } }
 */
export async function listLicenses (req, res) {
  try {
    // Extract user information and pagination parameters
    const userRole = req.user?.role
    const userId = req.user?.id
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const offset = (page - 1) * limit

    // Generate cache key based on user role, ID, and pagination parameters
    const cacheKey = redisConfig.generateKey(
      'license',
      'list',
      userRole,
      userId || 'anonymous',
      page,
      limit
    )

    // Try to get data from Redis cache first for performance optimization
    if (redisConfig.isRedisConnected()) {
      const cachedData = await redisConfig.get(cacheKey)
      if (cachedData) {
        // Log cache hit for monitoring and debugging
        logger.info('License list served from cache')
        return res.json(cachedData)
      }
    }

    // Build where clause based on user role for access control
    const whereClause = {}

    // If user is not admin, only show licenses assigned to them
    if (userRole !== 'admin') {
      whereClause.assigned_to = userId
    }

    // Retrieve licenses from database with pagination, employee info, and ordering
    const { count, rows: licenses } = await License.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Employee,
          as: 'assignedEmployee',
          attributes: ['id', 'first_name', 'last_name', 'employee_id']
        }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    })

    // Prepare response with pagination metadata
    const result = {
      success: true,
      data: licenses,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit)
      }
    }

    // Cache the result for 5 minutes to improve performance
    if (redisConfig.isRedisConnected()) {
      await redisConfig.set(cacheKey, result, 300) // 5 minutes cache
    }

    // Return successful response with licenses data and pagination info
    res.status(200).json(result)
  } catch (error) {
    // Log error and return failure response
    logger.error('License list error', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching licenses',
      error: error.message
    })
  }
}

/**
 * Retrieves a specific license by ID with role-based access control and Redis caching
 * 
 * @async
 * @function getLicenseById
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object (from middleware)
 * @param {string} req.user.role - User role (admin, user, etc.)
 * @param {number} req.user.id - User ID
 * @param {Object} req.params - Route parameters
 * @param {string} req.params._id - License ID
 * @param {Object} res - Express response object
 * 
 * @description
 * Retrieves a specific license by ID with the following features:
 * 1. Role-based access control (admin sees all, users see only their licenses)
 * 2. Redis caching for performance optimization (5-minute cache)
 * 3. Employee information included in response
 * 4. Proper error handling for not found cases
 * 
 * @returns {Promise<void>} JSON response with license data or error
 * 
 * @throws {Error} If database query fails or Redis operations fail
 * 
 * @example
 * // Request: GET /api/v1/licenses/123
 * // Response: { "success": true, "data": { "id": 123, "software_name": "Microsoft Office", ... } }
 * 
 * @example
 * // Request: GET /api/v1/licenses/999
 * // Response: { "success": false, "message": "License not found" }
 */
export async function getLicenseById (req, res) {
  try {
    // Extract user information and license ID from request
    const userRole = req.user?.role
    const userId = req.user?.id
    const licenseId = req.params._id // Fixed: use _id to match route parameter

    // Generate cache key for this specific license
    const cacheKey = redisConfig.generateKey('license', 'detail', licenseId)

    // Try to get data from Redis cache first for performance optimization
    if (redisConfig.isRedisConnected()) {
      const cachedData = await redisConfig.get(cacheKey)
      if (cachedData) {
        // Log cache hit for monitoring and debugging
        logger.info('License detail served from cache')
        return res.json(cachedData)
      }
    }

    // Build where clause with role-based access control
    const whereClause = { id: licenseId }

    // If user is not admin, only allow access to licenses assigned to them
    if (userRole !== 'admin') {
      whereClause.assigned_to = userId
    }

    // Find license by ID with employee information included
    const license = await License.findOne({
      where: whereClause,
      include: [
        {
          model: Employee,
          as: 'assignedEmployee',
          attributes: ['id', 'first_name', 'last_name', 'employee_id']
        }
      ]
    })

    if (!license) {
      // Return 404 if license not found or user doesn't have access
      return res.status(404).json({
        success: false,
        message: 'License not found'
      })
    }

    // Prepare successful response with license data
    const result = {
      success: true,
      data: license
    }

    // Cache the result for 5 minutes to improve performance
    if (redisConfig.isRedisConnected()) {
      await redisConfig.set(cacheKey, result, 300) // 5 minutes cache
    }

    // Return successful response with license data
    res.status(200).json(result)
  } catch (error) {
    // Log error and return failure response
    logger.error('License fetch error', {
      licenseId: req.params._id,
      error: error.message
    })
    res.status(500).json({
      success: false,
      message: 'Error fetching license',
      error: error.message
    })
  }
}

/**
 * Updates an existing license by ID with validation and cache invalidation
 * 
 * @async
 * @function updateLicense
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params._id - License ID to update
 * @param {Object} req.body - Request body containing update data
 * @param {string} req.body.software_name - Name of the software
 * @param {string} req.body.license_key - License key or serial number
 * @param {string} req.body.license_type - Type of license (perpetual, subscription, etc.)
 * @param {Date} req.body.expiry_date - License expiration date
 * @param {number} req.body.assigned_to - Employee ID assigned to the license
 * @param {string} req.body.notes - Additional notes about the license
 * @param {Object} res - Express response object
 * 
 * @description
 * Updates an existing license with the following features:
 * 1. Request validation using express-validator
 * 2. Database record update using Sequelize
 * 3. Cache invalidation to ensure data consistency
 * 4. Comprehensive error handling and logging
 * 
 * @returns {Promise<void>} JSON response with update status
 * 
 * @throws {Error} If validation fails, license not found, or database operation fails
 * 
 * @example
 * // Request: PUT /api/v1/licenses/update/123
 * // Body: { "software_name": "Updated Microsoft Office", "expiry_date": "2025-12-31" }
 * // Response: { "success": true, "message": "License updated successfully", "data": {...} }
 */
export async function updateLicense (req, res) {
  // Validate request parameters using express-validator
  const errors = validationResult(req)
  if (!errors.isEmpty()) { 
    return res.status(400).json({ errors: errors.array() }) 
  }

  try {
    // Extract license ID from route parameters
    const licenseId = req.params._id // Fixed: use _id to match route parameter
    
    // Update license record in the database using Sequelize
    const [updatedRowsCount] = await License.update(req.body, {
      where: { id: licenseId }
    })

    if (updatedRowsCount === 0) {
      // Return 404 if license not found
      return res.status(404).json({
        success: false,
        message: 'License not found'
      })
    }

    // Retrieve updated license data for response
    const updatedLicense = await License.findByPk(licenseId)
    
    // Log successful license update for monitoring
    logger.info('License updated', { licenseId })

    // Invalidate license cache to ensure data consistency
    if (redisConfig.isRedisConnected()) {
      await redisConfig.del('license:list:*')
      await redisConfig.del('license:employee:*')
      await redisConfig.del(
        redisConfig.generateKey('license', 'detail', licenseId)
      )
    }

    // Return successful update response with updated license data
    res.status(200).json({
      success: true,
      message: 'License updated successfully',
      data: updatedLicense
    })
  } catch (error) {
    // Log error and return failure response
    logger.error('License update failed', {
      licenseId: req.params._id,
      error: error.message
    })
    res.status(400).json({
      success: false,
      message: 'Error updating license',
      error: error.message
    })
  }
}

/**
 * Deletes a license by ID with cache invalidation
 * 
 * @async
 * @function deleteLicense
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params._id - License ID to delete
 * @param {Object} res - Express response object
 * 
 * @description
 * Deletes a license with the following features:
 * 1. License lookup by ID
 * 2. Database record deletion using Sequelize
 * 3. Cache invalidation to ensure data consistency
 * 4. Comprehensive error handling and logging
 * 
 * @returns {Promise<void>} JSON response with deletion status
 * 
 * @throws {Error} If license not found or database operation fails
 * 
 * @example
 * // Request: DELETE /api/v1/licenses/delete/123
 * // Response: { "success": true, "message": "License deleted successfully" }
 */
export async function deleteLicense (req, res) {
  try {
    // Extract license ID from route parameters
    const licenseId = req.params._id // Fixed: use _id to match route parameter
    
    // Delete license record from the database using Sequelize
    const deletedRowsCount = await License.destroy({
      where: { id: licenseId }
    })

    if (deletedRowsCount === 0) {
      // Return 404 if license not found
      return res.status(404).json({
        success: false,
        message: 'License not found'
      })
    }

    // Log successful license deletion for monitoring
    logger.info('License deleted', { licenseId })

    // Invalidate license cache to ensure data consistency
    if (redisConfig.isRedisConnected()) {
      await redisConfig.del('license:list:*')
      await redisConfig.del('license:employee:*')
      await redisConfig.del(
        redisConfig.generateKey('license', 'detail', licenseId)
      )
    }

    // Return successful deletion response
    res.status(200).json({
      success: true,
      message: 'License deleted successfully'
    })
  } catch (error) {
    // Log error and return failure response
    logger.error('License deletion failed', {
      licenseId: req.params._id,
      error: error.message
    })
    res.status(500).json({
      success: false,
      message: 'Error deleting license',
      error: error.message
    })
  }
}

/**
 * Retrieves licenses assigned to a specific employee with role-based access control and Redis caching
 * 
 * @async
 * @function getLicensesByEmployee
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object (from middleware)
 * @param {string} req.user.role - User role (admin, user, etc.)
 * @param {number} req.user.id - User ID
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.employeeId - Employee ID to get licenses for
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * @description
 * Retrieves licenses assigned to a specific employee with the following features:
 * 1. Role-based access control (admin can see all, users can only see their own)
 * 2. Redis caching for performance optimization (5-minute cache)
 * 3. Employee information included in response
 * 4. Ordered by creation date (newest first)
 * 
 * @returns {Promise<void>} JSON response with employee's licenses or error
 * 
 * @throws {Error} If access denied, database query fails, or Redis operations fail
 * 
 * @example
 * // Request: GET /api/v1/licenses/employee/123
 * // Response: { "success": true, "data": [{ "id": 1, "software_name": "Microsoft Office", ... }] }
 * 
 * @example
 * // Request: GET /api/v1/licenses/employee/999 (non-admin user trying to access other employee's licenses)
 * // Response: { "success": false, "error": "Forbidden", "message": "Access denied. You can only view your own licenses." }
 */
export async function getLicensesByEmployee (req, res, next) {
  try {
    // Extract user information and employee ID from request
    const userRole = req.user?.role
    const userId = req.user?.id
    const employeeId = req.params.employeeId

    // If user is not admin, only allow access to their own licenses
    if (userRole !== 'admin' && parseInt(employeeId) !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Access denied. You can only view your own licenses.'
      })
    }

    // Generate cache key for this specific employee's licenses
    const cacheKey = redisConfig.generateKey('license', 'employee', employeeId)

    // Try to get data from Redis cache first for performance optimization
    if (redisConfig.isRedisConnected()) {
      const cachedData = await redisConfig.get(cacheKey)
      if (cachedData) {
        // Log cache hit for monitoring and debugging
        logger.info('Employee licenses served from cache')
        return res.json(cachedData)
      }
    }

    // Find licenses assigned to the employee with employee information included
    const licenses = await License.findAll({
      where: { assigned_to: employeeId },
      include: [
        {
          model: Employee,
          as: 'assignedEmployee',
          attributes: ['id', 'first_name', 'last_name', 'employee_id']
        }
      ],
      order: [['createdAt', 'DESC']]
    })

    // Prepare successful response with employee's licenses data
    const result = {
      success: true,
      data: licenses
    }

    // Cache the result for 5 minutes to improve performance
    if (redisConfig.isRedisConnected()) {
      await redisConfig.set(cacheKey, result, 300) // 5 minutes cache
    }

    // Return successful response with employee's licenses data
    res.json(result)
  } catch (err) {
    // Log error and return failure response
    logger.error('Error fetching employee licenses:', err)
    res.status(500).json({
      success: false,
      message: 'Error fetching employee licenses',
      error: err.message
    })
  }
}
