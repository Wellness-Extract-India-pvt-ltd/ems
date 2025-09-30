/**
 * @fileoverview Software Controller for EMS Backend
 * @description Handles CRUD operations and business logic for software asset management.
 * Provides comprehensive software management including creation, retrieval, updates,
 * and deletion with Redis caching for optimal performance and role-based access control.
 * 
 * @author EMS Development Team
 * @version 1.0.0
 * @since 2025-09-17
 * 
 * @features
 * - Software CRUD operations with validation
 * - Role-based access control (admin vs user permissions)
 * - Redis caching for performance optimization
 * - Employee-specific software filtering
 * - Pagination support for large datasets
 * - Cache invalidation on data changes
 * - Comprehensive error handling and logging
 */

// Import express-validator for request validation
import { validationResult } from 'express-validator'
// Import Software and Employee models for database operations
import { Software, Employee } from '../models/index.js'
// Import logger for comprehensive logging
import logger from '../utils/logger.js'
// Import Redis configuration for caching operations
import redisConfig from '../config/redis.js'

/**
 * Creates a new software asset with validation and cache invalidation
 * 
 * @async
 * @function addSoftware
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing software data
 * @param {string} req.body.name - Name of the software
 * @param {string} req.body.version - Software version
 * @param {string} req.body.vendor - Software vendor/developer
 * @param {string} req.body.category - Software category (productivity, development, etc.)
 * @param {number} req.body.assigned_to - Employee ID assigned to the software
 * @param {string} req.body.notes - Additional notes about the software
 * @param {Object} res - Express response object
 * 
 * @description
 * Creates a new software asset with the following features:
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
 * // Request: POST /api/v1/software/add
 * // Body: { "name": "Microsoft Office", "version": "2021", "assigned_to": 1 }
 * // Response: { "success": true, "message": "Software added successfully", "data": {...} }
 */
export async function addSoftware (req, res) {
  // Validate request parameters using express-validator
  const errors = validationResult(req)
  if (!errors.isEmpty()) { 
    return res.status(400).json({ errors: errors.array() }) 
  }

  try {
    // Create new software record in the database using Sequelize
    const newSoftware = await Software.create(req.body)
    
    // Log successful software creation for monitoring
    logger.info('Software added', {
      softwareId: newSoftware.id,
      name: newSoftware.name
    })

    // Invalidate software cache to ensure data consistency
    if (redisConfig.isRedisConnected()) {
      await redisConfig.del('software:list:*')
      await redisConfig.del('software:employee:*')
    }

    // Return successful creation response with software data
    res.status(201).json({
      success: true,
      message: 'Software added successfully',
      data: newSoftware
    })
  } catch (error) {
    // Log error and return failure response
    logger.error('Software creation failed', {
      error: error.message,
      payload: req.body
    })
    res.status(400).json({
      success: false,
      message: 'Error adding software',
      error: error.message
    })
  }
}

/**
 * Retrieves all software assets with pagination, role-based access control, and Redis caching
 * 
 * @async
 * @function listSoftware
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
 * Retrieves software assets with the following features:
 * 1. Role-based access control (admin sees all, users see only their software)
 * 2. Pagination support for large datasets
 * 3. Redis caching for performance optimization (5-minute cache)
 * 4. Employee information included in response
 * 5. Ordered by creation date (newest first)
 * 
 * @returns {Promise<void>} JSON response with software list and pagination info
 * 
 * @throws {Error} If database query fails or Redis operations fail
 * 
 * @example
 * // Request: GET /api/v1/software/all?page=1&limit=20
 * // Response: { "success": true, "data": [...], "pagination": { "page": 1, "limit": 20, "total": 50, "pages": 3 } }
 */
export async function listSoftware (req, res) {
  try {
    // Extract user information and pagination parameters
    const userRole = req.user?.role
    const userId = req.user?.id
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const offset = (page - 1) * limit

    // Generate cache key based on user role, ID, and pagination parameters
    const cacheKey = redisConfig.generateKey(
      'software',
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
        logger.info('Software list served from cache')
        return res.json(cachedData)
      }
    }

    // Build where clause based on user role for access control
    const whereClause = {}

    // If user is not admin, only show software assigned to them
    if (userRole !== 'admin') {
      whereClause.assigned_to = userId
    }

    // Retrieve software from database with pagination, employee info, and ordering
    const { count, rows: softwareItems } = await Software.findAndCountAll({
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
      data: softwareItems,
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

    // Return successful response with software data and pagination info
    res.status(200).json(result)
  } catch (error) {
    // Log error and return failure response
    logger.error('Software list error', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching software',
      error: error.message
    })
  }
}

