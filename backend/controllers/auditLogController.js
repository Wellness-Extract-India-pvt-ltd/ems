/**
 * @fileoverview Audit Log Controller for Enterprise-Level Audit Trail
 * @description Comprehensive audit log management with advanced filtering, 
 * search, export capabilities, and compliance features.
 * 
 * @author EMS Development Team
 * @version 1.0.0
 * @since 2025-09-23
 */

import { validationResult } from 'express-validator'
import { Op } from 'sequelize'
import sequelize from '../database/connection.js'
import AuditLog from '../models/AuditLog.js'
import UserRoleMap from '../models/UserRoleMap.js'
import logger from '../utils/logger.js'
import redisConfig from '../config/redis.js'

/**
 * Get paginated audit logs with advanced filtering and search
 * 
 * @async
 * @function getAuditLogs
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {Object} req.query - Query parameters for filtering and pagination
 * @param {Object} res - Express response object
 * 
 * @returns {Promise<void>} JSON response with audit logs and metadata
 */
export const getAuditLogs = async (req, res) => {
  try {
    const userRole = req.user?.role
    const userId = req.user?.id
    
    // Extract query parameters
    const {
      page = 1,
      limit = 50,
      search,
      action,
      resource_type,
      severity,
      status,
      category,
      user_email,
      date_from,
      date_to,
      ip_address,
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = req.query

    // Filter out empty string parameters
    const cleanParams = {
      search: search && search.trim() !== '' ? search.trim() : undefined,
      action: action && action.trim() !== '' ? action.trim() : undefined,
      resource_type: resource_type && resource_type.trim() !== '' ? resource_type.trim() : undefined,
      severity: severity && severity.trim() !== '' ? severity.trim() : undefined,
      status: status && status.trim() !== '' ? status.trim() : undefined,
      category: category && category.trim() !== '' ? category.trim() : undefined,
      user_email: user_email && user_email.trim() !== '' ? user_email.trim() : undefined,
      date_from: date_from && date_from.trim() !== '' ? date_from.trim() : undefined,
      date_to: date_to && date_to.trim() !== '' ? date_to.trim() : undefined,
      ip_address: ip_address && ip_address.trim() !== '' ? ip_address.trim() : undefined
    }

    const offset = (parseInt(page) - 1) * parseInt(limit)

    // Generate cache key for performance optimization
    const cacheKey = redisConfig.generateKey(
      'audit_logs',
      'list',
      userRole,
      userId || 'anonymous',
      page,
      limit,
      search,
      action,
      resource_type,
      severity,
      status,
      category
    )

    // Try to get data from Redis cache first
    if (redisConfig.isRedisConnected()) {
      const cachedData = await redisConfig.get(cacheKey)
      if (cachedData) {
        logger.info('Audit logs served from cache')
        return res.json(cachedData)
      }
    }

    // Build where clause for filtering
    const whereClause = {}

    // Role-based access control
    if (userRole !== 'admin') {
      // Non-admin users can only see their own audit logs
      whereClause.user_id = userId
    }

    // Search functionality
    if (cleanParams.search) {
      whereClause[Op.or] = [
        { user_name: { [Op.iLike]: `%${cleanParams.search}%` } },
        { user_email: { [Op.iLike]: `%${cleanParams.search}%` } },
        { action: { [Op.iLike]: `%${cleanParams.search}%` } },
        { resource_name: { [Op.iLike]: `%${cleanParams.search}%` } },
        { description: { [Op.iLike]: `%${cleanParams.search}%` } }
      ]
    }

    // Filter by action
    if (cleanParams.action) {
      whereClause.action = { [Op.iLike]: `%${cleanParams.action}%` }
    }

    // Filter by resource type
    if (cleanParams.resource_type) {
      whereClause.resource_type = cleanParams.resource_type
    }

    // Filter by severity
    if (cleanParams.severity) {
      whereClause.severity = cleanParams.severity
    }

    // Filter by status
    if (cleanParams.status) {
      whereClause.status = cleanParams.status
    }

    // Filter by category
    if (cleanParams.category) {
      whereClause.category = cleanParams.category
    }

    // Filter by user email
    if (cleanParams.user_email) {
      whereClause.user_email = { [Op.iLike]: `%${cleanParams.user_email}%` }
    }

    // Filter by IP address
    if (cleanParams.ip_address) {
      whereClause.ip_address = { [Op.iLike]: `%${cleanParams.ip_address}%` }
    }

    // Date range filtering
    if (cleanParams.date_from || cleanParams.date_to) {
      whereClause.created_at = {}
      if (cleanParams.date_from) {
        whereClause.created_at[Op.gte] = new Date(cleanParams.date_from)
      }
      if (cleanParams.date_to) {
        whereClause.created_at[Op.lte] = new Date(cleanParams.date_to)
      }
    }

    // Validate sort parameters
    const allowedSortFields = ['created_at', 'user_name', 'action', 'severity', 'status', 'category']
    const sortField = allowedSortFields.includes(sort_by) ? sort_by : 'created_at'
    const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'

    // Retrieve audit logs with pagination
    const { count, rows: auditLogs } = await AuditLog.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset,
      order: [[sortField, sortDirection]],
      attributes: [
        'id',
        'user_name',
        'user_email',
        'user_role',
        'action',
        'resource_type',
        'resource_id',
        'resource_name',
        'description',
        'old_values',
        'new_values',
        'ip_address',
        'severity',
        'status',
        'category',
        'tags',
        'is_sensitive',
        'created_at',
        'updated_at'
      ]
    })

    // Calculate pagination metadata
    const totalPages = Math.ceil(count / parseInt(limit))
    const hasNextPage = parseInt(page) < totalPages
    const hasPrevPage = parseInt(page) > 1

    // Prepare response
    const result = {
      success: true,
      data: {
        audit_logs: auditLogs,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_records: count,
          limit: parseInt(limit),
          has_next_page: hasNextPage,
          has_prev_page: hasPrevPage
        },
        filters: {
          search: cleanParams.search || '',
          action: cleanParams.action || '',
          resource_type: cleanParams.resource_type || '',
          severity: cleanParams.severity || '',
          status: cleanParams.status || '',
          category: cleanParams.category || '',
          user_email: cleanParams.user_email || '',
          date_from: cleanParams.date_from || '',
          date_to: cleanParams.date_to || '',
          ip_address: cleanParams.ip_address || ''
        },
        sort: {
          field: sortField,
          order: sortDirection
        }
      }
    }

    // Cache the result for 5 minutes
    if (redisConfig.isRedisConnected()) {
      await redisConfig.set(cacheKey, result, 300)
    }

    res.status(200).json(result)

  } catch (error) {
    logger.error('Failed to retrieve audit logs', {
      userId: req.user?.id,
      error: error.message,
      stack: error.stack
    })

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve audit logs',
      message: error.message
    })
  }
}

