/**
 * @fileoverview Hardware Controller for EMS Backend
 * @description Handles CRUD operations and business logic for hardware asset resources.
 * Provides comprehensive hardware asset management including creation, retrieval, updates,
 * and deletion with role-based access control and Redis caching for optimal performance.
 * 
 * @author EMS Development Team
 * @version 1.0.0
 * @since 2025-09-17
 * 
 * @features
 * - Hardware asset CRUD operations with validation
 * - Role-based access control (admin vs employee)
 * - Redis caching for performance optimization
 * - Employee assignment tracking
 * - Cache invalidation on data changes
 * - Comprehensive error handling and logging
 */

// Import validation utilities for request validation
import { validationResult } from 'express-validator'
// Import logger for comprehensive logging
import logger from '../utils/logger.js'
// Import database models for hardware and employee operations
import { Hardware, Employee } from '../models/index.js'
// Import Redis configuration for caching operations
import redisConfig from '../config/redis.js'

/**
 * Retrieves all hardware assets with role-based access control and Redis caching
 * 
 * @async
 * @function listHardware
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {string} req.user.role - User role (admin or employee)
 * @param {number} req.user.id - User ID
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * @description
 * Retrieves hardware assets with the following features:
 * 1. Role-based access control (admin sees all, employees see only assigned assets)
 * 2. Redis caching for performance optimization (5-minute cache)
 * 3. Employee assignment information included
 * 4. Cache invalidation on data changes
 * 
 * @returns {Promise<void>} JSON response with hardware assets list
 * 
 * @throws {Error} If database query fails or Redis operations fail
 * 
 * @example
 * // Request: GET /api/v1/hardware (admin user)
 * // Response: { "success": true, "data": [{ "id": 1, "name": "Laptop", "assignedEmployee": {...} }] }
 * 
 * @example
 * // Request: GET /api/v1/hardware (employee user)
 * // Response: { "success": true, "data": [{ "id": 1, "name": "Laptop", "assigned_to": 123 }] }
 */
export async function listHardware (req, res, next) {
  try {
    // Extract user role and ID from authenticated request
    const userRole = req.user?.role
    const userId = req.user?.id

    // Generate cache key based on user role and ID for personalized caching
    const cacheKey = redisConfig.generateKey(
      'hardware',
      'list',
      userRole,
      userId || 'anonymous'
    )

    // Try to get data from Redis cache first for performance optimization
    if (redisConfig.isRedisConnected()) {
      const cachedData = await redisConfig.get(cacheKey)
      if (cachedData) {
        // Log cache hit for monitoring and debugging
        logger.info('Hardware list served from cache')
        return res.json({
          success: true,
          data: cachedData
        })
      }
    }

    // Initialize where clause for database query
    const whereClause = {}

    // Implement role-based access control: non-admin users only see their assigned assets
    if (userRole !== 'admin') {
      whereClause.assigned_to = userId
    }

    // Retrieve hardware assets from database with employee assignment information
    const hardware = await Hardware.findAll({
      where: whereClause,
      include: [
        {
          model: Employee,
          as: 'assignedEmployee',
          attributes: ['id', 'first_name', 'last_name', 'employee_id']
        }
      ]
    })

    // Cache the result for 5 minutes to improve performance
    if (redisConfig.isRedisConnected()) {
      await redisConfig.set(cacheKey, hardware, 300)
    }

    // Return successful response with hardware assets data
    res.json({
      success: true,
      data: hardware
    })
  } catch (err) {
    // Pass error to Express error handling middleware
    next(err)
  }
}

/**
 * Retrieves a specific hardware asset by ID with role-based access control
 * 
 * @async
 * @function getHardwareById
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params._id - Hardware asset ID
 * @param {Object} req.user - Authenticated user object
 * @param {string} req.user.role - User role (admin or employee)
 * @param {number} req.user.id - User ID
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * @description
 * Retrieves a specific hardware asset by ID with the following features:
 * 1. Role-based access control (admin can access any asset, employees only assigned assets)
 * 2. Employee assignment information included
 * 3. Proper error handling for not found cases
 * 
 * @returns {Promise<void>} JSON response with hardware asset data or error
 * 
 * @throws {Error} If database query fails
 * 
 * @example
 * // Request: GET /api/v1/hardware/123 (admin user)
 * // Response: { "success": true, "data": { "id": 123, "name": "Laptop", "assignedEmployee": {...} } }
 * 
 * @example
 * // Request: GET /api/v1/hardware/123 (employee user, asset not assigned to them)
 * // Response: { "success": false, "message": "Hardware not found" }
 */
