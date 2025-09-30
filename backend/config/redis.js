/**
 * @fileoverview Redis Configuration for EMS Backend
 * @description Comprehensive Redis connection management, caching operations, and performance optimization.
 * Provides singleton Redis client with connection pooling, error handling, and cache management utilities.
 *
 * @author EMS Development Team
 * @version 1.0.0
 * @since 2025-09-17
 *
 * @features
 * - Singleton Redis client with connection pooling
 * - Automatic reconnection and failover handling
 * - Comprehensive error handling and logging
 * - Cache management utilities (set, get, delete, exists)
 * - TTL (Time To Live) support for cache expiration
 * - JSON serialization/deserialization for complex data
 * - Connection status monitoring and health checks
 * - Graceful shutdown and cleanup
 * - Environment-based configuration
 * - Performance optimization with lazy connection
 */

// Import Redis client library for connection management
import Redis from 'ioredis'
// Import logger for comprehensive logging and monitoring
import logger from '../utils/logger.js'

/**
 * Redis Configuration and Connection Management Class
 * 
 * @class RedisConfig
 * @description Manages Redis connection, caching operations, and performance optimization.
 * Provides a singleton pattern for consistent Redis access across the application.
 * 
 * @example
 * // Basic usage
 * import redisConfig from './config/redis.js'
 * await redisConfig.connect()
 * await redisConfig.set('user:123', { name: 'John' }, 3600)
 * const user = await redisConfig.get('user:123')
 */
class RedisConfig {
  /**
   * Initialize Redis configuration instance
   * 
   * @constructor
   * @description Creates a new Redis configuration instance with default values.
   * Sets up initial state for connection management and monitoring.
   */
  constructor () {
    // Redis client instance (null until connection is established)
    this.client = null
    // Connection status flag for monitoring and health checks
    this.isConnected = false
  }

  /**
   * Initialize Redis connection with comprehensive configuration and event handling
   * 
   * @async
   * @function connect
   * @description Establishes Redis connection with environment-based configuration,
   * event listeners for monitoring, and automatic reconnection capabilities.
   * 
   * @returns {Promise<Redis>} Redis client instance
   * 
   * @throws {Error} If Redis connection fails or configuration is invalid
   * 
   * @example
   * // Connect to Redis with default configuration
   * const client = await redisConfig.connect()
   * 
   * @example
   * // Connect with environment variables
   * // REDIS_HOST=redis.example.com
   * // REDIS_PORT=6380
   * // REDIS_PASSWORD=secret123
   * const client = await redisConfig.connect()
   */
  async connect () {
    try {
      // Configure Redis connection parameters from environment variables
      const redisConfig = {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || null,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        keepAlive: 30000,
        connectTimeout: 10000,
        commandTimeout: 5000,
        // Disable authentication if no password is provided
        enableReadyCheck: false
      }

      // Create Redis client instance with configuration
      this.client = new Redis(redisConfig)

      // Set up event listeners for connection monitoring and error handling
      this.client.on('connect', () => {
        logger.info('Redis connected successfully')
        this.isConnected = true
      })

      this.client.on('error', (error) => {
        logger.error('Redis connection error:', error)
        this.isConnected = false
      })

      this.client.on('close', () => {
        logger.warn('Redis connection closed')
        this.isConnected = false
      })

      this.client.on('reconnecting', () => {
        logger.info('Redis reconnecting...')
      })

      // Establish connection to Redis server
      await this.client.connect()

      return this.client
    } catch (error) {
      logger.error('Failed to connect to Redis:', error)
      throw error
    }
  }

  /**
   * Get Redis client instance for direct operations
   * 
   * @function getClient
   * @description Returns the Redis client instance for direct Redis operations.
   * Throws an error if the client is not initialized.
   * 
   * @returns {Redis} Redis client instance
   * 
   * @throws {Error} If Redis client is not initialized
   * 
   * @example
   * // Get client for direct operations
   * const client = redisConfig.getClient()
   * await client.hgetall('user:123')
   */
  getClient () {
    if (!this.client) {
      throw new Error('Redis client not initialized. Call connect() first.')
    }
    return this.client
  }

  /**
   * Check if Redis connection is active and ready
   * 
   * @function isRedisConnected
   * @description Verifies Redis connection status by checking both internal
   * connection flag and client status. Used for health checks and cache operations.
   * 
   * @returns {boolean} True if Redis is connected and ready, false otherwise
   * 
   * @example
   * // Check connection before cache operations
   * if (redisConfig.isRedisConnected()) {
   *   await redisConfig.set('key', 'value')
   * }
   */
  isRedisConnected () {
    return this.isConnected && this.client && this.client.status === 'ready'
  }

  /**
   * Close Redis connection gracefully
   * 
   * @async
   * @function disconnect
   * @description Closes Redis connection gracefully with proper cleanup.
   * Updates connection status and logs the disconnection event.
   * 
   * @returns {Promise<void>} Promise that resolves when connection is closed
   * 
   * @example
   * // Graceful shutdown
   * await redisConfig.disconnect()
   */
  async disconnect () {
    if (this.client) {
      await this.client.quit()
      this.isConnected = false
      logger.info('Redis connection closed')
    }
  }

  /**
   * Cache Management Utilities
   * 
   * @description Comprehensive cache operations with JSON serialization,
   * TTL support, error handling, and connection status validation.
   */

