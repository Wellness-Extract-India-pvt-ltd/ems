/**
 * BioMetrics SQL Server Database Connection
 * Handles connection to the remote ONtime_Att database for biometric data
 */

import sql from 'mssql'
import config from '../config.js'
import logger from '../utils/logger.js'

// Use msnodesqlv8 driver for Windows Authentication
import msnodesqlv8 from 'msnodesqlv8'
sql.msnodesqlv8 = msnodesqlv8

let pool = null
let isConnecting = false
let lastConnectionAttempt = null
const RECONNECT_DELAY = 5000 // 5 seconds

/**
 * Creates and returns a SQL Server connection pool
 * @returns {Promise<sql.ConnectionPool>} Connection pool instance
 */
export async function getBiometricsConnection () {
  try {
    // Check if pool exists and is connected
    if (pool && isPoolHealthy(pool)) {
      return pool
    }

    // Prevent multiple simultaneous connection attempts
    if (isConnecting) {
      const waitTime = Date.now() - lastConnectionAttempt
      if (waitTime < RECONNECT_DELAY) {
        await new Promise((resolve) =>
          setTimeout(resolve, RECONNECT_DELAY - waitTime)
        )
      }
      return getBiometricsConnection()
    }

    isConnecting = true
    lastConnectionAttempt = Date.now()

    // Clean up existing pool if it exists but is unhealthy
    if (pool) {
      try {
        await pool.close()
      } catch (error) {
        logger.warn('Error closing unhealthy BioMetrics pool:', error.message)
      }
      pool = null
    }

    const sqlConfig = {
      server: config.biometrics.server,
      database: config.biometrics.database,
      port: parseInt(config.biometrics.port),
      options: config.biometrics.options,
      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
        acquireTimeoutMillis: 30000,
        createTimeoutMillis: 30000,
        destroyTimeoutMillis: 5000,
        reapIntervalMillis: 1000,
        createRetryIntervalMillis: 200
      },
      // Use msnodesqlv8 driver for Windows Authentication
      driver: 'msnodesqlv8'
    }

    // Use Windows Authentication if no user/password provided
    if (
      config.biometrics.user &&
      config.biometrics.password &&
      config.biometrics.user.trim() !== '' &&
      config.biometrics.password.trim() !== ''
    ) {
      sqlConfig.user = config.biometrics.user
      sqlConfig.password = config.biometrics.password
    } else {
      // Use Windows Authentication - following POC documentation
      sqlConfig.options.trustedConnection = true
    }

    // Debug: Log the connection configuration (without sensitive data)
    logger.info('BioMetrics Connection Config:', {
      server: sqlConfig.server,
      database: sqlConfig.database,
      port: sqlConfig.port,
      hasUser: !!sqlConfig.user,
      hasPassword: !!sqlConfig.password,
      trustedConnection: sqlConfig.options.trustedConnection,
      integratedSecurity: sqlConfig.options.integratedSecurity
    })

    // Create connection pool with msnodesqlv8 driver
    pool = new sql.ConnectionPool(sqlConfig)

    // Set up error handlers
    pool.on('error', (error) => {
      logger.error('BioMetrics Connection Pool Error:', error)
      pool = null
    })

    await pool.connect()

    logger.info('✅ BioMetrics SQL Server Connected', {
      server: config.biometrics.server,
      database: config.biometrics.database
    })

    isConnecting = false
    return pool
  } catch (error) {
    isConnecting = false
    logger.error('❌ BioMetrics SQL Server Connection Error:', error)

    // Clean up failed pool
    if (pool) {
      try {
        await pool.close()
      } catch (closeError) {
        logger.warn(
          'Error closing failed BioMetrics pool:',
          closeError.message
        )
      }
      pool = null
    }

    throw error
  }
}

/**
 * Checks if the connection pool is healthy
 * @param {sql.ConnectionPool} pool - Connection pool to check
 * @returns {boolean} Pool health status
 */
