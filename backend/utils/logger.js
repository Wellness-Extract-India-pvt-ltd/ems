/**
 * @fileoverview Enhanced Logger Configuration for EMS Backend
 * @description Comprehensive logging system with Winston providing structured logging,
 * multiple transports, performance monitoring, security event tracking, and business logic logging.
 * Includes daily log rotation, error handling, and specialized logging methods for different use cases.
 *
 * @author EMS Development Team
 * @version 1.0.0
 * @since 2025-09-17
 *
 * @features
 * - Multi-transport logging (console, files, daily rotation)
 * - Structured JSON logging with timestamps
 * - Custom log levels and colors
 * - HTTP request/response logging
 * - Security event tracking and logging
 * - Performance metrics and monitoring
 * - Database operation logging
 * - Authentication event logging
 * - Business logic event tracking
 * - Child logger creation with default metadata
 * - Uncaught exception and unhandled rejection handling
 * - Log rotation and archival
 * - Environment-specific configurations
 */

// Import Winston for comprehensive logging capabilities
import winston from 'winston'
// Import path utilities for file path management
import path from 'path'
// Import file system utilities for directory creation
import fs from 'fs'
// Import daily rotate file transport for log rotation
import 'winston-daily-rotate-file'

// Logger configuration based on environment variables
const logDir = process.env.LOG_DIR || path.resolve('logs')
const logLevel =
  process.env.LOG_LEVEL ||
  (process.env.NODE_ENV === 'production' ? 'info' : 'debug')
const isDevelopment = process.env.NODE_ENV === 'development'
const isProduction = process.env.NODE_ENV === 'production'

// Ensure log directory exists with proper permissions
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true, mode: 0o755 })
}

/**
 * Custom log levels with priorities and colors for enhanced logging
 * 
 * @description Defines custom log levels with numeric priorities and color coding
 * for better log organization and visual distinction in console output.
 */
const customLevels = {
  error: 0,   // Highest priority - system errors
  warn: 1,    // Warning messages
  info: 2,    // General information
  http: 3,    // HTTP request/response logging
  debug: 4,   // Debug information
  trace: 5    // Lowest priority - detailed tracing
}

/**
 * Color mapping for console output based on log levels
 */
const customColors = {
  error: 'red',     // Red for errors
  warn: 'yellow',   // Yellow for warnings
  info: 'green',    // Green for info
  http: 'magenta',  // Magenta for HTTP logs
  debug: 'blue',    // Blue for debug
  trace: 'cyan'     // Cyan for trace
}

// Register custom colors with Winston
winston.addColors(customColors)

/**
 * Enhanced structured log format for file output
 * 
 * @description Creates structured JSON logs with timestamps, error stack traces,
 * process information, and metadata for comprehensive logging and monitoring.
 */
const structuredFormat = winston.format.combine(
  // Add timestamp to all log entries
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  // Include error stack traces when available
  winston.format.errors({ stack: true }),
  // Convert to JSON format for structured logging
  winston.format.json(),
  // Custom printf formatter for enhanced log structure
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...meta
    }

    // Add stack trace for errors in development environment
    if (stack && isDevelopment) {
      logEntry.stack = stack
    }

    // Add process information for monitoring and debugging
    logEntry.process = {
      pid: process.pid,
      version: process.version,
      platform: process.platform,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      }
    }

    return JSON.stringify(logEntry)
  })
)

/**
 * Console format with colors for development environment
 * 
 * @description Provides colored console output with timestamps and formatted metadata
 * for better readability during development and debugging.
 */
const consoleFormat = winston.format.combine(
  // Add timestamp with shorter format for console
  winston.format.timestamp({ format: 'HH:mm:ss.SSS' }),
  // Include error stack traces when available
  winston.format.errors({ stack: true }),
  // Apply colors to console output
  winston.format.colorize({ all: true }),
  // Custom printf formatter for console display
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let logMessage = `${timestamp} ${level}: ${message}`

    // Add metadata if present (formatted for readability)
    if (Object.keys(meta).length > 0) {
      logMessage += `\n${JSON.stringify(meta, null, 2)}`
    }

    // Add stack trace for errors in development environment
    if (stack && isDevelopment) {
      logMessage += `\n${stack}`
    }

    return logMessage
  })
)

