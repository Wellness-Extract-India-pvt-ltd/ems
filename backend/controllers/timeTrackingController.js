import { validationResult } from 'express-validator'
import { Op } from 'sequelize'
import { TimeTracking, UserRoleMap, Employee } from '../models/index.js'
import sequelize from '../database/connection.js'
import logger from '../utils/logger.js'

/**
 * @route POST /api/v1/time-tracking/test-checkin
 * @desc Test endpoint for check-in without validation
 * @access Private
 */
export const testCheckIn = async (req, res) => {
  try {
    logger.info('Test check-in request', {
      body: req.body,
      user: req.user
    })
    
    const today = new Date().toISOString().split('T')[0]
    const now = new Date()
    
    const timeTrackingData = {
      user_id: req.user.id,
      employee_id: req.user.employee_id || null,
      check_in_time: now,
      work_date: today,
      status: 'checked_in',
      is_manual: false
    }
    
    const timeTracking = await TimeTracking.create(timeTrackingData)
    
    res.status(200).json({
      success: true,
      data: {
        message: 'Test check-in successful',
        sessionId: timeTracking.id
      }
    })
  } catch (error) {
    logger.error('Test check-in failed', {
      error: error.message,
      userId: req.user?.id
    })
    
    res.status(500).json({
      success: false,
      error: 'Test check-in failed',
      message: error.message
    })
  }
}

/**
 * @route GET /api/v1/time-tracking/status
 * @desc Get current time tracking status for the user
 * @access Private
 */
export const getTimeTrackingStatus = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]
    
    const currentSession = await TimeTracking.findOne({
      where: {
        user_id: req.user.id,
        work_date: today,
        is_active: true
      },
      include: [
        {
          model: UserRoleMap,
          as: 'user',
          attributes: ['id', 'email', 'role', 'employee_id']
        }
      ],
      order: [['created_at', 'DESC']]
    })

    if (!currentSession) {
      return res.status(200).json({
        success: true,
        data: {
          status: 'checked_out',
          currentSession: null,
          todayHours: 0,
          canCheckIn: true,
          canCheckOut: false
        }
      })
    }

    // Calculate today's total hours
    const todayHours = await TimeTracking.findAll({
      where: {
        user_id: req.user.id,
        work_date: today,
        is_active: true
      },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('total_hours')), 'totalHours']
      ],
      raw: true
    })

    const totalHours = parseFloat(todayHours[0]?.totalHours || 0)

    res.status(200).json({
      success: true,
      data: {
        status: currentSession.status,
        currentSession: {
          id: currentSession.id,
          checkInTime: currentSession.check_in_time,
          checkOutTime: currentSession.check_out_time,
          totalHours: currentSession.total_hours,
          breakDuration: currentSession.break_duration,
          overtimeHours: currentSession.overtime_hours,
          notes: currentSession.notes,
          location: currentSession.check_in_location
        },
        todayHours: totalHours,
        canCheckIn: currentSession.status === 'checked_out',
        canCheckOut: currentSession.status === 'checked_in'
      }
    })

  } catch (error) {
    logger.error('Failed to get time tracking status', {
      error: error.message,
      userId: req.user?.id
    })

    res.status(500).json({
      success: false,
      error: 'Failed to get time tracking status',
      message: error.message
    })
  }
}

/**
 * @route POST /api/v1/time-tracking/check-in
 * @desc Check in for work
 * @access Private
 */