export async function getHardwareById (req, res, next) {
  try {
    // Extract user role, ID, and hardware ID from request
    const userRole = req.user?.role
    const userId = req.user?.id
    const hardwareId = req.params._id

    // Initialize where clause with hardware ID
    const whereClause = { id: hardwareId }

    // Implement role-based access control: non-admin users only see their assigned assets
    if (userRole !== 'admin') {
      whereClause.assigned_to = userId
    }

    // Find hardware asset by ID with role-based access and employee information
    const hardware = await Hardware.findOne({
      where: whereClause,
      include: [
        {
          model: Employee,
          as: 'assignedEmployee',
          attributes: ['id', 'first_name', 'last_name', 'employee_id']
        }
      ]
    })

    if (!hardware) {
      // Return 404 if hardware not found or user doesn't have access
      return res.status(404).json({
        success: false,
        message: 'Hardware not found'
      })
    }

    // Return successful response with hardware asset data
    res.json({
      success: true,
      data: hardware
    })
  } catch (err) {
    // Pass error to Express error handling middleware
    next(err)
  }
}

/**
 * Creates a new hardware asset with validation and cache invalidation
 * 
 * @async
 * @function addHardware
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing hardware asset data
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * @description
 * Creates a new hardware asset with the following features:
 * 1. Request validation using express-validator
 * 2. Database record creation
 * 3. Cache invalidation to ensure data consistency
 * 4. Comprehensive error handling
 * 
 * @returns {Promise<void>} JSON response with creation status
 * 
 * @throws {Error} If validation fails or database operation fails
 * 
 * @example
 * // Request: POST /api/v1/hardware
 * // Body: { "name": "Laptop", "type": "Computer", "assigned_to": 123 }
 * // Response: { "success": true, "message": "Hardware created successfully", "data": {...} }
 */
export async function addHardware (req, res, next) {
  // Validate request data using express-validator
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    })
  }
  
  try {
    // Create and save a new hardware asset in the database
    const hardware = await Hardware.create(req.body)

    // Invalidate hardware cache to ensure data consistency
    if (redisConfig.isRedisConnected()) {
      const client = redisConfig.getClient()
      const keys = await client.keys('hardware:*')
      if (keys.length > 0) {
        await client.del(...keys)
        // Log cache invalidation for monitoring and debugging
        logger.info(`Invalidated ${keys.length} hardware cache keys`)
      }
    }

    // Return successful creation response with hardware data
    res.status(201).json({
      success: true,
      message: 'Hardware created successfully',
      data: hardware
    })
  } catch (err) {
    // Pass error to Express error handling middleware
    next(err)
  }
}

/**
 * Updates an existing hardware asset by ID with cache invalidation
 * 
 * @async
 * @function updateHardware
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params._id - Hardware asset ID to update
 * @param {Object} req.body - Request body containing update data
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * @description
 * Updates an existing hardware asset with the following features:
 * 1. Hardware asset lookup by ID
 * 2. Database record update
 * 3. Cache invalidation to ensure data consistency
 * 4. Comprehensive error handling
 * 
 * @returns {Promise<void>} JSON response with update status
 * 
 * @throws {Error} If hardware not found or database operation fails
 * 
 * @example
 * // Request: PUT /api/v1/hardware/123
 * // Body: { "name": "Updated Laptop", "status": "Active" }
 * // Response: { "success": true, "message": "Hardware updated successfully", "data": {...} }
 */
export async function updateHardware (req, res, next) {
  try {
    // Extract hardware ID from route parameters
    const hardwareId = req.params._id

    // Find hardware asset by ID in the database
    const hardware = await Hardware.findByPk(hardwareId)
    if (!hardware) {
      // Return 404 if hardware not found
      return res.status(404).json({
        success: false,
        message: 'Hardware not found'
      })
    }

    // Update the hardware asset with provided data
    await hardware.update(req.body)

    // Invalidate hardware cache to ensure data consistency
    if (redisConfig.isRedisConnected()) {
      const client = redisConfig.getClient()
      const keys = await client.keys('hardware:*')
      if (keys.length > 0) {
        await client.del(...keys)
        // Log cache invalidation for monitoring and debugging
        logger.info(`Invalidated ${keys.length} hardware cache keys`)
      }
    }

    // Return successful update response with updated hardware data
    res.json({
      success: true,
      message: 'Hardware updated successfully',
      data: hardware
    })
  } catch (err) {
    // Pass error to Express error handling middleware
    next(err)
  }
}