/**
 * HTTP request/response format for API logging
 * 
 * @description Specialized format for logging HTTP requests and responses
 * with detailed request information, response status, and timing data.
 */
const httpFormat = winston.format.combine(
  // Add timestamp to HTTP logs
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  // Custom printf formatter for HTTP-specific logging
  winston.format.printf(
    ({ timestamp, level, message, req, res, responseTime, ...meta }) => {
      const httpLog = {
        timestamp,
        level: level.toUpperCase(),
        message,
        request: {
          method: req?.method,
          url: req?.url,
          headers: req?.headers,
          ip: req?.ip || req?.connection?.remoteAddress,
          userAgent: req?.get ? req.get('User-Agent') : req?.userAgent,
          userId: req?.user?.id
        },
        response: {
          statusCode: res?.statusCode,
          responseTime: responseTime ? `${responseTime}ms` : undefined
        },
        ...meta
      }

      return JSON.stringify(httpLog)
    }
  )
)

/**
 * Security event format for security logging
 * 
 * @description Specialized format for logging security events with severity levels,
 * user information, IP addresses, and event categorization for security monitoring.
 */
const securityFormat = winston.format.combine(
  // Add timestamp to security logs
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  // Custom printf formatter for security-specific logging
  winston.format.printf(
    ({ timestamp, level, message, event, user, ip, userAgent, ...meta }) => {
      const securityLog = {
        timestamp,
        level: level.toUpperCase(),
        message,
        securityEvent: {
          type: event,
          user: user || 'anonymous',
          ip,
          userAgent,
          severity:
            level === 'error' ? 'high' : level === 'warn' ? 'medium' : 'low'
        },
        ...meta
      }

      return JSON.stringify(securityLog)
    }
  )
)

/**
 * Performance metrics format for performance monitoring
 * 
 * @description Specialized format for logging performance metrics including
 * operation duration, memory usage, CPU utilization, and other performance indicators.
 */
const performanceFormat = winston.format.combine(
  // Add timestamp to performance logs
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  // Custom printf formatter for performance-specific logging
  winston.format.printf(
    ({
      timestamp,
      level,
      message,
      operation,
      duration,
      memory,
      cpu,
      ...meta
    }) => {
      const perfLog = {
        timestamp,
        level: level.toUpperCase(),
        message,
        performance: {
          operation,
          duration: duration ? `${duration}ms` : undefined,
          memory: memory ? `${memory}MB` : undefined,
          cpu: cpu ? `${cpu}%` : undefined
        },
        ...meta
      }

      return JSON.stringify(perfLog)
    }
  )
)

/**
 * Create Winston logger with enhanced configuration and multiple transports
 * 
 * @description Configures a comprehensive logging system with multiple transports
 * for different log types, daily rotation, archival, and environment-specific settings.
 */
const logger = winston.createLogger({
  level: logLevel,
  levels: customLevels,
  format: structuredFormat,
  exitOnError: false,
  transports: [
    // Console transport with colored output for development
    new winston.transports.Console({
      format: consoleFormat,
      silent: isProduction && process.env.DISABLE_CONSOLE_LOGS === 'true'
    }),

    // Combined logs (all levels) with 30-day retention
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d',
      maxSize: '20m',
      zippedArchive: true,
      format: structuredFormat
    }),

    // Error logs (errors only) with 14-day retention
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '14d',
      maxSize: '10m',
      zippedArchive: true,
      format: structuredFormat
    }),

    // HTTP request logs with 7-day retention
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, 'http-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'http',
      maxFiles: '7d',
      maxSize: '5m',
      zippedArchive: true,
      format: httpFormat
    }),

    // Security event logs with 90-day retention (longer for compliance)
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, 'security-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '90d', // Keep security logs longer for compliance
      maxSize: '10m',
      zippedArchive: true,
      format: securityFormat
    }),

    // Performance logs with 7-day retention
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, 'performance-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '7d',
      maxSize: '5m',
      zippedArchive: true,
      format: performanceFormat
    })
  ]
})

