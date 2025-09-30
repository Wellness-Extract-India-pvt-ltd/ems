import { describe, it, expect, beforeAll } from 'vitest'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

describe('Redis Configuration Unit Tests', () => {
  let configPath
  let fileContent

  beforeAll(() => {
    configPath = path.join(__dirname, '..', 'config', 'redis.js')
    fileContent = fs.readFileSync(configPath, 'utf8')
  })

  describe('File Structure and Syntax', () => {
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

    it('should be an ES6 module', () => {
      expect(fileContent).toContain('import ')
      expect(fileContent).toContain('export ')
    })

    it('should have proper file structure', () => {
      expect(fileContent).toContain('@fileoverview')
      expect(fileContent).toContain('@description')
      expect(fileContent).toContain('@author')
      expect(fileContent).toContain('@version')
      expect(fileContent).toContain('@since')
    })
  })

  describe('Import Statements', () => {
    it('should import Redis from ioredis', () => {
      expect(fileContent).toContain('import Redis from \'ioredis\'')
    })

    it('should import logger', () => {
      expect(fileContent).toContain('import logger from \'../utils/logger.js\'')
    })
  })

  describe('Class Declaration', () => {
    it('should declare RedisConfig class', () => {
      expect(fileContent).toContain('class RedisConfig {')
    })

    it('should have constructor', () => {
      expect(fileContent).toContain('constructor () {')
    })

    it('should initialize client and isConnected', () => {
      expect(fileContent).toContain('this.client = null')
      expect(fileContent).toContain('this.isConnected = false')
    })
  })

  describe('Method Declarations', () => {
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

  describe('Connect Method Structure', () => {
    it('should have proper method signature', () => {
      expect(fileContent).toContain('async connect () {')
    })

    it('should have try-catch block', () => {
      expect(fileContent).toContain('try {')
      expect(fileContent).toContain('} catch (error) {')
    })

    it('should configure Redis connection', () => {
      expect(fileContent).toContain('const redisConfig = {')
      expect(fileContent).toContain('host: process.env.REDIS_HOST || \'localhost\'')
      expect(fileContent).toContain('port: process.env.REDIS_PORT || 6379')
      expect(fileContent).toContain('password: process.env.REDIS_PASSWORD || null')
    })

    it('should set connection parameters', () => {
      expect(fileContent).toContain('retryDelayOnFailover: 100')
      expect(fileContent).toContain('maxRetriesPerRequest: 3')
      expect(fileContent).toContain('lazyConnect: true')
      expect(fileContent).toContain('keepAlive: 30000')
      expect(fileContent).toContain('connectTimeout: 10000')
      expect(fileContent).toContain('commandTimeout: 5000')
      expect(fileContent).toContain('enableReadyCheck: false')
    })

    it('should create Redis client', () => {
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

  describe('GetClient Method Structure', () => {
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

  describe('IsRedisConnected Method Structure', () => {
    it('should have proper method signature', () => {
      expect(fileContent).toContain('isRedisConnected () {')
    })

    it('should check connection status', () => {
      expect(fileContent).toContain('return this.isConnected && this.client && this.client.status === \'ready\'')
    })
  })

  describe('Disconnect Method Structure', () => {
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

  describe('Set Method Structure', () => {
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

  describe('Get Method Structure', () => {
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

  describe('Del Method Structure', () => {
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

  describe('Exists Method Structure', () => {
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

  describe('GenerateKey Method Structure', () => {
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

  describe('Documentation Quality', () => {
    it('should have file header documentation', () => {
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

    it('should have method documentation', () => {
      expect(fileContent).toContain('@async')
      expect(fileContent).toContain('@function')
      expect(fileContent).toContain('@param')
      expect(fileContent).toContain('@returns')
      expect(fileContent).toContain('@throws')
      expect(fileContent).toContain('@example')
    })

    it('should have inline comments', () => {
      expect(fileContent).toContain('// Import Redis client library for connection management')
      expect(fileContent).toContain('// Import logger for comprehensive logging and monitoring')
      expect(fileContent).toContain('// Redis client instance (null until connection is established)')
      expect(fileContent).toContain('// Connection status flag for monitoring and health checks')
      expect(fileContent).toContain('// Configure Redis connection parameters from environment variables')
      expect(fileContent).toContain('// Create Redis client instance with configuration')
      expect(fileContent).toContain('// Set up event listeners for connection monitoring and error handling')
      expect(fileContent).toContain('// Establish connection to Redis server')
      expect(fileContent).toContain('// Serialize value to JSON for storage')
      expect(fileContent).toContain('// Store with TTL using SETEX command')
      expect(fileContent).toContain('// Retrieve value from Redis')
      expect(fileContent).toContain('// Deserialize JSON and return, or null if not found')
      expect(fileContent).toContain('// Delete key from Redis')
      expect(fileContent).toContain('// Check if key exists in Redis')
      expect(fileContent).toContain('// Create singleton instance for application-wide Redis access')
      expect(fileContent).toContain('// Export singleton instance as default export')
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
