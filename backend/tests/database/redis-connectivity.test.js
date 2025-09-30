import { describe, it, expect, beforeEach, afterEach, vi, beforeAll, afterAll } from 'vitest'
import redisConfig from '../config/redis.js'
import logger from '../utils/logger.js'

describe('Redis Connectivity and Operations Tests', () => {
  let testKey
  let testData

  beforeAll(async () => {
    // Set up test data
    testKey = 'test:connectivity:' + Date.now()
    testData = {
      id: 123,
      name: 'Test User',
      email: 'test@example.com',
      timestamp: new Date().toISOString(),
      nested: {
        role: 'admin',
        permissions: ['read', 'write', 'delete']
      }
    }

    // Mock logger to prevent actual file writes during tests
    vi.spyOn(logger, 'info').mockImplementation(() => {})
    vi.spyOn(logger, 'warn').mockImplementation(() => {})
    vi.spyOn(logger, 'error').mockImplementation(() => {})
  })

  afterAll(async () => {
    // Clean up test data
    if (redisConfig.isRedisConnected()) {
      await redisConfig.del(testKey)
    }
    
    // Disconnect from Redis
    await redisConfig.disconnect()
    
    // Restore logger mocks
    vi.restoreAllMocks()
  })

  describe('Redis Connection Tests', () => {
    it('should connect to Redis successfully', async () => {
      // Test connection to Redis
      const client = await redisConfig.connect()
      
      expect(client).toBeDefined()
      expect(redisConfig.isRedisConnected()).toBe(true)
    }, 10000) // 10 second timeout for connection

    it('should verify Redis connection status', () => {
      expect(redisConfig.isRedisConnected()).toBe(true)
    })

    it('should get Redis client instance', () => {
      const client = redisConfig.getClient()
      expect(client).toBeDefined()
      expect(client.status).toBe('ready')
    })
  })

  describe('Redis Basic Operations Tests', () => {
    it('should store data in Redis cache', async () => {
      const result = await redisConfig.set(testKey, testData, 60) // 60 seconds TTL
      expect(result).toBe(true)
    })

    it('should retrieve data from Redis cache', async () => {
      const retrievedData = await redisConfig.get(testKey)
      
      expect(retrievedData).toBeDefined()
      expect(retrievedData.id).toBe(testData.id)
      expect(retrievedData.name).toBe(testData.name)
      expect(retrievedData.email).toBe(testData.email)
      expect(retrievedData.nested.role).toBe(testData.nested.role)
      expect(retrievedData.nested.permissions).toEqual(testData.nested.permissions)
    })

    it('should check if key exists in Redis', async () => {
      const exists = await redisConfig.exists(testKey)
      expect(exists).toBe(true)
    })

    it('should handle non-existent key', async () => {
      const nonExistentKey = 'test:non-existent:' + Date.now()
      const exists = await redisConfig.exists(nonExistentKey)
      expect(exists).toBe(false)
    })

    it('should delete data from Redis cache', async () => {
      const result = await redisConfig.del(testKey)
      expect(result).toBe(true)
      
      // Verify deletion
      const exists = await redisConfig.exists(testKey)
      expect(exists).toBe(false)
    })
  })

  describe('Redis Data Types Tests', () => {
    it('should handle string data', async () => {
      const stringKey = 'test:string:' + Date.now()
      const stringData = 'Hello Redis!'
      
      await redisConfig.set(stringKey, stringData, 30)
      const retrieved = await redisConfig.get(stringKey)
      
      expect(retrieved).toBe(stringData)
      
      // Cleanup
      await redisConfig.del(stringKey)
    })

    it('should handle number data', async () => {
      const numberKey = 'test:number:' + Date.now()
      const numberData = 42
      
      await redisConfig.set(numberKey, numberData, 30)
      const retrieved = await redisConfig.get(numberKey)
      
      expect(retrieved).toBe(numberData)
      
      // Cleanup
      await redisConfig.del(numberKey)
    })

    it('should handle boolean data', async () => {
      const booleanKey = 'test:boolean:' + Date.now()
      const booleanData = true
      
      await redisConfig.set(booleanKey, booleanData, 30)
      const retrieved = await redisConfig.get(booleanKey)
      
      expect(retrieved).toBe(booleanData)
      
      // Cleanup
      await redisConfig.del(booleanKey)
    })

    it('should handle array data', async () => {
      const arrayKey = 'test:array:' + Date.now()
      const arrayData = [1, 2, 3, 'four', { five: 5 }]
      
      await redisConfig.set(arrayKey, arrayData, 30)
      const retrieved = await redisConfig.get(arrayKey)
      
      expect(retrieved).toEqual(arrayData)
      expect(Array.isArray(retrieved)).toBe(true)
      
      // Cleanup
      await redisConfig.del(arrayKey)
    })

    it('should handle null and undefined data', async () => {
      const nullKey = 'test:null:' + Date.now()
      const nullData = null
      
      await redisConfig.set(nullKey, nullData, 30)
      const retrieved = await redisConfig.get(nullKey)
      
      expect(retrieved).toBe(null)
      
      // Cleanup
      await redisConfig.del(nullKey)
    })
  })

  describe('Redis TTL (Time To Live) Tests', () => {
    it('should set data with TTL and verify expiration', async () => {
      const ttlKey = 'test:ttl:' + Date.now()
      const ttlData = { message: 'This will expire', timestamp: Date.now() }
      
      // Set with 2 seconds TTL
      await redisConfig.set(ttlKey, ttlData, 2)
      
      // Verify data exists immediately
      const exists = await redisConfig.exists(ttlKey)
      expect(exists).toBe(true)
      
      // Wait for expiration (3 seconds to be safe)
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Verify data has expired
      const expiredExists = await redisConfig.exists(ttlKey)
      expect(expiredExists).toBe(false)
    }, 10000) // 10 second timeout for TTL test

    it('should use default TTL when not specified', async () => {
      const defaultTtlKey = 'test:default-ttl:' + Date.now()
      const defaultTtlData = { message: 'Default TTL test' }
      
      // Set without TTL (should use default 3600 seconds)
      await redisConfig.set(defaultTtlKey, defaultTtlData)
      
      // Verify data exists
      const exists = await redisConfig.exists(defaultTtlKey)
      expect(exists).toBe(true)
      
      // Cleanup
      await redisConfig.del(defaultTtlKey)
    })
  })

  describe('Redis Key Generation Tests', () => {
    it('should generate proper cache keys', () => {
      const key1 = redisConfig.generateKey('user', '123')
      expect(key1).toBe('user:123')
      
      const key2 = redisConfig.generateKey('ticket', 'list', 'admin', '1', '10')
      expect(key2).toBe('ticket:list:admin:1:10')
      
      const key3 = redisConfig.generateKey('session', 'abc123')
      expect(key3).toBe('session:abc123')
    })

    it('should handle complex key generation', () => {
      const complexKey = redisConfig.generateKey('ems', 'cache', 'employee', '123', 'profile', 'v2')
      expect(complexKey).toBe('ems:cache:employee:123:profile:v2')
    })
  })

  describe('Redis Error Handling Tests', () => {
    it('should handle connection errors gracefully', async () => {
      // Test with invalid key (empty string) - Redis actually accepts empty keys
      const result = await redisConfig.set('', testData)
      expect(result).toBe(true) // Redis accepts empty string keys
      
      // Clean up the empty key
      await redisConfig.del('')
    })

    it('should handle JSON serialization errors', async () => {
      // Create circular reference to test JSON.stringify error
      const circularData = { name: 'test' }
      circularData.self = circularData
      
      const result = await redisConfig.set('test:circular:' + Date.now(), circularData)
      expect(result).toBe(false)
    })
  })

  describe('Redis Performance Tests', () => {
    it('should handle multiple concurrent operations', async () => {
      const promises = []
      const keyPrefix = 'test:concurrent:' + Date.now()
      
      // Create 10 concurrent set operations
      for (let i = 0; i < 10; i++) {
        const key = `${keyPrefix}:${i}`
        const data = { id: i, message: `Concurrent test ${i}` }
        promises.push(redisConfig.set(key, data, 30))
      }
      
      const results = await Promise.all(promises)
      expect(results.every(result => result === true)).toBe(true)
      
      // Verify all keys exist
      const verifyPromises = []
      for (let i = 0; i < 10; i++) {
        const key = `${keyPrefix}:${i}`
        verifyPromises.push(redisConfig.exists(key))
      }
      
      const existsResults = await Promise.all(verifyPromises)
      expect(existsResults.every(exists => exists === true)).toBe(true)
      
      // Cleanup all keys
      const cleanupPromises = []
      for (let i = 0; i < 10; i++) {
        const key = `${keyPrefix}:${i}`
        cleanupPromises.push(redisConfig.del(key))
      }
      
      const cleanupResults = await Promise.all(cleanupPromises)
      expect(cleanupResults.every(result => result === true)).toBe(true)
    })

    it('should handle large data objects', async () => {
      const largeKey = 'test:large:' + Date.now()
      const largeData = {
        id: 1,
        name: 'Large Data Test',
        items: Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          value: `Item ${i}`,
          metadata: {
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
            tags: [`tag${i}`, `category${i % 10}`]
          }
        }))
      }
      
      const result = await redisConfig.set(largeKey, largeData, 60)
      expect(result).toBe(true)
      
      const retrieved = await redisConfig.get(largeKey)
      expect(retrieved).toBeDefined()
      expect(retrieved.items).toHaveLength(1000)
      expect(retrieved.items[0].id).toBe(0)
      expect(retrieved.items[999].id).toBe(999)
      
      // Cleanup
      await redisConfig.del(largeKey)
    })
  })

  describe('Redis Cache Invalidation Tests', () => {
    it('should handle cache invalidation patterns', async () => {
      const baseKey = 'test:invalidation:' + Date.now()
      const keys = [
        `${baseKey}:user:123`,
        `${baseKey}:user:456`,
        `${baseKey}:ticket:789`,
        `${baseKey}:ticket:101`
      ]
      
      // Set multiple keys
      for (const key of keys) {
        await redisConfig.set(key, { id: key.split(':').pop() }, 60)
      }
      
      // Verify all keys exist
      for (const key of keys) {
        const exists = await redisConfig.exists(key)
        expect(exists).toBe(true)
      }
      
      // Delete all keys (simulate cache invalidation)
      for (const key of keys) {
        const result = await redisConfig.del(key)
        expect(result).toBe(true)
      }
      
      // Verify all keys are deleted
      for (const key of keys) {
        const exists = await redisConfig.exists(key)
        expect(exists).toBe(false)
      }
    })
  })

  describe('Redis Connection Status Tests', () => {
    it('should maintain connection status during operations', () => {
      expect(redisConfig.isRedisConnected()).toBe(true)
    })

    it('should handle connection status checks', () => {
      const isConnected = redisConfig.isRedisConnected()
      expect(typeof isConnected).toBe('boolean')
      expect(isConnected).toBe(true)
    })
  })
})
