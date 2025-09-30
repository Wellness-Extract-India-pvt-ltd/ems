/**
 * @fileoverview MySQL Database Connection for EMS Backend
 * @description Comprehensive MySQL database connection management using Sequelize ORM.
 * Provides connection pooling, health monitoring, automatic reconnection, and database operations.
 * Includes advanced features like connection validation, retry logic, and performance monitoring.
 *
 * @author EMS Development Team
 * @version 1.0.0
 * @since 2025-09-17
 *
 * @features
 * - Sequelize ORM integration with MySQL
 * - Connection pooling with enhanced configuration
 * - Automatic reconnection and retry logic
 * - Connection health monitoring and status tracking
 * - Database synchronization and schema management
 * - Raw SQL query execution capabilities
 * - Performance monitoring and response time tracking
 * - Connection validation and error handling
 * - Graceful shutdown and cleanup procedures
 * - Database metadata and information retrieval
 * - Force reconnection capabilities
 */

// Import Sequelize ORM for MySQL database operations
import { Sequelize } from 'sequelize'
// Import application configuration for database settings
import config from '../config.js'
// Import logger for comprehensive logging and monitoring
import logger from '../utils/logger.js'

/**
 * Create Sequelize instance with comprehensive configuration
 * 
 * @description Initializes Sequelize with enhanced connection pooling, retry logic,
 * and MySQL-specific optimizations for production reliability and performance.
 * 
 * @example
 * // Basic usage
 * import sequelize from './database/connection.js'
 * await sequelize.authenticate()
 * 
 * @example
 * // With models
 * import sequelize from './database/connection.js'
 * import User from './models/User.js'
 * const users = await User.findAll()
 */
const sequelize = new Sequelize(
  config.database.database,
  config.database.username,
  config.database.password,
  {
    // Basic connection configuration
    host: config.database.host,
    port: config.database.port,
    dialect: config.database.dialect,
    logging: config.database.logging,
    
    // Enhanced connection pooling for better reliability and performance
    pool: {
      ...config.database.pool,
      // Enhanced pool configuration for better reliability
      acquireTimeoutMillis: 60000, // 60 seconds to acquire connection
      createTimeoutMillis: 30000, // 30 seconds to create connection
      destroyTimeoutMillis: 5000, // 5 seconds to destroy connection
      idleTimeoutMillis: 300000, // 5 minutes idle timeout
      reapIntervalMillis: 1000, // 1 second reap interval
      createRetryIntervalMillis: 200, // 200ms retry interval
      maxUses: 7200, // Connection lifetime (2 hours)
      validate: (connection) => {
        // Validate connection before use to ensure it's healthy
        return connection && !connection.closed
      }
    },
    
    // Global model configuration
    define: {
      timestamps: true, // Enable createdAt and updatedAt timestamps
      underscored: true, // Use snake_case for column names
      freezeTableName: true // Prevent Sequelize from pluralizing table names
    },
    
    // Enhanced MySQL-specific connection options
    dialectOptions: {
      charset: 'utf8mb4', // Support for full Unicode including emojis
      collate: 'utf8mb4_unicode_ci' // Unicode collation for proper sorting
    },
    
    // Comprehensive retry configuration for network resilience
    retry: {
      match: [
        // Network timeout errors
        /ETIMEDOUT/,
        /EHOSTUNREACH/,
        /ECONNRESET/,
        /ECONNREFUSED/,
        /ESOCKETTIMEDOUT/,
        /EPIPE/,
        /EAI_AGAIN/,
        // Sequelize specific connection errors
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/
      ],
      max: 3 // Maximum retry attempts
    }
  }
)

// Connection state tracking variables for monitoring and health checks
let isConnected = false // Current connection status
let lastConnectionAttempt = null // Timestamp of last connection attempt
let connectionRetries = 0 // Number of consecutive retry attempts
const MAX_RETRIES = 3 // Maximum allowed retry attempts

/**
 * Test database connection with performance monitoring
 * 
 * @async
 * @function testConnection
 * @description Tests the database connection by authenticating with MySQL server.
 * Includes response time monitoring, connection state tracking, and comprehensive error handling.
 * 
 * @returns {Promise<boolean>} True if connection successful, false if failed
 * 
 * @throws {Error} If authentication fails or connection cannot be established
 * 
 * @example
 * // Test database connection
 * const connected = await testConnection()
 * if (connected) {
 *   console.log('Database is ready')
 * } else {
 *   console.log('Database connection failed')
 * }
 * 
 * @example
 * // Use in health check endpoint
 * app.get('/health', async (req, res) => {
 *   const dbHealthy = await testConnection()
 *   res.json({ database: dbHealthy ? 'healthy' : 'unhealthy' })
 * })
 */