export const checkIn = async (req, res) => {
  try {
    // Log the incoming request for debugging
    logger.info('Check-in request received', {
      body: req.body,
      headers: req.headers,
      userId: req.user?.id
    })
    
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      logger.error('Validation errors in check-in', {
        errors: errors.array(),
        body: req.body,
        userId: req.user?.id
      })
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      })
    }

    const { location, notes, deviceInfo } = req.body
    
    // Validate user object
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
        message: 'User authentication required'
      })
    }
    
    // Check if user has employee_id (required for time tracking)
    if (!req.user.employee_id) {
      logger.warn('User missing employee_id', {
        userId: req.user.id,
        userEmail: req.user.email,
        userRole: req.user.role
      })
      // Don't fail the request, just log a warning
    }
    
    logger.info('Check-in request', {
      userId: req.user.id,
      employeeId: req.user.employee_id,
      hasLocation: !!location,
      hasNotes: !!notes
    })
    
    const today = new Date().toISOString().split('T')[0]
    const now = new Date()

    // Check if user is already checked in
    const existingSession = await TimeTracking.findOne({
      where: {
        user_id: req.user.id,
        work_date: today,
        status: 'checked_in',
        is_active: true
      }
    })

    if (existingSession) {
      return res.status(400).json({
        success: false,
        error: 'Already checked in',
        message: 'You are already checked in for today'
      })
    }

    // Get client information
    const ip_address = req.ip || req.connection.remoteAddress
    const user_agent = req.get('User-Agent')

    // Create new time tracking session
    const timeTrackingData = {
      user_id: req.user.id,
      employee_id: req.user.employee_id || null, // Allow null if not available
      check_in_time: now,
      check_in_location: location,
      work_date: today,
      status: 'checked_in',
      notes,
      ip_address,
      user_agent,
      device_info: deviceInfo,
      is_manual: false
    }
    
    logger.info('Creating time tracking session', {
      userId: req.user.id,
      workDate: today,
      hasLocation: !!location,
      timeTrackingData: timeTrackingData
    })
    
    let timeTracking
    try {
      timeTracking = await TimeTracking.create(timeTrackingData)
      logger.info('Time tracking session created successfully', {
        sessionId: timeTracking.id,
        userId: req.user.id
      })
    } catch (createError) {
      logger.error('Failed to create time tracking session', {
        error: createError.message,
        userId: req.user.id,
        timeTrackingData: timeTrackingData
      })
      throw createError
    }

    // Fetch the created session with user information
    const createdSession = await TimeTracking.findByPk(timeTracking.id, {
      include: [
        {
          model: UserRoleMap,
          as: 'user',
          attributes: ['id', 'email', 'role', 'employee_id']
        }
      ]
    })

    logger.info('User checked in', {
      userId: req.user.id,
      employeeId: req.user.employee_id,
      checkInTime: now,
      location: location ? `${location.latitude}, ${location.longitude}` : 'Not provided'
    })

    res.status(201).json({
      success: true,
      data: {
        session: {
          id: createdSession.id,
          checkInTime: createdSession.check_in_time,
          status: createdSession.status,
          location: createdSession.check_in_location,
          notes: createdSession.notes
        },
        message: 'Successfully checked in'
      }
    })

  } catch (error) {
    logger.error('Failed to check in', {
      error: error.message,
      userId: req.user?.id
    })

    res.status(500).json({
      success: false,
      error: 'Failed to check in',
      message: error.message
    })
  }
}

/**
 * @route POST /api/v1/time-tracking/check-out
 * @desc Check out from work
 * @access Private
 */
export const checkOut = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      })
    }

    const { location, notes } = req.body
    const today = new Date().toISOString().split('T')[0]
    const now = new Date()

    // Find current active session
    const currentSession = await TimeTracking.findOne({
      where: {
        user_id: req.user.id,
        work_date: today,
        status: 'checked_in',
        is_active: true
      }
    })

    if (!currentSession) {
      return res.status(400).json({
        success: false,
        error: 'Not checked in',
        message: 'You are not currently checked in'
      })
    }

    // Calculate total hours worked
    const checkInTime = new Date(currentSession.check_in_time)
    const totalHours = (now - checkInTime) / (1000 * 60 * 60) // Convert to hours
    const overtimeHours = Math.max(0, totalHours - 8) // Assuming 8 hours is standard

    // Update the session
    await currentSession.update({
      check_out_time: now,
      check_out_location: location,
      total_hours: parseFloat(totalHours.toFixed(2)),
      overtime_hours: parseFloat(overtimeHours.toFixed(2)),
      status: 'checked_out',
      notes: notes || currentSession.notes
    })

    logger.info('User checked out', {
      userId: req.user.id,
      employeeId: req.user.employee_id,
      checkOutTime: now,
      totalHours: totalHours.toFixed(2),
      overtimeHours: overtimeHours.toFixed(2),
      location: location ? `${location.latitude}, ${location.longitude}` : 'Not provided'
    })

    res.status(200).json({
      success: true,
      data: {
        session: {
          id: currentSession.id,
          checkInTime: currentSession.check_in_time,
          checkOutTime: now,
          totalHours: parseFloat(totalHours.toFixed(2)),
          overtimeHours: parseFloat(overtimeHours.toFixed(2)),
          status: 'checked_out'
        },
        message: 'Successfully checked out'
      }
    })

  } catch (error) {
    logger.error('Failed to check out', {
      error: error.message,
      userId: req.user?.id
    })

    res.status(500).json({
      success: false,
      error: 'Failed to check out',
      message: error.message
    })
  }
}

/**
 * @route GET /api/v1/time-tracking/history
 * @desc Get time tracking history for the user
 * @access Private
 */