function isPoolHealthy (pool) {
  try {
    return (
      pool && pool.connected !== false && !pool._connecting && !pool._closing
    )
  } catch (error) {
    return false
  }
}

/**
 * Executes a SQL query on the BioMetrics database
 * @param {string} query - SQL query string
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Query result
 */
export async function executeBiometricsQuery (query, params = {}) {
  let pool = null
  let request = null

  try {
    pool = await getBiometricsConnection()
    request = pool.request()

    // Add parameters to the request
    Object.keys(params).forEach((key) => {
      request.input(key, params[key])
    })

    const result = await request.query(query)
    return result
  } catch (error) {
    logger.error('BioMetrics Query Error:', {
      query: query.substring(0, 100) + '...',
      error: error.message,
      params: Object.keys(params)
    })

    // If it's a connection error, mark pool as unhealthy
    if (
      error.code === 'ECONNRESET' ||
      error.code === 'ETIMEDOUT' ||
      error.message.includes('connection') ||
      error.message.includes('timeout')
    ) {
      logger.warn(
        'BioMetrics connection error detected, pool will be recreated on next request'
      )
      pool = null
    }

    throw error
  }
}

/**
 * Tests the BioMetrics database connection
 * @returns {Promise<boolean>} Connection status
 */
export async function testBiometricsConnection () {
  try {
    const result = await executeBiometricsQuery(
      'SELECT @@VERSION as version, DB_NAME() as database_name'
    )
    logger.info('BioMetrics Connection Test Successful:', result.recordset[0])
    return true
  } catch (error) {
    logger.error('BioMetrics Connection Test Failed:', error.message)
    return false
  }
}

/**
 * Closes the BioMetrics database connection
 */
export async function closeBiometricsConnection () {
  try {
    if (pool) {
      await pool.close()
      pool = null
      isConnecting = false
      logger.info('🔌 BioMetrics SQL Server connection closed')
    }
  } catch (error) {
    logger.error('Error closing BioMetrics connection:', error)
    pool = null
    isConnecting = false
  }
}

/**
 * Gets database information and table structure
 * @returns {Promise<Object>} Database metadata
 */
export async function getBiometricsDatabaseInfo () {
  try {
    const queries = {
      databases: 'SELECT name FROM sys.databases WHERE name = @database',
      tables: `
        SELECT TABLE_NAME, TABLE_TYPE 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_TYPE = 'BASE TABLE'
        ORDER BY TABLE_NAME
      `,
      employeeTables: `
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_NAME LIKE '%employee%' OR TABLE_NAME LIKE '%emp%'
        ORDER BY TABLE_NAME
      `,
      attendanceTables: `
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_NAME LIKE '%att%' OR TABLE_NAME LIKE '%punch%' OR TABLE_NAME LIKE '%time%'
        ORDER BY TABLE_NAME
      `
    }

    const results = {}

    for (const [key, query] of Object.entries(queries)) {
      try {
        const result = await executeBiometricsQuery(query, {
          database: config.biometrics.database
        })
        results[key] = result.recordset
      } catch (error) {
        results[key] = { error: error.message }
      }
    }

    return results
  } catch (error) {
    logger.error('Error getting BioMetrics database info:', error)
    throw error
  }
}

/**
 * Health check for BioMetrics connection
 * @returns {Promise<Object>} Health status
 */
export async function getBiometricsHealth () {
  try {
    const startTime = Date.now()
    const isConnected = await testBiometricsConnection()
    const responseTime = Date.now() - startTime

    return {
      status: isConnected ? 'healthy' : 'unhealthy',
      connected: isConnected,
      responseTime,
      poolStatus: pool
        ? isPoolHealthy(pool)
          ? 'healthy'
          : 'unhealthy'
        : 'not_initialized',
      lastConnectionAttempt,
      isConnecting
    }
  } catch (error) {
    return {
      status: 'error',
      connected: false,
      error: error.message,
      poolStatus: 'error',
      lastConnectionAttempt,
      isConnecting
    }
  }
}