/**
 * Get audit log statistics and analytics
 * 
 * @async
 * @function getAuditLogStats
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * 
 * @returns {Promise<void>} JSON response with audit log statistics
 */
export const getAuditLogStats = async (req, res) => {
  try {
    const userRole = req.user?.role
    const userId = req.user?.id

    // Build base where clause for role-based access
    const baseWhereClause = userRole === 'admin' ? {} : { user_id: userId }

    // Get statistics for the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const [
      totalLogs,
      logsByAction,
      logsBySeverity,
      logsByStatus,
      logsByCategory,
      logsByUser,
      recentActivity,
      securityEvents
    ] = await Promise.all([
      // Total logs count
      AuditLog.count({
        where: {
          ...baseWhereClause,
          created_at: { [Op.gte]: thirtyDaysAgo }
        }
      }),

      // Logs by action
      AuditLog.findAll({
        where: {
          ...baseWhereClause,
          created_at: { [Op.gte]: thirtyDaysAgo }
        },
        attributes: [
          'action',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['action'],
        order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
        limit: 10
      }),

      // Logs by severity
      AuditLog.findAll({
        where: {
          ...baseWhereClause,
          created_at: { [Op.gte]: thirtyDaysAgo }
        },
        attributes: [
          'severity',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['severity']
      }),

      // Logs by status
      AuditLog.findAll({
        where: {
          ...baseWhereClause,
          created_at: { [Op.gte]: thirtyDaysAgo }
        },
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['status']
      }),

      // Logs by category
      AuditLog.findAll({
        where: {
          ...baseWhereClause,
          created_at: { [Op.gte]: thirtyDaysAgo }
        },
        attributes: [
          'category',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['category'],
        order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
        limit: 10
      }),

      // Logs by user
      AuditLog.findAll({
        where: {
          ...baseWhereClause,
          created_at: { [Op.gte]: thirtyDaysAgo }
        },
        attributes: [
          'user_name',
          'user_email',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['user_name', 'user_email'],
        order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
        limit: 10
      }),

      // Recent activity (last 24 hours)
      AuditLog.count({
        where: {
          ...baseWhereClause,
          created_at: { [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }
      }),

      // Security events (high severity or security category)
      AuditLog.count({
        where: {
          ...baseWhereClause,
          created_at: { [Op.gte]: thirtyDaysAgo },
          [Op.or]: [
            { severity: { [Op.in]: ['HIGH', 'CRITICAL'] } },
            { category: 'SECURITY_EVENT' }
          ]
        }
      })
    ])

    res.status(200).json({
      success: true,
      data: {
        summary: {
          total_logs: totalLogs,
          recent_activity: recentActivity,
          security_events: securityEvents
        },
        breakdown: {
          by_action: logsByAction,
          by_severity: logsBySeverity,
          by_status: logsByStatus,
          by_category: logsByCategory,
          by_user: logsByUser
        }
      }
    })

  } catch (error) {
    logger.error('Failed to retrieve audit log statistics', {
      userId: req.user?.id,
      error: error.message
    })

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve audit log statistics',
      message: error.message
    })
  }
}

/**
 * Export audit logs to CSV format
 * 
 * @async
 * @function exportAuditLogs
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * 
 * @returns {Promise<void>} CSV file download
 */
export const exportAuditLogs = async (req, res) => {
  try {
    const userRole = req.user?.role
    const userId = req.user?.id

    // Build where clause for role-based access
    const whereClause = userRole === 'admin' ? {} : { user_id: userId }

    // Get audit logs for export
    const auditLogs = await AuditLog.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit: 10000 // Limit to prevent memory issues
    })

    // Generate CSV content
    const csvHeaders = [
      'ID',
      'User Name',
      'User Email',
      'User Role',
      'Action',
      'Resource Type',
      'Resource ID',
      'Resource Name',
      'Description',
      'IP Address',
      'Severity',
      'Status',
      'Category',
      'Created At'
    ]

    const csvRows = auditLogs.map(log => [
      log.id,
      log.user_name,
      log.user_email,
      log.user_role,
      log.action,
      log.resource_type,
      log.resource_id || '',
      log.resource_name || '',
      log.description || '',
      log.ip_address || '',
      log.severity,
      log.status,
      log.category,
      log.created_at
    ])

    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    // Set response headers for CSV download
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="audit_logs_${new Date().toISOString().split('T')[0]}.csv"`)
    
    res.status(200).send(csvContent)

  } catch (error) {
    logger.error('Failed to export audit logs', {
      userId: req.user?.id,
      error: error.message
    })

    res.status(500).json({
      success: false,
      error: 'Failed to export audit logs',
      message: error.message
    })
  }
}

/**
 * Create a new audit log entry
 * 
 * @async
 * @function createAuditLog
 * @param {Object} logData - Audit log data
 * @param {Object} req - Express request object (optional)
 * 
 * @returns {Promise<Object>} Created audit log entry
 */
export const createAuditLog = async (logData, req = null) => {
  try {
    // Extract user information from request if available
    const userInfo = req?.user ? {
      user_id: req.user.id,
      user_name: req.user.name || req.user.first_name + ' ' + req.user.last_name,
      user_email: req.user.email,
      user_role: req.user.role,
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      session_id: req.sessionID
    } : {}

    // Create audit log entry
    const auditLog = await AuditLog.create({
      ...logData,
      ...userInfo,
      created_at: new Date(),
      updated_at: new Date()
    })

    logger.info('Audit log created', {
      auditLogId: auditLog.id,
      action: auditLog.action,
      userId: auditLog.user_id
    })

    return auditLog

  } catch (error) {
    logger.error('Failed to create audit log', {
      error: error.message,
      logData
    })
    throw error
  }
}

/**
 * Clean up old audit logs based on retention policy
 * 
 * @async
 * @function cleanupAuditLogs
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * 
 * @returns {Promise<void>} JSON response with cleanup results
 */
export const cleanupAuditLogs = async (req, res) => {
  try {
    const { retention_days = 365 } = req.body

    // Calculate cutoff date
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - retention_days)

    // Delete old audit logs
    const deletedCount = await AuditLog.destroy({
      where: {
        created_at: { [Op.lt]: cutoffDate },
        is_sensitive: false // Don't delete sensitive logs
      }
    })

    logger.info('Audit logs cleanup completed', {
      deletedCount,
      retentionDays: retention_days,
      cutoffDate
    })

    res.status(200).json({
      success: true,
      message: `Cleaned up ${deletedCount} audit log entries`,
      data: {
        deleted_count: deletedCount,
        retention_days,
        cutoff_date: cutoffDate
      }
    })

  } catch (error) {
    logger.error('Failed to cleanup audit logs', {
      error: error.message
    })

    res.status(500).json({
      success: false,
      error: 'Failed to cleanup audit logs',
      message: error.message
    })
  }
}