// Handle uncaught exceptions with dedicated log file
logger.exceptions.handle(
  new winston.transports.DailyRotateFile({
    filename: path.join(logDir, 'exceptions-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxFiles: '14d',
    maxSize: '10m',
    zippedArchive: true,
    format: structuredFormat
  })
)

// Handle unhandled promise rejections with comprehensive logging
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection', {
    reason: reason instanceof Error ? reason.message : reason,
    stack: reason instanceof Error ? reason.stack : undefined,
    promise: promise.toString()
  })
  throw reason
})

/**
 * Enhanced logging methods with specialized functionality
 * 
 * @description Provides specialized logging methods for different use cases
 * including HTTP requests, security events, performance metrics, and business logic.
 */

/**
 * Log HTTP request/response with detailed information
 * 
 * @function logger.http
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {number} responseTime - Response time in milliseconds
 * @param {Object} meta - Additional metadata
 * 
 * @description Logs HTTP requests and responses with request details,
 * response status, timing information, and user context for API monitoring.
 * 
 * @example
 * // Log HTTP request in middleware
 * logger.http(req, res, responseTime, { userId: req.user?.id });
 */
logger.http = (req, res, responseTime, meta = {}) => {
  logger.log('http', 'HTTP Request', {
    req,
    res,
    responseTime,
    ...meta
  })
}

/**
 * Log security events with severity classification
 * 
 * @function logger.security
 * @param {string} event - Security event type (e.g., 'login_failed', 'unauthorized_access')
 * @param {string} message - Event message
 * @param {Object} meta - Additional metadata including user, IP, userAgent
 * 
 * @description Logs security events with severity classification, user information,
 * IP addresses, and event categorization for security monitoring and compliance.
 * 
 * @example
 * // Log security event
 * logger.security('login_failed', 'Invalid credentials', {
 *   user: 'john.doe@company.com',
 *   ip: '192.168.1.100',
 *   userAgent: 'Mozilla/5.0...'
 * });
 */
logger.security = (event, message, meta = {}) => {
  logger.warn(message, {
    event,
    user: meta.user || 'anonymous',
    ip: meta.ip,
    userAgent: meta.userAgent,
    ...meta
  })
}

/**
 * Log performance metrics with memory usage
 * 
 * @function logger.performance
 * @param {string} operation - Operation name (e.g., 'database_query', 'api_call')
 * @param {number} duration - Duration in milliseconds
 * @param {Object} meta - Additional metadata
 * 
 * @description Logs performance metrics including operation duration, memory usage,
 * and other performance indicators for monitoring and optimization.
 * 
 * @example
 * // Log performance metrics
 * logger.performance('database_query', 150, { 
 *   table: 'users', 
 *   records: 1000 
 * });
 */
logger.performance = (operation, duration, meta = {}) => {
  logger.info(`Performance: ${operation}`, {
    operation,
    duration,
    memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    ...meta
  })
}

/**
 * Log database operations with timing and table information
 * 
 * @function logger.database
 * @param {string} operation - Database operation (e.g., 'SELECT', 'INSERT', 'UPDATE')
 * @param {string} table - Table name
 * @param {number} duration - Operation duration in milliseconds
 * @param {Object} meta - Additional metadata
 * 
 * @description Logs database operations with timing information, table names,
 * and operation details for database performance monitoring and debugging.
 * 
 * @example
 * // Log database operation
 * logger.database('SELECT', 'users', 45, { 
 *   records: 50, 
 *   query: 'SELECT * FROM users WHERE active = true' 
 * });
 */
logger.database = (operation, table, duration, meta = {}) => {
  logger.debug(`Database ${operation}`, {
    operation,
    table,
    duration: `${duration}ms`,
    ...meta
  })
}

/**
 * Log authentication events with user context
 * 
 * @function logger.auth
 * @param {string} event - Auth event type (e.g., 'login', 'logout', 'token_refresh')
 * @param {string} message - Event message
 * @param {Object} meta - Additional metadata including user, IP, userAgent
 * 
 * @description Logs authentication events with user context, IP addresses,
 * and event details for security monitoring and audit trails.
 * 
 * @example
 * // Log authentication event
 * logger.auth('login', 'User logged in successfully', {
 *   user: 'john.doe@company.com',
 *   ip: '192.168.1.100',
 *   userAgent: 'Mozilla/5.0...'
 * });
 */
