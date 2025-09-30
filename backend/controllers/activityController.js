import { validationResult } from 'express-validator'
import { Op } from 'sequelize'
import Activity from '../models/Activity.js'
import UserRoleMap from '../models/UserRoleMap.js'
import sequelize from '../database/connection.js'
import logger from '../utils/logger.js'

/**
 * @route GET /api/v1/activities
 * @desc Get recent activities for the authenticated user
 * @access Private
 */
export const getActivities = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      type, 
      entity_type, 
      severity,
      days = 30 
    } = req.query

    const offset = (parseInt(page) - 1) * parseInt(limit)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(days))

    // Build where clause
    const whereClause = {
      is_active: true,
      is_public: true,
      created_at: {
        [Op.gte]: startDate
      }
    }

    if (type) {
      whereClause.activity_type = type
    }

    if (entity_type) {
      whereClause.entity_type = entity_type
    }

    if (severity) {
      whereClause.severity = severity
    }

    // Get activities with user information
    const { count, rows: activities } = await Activity.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: UserRoleMap,
          as: 'user',
          attributes: ['id', 'email', 'role', 'employee_id'],
          required: true
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    })

    // Transform activities for frontend
    const transformedActivities = activities.map(activity => {
      const activityData = activity.toJSON()
      return {
        id: activityData.id,
        type: activityData.activity_type,
        title: activityData.title,
        description: activityData.description,
        entityType: activityData.entity_type,
        entityId: activityData.entity_id,
        severity: activityData.severity,
        metadata: activityData.metadata,
        timestamp: activityData.created_at,
        user: {
          id: activityData.user.id,
          email: activityData.user.email,
          role: activityData.user.role,
          employeeId: activityData.user.employee_id
        }
      }
    })

    res.status(200).json({
      success: true,
      data: {
        activities: transformedActivities,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / parseInt(limit)),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    })

  } catch (error) {
    logger.error('Failed to fetch activities', {
      error: error.message,
      userId: req.user?.id
    })

    res.status(500).json({
      success: false,
      error: 'Failed to fetch activities',
      message: error.message
    })
  }
}

/**
 * @route POST /api/v1/activities
 * @desc Create a new activity
 * @access Private
 */
export const createActivity = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      })
    }

    const {
      activity_type,
      title,
      description,
      entity_type,
      entity_id,
      metadata,
      severity = 'low',
      is_public = true
    } = req.body

    // Get client information
    const ip_address = req.ip || req.connection.remoteAddress
    const user_agent = req.get('User-Agent')

    const activity = await Activity.create({
      user_id: req.user.id,
      activity_type,
      title,
      description,
      entity_type,
      entity_id,
      metadata,
      severity,
      is_public,
      ip_address,
      user_agent
    })

    // Fetch the created activity with user information
    const createdActivity = await Activity.findByPk(activity.id, {
      include: [
        {
          model: UserRoleMap,
          as: 'user',
          attributes: ['id', 'email', 'role', 'employee_id']
        }
      ]
    })

    res.status(201).json({
      success: true,
      data: {
        activity: {
          id: createdActivity.id,
          type: createdActivity.activity_type,
          title: createdActivity.title,
          description: createdActivity.description,
          entityType: createdActivity.entity_type,
          entityId: createdActivity.entity_id,
          severity: createdActivity.severity,
          metadata: createdActivity.metadata,
          timestamp: createdActivity.created_at,
          user: {
            id: createdActivity.user.id,
            email: createdActivity.user.email,
            role: createdActivity.user.role,
            employeeId: createdActivity.user.employee_id
          }
        }
      }
    })

  } catch (error) {
    logger.error('Failed to create activity', {
      error: error.message,
      userId: req.user?.id,
      activityType: req.body.activity_type
    })

    res.status(500).json({
      success: false,
      error: 'Failed to create activity',
      message: error.message
    })
  }
}

/**
 * @route GET /api/v1/activities/stats
 * @desc Get activity statistics
 * @access Private
 */
export const getActivityStats = async (req, res) => {
  try {
    const { days = 30 } = req.query
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(days))

    const stats = await Activity.findAll({
      where: {
        is_active: true,
        is_public: true,
        created_at: {
          [Op.gte]: startDate
        }
      },
      attributes: [
        'activity_type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['activity_type'],
      raw: true
    })

    const totalActivities = await Activity.count({
      where: {
        is_active: true,
        is_public: true,
        created_at: {
          [Op.gte]: startDate
        }
      }
    })

    res.status(200).json({
      success: true,
      data: {
        stats: stats.map(stat => ({
          type: stat.activity_type,
          count: parseInt(stat.count)
        })),
        totalActivities,
        period: `${days} days`
      }
    })

  } catch (error) {
    logger.error('Failed to fetch activity stats', {
      error: error.message,
      userId: req.user?.id
    })

    res.status(500).json({
      success: false,
      error: 'Failed to fetch activity stats',
      message: error.message
    })
  }
}

/**
 * @route DELETE /api/v1/activities/:id
 * @desc Delete an activity (soft delete)
 * @access Private
 */
export const deleteActivity = async (req, res) => {
  try {
    const { id } = req.params

    const activity = await Activity.findByPk(id)
    if (!activity) {
      return res.status(404).json({
        success: false,
        error: 'Activity not found'
      })
    }

    // Check if user has permission to delete this activity
    if (activity.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Permission denied'
      })
    }

    await activity.update({ is_active: false })

    res.status(200).json({
      success: true,
      message: 'Activity deleted successfully'
    })

  } catch (error) {
    logger.error('Failed to delete activity', {
      error: error.message,
      userId: req.user?.id,
      activityId: req.params.id
    })

    res.status(500).json({
      success: false,
      error: 'Failed to delete activity',
      message: error.message
    })
  }
}
