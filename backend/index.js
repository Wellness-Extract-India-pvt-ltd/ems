/**
 * @fileoverview Main server entry point for the EMS (Employee Management System) backend
 * This file handles server initialization, database connections, and graceful shutdown
 * 
 * @author EMS Development Team
 * @version 1.0.0
 * @since 2025
 */

// Load environment variables from .env file
import 'dotenv/config'

// Import Express application configuration
import app from './app.js'

// Import Redis configuration for caching
import redisConfig from './config/redis.js'

// Import MySQL database connection utilities
import {
  testConnection,
  syncDatabase,
  closeConnection
} from './database/connection.js'

// Import BioMetrics SQL Server connection utilities
import {
  testBiometricsConnection,
  closeBiometricsConnection
} from './database/biometricsConnection.js'

/**
 * Server port configuration
 * Uses PORT from environment variables or defaults to 5000
 */
const PORT = process.env.PORT || 5000

/**
 * Main server startup function
 * 
 * This function orchestrates the complete server initialization process:
 * 1. Establishes MySQL database connection and synchronizes schema
 * 2. Connects to Redis for caching (optional, continues if fails)
 * 3. Connects to BioMetrics SQL Server (optional, continues if fails)
 * 4. Starts the Express server
 * 5. Sets up graceful shutdown handlers
 * 6. Configures error handling for unhandled rejections and exceptions
 * 
 * @async
 * @function startServer
 * @throws {Error} If MySQL database connection fails (critical)
 * @throws {Error} If server startup fails
 * @returns {void}
 */
async function startServer () {
  console.log('🚀 Starting server...')
  
  try {
    // ========================================
    // MySQL Database Connection (Critical)
    // ========================================
    try {
      const dbConnected = await testConnection()
      if (dbConnected) {
        // Synchronize database schema with models
        await syncDatabase()
        console.log('✅ MySQL Database Connected and synchronized')
      } else {
        console.error('❌ MySQL Database connection failed')
        process.exit(1) // Exit if primary database fails
      }
    } catch (dbError) {
      console.error('❌ MySQL Database connection error:', dbError.message)
      process.exit(1) // Exit if database connection throws error
    }

    // ========================================
    // Redis Cache Connection (Optional)
    // ========================================
    try {
      await redisConfig.connect()
      console.log('✅ Redis Connected successfully')
    } catch (redisError) {
      // Redis is optional - continue without caching if connection fails
      console.warn(
        '⚠️ Redis connection failed, continuing without cache:',
        redisError.message
      )
    }

    // ========================================
    // BioMetrics SQL Server Connection (Optional)
    // ========================================
    try {
      const biometricsConnected = await testBiometricsConnection()
      if (biometricsConnected) {
        console.log('✅ BioMetrics SQL Server Connected')
      } else {
        console.warn(
          '⚠️ BioMetrics connection failed, continuing without biometric data'
        )
      }
    } catch (biometricsError) {
      // BioMetrics is optional - continue without biometric data if connection fails
      console.warn(
        '⚠️ BioMetrics connection error, continuing without biometric data:',
        biometricsError.message
      )
    }

    // ========================================
    // Start Express Server
    // ========================================
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    })

    // ========================================
    // Graceful Shutdown Handler
    // ========================================
    /**
     * Handles graceful server shutdown
     * Closes all database connections and stops the server cleanly
     * 
     * @async
     * @function shutdown
     * @returns {void}
     */
    const shutdown = async () => {
      console.log('🛑 Shutting down...')
      
      // Close BioMetrics connection
      await closeBiometricsConnection()
      
      // Close MySQL connection
      await closeConnection()
      
      // Disconnect from Redis
      await redisConfig.disconnect()
      
      // Close the HTTP server
      server.close(() => {
        console.log('🔌 Server closed. All connections disconnected.')
        process.exit(0)
      })
    }

    // ========================================
    // Process Signal Handlers
    // ========================================
    // Handle SIGINT (Ctrl+C) and SIGTERM (termination signal)
    process.on('SIGINT', shutdown)
    process.on('SIGTERM', shutdown)

    // ========================================
    // Global Error Handlers
    // ========================================
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason)
    })

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      console.error('Uncaught Exception:', err)
    })
    
  } catch (err) {
    console.error('❌ Server Startup Error:', err.message)
    process.exit(1)
  }
}

// Start the server
startServer()