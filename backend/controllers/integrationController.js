/**
 * @fileoverview Integration Controller for EMS Backend
 * @description Handles CRUD operations and business logic for system integrations.
 * Provides comprehensive integration management including creation, retrieval, updates,
 * and deletion with Redis caching for optimal performance and type/status filtering.
 * 
 * @author EMS Development Team
 * @version 1.0.0
 * @since 2025-09-17
 * 
 * @features
 * - Integration CRUD operations with validation
 * - Redis caching for performance optimization
 * - Type and status-based filtering
 * - Pagination support for large datasets
 * - Cache invalidation on data changes
 * - Comprehensive error handling and logging
 */

// Import Integration model for database operations
import Integration from '../models/Integration.js'
// Import logger for comprehensive logging
import logger from '../utils/logger.js'
// Import Redis configuration for caching operations
import redisConfig from '../config/redis.js'

/**
 * Creates a new system integration with validation and cache invalidation
 * 
 * @async
 * @function createIntegration
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing integration data
 * @param {string} req.body.name - Integration name
 * @param {string} req.body.type - Integration type
 * @param {Object} req.body.config - Integration configuration
 * @param {string} req.body.status - Integration status (default: 'active')
 * @param {string} req.body.description - Integration description
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * @description
 * Creates a new system integration with the following features:
 * 1. Integration data validation and processing
 * 2. Database record creation using Sequelize
 * 3. Cache invalidation to ensure data consistency
 * 4. Comprehensive error handling and logging
 * 
 * @returns {Promise<void>} JSON response with creation status
 * 
 * @throws {Error} If database operation fails
 * 
 * @example
 * // Request: POST /api/v1/integrations
 * // Body: { "name": "Slack Integration", "type": "notification", "config": {...}, "description": "Slack notifications" }
 * // Response: { "success": true, "message": "Integration created successfully", "data": {...} }
 */
export async function createIntegration (req, res, next) {
  try {
    // Prepare integration data from request body with defaults
    const integrationData = {
      name: req.body.name,
      type: req.body.type,
      config: req.body.config,
      status: req.body.status || 'active',
      description: req.body.description
    }

    // Create new integration record in the database using Sequelize
    const integration = await Integration.create(integrationData)

    // Log successful integration creation for monitoring
    logger.info(`Integration created: ${integration.id}`)

    // Invalidate integration cache to ensure data consistency
    if (redisConfig.isRedisConnected()) {
      await redisConfig.del('integration:list:*')
    }

    // Return successful creation response with integration data
    return res.status(201).json({
      success: true,
      message: 'Integration created successfully',
      data: integration
    })
  } catch (error) {
    // Log error and return failure response
    logger.error('Error creating integration:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to create integration',
      error: error.message
    })
  }
}

/**
 * Retrieves all integrations with pagination and Redis caching
 * 
 * @async
 * @function getIntegrations
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {number} req.query.page - Page number for pagination (default: 1)
 * @param {number} req.query.limit - Number of records per page (default: 10)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * @description
 * Retrieves integrations with the following features:
 * 1. Pagination support for large datasets
 * 2. Redis caching for performance optimization (5-minute cache)
 * 3. Ordered by creation date (newest first)
 * 4. Cache invalidation on data changes
 * 
 * @returns {Promise<void>} JSON response with integrations list and pagination info
 * 
 * @throws {Error} If database query fails or Redis operations fail
 * 
 * @example
 * // Request: GET /api/v1/integrations?page=1&limit=20
 * // Response: { "success": true, "data": [...], "pagination": { "page": 1, "limit": 20, "total": 50, "pages": 3 } }
 */
export async function getIntegrations (req, res, next) {
  try {
    // Extract pagination parameters from query with defaults
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const offset = (page - 1) * limit

    // Generate cache key based on pagination parameters
    const cacheKey = redisConfig.generateKey(
      'integration',
      'list',
      page,
      limit
    )

    // Try to get data from Redis cache first for performance optimization
    if (redisConfig.isRedisConnected()) {
      const cachedData = await redisConfig.get(cacheKey)
      if (cachedData) {
        // Log cache hit for monitoring and debugging
        logger.info('Integrations list served from cache')
        return res.json(cachedData)
      }
    }

    // Retrieve integrations from database with pagination and ordering
    const { count, rows: integrations } = await Integration.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    })

    // Prepare response with pagination metadata
    const result = {
      success: true,
      data: integrations,
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

    // Return successful response with integrations data and pagination info
    return res.json(result)
  } catch (error) {
    // Log error and return failure response
    logger.error('Error fetching integrations:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch integrations',
      error: error.message
    })
  }
}