/**
 * Retrieves a specific software asset by ID with role-based access control and Redis caching
 * 
 * @async
 * @function getSoftwareById
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object (from middleware)
 * @param {string} req.user.role - User role (admin, user, etc.)
 * @param {number} req.user.id - User ID
 * @param {Object} req.params - Route parameters
 * @param {string} req.params._id - Software ID
 * @param {Object} res - Express response object
 * 
 * @description
 * Retrieves a specific software asset by ID with the following features:
 * 1. Role-based access control (admin sees all, users see only their software)
 * 2. Redis caching for performance optimization (5-minute cache)
 * 3. Employee information included in response
 * 4. Proper error handling for not found cases
 * 
 * @returns {Promise<void>} JSON response with software data or error
 * 
 * @throws {Error} If database query fails or Redis operations fail
 * 
 * @example
 * // Request: GET /api/v1/software/123
 * // Response: { "success": true, "data": { "id": 123, "name": "Microsoft Office", ... } }
 * 
 * @example
 * // Request: GET /api/v1/software/999
 * // Response: { "success": false, "message": "Software not found" }
 */
export async function getSoftwareById (req, res) {
  try {
    // Extract user information and software ID from request
    const userRole = req.user?.role
    const userId = req.user?.id
    const softwareId = req.params._id // Fixed: use _id to match route parameter

    // Generate cache key for this specific software
    const cacheKey = redisConfig.generateKey('software', 'detail', softwareId)

    // Try to get data from Redis cache first for performance optimization
    if (redisConfig.isRedisConnected()) {
      const cachedData = await redisConfig.get(cacheKey)
      if (cachedData) {
        // Log cache hit for monitoring and debugging
        logger.info('Software detail served from cache')
        return res.json(cachedData)
      }
    }

    // Build where clause with role-based access control
    const whereClause = { id: softwareId }

    // If user is not admin, only allow access to software assigned to them
    if (userRole !== 'admin') {
      whereClause.assigned_to = userId
    }

    // Find software by ID with employee information included
    const softwareItem = await Software.findOne({
      where: whereClause,
      include: [
        {
          model: Employee,
          as: 'assignedEmployee',
          attributes: ['id', 'first_name', 'last_name', 'employee_id']
        }
      ]
    })

    if (!softwareItem) {
      // Return 404 if software not found or user doesn't have access
      return res.status(404).json({
        success: false,
        message: 'Software not found'
      })
    }

    // Prepare successful response with software data
    const result = {
      success: true,
      data: softwareItem
    }

    // Cache the result for 5 minutes to improve performance
    if (redisConfig.isRedisConnected()) {
      await redisConfig.set(cacheKey, result, 300) // 5 minutes cache
    }

    // Return successful response with software data
    res.status(200).json(result)
  } catch (error) {
    // Log error and return failure response
    logger.error('Software fetch error', {
      softwareId: req.params._id,
      error: error.message
    })
    res.status(500).json({
      success: false,
      message: 'Error fetching software',
      error: error.message
    })
  }
}

/**
 * Updates an existing software asset by ID with validation and cache invalidation
 * 
 * @async
 * @function updateSoftware
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params._id - Software ID to update
 * @param {Object} req.body - Request body containing update data
 * @param {string} req.body.name - Name of the software
 * @param {string} req.body.version - Software version
 * @param {string} req.body.vendor - Software vendor/developer
 * @param {string} req.body.category - Software category (productivity, development, etc.)
 * @param {number} req.body.assigned_to - Employee ID assigned to the software
 * @param {string} req.body.notes - Additional notes about the software
 * @param {Object} res - Express response object
 * 
 * @description
 * Updates an existing software asset with the following features:
 * 1. Request validation using express-validator
 * 2. Database record update using Sequelize
 * 3. Cache invalidation to ensure data consistency
 * 4. Comprehensive error handling and logging
 * 
 * @returns {Promise<void>} JSON response with update status
 * 
 * @throws {Error} If validation fails, software not found, or database operation fails
 * 
 * @example
 * // Request: PUT /api/v1/software/update/123
 * // Body: { "name": "Updated Microsoft Office", "version": "2022" }
 * // Response: { "success": true, "message": "Software updated successfully", "data": {...} }
 */
export async function updateSoftware (req, res) {
  // Validate request parameters using express-validator
  const errors = validationResult(req)
  if (!errors.isEmpty()) { 
    return res.status(400).json({ errors: errors.array() }) 
  }

  try {
    // Extract software ID from route parameters
    const softwareId = req.params._id // Fixed: use _id to match route parameter
    
    // Update software record in the database using Sequelize
    const [updatedRowsCount] = await Software.update(req.body, {
      where: { id: softwareId }
    })

    if (updatedRowsCount === 0) {
      // Return 404 if software not found
      return res.status(404).json({
        success: false,
        message: 'Software not found'
      })
    }

    // Retrieve updated software data for response
    const updatedSoftware = await Software.findByPk(softwareId)
    
    // Log successful software update for monitoring
    logger.info('Software updated', { softwareId })

    // Invalidate software cache to ensure data consistency
    if (redisConfig.isRedisConnected()) {
      await redisConfig.del('software:list:*')
      await redisConfig.del('software:employee:*')
      await redisConfig.del(
        redisConfig.generateKey('software', 'detail', softwareId)
      )
    }

    // Return successful update response with updated software data
    res.status(200).json({
      success: true,
      message: 'Software updated successfully',
      data: updatedSoftware
    })
  } catch (error) {
    // Log error and return failure response
    logger.error('Software update failed', {
      softwareId: req.params._id,
      error: error.message
    })
    res.status(400).json({
      success: false,
      message: 'Error updating software',
      error: error.message
    })
  }
}

