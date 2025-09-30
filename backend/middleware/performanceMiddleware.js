/**
 * @fileoverview Performance Monitoring Middleware
 * @description Comprehensive performance monitoring with metrics collection,
 * slow query detection, and performance optimization insights
 * @author EMS Development Team
 * @version 1.0.0
 */

import logger from '../utils/logger.js'
import { performance } from 'perf_hooks'

/**
 * Performance metrics storage
 */
const performanceMetrics = {
  requests: new Map(),
  slowQueries: [],
  memoryUsage: [],
  responseTimes: []
}

/**
 * Performance monitoring middleware
 * @param {Object} options - Monitoring options
 * @param {number} options.slowThreshold - Slow request threshold in ms
 * @param {boolean} options.trackMemory - Track memory usage
 * @param {boolean} options.trackQueries - Track database queries
 * @returns {Function} Express middleware function
 */
export function performanceMiddleware (options = {}) {
  const {
    slowThreshold = 1000, // 1 second
    trackMemory = true
  } = options

  return (req, res, next) => {
    const startTime = performance.now()
    const startMemory = process.memoryUsage()
    const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Store request start data
    performanceMetrics.requests.set(requestId, {
      startTime,
      startMemory,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    })

    // Override res.json to capture response metrics
    const originalJson = res.json
    res.json = function (data) {
      const endTime = performance.now()
      const endMemory = process.memoryUsage()
      const responseTime = endTime - startTime
      const memoryDelta = {
        rss: endMemory.rss - startMemory.rss,
        heapUsed: endMemory.heapUsed - startMemory.heapUsed,
        heapTotal: endMemory.heapTotal - startMemory.heapTotal,
        external: endMemory.external - startMemory.external
      }

      // Log performance metrics
      const metrics = {
        requestId,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        responseTime: Math.round(responseTime * 100) / 100,
        memoryDelta,
        timestamp: new Date().toISOString()
      }

      // Log all requests
      logger.performance('Request completed', metrics)

      // Track response times
      performanceMetrics.responseTimes.push({
        ...metrics,
        timestamp: Date.now()
      })

      // Keep only last 1000 response times
      if (performanceMetrics.responseTimes.length > 1000) {
        performanceMetrics.responseTimes = performanceMetrics.responseTimes.slice(-1000)
      }

      // Track slow requests
      if (responseTime > slowThreshold) {
        const slowRequest = {
          ...metrics,
          slowThreshold,
          isSlow: true
        }

        performanceMetrics.slowQueries.push(slowRequest)
        logger.warn('Slow request detected', slowRequest)

        // Keep only last 100 slow queries
        if (performanceMetrics.slowQueries.length > 100) {
          performanceMetrics.slowQueries = performanceMetrics.slowQueries.slice(-100)
        }
      }

      // Track memory usage if enabled
      if (trackMemory) {
        performanceMetrics.memoryUsage.push({
          timestamp: Date.now(),
          rss: endMemory.rss,
          heapUsed: endMemory.heapUsed,
          heapTotal: endMemory.heapTotal,
          external: endMemory.external,
          arrayBuffers: endMemory.arrayBuffers
        })

        // Keep only last 1000 memory snapshots
        if (performanceMetrics.memoryUsage.length > 1000) {
          performanceMetrics.memoryUsage = performanceMetrics.memoryUsage.slice(-1000)
        }
      }

      // Clean up request data
      performanceMetrics.requests.delete(requestId)

      return originalJson.call(this, data)
    }

    next()
  }
}

/**
 * Database query performance monitoring
 * @param {Object} sequelize - Sequelize instance
 */
export function monitorDatabasePerformance (sequelize) {
  // Monitor all database queries
  sequelize.addHook('beforeQuery', (options) => {
    options.startTime = performance.now()
  })

  sequelize.addHook('afterQuery', (options) => {
    const endTime = performance.now()
    const queryTime = endTime - options.startTime

    const queryMetrics = {
      sql: options.sql?.substring(0, 200) + '...',
      type: options.type,
      queryTime: Math.round(queryTime * 100) / 100,
      timestamp: new Date().toISOString()
    }

    // Log slow queries
    if (queryTime > 500) { // 500ms threshold
      logger.warn('Slow database query detected', queryMetrics)
    } else {
      logger.debug('Database query executed', queryMetrics)
    }
  })
}