/**
 * Deletes a hardware asset by ID with cache invalidation
 * 
 * @async
 * @function deleteHardware
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params._id - Hardware asset ID to delete
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * @description
 * Deletes a hardware asset with the following features:
 * 1. Hardware asset lookup by ID
 * 2. Database record deletion
 * 3. Cache invalidation to ensure data consistency
 * 4. Comprehensive error handling
 * 
 * @returns {Promise<void>} JSON response with deletion status
 * 
 * @throws {Error} If hardware not found or database operation fails
 * 
 * @example
 * // Request: DELETE /api/v1/hardware/123
 * // Response: { "success": true, "message": "Hardware deleted successfully" }
 */
export async function deleteHardware (req, res, next) {
  try {
    // Extract hardware ID from route parameters
    const hardwareId = req.params._id

    // Find hardware asset by ID in the database
    const hardware = await Hardware.findByPk(hardwareId)
    if (!hardware) {
      // Return 404 if hardware not found
      return res.status(404).json({
        success: false,
        message: 'Hardware not found'
      })
    }

    // Delete the hardware asset from the database
    await hardware.destroy()

    // Invalidate hardware cache to ensure data consistency
    if (redisConfig.isRedisConnected()) {
      const client = redisConfig.getClient()
      const keys = await client.keys('hardware:*')
      if (keys.length > 0) {
        await client.del(...keys)
        // Log cache invalidation for monitoring and debugging
        logger.info(`Invalidated ${keys.length} hardware cache keys`)
      }
    }

    // Return successful deletion response
    res.json({
      success: true,
      message: 'Hardware deleted successfully'
    })
  } catch (err) {
    // Pass error to Express error handling middleware
    next(err)
  }
}

/**
 * Retrieves hardware assets assigned to a specific employee with access control
 * 
 * @async
 * @function getHardwareByEmployee
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.employeeId - Employee ID to get hardware for
 * @param {Object} req.user - Authenticated user object
 * @param {string} req.user.role - User role (admin or employee)
 * @param {number} req.user.id - User ID
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * @description
 * Retrieves hardware assets assigned to a specific employee with the following features:
 * 1. Role-based access control (admin can access any employee, employees only their own)
 * 2. Employee assignment information included
 * 3. Proper error handling for access denied cases
 * 
 * @returns {Promise<void>} JSON response with hardware assets list or access denied
 * 
 * @throws {Error} If database query fails
 * 
 * @example
 * // Request: GET /api/v1/hardware/employee/123 (admin user)
 * // Response: { "success": true, "data": [{ "id": 1, "name": "Laptop", "assignedEmployee": {...} }] }
 * 
 * @example
 * // Request: GET /api/v1/hardware/employee/456 (employee user, not their own ID)
 * // Response: { "success": false, "message": "Access denied. You can only view your own assets." }
 */
export async function getHardwareByEmployee (req, res, next) {
  try {
    // Extract user role, ID, and employee ID from request
    const userRole = req.user?.role
    const userId = req.user?.id
    const employeeId = req.params.employeeId

    // Implement role-based access control: non-admin users can only access their own assets
    if (userRole !== 'admin' && parseInt(employeeId) !== userId) {
      // Return 403 Forbidden if user tries to access another employee's assets
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own assets.'
      })
    }

    // Find hardware assets assigned to the specified employee with employee information
    const hardware = await Hardware.findAll({
      where: { assigned_to: employeeId },
      include: [
        {
          model: Employee,
          as: 'assignedEmployee',
          attributes: ['id', 'first_name', 'last_name', 'employee_id']
        }
      ]
    })

    // Return successful response with hardware assets data
    res.json({
      success: true,
      data: hardware
    })
  } catch (err) {
    // Pass error to Express error handling middleware
    next(err)
  }
}