export const getTimeTrackingHistory = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      startDate, 
      endDate,
      status 
    } = req.query

    const offset = (parseInt(page) - 1) * parseInt(limit)
    
    // Build where clause
    const whereClause = {
      user_id: req.user.id,
      is_active: true
    }

    if (startDate && endDate) {
      whereClause.work_date = {
        [Op.between]: [startDate, endDate]
      }
    }

    if (status) {
      whereClause.status = status
    }

    const { count, rows: sessions } = await TimeTracking.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: UserRoleMap,
          as: 'user',
          attributes: ['id', 'email', 'role', 'employee_id']
        }
      ],
      order: [['work_date', 'DESC'], ['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    })

    res.status(200).json({
      success: true,
      data: {
        sessions: sessions.map(session => ({
          id: session.id,
          workDate: session.work_date,
          checkInTime: session.check_in_time,
          checkOutTime: session.check_out_time,
          totalHours: session.total_hours,
          overtimeHours: session.overtime_hours,
          breakDuration: session.break_duration,
          status: session.status,
          notes: session.notes,
          checkInLocation: session.check_in_location,
          checkOutLocation: session.check_out_location,
          isManual: session.is_manual,
          createdAt: session.created_at
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / parseInt(limit)),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    })

  } catch (error) {
    logger.error('Failed to get time tracking history', {
      error: error.message,
      userId: req.user?.id
    })

    res.status(500).json({
      success: false,
      error: 'Failed to get time tracking history',
      message: error.message
    })
  }
}

/**
 * @route GET /api/v1/time-tracking/team
 * @desc Get team time tracking data (for managers/admins)
 * @access Private
 */
export const getTeamTimeTracking = async (req, res) => {
  try {
    // Check if user has permission to view team data
    if (!['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Permission denied',
        message: 'Only admins and managers can view team time tracking data'
      })
    }

    const { 
      page = 1, 
      limit = 20, 
      startDate, 
      endDate,
      employeeId,
      departmentId 
    } = req.query

    const offset = (parseInt(page) - 1) * parseInt(limit)
    
    // Build where clause
    const whereClause = {
      is_active: true
    }

    if (startDate && endDate) {
      whereClause.work_date = {
        [Op.between]: [startDate, endDate]
      }
    }

    if (employeeId) {
      whereClause.employee_id = employeeId
    }

    const { count, rows: sessions } = await TimeTracking.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: UserRoleMap,
          as: 'user',
          attributes: ['id', 'email', 'role', 'employee_id'],
          include: [
            {
              model: Employee,
              as: 'employee',
              attributes: ['id', 'first_name', 'last_name', 'email', 'department_id'],
              where: departmentId ? { department_id: departmentId } : undefined,
              required: false
            }
          ]
        }
      ],
      order: [['work_date', 'DESC'], ['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    })

    res.status(200).json({
      success: true,
      data: {
        sessions: sessions.map(session => ({
          id: session.id,
          employeeId: session.employee_id,
          employeeName: session.user.employee ? 
            `${session.user.employee.first_name} ${session.user.employee.last_name}` : 
            session.user.email,
          workDate: session.work_date,
          checkInTime: session.check_in_time,
          checkOutTime: session.check_out_time,
          totalHours: session.total_hours,
          overtimeHours: session.overtime_hours,
          status: session.status,
          checkInLocation: session.check_in_location,
          checkOutLocation: session.check_out_location,
          notes: session.notes,
          isManual: session.is_manual,
          createdAt: session.created_at
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / parseInt(limit)),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    })

  } catch (error) {
    logger.error('Failed to get team time tracking', {
      error: error.message,
      userId: req.user?.id
    })

    res.status(500).json({
      success: false,
      error: 'Failed to get team time tracking',
      message: error.message
    })
  }
}

/**
 * @route GET /api/v1/time-tracking/stats
 * @desc Get time tracking statistics
 * @access Private
 */
export const getTimeTrackingStats = async (req, res) => {
  try {
    const { startDate, endDate, employeeId } = req.query
    const userId = employeeId || req.user.id

    const whereClause = {
      user_id: userId,
      is_active: true
    }

    if (startDate && endDate) {
      whereClause.work_date = {
        [Op.between]: [startDate, endDate]
      }
    }

    const stats = await TimeTracking.findAll({
      where: whereClause,
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalSessions'],
        [sequelize.fn('SUM', sequelize.col('total_hours')), 'totalHours'],
        [sequelize.fn('SUM', sequelize.col('overtime_hours')), 'totalOvertime'],
        [sequelize.fn('AVG', sequelize.col('total_hours')), 'averageHours'],
        [sequelize.fn('MAX', sequelize.col('total_hours')), 'maxHours'],
        [sequelize.fn('MIN', sequelize.col('total_hours')), 'minHours']
      ],
      raw: true
    })

    const result = stats[0] || {}

    res.status(200).json({
      success: true,
      data: {
        totalSessions: parseInt(result.totalSessions || 0),
        totalHours: parseFloat(result.totalHours || 0),
        totalOvertime: parseFloat(result.totalOvertime || 0),
        averageHours: parseFloat(result.averageHours || 0),
        maxHours: parseFloat(result.maxHours || 0),
        minHours: parseFloat(result.minHours || 0)
      }
    })

  } catch (error) {
    logger.error('Failed to get time tracking stats', {
      error: error.message,
      userId: req.user?.id
    })

    res.status(500).json({
      success: false,
      error: 'Failed to get time tracking stats',
      message: error.message
    })
  }
}