logger.auth = (event, message, meta = {}) => {
  logger.info(message, {
    authEvent: event,
    user: meta.user || 'anonymous',
    ip: meta.ip,
    userAgent: meta.userAgent,
    ...meta
  })
}

/**
 * Log business logic events with module and action context
 * 
 * @function logger.business
 * @param {string} module - Module name (e.g., 'user_management', 'order_processing')
 * @param {string} action - Action performed (e.g., 'user_created', 'order_completed')
 * @param {Object} meta - Additional metadata
 * 
 * @description Logs business logic events with module and action context
 * for business process monitoring and audit trails.
 * 
 * @example
 * // Log business logic event
 * logger.business('user_management', 'user_created', {
 *   userId: 123,
 *   createdBy: 'admin@company.com'
 * });
 */
logger.business = (module, action, meta = {}) => {
  logger.info(`Business Logic: ${module} - ${action}`, {
    module,
    action,
    ...meta
  })
}

/**
 * Create child logger with default metadata for all log calls
 * 
 * @function logger.child
 * @param {Object} defaultMeta - Default metadata to include in all log calls
 * @returns {Object} Child logger instance with all logging methods
 * 
 * @description Creates a child logger that automatically includes default metadata
 * in all log calls, useful for module-specific logging with consistent context.
 * 
 * @example
 * // Create child logger for user module
 * const userLogger = logger.child({ module: 'user_management', userId: 123 });
 * userLogger.info('User updated', { field: 'email' });
 * // Logs: { module: 'user_management', userId: 123, field: 'email' }
 */
logger.child = (defaultMeta = {}) => {
  return {
    error: (message, meta = {}) =>
      logger.error(message, { ...defaultMeta, ...meta }),
    warn: (message, meta = {}) =>
      logger.warn(message, { ...defaultMeta, ...meta }),
    info: (message, meta = {}) =>
      logger.info(message, { ...defaultMeta, ...meta }),
    debug: (message, meta = {}) =>
      logger.debug(message, { ...defaultMeta, ...meta }),
    trace: (message, meta = {}) =>
      logger.log('trace', message, { ...defaultMeta, ...meta }),
    http: (req, res, responseTime, meta = {}) =>
      logger.http(req, res, responseTime, { ...defaultMeta, ...meta }),
    security: (event, message, meta = {}) =>
      logger.security(event, message, { ...defaultMeta, ...meta }),
    performance: (operation, duration, meta = {}) =>
      logger.performance(operation, duration, { ...defaultMeta, ...meta }),
    database: (operation, table, duration, meta = {}) =>
      logger.database(operation, table, duration, { ...defaultMeta, ...meta }),
    auth: (event, message, meta = {}) =>
      logger.auth(event, message, { ...defaultMeta, ...meta }),
    business: (module, action, meta = {}) =>
      logger.business(module, action, { ...defaultMeta, ...meta })
  }
}

/**
 * Get logger statistics and system information
 * 
 * @function logger.getStats
 * @returns {Object} Logger statistics including configuration, memory usage, and system info
 * 
 * @description Returns comprehensive statistics about the logger configuration,
 * system memory usage, uptime, and environment information for monitoring.
 * 
 * @example
 * // Get logger statistics
 * const stats = logger.getStats();
 * console.log('Logger level:', stats.level);
 * console.log('Memory usage:', stats.memory.used, 'MB');
 */
logger.getStats = () => {
  return {
    level: logLevel,
    directory: logDir,
    environment: process.env.NODE_ENV,
    transports: logger.transports.length,
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
    },
    uptime: process.uptime()
  }
}

// Log startup information with configuration details
logger.info('Logger initialized', {
  level: logLevel,
  directory: logDir,
  environment: process.env.NODE_ENV,
  transports: logger.transports.length,
  customLevels: Object.keys(customLevels)
})

// Export the enhanced logger with all specialized methods
export default logger