export async function testConnection () {
  try {
    // Measure connection response time for performance monitoring
    const startTime = Date.now()
    await sequelize.authenticate()
    const responseTime = Date.now() - startTime

    // Update connection state on successful connection
    isConnected = true
    connectionRetries = 0

    // Log successful connection with performance metrics
    logger.info('✅ MySQL Database Connected successfully', {
      responseTime,
      host: config.database.host,
      database: config.database.database
    })

    return true
  } catch (error) {
    // Update connection state on failure
    isConnected = false
    connectionRetries++
    lastConnectionAttempt = Date.now()

    // Log detailed error information for debugging
    logger.error('❌ MySQL Database Connection Error:', {
      error: error.message,
      host: config.database.host,
      database: config.database.database,
      retryCount: connectionRetries,
      timestamp: new Date().toISOString()
    })

    return false
  }
}

/**
 * Synchronize database models with schema management
 * 
 * @async
 * @function syncDatabase
 * @param {Object} options - Synchronization options
 * @param {boolean} options.alter - Whether to alter existing tables (default: true)
 * @param {boolean} options.force - Whether to force recreation of tables (default: false)
 * @param {boolean} options.match - Regex pattern to match table names
 * @param {string} options.schema - Database schema name
 * @param {string} options.searchPath - Search path for schemas
 * 
 * @description Synchronizes Sequelize models with the database schema.
 * Safely modifies existing tables without data loss and handles schema conflicts gracefully.
 * 
 * @returns {Promise<boolean>} True if sync successful, false if failed
 * 
 * @throws {Error} If model registration fails or schema conflicts occur
 * 
 * @example
 * // Basic sync with default options
 * const synced = await syncDatabase()
 * 
 * @example
 * // Sync with custom options
 * const synced = await syncDatabase({
 *   alter: true,
 *   force: false,
 *   match: /^ems_/
 * })
 * 
 * @example
 * // Force recreation (use with caution)
 * const synced = await syncDatabase({ force: true })
 */