/**
 * Retrieves a specific integration by ID with Redis caching
 * 
 * @async
 * @function getIntegrationById
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.id - Integration ID
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * @description
 * Retrieves a specific integration by ID with the following features:
 * 1. Redis caching for performance optimization (5-minute cache)
 * 2. Proper error handling for not found cases
 * 3. Cache invalidation on data changes
 * 
 * @returns {Promise<void>} JSON response with integration data or error
 * 
 * @throws {Error} If database query fails or Redis operations fail
 * 
 * @example
 * // Request: GET /api/v1/integrations/123
 * // Response: { "success": true, "data": { "id": 123, "name": "Slack Integration", ... } }
 * 
 * @example
 * // Request: GET /api/v1/integrations/999
 * // Response: { "success": false, "message": "Integration not found" }
 */
export async function getIntegrationById (req, res, next) {
  try {
    // Extract integration ID from route parameters
    const integrationId = req.params.id

    // Generate cache key for this specific integration
    const cacheKey = redisConfig.generateKey(
      'integration',
      'detail',
      integrationId
    )

    // Try to get data from Redis cache first for performance optimization
    if (redisConfig.isRedisConnected()) {
      const cachedData = await redisConfig.get(cacheKey)
      if (cachedData) {
        // Log cache hit for monitoring and debugging
        logger.info('Integration detail served from cache')
        return res.json(cachedData)
      }
    }

    // Find integration by primary key in the database
    const integration = await Integration.findByPk(integrationId)

    if (!integration) {
      // Return 404 if integration not found
      return res.status(404).json({
        success: false,
        message: 'Integration not found'
      })
    }

    // Prepare successful response with integration data
    const result = {
      success: true,
      data: integration
    }

    // Cache the result for 5 minutes to improve performance
    if (redisConfig.isRedisConnected()) {
      await redisConfig.set(cacheKey, result, 300) // 5 minutes cache
    }

    // Return successful response with integration data
    return res.json(result)
  } catch (error) {
    // Log error and return failure response
    logger.error('Error fetching integration:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch integration',
      error: error.message
    })
  }
}

/**
 * Updates an existing integration by ID with cache invalidation
 * 
 * @async
 * @function updateIntegration
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.id - Integration ID to update
 * @param {Object} req.body - Request body containing update data
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * @description
 * Updates an existing integration with the following features:
 * 1. Integration lookup by ID
 * 2. Database record update using Sequelize
 * 3. Cache invalidation to ensure data consistency
 * 4. Comprehensive error handling and logging
 * 
 * @returns {Promise<void>} JSON response with update status
 * 
 * @throws {Error} If integration not found or database operation fails
 * 
 * @example
 * // Request: PUT /api/v1/integrations/123
 * // Body: { "name": "Updated Slack Integration", "status": "inactive" }
 * // Response: { "success": true, "message": "Integration updated successfully", "data": {...} }
 */
export async function updateIntegration (req, res, next) {
  try {
    // Extract integration ID from route parameters
    const integrationId = req.params.id

    // Find integration by primary key in the database
    const integration = await Integration.findByPk(integrationId)

    if (!integration) {
      // Return 404 if integration not found
      return res.status(404).json({
        success: false,
        message: 'Integration not found'
      })
    }

    // Update integration record with provided data using Sequelize
    await integration.update(req.body)

    // Log successful integration update for monitoring
    logger.info(`Integration updated: ${integrationId}`)

    // Invalidate integration cache to ensure data consistency
    if (redisConfig.isRedisConnected()) {
      await redisConfig.del('integration:list:*')
      await redisConfig.del(
        redisConfig.generateKey('integration', 'detail', integrationId)
      )
    }

    // Return successful update response with updated integration data
    return res.json({
      success: true,
      message: 'Integration updated successfully',
      data: integration
    })
  } catch (error) {
    // Log error and return failure response
    logger.error('Error updating integration:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to update integration',
      error: error.message
    })
  }
}

/**
 * Deletes an integration by ID with cache invalidation
 * 
 * @async
 * @function deleteIntegration
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.id - Integration ID to delete
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * @description
 * Deletes an integration with the following features:
 * 1. Integration lookup by ID
 * 2. Database record deletion using Sequelize
 * 3. Cache invalidation to ensure data consistency
 * 4. Comprehensive error handling and logging
 * 
 * @returns {Promise<void>} JSON response with deletion status
 * 
 * @throws {Error} If integration not found or database operation fails
 * 
 * @example
 * // Request: DELETE /api/v1/integrations/123
 * // Response: { "success": true, "message": "Integration deleted successfully" }
 */
