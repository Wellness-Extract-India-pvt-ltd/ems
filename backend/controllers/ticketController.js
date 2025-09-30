/**
 * @fileoverview Ticket Controller for EMS Backend
 * @description Handles CRUD operations and business logic for ticket management system.
 * Provides comprehensive ticket management including creation, retrieval, updates,
 * deletion, and file attachment handling with Redis caching for optimal performance
 * and role-based access control.
 * 
 * @author EMS Development Team
 * @version 1.0.0
 * @since 2025-09-17
 * 
 * @features
 * - Ticket CRUD operations with validation
 * - Role-based access control (admin, manager, employee permissions)
 * - Redis caching for performance optimization
 * - File attachment management
 * - Pagination support for large datasets
 * - Cache invalidation on data changes
 * - Comprehensive error handling and logging
 * - Unique ticket number generation
 * - Self-assignment prevention
 */

// Import express-validator for request validation
import { validationResult } from 'express-validator'
// Import Ticket and Employee models for database operations
import Ticket from '../models/Ticket.js'
import Employee from '../models/Employee.js'
// Import logger for comprehensive logging
import logger from '../utils/logger.js'
// Import Redis configuration for caching operations
import redisConfig from '../config/redis.js'

/**
 * Creates a new support ticket with validation and cache invalidation
 * 
 * @async
 * @function addTicket
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing ticket data
 * @param {string} req.body.title - Ticket title
 * @param {string} req.body.description - Ticket description
 * @param {string} req.body.status - Ticket status (default: 'Open')
 * @param {string} req.body.priority - Ticket priority (default: 'Medium')
 * @param {string} req.body.category - Ticket category (default: 'Other')
 * @param {number} req.body.assignedTo - Employee ID assigned to the ticket
 * @param {string} req.body.dueDate - Ticket due date
 * @param {Object} req.user - Authenticated user object (from middleware)
 * @param {number} req.user.employee - Employee ID of the user creating the ticket
 * @param {Object} res - Express response object
 * 
 * @description
 * Creates a new support ticket with the following features:
 * 1. Request validation using express-validator
 * 2. Self-assignment prevention (employees cannot assign tickets to themselves)
 * 3. Unique ticket number generation with timestamp and random string
 * 4. Database record creation using Sequelize
 * 5. Cache invalidation to ensure data consistency
 * 6. Comprehensive error handling and logging
 * 
 * @returns {Promise<void>} JSON response with creation status
 * 
 * @throws {Error} If validation fails, self-assignment attempted, or database operation fails
 * 
 * @example
 * // Request: POST /api/v1/tickets/add
 * // Body: { "title": "Login Issue", "description": "Cannot login to system", "priority": "High" }
 * // Response: { "success": true, "message": "Ticket created successfully", "data": {...} }
 */
