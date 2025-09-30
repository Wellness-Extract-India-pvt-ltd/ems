import { validationResult } from 'express-validator'
import { Op } from 'sequelize'
import sequelize from '../database/connection.js'

// Import models
import UserRoleMap from '../models/UserRoleMap.js'
import Employee from '../models/Employee.js'
import Hardware from '../models/Hardware.js'
import Software from '../models/Software.js'
import License from '../models/License.js'
import Ticket from '../models/Ticket.js'
import BiometricEmployee from '../models/BiometricEmployee.js'
import Chat from '../models/Chat.js'

// Import logger
import logger from '../utils/logger.js'

/**
 * Gets dashboard statistics for the authenticated user
 * 
 * @async
 * @function getDashboardStats
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {Object} res - Express response object
 * 
 * @returns {Promise<void>} JSON response with dashboard statistics
 */
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id
    const userRole = req.user.role

    logger.info('Fetching dashboard stats', {
      userId,
      userRole
    })

    // Get current date for time-based calculations
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // Initialize stats object
    const stats = {
      employees: {
        total: 0,
        active: 0,
        newThisMonth: 0,
        newThisWeek: 0
      },
      assets: {
        total: 0,
        assigned: 0,
        available: 0,
        maintenance: 0
      },
      software: {
        total: 0,
        installed: 0,
        available: 0
      },
      licenses: {
        total: 0,
        active: 0,
        expiringSoon: 0,
        expired: 0
      },
      tickets: {
        total: 0,
        open: 0,
        inProgress: 0,
        resolved: 0,
        newToday: 0
      },
      biometrics: {
        totalEmployees: 0,
        activeToday: 0,
        activeThisWeek: 0
      },
      chat: {
        totalSessions: 0,
        messagesToday: 0,
        activeUsers: 0
      }
    }

    // Employee Statistics
    try {
      const employeeStats = await Employee.findAll({
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
          [sequelize.fn('COUNT', sequelize.literal("CASE WHEN status = 'Active' THEN 1 END")), 'active'],
          [sequelize.fn('COUNT', sequelize.literal(`CASE WHEN created_at >= '${startOfMonth.toISOString()}' THEN 1 END`)), 'newThisMonth'],
          [sequelize.fn('COUNT', sequelize.literal(`CASE WHEN created_at >= '${startOfWeek.toISOString()}' THEN 1 END`)), 'newThisWeek']
        ],
        raw: true
      })

      if (employeeStats[0]) {
        stats.employees.total = parseInt(employeeStats[0].total) || 0
        stats.employees.active = parseInt(employeeStats[0].active) || 0
        stats.employees.newThisMonth = parseInt(employeeStats[0].newThisMonth) || 0
        stats.employees.newThisWeek = parseInt(employeeStats[0].newThisWeek) || 0
      }
    } catch (error) {
      logger.error('Error fetching employee stats', { error: error.message })
    }

    // Hardware Statistics
    try {
      const assetStats = await Hardware.findAll({
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
          [sequelize.fn('COUNT', sequelize.literal('CASE WHEN status = "Assigned" THEN 1 END')), 'assigned'],
          [sequelize.fn('COUNT', sequelize.literal('CASE WHEN status = "Available" THEN 1 END')), 'available'],
          [sequelize.fn('COUNT', sequelize.literal('CASE WHEN status = "Maintenance" THEN 1 END')), 'maintenance']
        ],
        raw: true
      })

      if (assetStats[0]) {
        stats.assets.total = parseInt(assetStats[0].total) || 0
        stats.assets.assigned = parseInt(assetStats[0].assigned) || 0
        stats.assets.available = parseInt(assetStats[0].available) || 0
        stats.assets.maintenance = parseInt(assetStats[0].maintenance) || 0
      }
    } catch (error) {
      logger.error('Error fetching asset stats', { error: error.message })
    }

    // Software Statistics
    try {
      const softwareStats = await Software.findAll({
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
          [sequelize.fn('COUNT', sequelize.literal('CASE WHEN status = "Active" THEN 1 END')), 'installed'],
          [sequelize.fn('COUNT', sequelize.literal('CASE WHEN status = "Inactive" THEN 1 END')), 'available']
        ],
        raw: true
      })

      if (softwareStats[0]) {
        stats.software.total = parseInt(softwareStats[0].total) || 0
        stats.software.installed = parseInt(softwareStats[0].installed) || 0
        stats.software.available = parseInt(softwareStats[0].available) || 0
      }
    } catch (error) {
      logger.error('Error fetching software stats', { error: error.message })
    }

    // License Statistics
    try {
      const licenseStats = await License.findAll({
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
          [sequelize.fn('COUNT', sequelize.literal('CASE WHEN status = "Active" THEN 1 END')), 'active'],
          [sequelize.fn('COUNT', sequelize.literal(`CASE WHEN expiration_date BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 30 DAY) THEN 1 END`)), 'expiringSoon'],
          [sequelize.fn('COUNT', sequelize.literal('CASE WHEN status = "Expired" OR expiration_date < NOW() THEN 1 END')), 'expired']
        ],
        raw: true
      })

      if (licenseStats[0]) {
        stats.licenses.total = parseInt(licenseStats[0].total) || 0
        stats.licenses.active = parseInt(licenseStats[0].active) || 0
        stats.licenses.expiringSoon = parseInt(licenseStats[0].expiringSoon) || 0
        stats.licenses.expired = parseInt(licenseStats[0].expired) || 0
      }
    } catch (error) {
      logger.error('Error fetching license stats', { error: error.message })
    }

    // Ticket Statistics
    try {
      const ticketStats = await Ticket.findAll({
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
          [sequelize.fn('COUNT', sequelize.literal('CASE WHEN status = "Open" THEN 1 END')), 'open'],
          [sequelize.fn('COUNT', sequelize.literal('CASE WHEN status = "In Progress" THEN 1 END')), 'inProgress'],
          [sequelize.fn('COUNT', sequelize.literal('CASE WHEN status = "Resolved" OR status = "Closed" THEN 1 END')), 'resolved'],
          [sequelize.fn('COUNT', sequelize.literal(`CASE WHEN created_at >= '${startOfDay.toISOString()}' THEN 1 END`)), 'newToday']
        ],
        raw: true
      })

      if (ticketStats[0]) {
        stats.tickets.total = parseInt(ticketStats[0].total) || 0
        stats.tickets.open = parseInt(ticketStats[0].open) || 0
        stats.tickets.inProgress = parseInt(ticketStats[0].inProgress) || 0
        stats.tickets.resolved = parseInt(ticketStats[0].resolved) || 0
        stats.tickets.newToday = parseInt(ticketStats[0].newToday) || 0
      }
    } catch (error) {
      logger.error('Error fetching ticket stats', { error: error.message })
    }

    // Biometric Statistics
    try {
      const biometricStats = await BiometricEmployee.findAll({
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'totalEmployees'],
          [sequelize.fn('COUNT', sequelize.literal(`CASE WHEN DATE(last_activity) = CURDATE() THEN 1 END`)), 'activeToday'],
          [sequelize.fn('COUNT', sequelize.literal(`CASE WHEN last_activity >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END`)), 'activeThisWeek']
        ],
        raw: true
      })

      if (biometricStats[0]) {
        stats.biometrics.totalEmployees = parseInt(biometricStats[0].totalEmployees) || 0
        stats.biometrics.activeToday = parseInt(biometricStats[0].activeToday) || 0
        stats.biometrics.activeThisWeek = parseInt(biometricStats[0].activeThisWeek) || 0
      }
    } catch (error) {
      logger.error('Error fetching biometric stats', { error: error.message })
    }

    // Chat Statistics
    try {
      const chatStats = await Chat.findAll({
        attributes: [
          [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('session_id'))), 'totalSessions'],
          [sequelize.fn('COUNT', sequelize.literal(`CASE WHEN DATE(created_at) = CURDATE() THEN 1 END`)), 'messagesToday'],
          [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('user_id'))), 'activeUsers']
        ],
        where: {
          is_active: true
        },
        raw: true
      })

      if (chatStats[0]) {
        stats.chat.totalSessions = parseInt(chatStats[0].totalSessions) || 0
        stats.chat.messagesToday = parseInt(chatStats[0].messagesToday) || 0
        stats.chat.activeUsers = parseInt(chatStats[0].activeUsers) || 0
      }
    } catch (error) {
      logger.error('Error fetching chat stats', { error: error.message })
    }

    logger.info('Dashboard stats fetched successfully', {
      userId,
      stats
    })

    res.status(200).json({
      success: true,
      data: {
        stats,
        lastUpdated: new Date().toISOString()
      }
    })

  } catch (error) {
    logger.error('Failed to fetch dashboard stats', {
      userId: req.user?.id,
      error: error.message
    })

    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics',
      message: error.message
    })
  }
}