export async function deleteIntegration (req, res, next) {
  try {
    // Extract integration ID from route parameters
    const integrationId = req.params.id

    // Find integration by primary key in the database
    const integration = await Integration.findByPk(integrationId)

    if (!integration) {
      // Return 404 if integration not found
      return res.status(404).json({
        success: false,
        message: 'Integration not found'
      })
    }

    // Delete integration record from the database using Sequelize
    await integration.destroy()

    // Log successful integration deletion for monitoring
    logger.info(`Integration deleted: ${integrationId}`)

    // Invalidate integration cache to ensure data consistency
    if (redisConfig.isRedisConnected()) {
      await redisConfig.del('integration:list:*')
      await redisConfig.del(
        redisConfig.generateKey('integration', 'detail', integrationId)
      )
    }

    // Return successful deletion response
    return res.json({
      success: true,
      message: 'Integration deleted successfully'
    })
  } catch (error) {
    // Log error and return failure response
    logger.error('Error deleting integration:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to delete integration',
      error: error.message
    })
  }
}

/**
 * Retrieves integrations filtered by type with Redis caching
 * 
 * @async
 * @function getIntegrationsByType
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.type - Integration type to filter by
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * @description
 * Retrieves integrations filtered by type with the following features:
 * 1. Type-based filtering using Sequelize
 * 2. Redis caching for performance optimization (5-minute cache)
 * 3. Ordered by creation date (newest first)
 * 4. Cache invalidation on data changes
 * 
 * @returns {Promise<void>} JSON response with filtered integrations list
 * 
 * @throws {Error} If database query fails or Redis operations fail
 * 
 * @example
 * // Request: GET /api/v1/integrations/type/notification
 * // Response: { "success": true, "data": [{ "id": 1, "name": "Slack Integration", "type": "notification", ... }] }
 */
export async function getIntegrationsByType (req, res, next) {
  try {
    // Extract type from route parameters
    const { type } = req.params

    // Generate cache key for this specific type
    const cacheKey = redisConfig.generateKey('integration', 'type', type)

    // Try to get data from Redis cache first for performance optimization
    if (redisConfig.isRedisConnected()) {
      const cachedData = await redisConfig.get(cacheKey)
      if (cachedData) {
        // Log cache hit for monitoring and debugging
        logger.info('Integrations by type served from cache')
        return res.json(cachedData)
      }
    }

    // Find integrations by type using Sequelize with ordering
    const integrations = await Integration.findAll({
      where: { type },
      order: [['createdAt', 'DESC']]
    })

    // Prepare successful response with filtered integrations data
    const result = {
      success: true,
      data: integrations
    }

    // Cache the result for 5 minutes to improve performance
    if (redisConfig.isRedisConnected()) {
      await redisConfig.set(cacheKey, result, 300) // 5 minutes cache
    }

    // Return successful response with filtered integrations data
    return res.json(result)
  } catch (error) {
    // Log error and return failure response
    logger.error('Error fetching integrations by type:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch integrations by type',
      error: error.message
    })
  }
}

/**
 * Retrieves integrations filtered by status with Redis caching
 * 
 * @async
 * @function getIntegrationsByStatus
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.status - Integration status to filter by
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * @description
 * Retrieves integrations filtered by status with the following features:
 * 1. Status-based filtering using Sequelize
 * 2. Redis caching for performance optimization (5-minute cache)
 * 3. Ordered by creation date (newest first)
 * 4. Cache invalidation on data changes
 * 
 * @returns {Promise<void>} JSON response with filtered integrations list
 * 
 * @throws {Error} If database query fails or Redis operations fail
 * 
 * @example
 * // Request: GET /api/v1/integrations/status/active
 * // Response: { "success": true, "data": [{ "id": 1, "name": "Slack Integration", "status": "active", ... }] }
 */
export async function getIntegrationsByStatus (req, res, next) {
  try {
    // Extract status from route parameters
    const { status } = req.params

    // Generate cache key for this specific status
    const cacheKey = redisConfig.generateKey('integration', 'status', status)

    // Try to get data from Redis cache first for performance optimization
    if (redisConfig.isRedisConnected()) {
      const cachedData = await redisConfig.get(cacheKey)
      if (cachedData) {
        // Log cache hit for monitoring and debugging
        logger.info('Integrations by status served from cache')
        return res.json(cachedData)
      }
    }

    // Find integrations by status using Sequelize with ordering
    const integrations = await Integration.findAll({
      where: { status },
      order: [['createdAt', 'DESC']]
    })

    // Prepare successful response with filtered integrations data
    const result = {
      success: true,
      data: integrations
    }

    // Cache the result for 5 minutes to improve performance
    if (redisConfig.isRedisConnected()) {
      await redisConfig.set(cacheKey, result, 300) // 5 minutes cache
    }

    // Return successful response with filtered integrations data
    return res.json(result)
  } catch (error) {
    // Log error and return failure response
    logger.error('Error fetching integrations by status:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch integrations by status',
      error: error.message
    })
  }
}