export async function addTicket (req, res) {
  // Validate request parameters using express-validator
  const errors = validationResult(req)
  if (!errors.isEmpty()) { 
    return res.status(400).json({ errors: errors.array() }) 
  }

  try {
    // Extract ticket data from request body
    const {
      title,
      description,
      status,
      priority,
      assignedTo,
      dueDate,
      category
    } = req.body

    // Prevent employees from assigning tickets to themselves
    if (assignedTo && assignedTo === req.user.employee?.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot assign ticket to self.'
      })
    }

    // Generate unique ticket number with timestamp and random string
    const ticketNumber = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`

    // Create new ticket record in the database using Sequelize
    const ticket = await Ticket.create({
      ticket_number: ticketNumber,
      title,
      description,
      status: status || 'Open',
      priority: priority || 'Medium',
      category: category || 'Other',
      due_date: dueDate,
      assigned_to: assignedTo,
      created_by: req.user.employee,
      attachments: []
    })

    // Log successful ticket creation for monitoring
    logger.info('Ticket created', { ticketId: ticket.id, ticketNumber })

    // Invalidate ticket cache to ensure data consistency
    if (redisConfig.isRedisConnected()) {
      await redisConfig.del('ticket:list:*')
    }

    // Return successful creation response with ticket data
    res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      data: ticket
    })
  } catch (error) {
    // Log error and return failure response
    logger.error('Ticket creation failed', { error: error.message })
    res.status(400).json({
      success: false,
      message: 'Error creating ticket',
      error: error.message
    })
  }
}

/**
 * Uploads file attachments to a specific ticket with validation and cache invalidation
 * 
 * @async
 * @function uploadAttachments
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params._id - Ticket ID to upload attachments to
 * @param {Object} req.files - Uploaded files from multer middleware
 * @param {Object} req.user - Authenticated user object (from middleware)
 * @param {number} req.user.employee - Employee ID of the user uploading files
 * @param {Object} res - Express response object
 * 
 * @description
 * Uploads file attachments to a ticket with the following features:
 * 1. Ticket existence validation
 * 2. File upload validation (ensures files are provided)
 * 3. File metadata extraction (filename, size, path, etc.)
 * 4. Attachment array management (appends to existing attachments)
 * 5. Database update using Sequelize
 * 6. Cache invalidation to ensure data consistency
 * 7. Comprehensive error handling and logging
 * 
 * @returns {Promise<void>} JSON response with upload status
 * 
 * @throws {Error} If ticket not found, no files uploaded, or database operation fails
 * 
 * @example
 * // Request: POST /api/v1/tickets/123/attachments (with multipart/form-data)
 * // Response: { "success": true, "message": "Attachments uploaded successfully", "data": [...] }
 */
export async function uploadAttachments (req, res) {
  // Extract ticket ID from route parameters
  const ticketId = req.params._id

  try {
    // Find ticket by ID using Sequelize
    const ticket = await Ticket.findByPk(ticketId)
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      })
    }

    // Extract uploaded files from multer middleware
    const files = req.files || []
    if (!files.length) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      })
    }

    // Process uploaded files and extract metadata
    const attachments = files.map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size,
      uploadedBy: req.user.employee,
      uploadedAt: new Date()
    }))

    // Update ticket attachments by appending new attachments to existing ones
    const currentAttachments = ticket.attachments || []
    const updatedAttachments = [...currentAttachments, ...attachments]

    // Update ticket with new attachments using Sequelize
    await ticket.update({ attachments: updatedAttachments })

    // Invalidate ticket cache to ensure data consistency
    if (redisConfig.isRedisConnected()) {
      await redisConfig.del('ticket:list:*')
      await redisConfig.del(
        redisConfig.generateKey('ticket', 'detail', ticketId)
      )
    }

    // Return successful upload response with attachment data
    res.status(200).json({
      success: true,
      message: 'Attachments uploaded successfully',
      data: attachments
    })
  } catch (error) {
    // Log error and return failure response
    logger.error('Upload Error', error.message)
    res.status(500).json({
      success: false,
      message: 'Failed to upload attachments',
      error: error.message
    })
  }
}

/**
 * Retrieves all tickets with pagination, role-based access control, and Redis caching
 * 
 * @async
 * @function listTickets
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object (from middleware)
 * @param {string} req.user.role - User role (admin, manager, employee)
 * @param {number} req.user.employee - Employee ID
 * @param {Object} req.query - Query parameters
 * @param {number} req.query.page - Page number for pagination (default: 1)
 * @param {number} req.query.limit - Number of records per page (default: 10)
 * @param {Object} res - Express response object
 * 
 * @description
 * Retrieves tickets with the following features:
 * 1. Role-based access control (admin/manager see all, employees see only their tickets)
 * 2. Pagination support for large datasets
 * 3. Redis caching for performance optimization (5-minute cache)
 * 4. Employee information included in response (creator and assignee)
 * 5. Ordered by creation date (newest first)
 * 
 * @returns {Promise<void>} JSON response with ticket list and pagination info
 * 
 * @throws {Error} If database query fails or Redis operations fail
 * 
 * @example
 * // Request: GET /api/v1/tickets/all?page=1&limit=20
 * // Response: { "success": true, "data": [...], "pagination": { "page": 1, "limit": 20, "total": 50, "pages": 3 } }
 */
export async function listTickets (req, res) {
  try {
    // Extract user information and pagination parameters
    const userRole = req.user.role
    const userId = req.user.employee
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const offset = (page - 1) * limit

    // Generate cache key based on user role, ID, and pagination parameters
    const cacheKey = redisConfig.generateKey(
      'ticket',
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
        logger.info('Ticket list served from cache')
        return res.json(cachedData)
      }
    }

    // Build where clause based on user role for access control
    const whereClause = {}

    // Role-based access control implementation
    if (userRole === 'admin' || userRole === 'manager') {
      // Admin and manager can see all tickets
    } else if (userRole === 'employee') {
      // Employees can only see tickets they created
      whereClause.created_by = userId
    }

    // Retrieve tickets from database with pagination, employee info, and ordering
    const { count, rows: tickets } = await Ticket.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Employee,
          as: 'createdByEmployee',
          attributes: ['id', 'first_name', 'last_name', 'employee_id']
        },
        {
          model: Employee,
          as: 'assignedToEmployee',
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
      data: tickets,
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

    // Return successful response with ticket data and pagination info
    res.status(200).json(result)
  } catch (error) {
    // Log error and return failure response
    logger.error('Error fetching tickets', { error: error.message })
    res.status(500).json({
      success: false,
      message: 'Error fetching tickets',
      error: error.message
    })
  }
}

/**
 * Retrieves a specific ticket by ID with role-based access control and Redis caching
 * 
 * @async
 * @function getTicketById
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object (from middleware)
 * @param {string} req.user.role - User role (admin, manager, employee)
 * @param {number} req.user.employee - Employee ID
 * @param {Object} req.params - Route parameters
 * @param {string} req.params._id - Ticket ID
 * @param {Object} res - Express response object
 * 
 * @description
 * Retrieves a specific ticket by ID with the following features:
 * 1. Role-based access control (admin/manager see all, employees see only their tickets)
 * 2. Redis caching for performance optimization (5-minute cache)
 * 3. Employee information included in response (creator and assignee)
 * 4. Proper error handling for not found cases
 * 5. Access validation for employee users
 * 
 * @returns {Promise<void>} JSON response with ticket data or error
 * 
 * @throws {Error} If database query fails, Redis operations fail, or access denied
 * 
 * @example
 * // Request: GET /api/v1/tickets/123
 * // Response: { "success": true, "data": { "id": 123, "title": "Login Issue", ... } }
 * 
 * @example
 * // Request: GET /api/v1/tickets/999 (employee trying to access other employee's ticket)
 * // Response: { "success": false, "message": "Access denied" }
 */
export async function getTicketById (req, res) {
  try {
    // Extract ticket ID from route parameters
    const ticketId = req.params._id

    // Generate cache key for this specific ticket
    const cacheKey = redisConfig.generateKey('ticket', 'detail', ticketId)

    // Try to get data from Redis cache first for performance optimization
    if (redisConfig.isRedisConnected()) {
      const cachedData = await redisConfig.get(cacheKey)
      if (cachedData) {
        // Log cache hit for monitoring and debugging
        logger.info('Ticket detail served from cache')
        return res.json(cachedData)
      }
    }

    // Find ticket by ID with employee information included
    const ticket = await Ticket.findByPk(ticketId, {
      include: [
        {
          model: Employee,
          as: 'createdByEmployee',
          attributes: ['id', 'first_name', 'last_name', 'employee_id']
        },
        {
          model: Employee,
          as: 'assignedToEmployee',
          attributes: ['id', 'first_name', 'last_name', 'employee_id']
        }
      ]
    })

    if (!ticket) {
      // Return 404 if ticket not found
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      })
    }

    // Role-based access control: employees can only fetch their own tickets
    if (
      req.user.role === 'employee' &&
      ticket.created_by !== req.user.employee
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    // Prepare successful response with ticket data
    const result = {
      success: true,
      data: ticket
    }

    // Cache the result for 5 minutes to improve performance
    if (redisConfig.isRedisConnected()) {
      await redisConfig.set(cacheKey, result, 300) // 5 minutes cache
    }

    // Return successful response with ticket data
    res.status(200).json(result)
  } catch (error) {
    // Log error and return failure response
    logger.error('Error fetching ticket', { error: error.message })
    res.status(500).json({
      success: false,
      message: 'Error fetching ticket',
      error: error.message
    })
  }
}

/**
 * Updates an existing ticket with validation, role-based access control, and cache invalidation
 * 
 * @async
 * @function updateTicket
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params._id - Ticket ID to update
 * @param {Object} req.body - Request body containing update data
 * @param {string} req.body.title - Ticket title
 * @param {string} req.body.description - Ticket description
 * @param {string} req.body.status - Ticket status (Open, In Progress, Resolved, Closed)
 * @param {string} req.body.priority - Ticket priority (Low, Medium, High, Critical)
 * @param {string} req.body.category - Ticket category
 * @param {number} req.body.assignedTo - Employee ID assigned to the ticket
 * @param {string} req.body.dueDate - Ticket due date
 * @param {string} req.body.resolution - Ticket resolution notes
 * @param {Object} req.user - Authenticated user object (from middleware)
 * @param {string} req.user.role - User role (admin, manager, employee)
 * @param {number} req.user.employee - Employee ID
 * @param {Object} res - Express response object
 * 
 * @description
 * Updates an existing ticket with the following features:
 * 1. Request validation using express-validator
 * 2. Role-based access control (employees can only update their own tickets)
 * 3. Selective field updates (only provided fields are updated)
 * 4. Automatic resolution date setting for resolved/closed tickets
 * 5. Database record update using Sequelize
 * 6. Cache invalidation to ensure data consistency
 * 7. Comprehensive error handling and logging
 * 
 * @returns {Promise<void>} JSON response with update status
 * 
 * @throws {Error} If validation fails, ticket not found, access denied, or database operation fails
 * 
 * @example
 * // Request: PUT /api/v1/tickets/update/123
 * // Body: { "status": "Resolved", "resolution": "Issue fixed by restarting service" }
 * // Response: { "success": true, "message": "Ticket updated successfully", "data": {...} }
 */
export async function updateTicket (req, res) {
  // Validate request parameters using express-validator
  const errors = validationResult(req)
  if (!errors.isEmpty()) { 
    return res.status(400).json({ errors: errors.array() }) 
  }

  try {
    // Extract ticket ID from route parameters
    const ticketId = req.params._id

    // Find ticket by ID using Sequelize
    const ticket = await Ticket.findByPk(ticketId)
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      })
    }

    // Role-based access control: employees can only update their own tickets
    if (
      req.user.role === 'employee' &&
      ticket.created_by !== req.user.employee
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    // Extract update data from request body
    const updates = req.body
    const updatedData = {}

    // Update only provided fields (selective updates)
    if (updates.title) updatedData.title = updates.title
    if (updates.description) updatedData.description = updates.description
    if (updates.status) updatedData.status = updates.status
    if (updates.priority) updatedData.priority = updates.priority
    if (updates.category) updatedData.category = updates.category
    if (updates.assignedTo) updatedData.assigned_to = updates.assignedTo
    if (updates.dueDate) updatedData.due_date = updates.dueDate
    if (updates.resolution) updatedData.resolution = updates.resolution

    // Automatically set resolved_date if status is resolved or closed
    if (updates.status === 'Resolved' || updates.status === 'Closed') {
      updatedData.resolved_date = new Date()
    }

    // Update ticket record in the database using Sequelize
    await ticket.update(updatedData)

    // Log successful ticket update for monitoring
    logger.info('Ticket updated', { ticketId: ticket.id })

    // Invalidate ticket cache to ensure data consistency
    if (redisConfig.isRedisConnected()) {
      await redisConfig.del('ticket:list:*')
      await redisConfig.del(
        redisConfig.generateKey('ticket', 'detail', ticketId)
      )
    }

    // Return successful update response with updated ticket data
    res.status(200).json({
      success: true,
      message: 'Ticket updated successfully',
      data: ticket
    })
  } catch (error) {
    // Log error and return failure response
    logger.error('Ticket update failed', { error: error.message })
    res.status(500).json({
      success: false,
      message: 'Error updating ticket',
      error: error.message
    })
  }
}

/**
 * Deletes a ticket (admin only) with cache invalidation
 * 
 * @async
 * @function deleteTicket
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params._id - Ticket ID to delete
 * @param {Object} res - Express response object
 * 
 * @description
 * Deletes a ticket with the following features:
 * 1. Ticket existence validation
 * 2. Database record deletion using Sequelize
 * 3. Cache invalidation to ensure data consistency
 * 4. Comprehensive error handling and logging
 * 5. Admin-only access (enforced by middleware)
 * 
 * @returns {Promise<void>} JSON response with deletion status
 * 
 * @throws {Error} If ticket not found or database operation fails
 * 
 * @example
 * // Request: DELETE /api/v1/tickets/delete/123
 * // Response: { "success": true, "message": "Ticket deleted successfully" }
 */
export async function deleteTicket (req, res) {
  try {
    // Extract ticket ID from route parameters
    const ticketId = req.params._id

    // Find ticket by ID using Sequelize
    const ticket = await Ticket.findByPk(ticketId)
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      })
    }

    // Delete ticket record from the database using Sequelize
    await ticket.destroy()

    // Log successful ticket deletion for monitoring
    logger.info('Ticket deleted', { ticketId })

    // Invalidate ticket cache to ensure data consistency
    if (redisConfig.isRedisConnected()) {
      await redisConfig.del('ticket:list:*')
      await redisConfig.del(
        redisConfig.generateKey('ticket', 'detail', ticketId)
      )
    }

    // Return successful deletion response
    res.status(200).json({
      success: true,
      message: 'Ticket deleted successfully'
    })
  } catch (error) {
    // Log error and return failure response
    logger.error('Ticket deletion failed', { error: error.message })
    res.status(500).json({
      success: false,
      message: 'Error deleting ticket',
      error: error.message
    })
  }
}