  /**
   * Store data in Redis cache with TTL (Time To Live) support
   * 
   * @async
   * @function set
   * @param {string} key - Cache key for storing data
   * @param {*} value - Data to store (will be JSON serialized)
   * @param {number} ttl - Time to live in seconds (default: 3600 = 1 hour)
   * 
   * @description Stores data in Redis cache with automatic JSON serialization
   * and TTL expiration. Handles connection failures gracefully.
   * 
   * @returns {Promise<boolean>} True if successful, false if failed
   * 
   * @example
   * // Store user data with 1 hour expiration
   * await redisConfig.set('user:123', { name: 'John', email: 'john@example.com' }, 3600)
   * 
   * @example
   * // Store with default TTL (1 hour)
   * await redisConfig.set('session:abc', { userId: 123, role: 'admin' })
   */
  async set (key, value, ttl = 3600) {
    if (!this.isRedisConnected()) {
      logger.warn('Redis not connected, skipping cache set')
      return false
    }

    try {
      // Serialize value to JSON for storage
      const serializedValue = JSON.stringify(value)
      // Store with TTL using SETEX command
      await this.client.setex(key, ttl, serializedValue)
      return true
    } catch (error) {
      logger.error('Redis set error:', error)
      return false
    }
  }

  /**
   * Retrieve data from Redis cache with automatic JSON deserialization
   * 
   * @async
   * @function get
   * @param {string} key - Cache key to retrieve data from
   * 
   * @description Retrieves data from Redis cache with automatic JSON deserialization.
   * Returns null if key doesn't exist or connection fails.
   * 
   * @returns {Promise<*|null>} Retrieved data or null if not found/failed
   * 
   * @example
   * // Retrieve user data
   * const user = await redisConfig.get('user:123')
   * // Returns: { name: 'John', email: 'john@example.com' } or null
   * 
   * @example
   * // Check if data exists before using
   * const session = await redisConfig.get('session:abc')
   * if (session) {
   *   console.log('User role:', session.role)
   * }
   */
  async get (key) {
    if (!this.isRedisConnected()) {
      logger.warn('Redis not connected, skipping cache get')
      return null
    }

    try {
      // Retrieve value from Redis
      const value = await this.client.get(key)
      // Deserialize JSON and return, or null if not found
      return value ? JSON.parse(value) : null
    } catch (error) {
      logger.error('Redis get error:', error)
      return null
    }
  }

  /**
   * Delete data from Redis cache
   * 
   * @async
   * @function del
   * @param {string} key - Cache key to delete
   * 
   * @description Removes data from Redis cache. Handles connection failures gracefully.
   * 
   * @returns {Promise<boolean>} True if successful, false if failed
   * 
   * @example
   * // Delete user cache
   * await redisConfig.del('user:123')
   * 
   * @example
   * // Delete session on logout
   * await redisConfig.del('session:abc')
   */
  async del (key) {
    if (!this.isRedisConnected()) {
      logger.warn('Redis not connected, skipping cache delete')
      return false
    }

    try {
      // Delete key from Redis
      await this.client.del(key)
      return true
    } catch (error) {
      logger.error('Redis delete error:', error)
      return false
    }
  }

  /**
   * Check if a key exists in Redis cache
   * 
   * @async
   * @function exists
   * @param {string} key - Cache key to check
   * 
   * @description Verifies if a key exists in Redis cache without retrieving the value.
   * Useful for cache hit/miss monitoring and conditional operations.
   * 
   * @returns {Promise<boolean>} True if key exists, false if not or connection failed
   * 
   * @example
   * // Check if user data is cached
   * if (await redisConfig.exists('user:123')) {
   *   const user = await redisConfig.get('user:123')
   * }
   * 
   * @example
   * // Conditional cache operations
   * if (!await redisConfig.exists('expensive:data')) {
   *   // Fetch from database and cache
   *   const data = await fetchFromDatabase()
   *   await redisConfig.set('expensive:data', data)
   * }
   */
  async exists (key) {
    if (!this.isRedisConnected()) {
      return false
    }

    try {
      // Check if key exists in Redis
      const result = await this.client.exists(key)
      return result === 1
    } catch (error) {
      logger.error('Redis exists error:', error)
      return false
    }
  }

  /**
   * Generate standardized cache key with namespace separation
   * 
   * @function generateKey
   * @param {string} prefix - Key prefix for namespace separation
   * @param {...string} parts - Additional key parts to join
   * 
   * @description Creates standardized cache keys with colon separation for
   * namespace organization and easy key management. Prevents key collisions
   * and provides clear key hierarchy.
   * 
   * @returns {string} Formatted cache key with colon separation
   * 
   * @example
   * // Generate user cache key
   * const userKey = redisConfig.generateKey('user', '123')
   * // Returns: 'user:123'
   * 
   * @example
   * // Generate complex cache key
   * const ticketKey = redisConfig.generateKey('ticket', 'list', 'admin', '1', '10')
   * // Returns: 'ticket:list:admin:1:10'
   * 
   * @example
   * // Generate session key
   * const sessionKey = redisConfig.generateKey('session', 'abc123')
   * // Returns: 'session:abc123'
   */
  generateKey (prefix, ...parts) {
    return `${prefix}:${parts.join(':')}`
  }
}

// Create singleton instance for application-wide Redis access
const redisConfig = new RedisConfig()

// Export singleton instance as default export
export default redisConfig