/**
 * Get performance statistics
 * @returns {Object} Performance statistics
 */
export function getPerformanceStats () {
  const now = Date.now()
  const oneHourAgo = now - (60 * 60 * 1000)

  // Filter recent data
  const recentResponseTimes = performanceMetrics.responseTimes.filter(
    rt => rt.timestamp > oneHourAgo
  )
  const recentMemoryUsage = performanceMetrics.memoryUsage.filter(
    mu => mu.timestamp > oneHourAgo
  )

  // Calculate statistics
  const avgResponseTime = recentResponseTimes.length > 0
    ? recentResponseTimes.reduce((sum, rt) => sum + rt.responseTime, 0) / recentResponseTimes.length
    : 0

  const maxResponseTime = recentResponseTimes.length > 0
    ? Math.max(...recentResponseTimes.map(rt => rt.responseTime))
    : 0

  const slowRequestsCount = performanceMetrics.slowQueries.filter(
    sq => sq.timestamp > oneHourAgo
  ).length

  const currentMemory = process.memoryUsage()
  const avgMemoryUsage = recentMemoryUsage.length > 0
    ? recentMemoryUsage.reduce((sum, mu) => sum + mu.heapUsed, 0) / recentMemoryUsage.length
    : currentMemory.heapUsed

  return {
    timestamp: new Date().toISOString(),
    requests: {
      total: recentResponseTimes.length,
      averageResponseTime: Math.round(avgResponseTime * 100) / 100,
      maxResponseTime: Math.round(maxResponseTime * 100) / 100,
      slowRequests: slowRequestsCount
    },
    memory: {
      current: {
        rss: currentMemory.rss,
        heapUsed: currentMemory.heapUsed,
        heapTotal: currentMemory.heapTotal,
        external: currentMemory.external
      },
      average: Math.round(avgMemoryUsage / 1024 / 1024 * 100) / 100 // MB
    },
    system: {
      uptime: process.uptime(),
      cpuUsage: process.cpuUsage(),
      platform: process.platform,
      nodeVersion: process.version
    },
    activeRequests: performanceMetrics.requests.size
  }
}

/**
 * Get slow queries report
 * @param {number} limit - Maximum number of slow queries to return
 * @returns {Array} Slow queries
 */
export function getSlowQueries (limit = 50) {
  return performanceMetrics.slowQueries
    .sort((a, b) => b.responseTime - a.responseTime)
    .slice(0, limit)
}

/**
 * Clear performance metrics
 */
export function clearPerformanceMetrics () {
  performanceMetrics.requests.clear()
  performanceMetrics.slowQueries.length = 0
  performanceMetrics.memoryUsage.length = 0
  performanceMetrics.responseTimes.length = 0

  logger.info('Performance metrics cleared')
}

/**
 * Health check based on performance metrics
 * @returns {Object} Health status
 */
export function getPerformanceHealth () {
  const stats = getPerformanceStats()
  const isHealthy = stats.requests.averageResponseTime < 2000 && // Less than 2 seconds
                   stats.requests.slowRequests < 10 && // Less than 10 slow requests
                   stats.memory.average < 500 // Less than 500MB average

  return {
    healthy: isHealthy,
    status: isHealthy ? 'OK' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    metrics: stats,
    recommendations: isHealthy
      ? []
      : [
          'Consider optimizing slow queries',
          'Monitor memory usage',
          'Check for resource bottlenecks'
        ]
  }
}

export default {
  performanceMiddleware,
  monitorDatabasePerformance,
  getPerformanceStats,
  getSlowQueries,
  clearPerformanceMetrics,
  getPerformanceHealth
}