/**
 * Deletes a software asset by ID with cache invalidation
 * 
 * @async
 * @function deleteSoftware
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params._id - Software ID to delete
 * @param {Object} res - Express response object
 * 
 * @description
 * Deletes a software asset with the following features:
 * 1. Software lookup by ID
 * 2. Database record deletion using Sequelize
 * 3. Cache invalidation to ensure data consistency
 * 4. Comprehensive error handling and logging
 * 
 * @returns {Promise<void>} JSON response with deletion status
 * 
 * @throws {Error} If software not found or database operation fails
 * 
 * @example
 * // Request: DELETE /api/v1/software/delete/123
 * // Response: { "success": true, "message": "Software deleted successfully" }
 */
export async function deleteSoftware (req, res) {
  try {
    // Extract software ID from route parameters
    const softwareId = req.params._id // Fixed: use _id to match route parameter
    
    // Delete software record from the database using Sequelize
    const deletedRowsCount = await Software.destroy({
      where: { id: softwareId }
    })

    if (deletedRowsCount === 0) {
      // Return 404 if software not found
      return res.status(404).json({
        success: false,
        message: 'Software not found'
      })
    }

    // Log successful software deletion for monitoring
    logger.info('Software deleted', { softwareId })

    // Invalidate software cache to ensure data consistency
    if (redisConfig.isRedisConnected()) {
      await redisConfig.del('software:list:*')
      await redisConfig.del('software:employee:*')
      await redisConfig.del(
        redisConfig.generateKey('software', 'detail', softwareId)
      )
    }

    // Return successful deletion response
    res.status(200).json({
      success: true,
      message: 'Software deleted successfully'
    })
  } catch (error) {
    // Log error and return failure response
    logger.error('Software deletion failed', {
      softwareId: req.params._id,
      error: error.message
    })
    res.status(500).json({
      success: false,
      message: 'Error deleting software',
      error: error.message
    })
  }
}

/**
 * Retrieves software assets assigned to a specific employee with role-based access control and Redis caching
 * 
 * @async
 * @function getSoftwareByEmployee
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object (from middleware)
 * @param {string} req.user.role - User role (admin, user, etc.)
 * @param {number} req.user.id - User ID
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.employeeId - Employee ID to get software for
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * @description
 * Retrieves software assets assigned to a specific employee with the following features:
 * 1. Role-based access control (admin can see all, users can only see their own)
 * 2. Redis caching for performance optimization (5-minute cache)
 * 3. Employee information included in response
 * 4. Ordered by creation date (newest first)
 * 
 * @returns {Promise<void>} JSON response with employee's software or error
 * 
 * @throws {Error} If access denied, database query fails, or Redis operations fail
 * 
 * @example
 * // Request: GET /api/v1/software/employee/123
 * // Response: { "success": true, "data": [{ "id": 1, "name": "Microsoft Office", ... }] }
 * 
 * @example
 * // Request: GET /api/v1/software/employee/999 (non-admin user trying to access other employee's software)
 * // Response: { "success": false, "error": "Forbidden", "message": "Access denied. You can only view your own software." }
 */
export async function getSoftwareByEmployee (req, res, next) {
  try {
    // Extract user information and employee ID from request
    const userRole = req.user?.role
    const userId = req.user?.id
    const employeeId = req.params.employeeId

    // If user is not admin, only allow access to their own software
    if (userRole !== 'admin' && parseInt(employeeId) !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Access denied. You can only view your own software.'
      })
    }

    // Generate cache key for this specific employee's software
    const cacheKey = redisConfig.generateKey(
      'software',
      'employee',
      employeeId
    )

    // Try to get data from Redis cache first for performance optimization
    if (redisConfig.isRedisConnected()) {
      const cachedData = await redisConfig.get(cacheKey)
      if (cachedData) {
        // Log cache hit for monitoring and debugging
        logger.info('Employee software served from cache')
        return res.json(cachedData)
      }
    }

    // Find software assigned to the employee with employee information included
    const software = await Software.findAll({
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

    // Prepare successful response with software data
    const result = {
      success: true,
      data: software
    }

    // Cache the result for 5 minutes to improve performance
    if (redisConfig.isRedisConnected()) {
      await redisConfig.set(cacheKey, result, 300) // 5 minutes cache
    }

    // Return successful response with employee's software data
    res.json(result)
  } catch (err) {
    // Log error and return failure response
    logger.error('Error fetching employee software:', err)
    res.status(500).json({
      success: false,
      message: 'Error fetching employee software',
      error: err.message
    })
  }
}