export async function syncDatabase (options = {}) {
  try {
    // Import all models to ensure they are registered with Sequelize
    await import('../models/index.js')

    // Configure synchronization options with safe defaults
    const syncOptions = {
      alter: false, // Disable alter to avoid index conflicts
      force: false, // Never drop tables to prevent data loss
      ...options
    }

    // Measure synchronization performance
    const startTime = Date.now()
    await sequelize.sync(syncOptions)
    const syncTime = Date.now() - startTime

    // Log successful synchronization with performance metrics
    logger.info('✅ Database models synchronized successfully', {
      syncTime,
      options: syncOptions,
      timestamp: new Date().toISOString()
    })

    return true
  } catch (error) {
    // Log detailed error information for debugging
    logger.error('❌ Database sync error:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    })

    // Don't exit on sync error, just log and continue to prevent application crashes
    logger.info('⚠️ Continuing without database sync due to schema conflicts')
    return false
  }
}

/**
 * Close database connection gracefully
 * 
 * @async
 * @function closeConnection
 * @description Closes the database connection and cleans up resources.
 * Resets connection state and handles cleanup errors gracefully.
 * 
 * @returns {Promise<void>} Promise that resolves when connection is closed
 * 
 * @throws {Error} If connection cannot be closed properly
 * 
 * @example
 * // Close connection on application shutdown
 * process.on('SIGTERM', async () => {
 *   await closeConnection()
 *   process.exit(0)
 * })
 * 
 * @example
 * // Close connection in cleanup function
 * const cleanup = async () => {
 *   await closeConnection()
 *   console.log('Database connection closed')
 * }
 */
export async function closeConnection () {
  try {
    // Close Sequelize connection and cleanup resources
    await sequelize.close()
    
    // Reset connection state variables
    isConnected = false
    connectionRetries = 0

    // Log successful connection closure
    logger.info('🔌 MySQL Database connection closed', {
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    // Log error but don't throw to prevent application crashes
    logger.error('❌ Error closing database connection:', {
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
}

/**
 * Get comprehensive database health status and metrics
 * 
 * @async
 * @function getDatabaseHealth
 * @description Retrieves detailed health information about the database connection,
 * including connection status, performance metrics, pool statistics, and configuration details.
 * 
 * @returns {Promise<Object>} Health information object with status, metrics, and configuration
 * 
 * @example
 * // Get database health for monitoring
 * const health = await getDatabaseHealth()
 * console.log(`Database status: ${health.status}`)
 * console.log(`Response time: ${health.responseTime}ms`)
 * 
 * @example
 * // Use in health check endpoint
 * app.get('/health/database', async (req, res) => {
 *   const health = await getDatabaseHealth()
 *   res.json(health)
 * })
 * 
 * @example
 * // Monitor connection pool
 * const health = await getDatabaseHealth()
 * if (health.pool.used > health.pool.total * 0.8) {
 *   console.warn('Connection pool is nearly full')
 * }
 */
export async function getDatabaseHealth () {
  try {
    // Measure health check response time
    const startTime = Date.now()
    const isHealthy = await testConnection()
    const responseTime = Date.now() - startTime

    // Get connection pool status for monitoring
    const poolStatus = sequelize.connectionManager.pool

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      connected: isHealthy,
      responseTime,
      pool: {
        total: poolStatus?.size || 0,
        used: poolStatus?.used || 0,
        available: poolStatus?.available || 0,
        pending: poolStatus?.pending || 0
      },
      retries: connectionRetries,
      lastConnectionAttempt,
      config: {
        host: config.database.host,
        database: config.database.database,
        dialect: config.database.dialect,
        port: config.database.port
      },
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    // Return error status if health check fails
    return {
      status: 'error',
      connected: false,
      error: error.message,
      retries: connectionRetries,
      lastConnectionAttempt,
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * Get comprehensive database information and metadata
 * 
 * @async
 * @function getDatabaseInfo
 * @description Retrieves detailed database metadata including version information,
 * table statistics, connection status, and server configuration.
 * 
 * @returns {Promise<Object>} Database metadata object with success status and data
 * 
 * @example
 * // Get database information
 * const info = await getDatabaseInfo()
 * if (info.success) {
 *   console.log(`MySQL Version: ${info.data.version.version}`)
 *   console.log(`Tables: ${info.data.tables.length}`)
 * }
 * 
 * @example
 * // Use in admin dashboard
 * app.get('/admin/database-info', async (req, res) => {
 *   const info = await getDatabaseInfo()
 *   res.json(info)
 * })
 * 
 * @example
 * // Monitor database size
 * const info = await getDatabaseInfo()
 * const totalSize = info.data.tables.reduce((sum, table) => 
 *   sum + (table.DATA_LENGTH || 0), 0)
 * console.log(`Total database size: ${totalSize} bytes`)
 */
export async function getDatabaseInfo () {
  try {
    // Define comprehensive database information queries
    const queries = {
      version: 'SELECT VERSION() as version, DATABASE() as current_database',
      tables: `
        SELECT 
          TABLE_NAME, 
          TABLE_ROWS, 
          DATA_LENGTH, 
          INDEX_LENGTH,
          CREATE_TIME,
          UPDATE_TIME
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = DATABASE()
        ORDER BY TABLE_NAME
      `,
      connections: 'SHOW STATUS LIKE "Threads_connected"',
      maxConnections: 'SHOW VARIABLES LIKE "max_connections"',
      uptime: 'SHOW STATUS LIKE "Uptime"'
    }

    const results = {}

    // Execute each query and collect results
    for (const [key, query] of Object.entries(queries)) {
      try {
        const [result] = await sequelize.query(query, {
          type: Sequelize.QueryTypes.SELECT
        })
        results[key] = result
      } catch (error) {
        // Handle individual query failures gracefully
        results[key] = { error: error.message }
      }
    }

    return {
      success: true,
      data: results,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    // Log error and return failure status
    logger.error('Error getting database info:', error)
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * Execute raw SQL query with parameterized replacements
 * 
 * @async
 * @function executeRawQuery
 * @param {string} query - SQL query string with optional placeholders
 * @param {Object} replacements - Parameterized replacements for query placeholders
 * @param {string} replacements.id - ID parameter for WHERE clauses
 * @param {string} replacements.name - Name parameter for WHERE clauses
 * @param {number} replacements.limit - Limit parameter for pagination
 * @param {number} replacements.offset - Offset parameter for pagination
 * 
 * @description Executes raw SQL queries with parameterized replacements for security.
 * Supports complex queries that cannot be expressed through Sequelize ORM.
 * 
 * @returns {Promise<Array>} Query results array
 * 
 * @throws {Error} If query execution fails or SQL syntax is invalid
 * 
 * @example
 * // Simple SELECT query
 * const users = await executeRawQuery('SELECT * FROM users WHERE active = :active', {
 *   active: 1
 * })
 * 
 * @example
 * // Complex query with multiple parameters
 * const results = await executeRawQuery(`
 *   SELECT u.*, p.name as profile_name 
 *   FROM users u 
 *   LEFT JOIN profiles p ON u.id = p.user_id 
 *   WHERE u.created_at > :date AND u.status = :status
 *   LIMIT :limit OFFSET :offset
 * `, {
 *   date: '2024-01-01',
 *   status: 'active',
 *   limit: 10,
 *   offset: 0
 * })
 * 
 * @example
 * // Aggregation query
 * const stats = await executeRawQuery(`
 *   SELECT 
 *     COUNT(*) as total_users,
 *     AVG(age) as avg_age,
 *     MAX(created_at) as latest_user
 *   FROM users
 * `)
 */
export async function executeRawQuery (query, replacements = {}) {
  try {
    // Execute parameterized query for security
    const results = await sequelize.query(query, {
      replacements,
      type: Sequelize.QueryTypes.SELECT
    })

    // Log successful query execution with truncated query for security
    logger.info('Raw query executed successfully', {
      query: query.substring(0, 100) + '...',
      resultCount: results.length
    })

    return results
  } catch (error) {
    // Log detailed error information for debugging
    logger.error('Raw query execution failed:', {
      query: query.substring(0, 100) + '...',
      error: error.message
    })
    throw error
  }
}

/**
 * Get current database connection status
 * 
 * @function isDatabaseConnected
 * @description Returns the current connection status without performing a test.
 * Useful for quick status checks without the overhead of authentication.
 * 
 * @returns {boolean} True if connected, false if disconnected
 * 
 * @example
 * // Check connection status
 * if (isDatabaseConnected()) {
 *   console.log('Database is connected')
 * } else {
 *   console.log('Database is disconnected')
 * }
 * 
 * @example
 * // Use in middleware
 * const dbMiddleware = (req, res, next) => {
 *   if (!isDatabaseConnected()) {
 *     return res.status(503).json({ error: 'Database unavailable' })
 *   }
 *   next()
 * }
 */
export function isDatabaseConnected () {
  return isConnected
}

/**
 * Force database reconnection with cleanup and retry
 * 
 * @async
 * @function forceReconnect
 * @description Forces a complete database reconnection by closing the existing
 * connection and establishing a new one. Useful for recovering from connection issues.
 * 
 * @returns {Promise<boolean>} True if reconnection successful, false if failed
 * 
 * @throws {Error} If reconnection process fails
 * 
 * @example
 * // Force reconnection on connection issues
 * const reconnected = await forceReconnect()
 * if (reconnected) {
 *   console.log('Database reconnected successfully')
 * } else {
 *   console.log('Failed to reconnect to database')
 * }
 * 
 * @example
 * // Use in error recovery
 * try {
 *   await someDatabaseOperation()
 * } catch (error) {
 *   if (error.code === 'ECONNRESET') {
 *     const reconnected = await forceReconnect()
 *     if (reconnected) {
 *       // Retry the operation
 *       await someDatabaseOperation()
 *     }
 *   }
 * }
 * 
 * @example
 * // Periodic reconnection for long-running applications
 * setInterval(async () => {
 *   if (!isDatabaseConnected()) {
 *     await forceReconnect()
 *   }
 * }, 300000) // Every 5 minutes
 */
export async function forceReconnect () {
  try {
    logger.info('Forcing database reconnection...')

    // Close existing connection to cleanup resources
    await sequelize.close()
    isConnected = false

    // Wait a moment before reconnecting to allow cleanup
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Test new connection to verify reconnection
    const reconnected = await testConnection()

    if (reconnected) {
      logger.info('✅ Database reconnection successful')
    } else {
      logger.error('❌ Database reconnection failed')
    }

    return reconnected
  } catch (error) {
    // Log error and return failure status
    logger.error('Error during forced reconnection:', error)
    return false
  }
}

// Export Sequelize instance as default export for direct database access
export default sequelize
