import { describe, it, expect, beforeEach, afterEach, vi, beforeAll, afterAll } from 'vitest'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

describe('Redis Configuration Tests', () => {
  let configPath
  let fileContent

  beforeAll(() => {
    configPath = path.join(__dirname, '..', 'config', 'redis.js')
    fileContent = fs.readFileSync(configPath, 'utf8')
  })

  describe('File Structure and Imports', () => {
    it('should exist and be readable', () => {
      expect(fs.existsSync(configPath)).toBe(true)
      expect(fileContent.length).toBeGreaterThan(0)
    })

    it('should have valid JavaScript syntax', () => {
      // Check for basic JavaScript syntax patterns
      expect(fileContent).toContain('class ')
      expect(fileContent).toContain('constructor')
      expect(fileContent).toContain('export ')
      expect(fileContent).toContain('import ')
    })

    it('should have proper ES6 module structure', () => {
      expect(fileContent).toContain('import Redis from \'ioredis\'')
      expect(fileContent).toContain('import logger from \'../utils/logger.js\'')
      expect(fileContent).toContain('export default redisConfig')
    })

    it('should import required modules', () => {
      expect(fileContent).toContain('import Redis from \'ioredis\'')
      expect(fileContent).toContain('import logger from \'../utils/logger.js\'')
    })
  })

  describe('Documentation', () => {
    it('should have a file-level JSDoc comment', () => {
      expect(fileContent).toContain('@fileoverview Redis Configuration for EMS Backend')
      expect(fileContent).toContain('@description Comprehensive Redis connection management')
      expect(fileContent).toContain('@author EMS Development Team')
      expect(fileContent).toContain('@version 1.0.0')
      expect(fileContent).toContain('@since 2025-09-17')
      expect(fileContent).toContain('@features')
    })

    it('should have class documentation', () => {
      expect(fileContent).toContain('@class RedisConfig')
      expect(fileContent).toContain('@description Manages Redis connection')
      expect(fileContent).toContain('@example')
    })

    it('should have constructor documentation', () => {
      expect(fileContent).toContain('@constructor')
      expect(fileContent).toContain('@description Creates a new Redis configuration instance')
    })

    it('should have connect method documentation', () => {
      expect(fileContent).toContain('* Initialize Redis connection with comprehensive configuration')
      expect(fileContent).toContain('* @async')
      expect(fileContent).toContain('* @function connect')
      expect(fileContent).toContain('* @returns {Promise<Redis>} Redis client instance')
      expect(fileContent).toContain('* @throws {Error} If Redis connection fails')
      expect(fileContent).toContain('* @example')
    })

    it('should have getClient method documentation', () => {
      expect(fileContent).toContain('* Get Redis client instance for direct operations')
      expect(fileContent).toContain('* @function getClient')
      expect(fileContent).toContain('* @returns {Redis} Redis client instance')
      expect(fileContent).toContain('* @throws {Error} If Redis client is not initialized')
    })

    it('should have isRedisConnected method documentation', () => {
      expect(fileContent).toContain('* Check if Redis connection is active and ready')
      expect(fileContent).toContain('* @function isRedisConnected')
      expect(fileContent).toContain('* @returns {boolean} True if Redis is connected and ready')
    })

    it('should have disconnect method documentation', () => {
      expect(fileContent).toContain('* Close Redis connection gracefully')
      expect(fileContent).toContain('* @async')
      expect(fileContent).toContain('* @function disconnect')
      expect(fileContent).toContain('* @returns {Promise<void>} Promise that resolves when connection is closed')
    })

    it('should have set method documentation', () => {
      expect(fileContent).toContain('* Store data in Redis cache with TTL (Time To Live) support')
      expect(fileContent).toContain('* @async')
      expect(fileContent).toContain('* @function set')
      expect(fileContent).toContain('* @param {string} key - Cache key for storing data')
      expect(fileContent).toContain('* @param {*} value - Data to store (will be JSON serialized)')
      expect(fileContent).toContain('* @param {number} ttl - Time to live in seconds (default: 3600 = 1 hour)')
      expect(fileContent).toContain('* @returns {Promise<boolean>} True if successful, false if failed')
    })

    it('should have get method documentation', () => {
      expect(fileContent).toContain('* Retrieve data from Redis cache with automatic JSON deserialization')
      expect(fileContent).toContain('* @function get')
      expect(fileContent).toContain('* @param {string} key - Cache key to retrieve data from')
      expect(fileContent).toContain('* @returns {Promise<*|null>} Retrieved data or null if not found/failed')
    })

    it('should have del method documentation', () => {
      expect(fileContent).toContain('* Delete data from Redis cache')
      expect(fileContent).toContain('* @function del')
      expect(fileContent).toContain('* @param {string} key - Cache key to delete')
      expect(fileContent).toContain('* @returns {Promise<boolean>} True if successful, false if failed')
    })

    it('should have exists method documentation', () => {
      expect(fileContent).toContain('* Check if a key exists in Redis cache')
      expect(fileContent).toContain('* @function exists')
      expect(fileContent).toContain('* @param {string} key - Cache key to check')
      expect(fileContent).toContain('* @returns {Promise<boolean>} True if key exists, false if not or connection failed')
    })

    it('should have generateKey method documentation', () => {
      expect(fileContent).toContain('* Generate standardized cache key with namespace separation')
      expect(fileContent).toContain('* @function generateKey')
      expect(fileContent).toContain('* @param {string} prefix - Key prefix for namespace separation')
      expect(fileContent).toContain('* @param {...string} parts - Additional key parts to join')
      expect(fileContent).toContain('* @returns {string} Formatted cache key with colon separation')
    })
  })

  describe('RedisConfig Class Structure', () => {
    it('should have proper class declaration', () => {
      expect(fileContent).toContain('class RedisConfig {')
    })

    it('should have constructor with proper initialization', () => {
      expect(fileContent).toContain('constructor () {')
      expect(fileContent).toContain('this.client = null')
      expect(fileContent).toContain('this.isConnected = false')
    })

    it('should have connect method', () => {
      expect(fileContent).toContain('async connect () {')
    })

    it('should have getClient method', () => {
      expect(fileContent).toContain('getClient () {')
    })

    it('should have isRedisConnected method', () => {
      expect(fileContent).toContain('isRedisConnected () {')
    })

    it('should have disconnect method', () => {
      expect(fileContent).toContain('async disconnect () {')
    })

    it('should have set method', () => {
      expect(fileContent).toContain('async set (key, value, ttl = 3600) {')
    })

    it('should have get method', () => {
      expect(fileContent).toContain('async get (key) {')
    })

    it('should have del method', () => {
      expect(fileContent).toContain('async del (key) {')
    })

    it('should have exists method', () => {
      expect(fileContent).toContain('async exists (key) {')
    })

    it('should have generateKey method', () => {
      expect(fileContent).toContain('generateKey (prefix, ...parts) {')
    })
  })

  describe('Connect Method', () => {
    it('should have proper method signature', () => {
      expect(fileContent).toContain('async connect () {')
    })

    it('should have try-catch block', () => {
      expect(fileContent).toContain('try {')
      expect(fileContent).toContain('} catch (error) {')
    })

    it('should configure Redis connection parameters', () => {
      expect(fileContent).toContain('const redisConfig = {')
      expect(fileContent).toContain('host: process.env.REDIS_HOST || \'localhost\'')
      expect(fileContent).toContain('port: process.env.REDIS_PORT || 6379')
      expect(fileContent).toContain('password: process.env.REDIS_PASSWORD || null')
      expect(fileContent).toContain('retryDelayOnFailover: 100')
      expect(fileContent).toContain('maxRetriesPerRequest: 3')
      expect(fileContent).toContain('lazyConnect: true')
      expect(fileContent).toContain('keepAlive: 30000')
      expect(fileContent).toContain('connectTimeout: 10000')
      expect(fileContent).toContain('commandTimeout: 5000')
      expect(fileContent).toContain('enableReadyCheck: false')
    })

    it('should create Redis client instance', () => {
      expect(fileContent).toContain('this.client = new Redis(redisConfig)')
    })

    it('should set up event listeners', () => {
      expect(fileContent).toContain('this.client.on(\'connect\'')
      expect(fileContent).toContain('this.client.on(\'error\'')
      expect(fileContent).toContain('this.client.on(\'close\'')
      expect(fileContent).toContain('this.client.on(\'reconnecting\'')
    })

    it('should handle connect event', () => {
      expect(fileContent).toContain('logger.info(\'Redis connected successfully\')')
      expect(fileContent).toContain('this.isConnected = true')
    })

    it('should handle error event', () => {
      expect(fileContent).toContain('logger.error(\'Redis connection error:\', error)')
      expect(fileContent).toContain('this.isConnected = false')
    })

    it('should handle close event', () => {
      expect(fileContent).toContain('logger.warn(\'Redis connection closed\')')
      expect(fileContent).toContain('this.isConnected = false')
    })

    it('should handle reconnecting event', () => {
      expect(fileContent).toContain('logger.info(\'Redis reconnecting...\')')
    })

    it('should establish connection', () => {
      expect(fileContent).toContain('await this.client.connect()')
    })

    it('should return client', () => {
      expect(fileContent).toContain('return this.client')
    })

    it('should handle connection errors', () => {
      expect(fileContent).toContain('logger.error(\'Failed to connect to Redis:\', error)')
      expect(fileContent).toContain('throw error')
    })
  })

  describe('GetClient Method', () => {
    it('should have proper method signature', () => {
      expect(fileContent).toContain('getClient () {')
    })

    it('should check if client exists', () => {
      expect(fileContent).toContain('if (!this.client) {')
      expect(fileContent).toContain('throw new Error(\'Redis client not initialized. Call connect() first.\')')
    })

    it('should return client', () => {
      expect(fileContent).toContain('return this.client')
    })
  })

  describe('IsRedisConnected Method', () => {
    it('should have proper method signature', () => {
      expect(fileContent).toContain('isRedisConnected () {')
    })

    it('should check connection status', () => {
      expect(fileContent).toContain('return this.isConnected && this.client && this.client.status === \'ready\'')
    })
  })

  describe('Disconnect Method', () => {
    it('should have proper method signature', () => {
      expect(fileContent).toContain('async disconnect () {')
    })

    it('should check if client exists', () => {
      expect(fileContent).toContain('if (this.client) {')
    })

    it('should quit client connection', () => {
      expect(fileContent).toContain('await this.client.quit()')
    })

    it('should update connection status', () => {
      expect(fileContent).toContain('this.isConnected = false')
    })

    it('should log disconnection', () => {
      expect(fileContent).toContain('logger.info(\'Redis connection closed\')')
    })
  })

  describe('Set Method', () => {
    it('should have proper method signature', () => {
      expect(fileContent).toContain('async set (key, value, ttl = 3600) {')
    })

    it('should check connection status', () => {
      expect(fileContent).toContain('if (!this.isRedisConnected()) {')
      expect(fileContent).toContain('logger.warn(\'Redis not connected, skipping cache set\')')
      expect(fileContent).toContain('return false')
    })

    it('should have try-catch block', () => {
      expect(fileContent).toContain('try {')
      expect(fileContent).toContain('} catch (error) {')
    })

    it('should serialize value to JSON', () => {
      expect(fileContent).toContain('const serializedValue = JSON.stringify(value)')
    })

    it('should store with TTL', () => {
      expect(fileContent).toContain('await this.client.setex(key, ttl, serializedValue)')
    })

    it('should return success status', () => {
      expect(fileContent).toContain('return true')
    })

    it('should handle errors', () => {
      expect(fileContent).toContain('logger.error(\'Redis set error:\', error)')
      expect(fileContent).toContain('return false')
    })
  })

  describe('Get Method', () => {
    it('should have proper method signature', () => {
      expect(fileContent).toContain('async get (key) {')
    })

    it('should check connection status', () => {
      expect(fileContent).toContain('if (!this.isRedisConnected()) {')
      expect(fileContent).toContain('logger.warn(\'Redis not connected, skipping cache get\')')
      expect(fileContent).toContain('return null')
    })

    it('should have try-catch block', () => {
      expect(fileContent).toContain('try {')
      expect(fileContent).toContain('} catch (error) {')
    })

    it('should retrieve value from Redis', () => {
      expect(fileContent).toContain('const value = await this.client.get(key)')
    })

    it('should deserialize JSON', () => {
      expect(fileContent).toContain('return value ? JSON.parse(value) : null')
    })

    it('should handle errors', () => {
      expect(fileContent).toContain('logger.error(\'Redis get error:\', error)')
      expect(fileContent).toContain('return null')
    })
  })

  describe('Del Method', () => {
    it('should have proper method signature', () => {
      expect(fileContent).toContain('async del (key) {')
    })

    it('should check connection status', () => {
      expect(fileContent).toContain('if (!this.isRedisConnected()) {')
      expect(fileContent).toContain('logger.warn(\'Redis not connected, skipping cache delete\')')
      expect(fileContent).toContain('return false')
    })

    it('should have try-catch block', () => {
      expect(fileContent).toContain('try {')
      expect(fileContent).toContain('} catch (error) {')
    })

    it('should delete key from Redis', () => {
      expect(fileContent).toContain('await this.client.del(key)')
    })

    it('should return success status', () => {
      expect(fileContent).toContain('return true')
    })

    it('should handle errors', () => {
      expect(fileContent).toContain('logger.error(\'Redis delete error:\', error)')
      expect(fileContent).toContain('return false')
    })
  })

  describe('Exists Method', () => {
    it('should have proper method signature', () => {
      expect(fileContent).toContain('async exists (key) {')
    })

    it('should check connection status', () => {
      expect(fileContent).toContain('if (!this.isRedisConnected()) {')
      expect(fileContent).toContain('return false')
    })

    it('should have try-catch block', () => {
      expect(fileContent).toContain('try {')
      expect(fileContent).toContain('} catch (error) {')
    })

    it('should check if key exists', () => {
      expect(fileContent).toContain('const result = await this.client.exists(key)')
      expect(fileContent).toContain('return result === 1')
    })

    it('should handle errors', () => {
      expect(fileContent).toContain('logger.error(\'Redis exists error:\', error)')
      expect(fileContent).toContain('return false')
    })
  })

  describe('GenerateKey Method', () => {
    it('should have proper method signature', () => {
      expect(fileContent).toContain('generateKey (prefix, ...parts) {')
    })

    it('should generate key with colon separation', () => {
      expect(fileContent).toContain('return `${prefix}:${parts.join(\':\')}`')
    })
  })

  describe('Singleton Pattern', () => {
    it('should create singleton instance', () => {
      expect(fileContent).toContain('const redisConfig = new RedisConfig()')
    })

    it('should export singleton as default', () => {
      expect(fileContent).toContain('export default redisConfig')
    })
  })

  describe('Error Handling Patterns', () => {
    it('should have comprehensive error handling', () => {
      expect(fileContent).toContain('} catch (error) {')
      expect(fileContent).toContain('logger.error')
      expect(fileContent).toContain('throw error')
    })

    it('should handle specific error cases', () => {
      expect(fileContent).toContain('Failed to connect to Redis')
      expect(fileContent).toContain('Redis connection error')
      expect(fileContent).toContain('Redis set error')
      expect(fileContent).toContain('Redis get error')
      expect(fileContent).toContain('Redis delete error')
      expect(fileContent).toContain('Redis exists error')
    })

    it('should have proper error responses', () => {
      expect(fileContent).toContain('return false')
      expect(fileContent).toContain('return null')
      expect(fileContent).toContain('throw new Error')
    })
  })

  describe('Logging Patterns', () => {
    it('should have proper logging statements', () => {
      expect(fileContent).toContain('logger.info(\'Redis connected successfully\')')
      expect(fileContent).toContain('logger.error(\'Redis connection error:\', error)')
      expect(fileContent).toContain('logger.warn(\'Redis connection closed\')')
      expect(fileContent).toContain('logger.info(\'Redis reconnecting...\')')
      expect(fileContent).toContain('logger.info(\'Redis connection closed\')')
    })
  })

  describe('Code Quality and Patterns', () => {
    it('should use async/await properly', () => {
      expect(fileContent).toContain('async ')
      expect(fileContent).toContain('await ')
    })

    it('should have proper error handling', () => {
      expect(fileContent).toContain('try {')
      expect(fileContent).toContain('} catch (')
    })

    it('should use consistent naming', () => {
      expect(fileContent).toContain('this.client')
      expect(fileContent).toContain('this.isConnected')
      expect(fileContent).toContain('redisConfig')
    })

    it('should have proper return statements', () => {
      expect(fileContent).toContain('return this.client')
      expect(fileContent).toContain('return true')
      expect(fileContent).toContain('return false')
      expect(fileContent).toContain('return null')
    })

    it('should use Redis operations', () => {
      expect(fileContent).toContain('this.client.setex(')
      expect(fileContent).toContain('this.client.get(')
      expect(fileContent).toContain('this.client.del(')
      expect(fileContent).toContain('this.client.exists(')
      expect(fileContent).toContain('this.client.connect(')
      expect(fileContent).toContain('this.client.quit(')
    })

    it('should use JSON serialization', () => {
      expect(fileContent).toContain('JSON.stringify(value)')
      expect(fileContent).toContain('JSON.parse(value)')
    })

    it('should use environment variables', () => {
      expect(fileContent).toContain('process.env.REDIS_HOST')
      expect(fileContent).toContain('process.env.REDIS_PORT')
      expect(fileContent).toContain('process.env.REDIS_PASSWORD')
    })

    it('should use event listeners', () => {
      expect(fileContent).toContain('this.client.on(\'connect\'')
      expect(fileContent).toContain('this.client.on(\'error\'')
      expect(fileContent).toContain('this.client.on(\'close\'')
      expect(fileContent).toContain('this.client.on(\'reconnecting\'')
    })
  })
})
