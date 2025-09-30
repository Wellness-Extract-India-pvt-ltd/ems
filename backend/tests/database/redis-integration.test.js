import { describe, it, expect, beforeEach, afterEach, vi, beforeAll, afterAll } from 'vitest'
import redisConfig from '../config/redis.js'
import logger from '../utils/logger.js'

describe('Redis Integration with EMS Backend Tests', () => {
  let testKeys = []

  beforeAll(async () => {
    // Connect to Redis
    await redisConfig.connect()
    
    // Mock logger to prevent actual file writes during tests
    vi.spyOn(logger, 'info').mockImplementation(() => {})
    vi.spyOn(logger, 'warn').mockImplementation(() => {})
    vi.spyOn(logger, 'error').mockImplementation(() => {})
  })

  afterAll(async () => {
    // Clean up all test keys
    for (const key of testKeys) {
      await redisConfig.del(key)
    }
    
    // Disconnect from Redis
    await redisConfig.disconnect()
    
    // Restore logger mocks
    vi.restoreAllMocks()
  })

  beforeEach(() => {
    // Clear test keys for each test
    testKeys = []
  })

  afterEach(async () => {
    // Clean up test keys after each test
    for (const key of testKeys) {
      await redisConfig.del(key)
    }
  })

  describe('Employee Controller Cache Integration', () => {
    it('should cache employee list data', async () => {
      const employeeListKey = redisConfig.generateKey('employee', 'list', 'admin', '1', '10')
      testKeys.push(employeeListKey)
      
      const employeeListData = {
        success: true,
        data: [
          { id: 1, first_name: 'John', last_name: 'Doe', employee_id: 'EMP001' },
          { id: 2, first_name: 'Jane', last_name: 'Smith', employee_id: 'EMP002' }
        ],
        pagination: { page: 1, limit: 10, total: 2, pages: 1 }
      }
      
      // Cache employee list
      const result = await redisConfig.set(employeeListKey, employeeListData, 300) // 5 minutes
      expect(result).toBe(true)
      
      // Retrieve cached data
      const cachedData = await redisConfig.get(employeeListKey)
      expect(cachedData).toBeDefined()
      expect(cachedData.success).toBe(true)
      expect(cachedData.data).toHaveLength(2)
      expect(cachedData.pagination.total).toBe(2)
    })

    it('should cache individual employee data', async () => {
      const employeeDetailKey = redisConfig.generateKey('employee', 'detail', '123')
      testKeys.push(employeeDetailKey)
      
      const employeeData = {
        success: true,
        data: {
          id: 123,
          first_name: 'John',
          last_name: 'Doe',
          employee_id: 'EMP001',
          email: 'john.doe@company.com',
          department: 'IT',
          position: 'Software Engineer'
        }
      }
      
      // Cache employee detail
      const result = await redisConfig.set(employeeDetailKey, employeeData, 300)
      expect(result).toBe(true)
      
      // Retrieve cached data
      const cachedData = await redisConfig.get(employeeDetailKey)
      expect(cachedData).toBeDefined()
      expect(cachedData.data.id).toBe(123)
      expect(cachedData.data.employee_id).toBe('EMP001')
    })
  })

  describe('Ticket Controller Cache Integration', () => {
    it('should cache ticket list data', async () => {
      const ticketListKey = redisConfig.generateKey('ticket', 'list', 'admin', '1', '10')
      testKeys.push(ticketListKey)
      
      const ticketListData = {
        success: true,
        data: [
          {
            id: 1,
            ticket_number: 'TKT-1234567890-ABC12',
            title: 'Login Issue',
            status: 'Open',
            priority: 'High',
            created_by: 1
          },
          {
            id: 2,
            ticket_number: 'TKT-1234567891-DEF34',
            title: 'Password Reset',
            status: 'In Progress',
            priority: 'Medium',
            created_by: 2
          }
        ],
        pagination: { page: 1, limit: 10, total: 2, pages: 1 }
      }
      
      // Cache ticket list
      const result = await redisConfig.set(ticketListKey, ticketListData, 300)
      expect(result).toBe(true)
      
      // Retrieve cached data
      const cachedData = await redisConfig.get(ticketListKey)
      expect(cachedData).toBeDefined()
      expect(cachedData.data).toHaveLength(2)
      expect(cachedData.data[0].ticket_number).toMatch(/^TKT-/)
    })

    it('should cache ticket detail data', async () => {
      const ticketDetailKey = redisConfig.generateKey('ticket', 'detail', '123')
      testKeys.push(ticketDetailKey)
      
      const ticketData = {
        success: true,
        data: {
          id: 123,
          ticket_number: 'TKT-1234567890-ABC12',
          title: 'Login Issue',
          description: 'User cannot login to the system',
          status: 'Open',
          priority: 'High',
          category: 'Technical',
          created_by: 1,
          assigned_to: 2,
          attachments: []
        }
      }
      
      // Cache ticket detail
      const result = await redisConfig.set(ticketDetailKey, ticketData, 300)
      expect(result).toBe(true)
      
      // Retrieve cached data
      const cachedData = await redisConfig.get(ticketDetailKey)
      expect(cachedData).toBeDefined()
      expect(cachedData.data.ticket_number).toMatch(/^TKT-/)
      expect(cachedData.data.status).toBe('Open')
    })
  })

  describe('Hardware Controller Cache Integration', () => {
    it('should cache hardware list data', async () => {
      const hardwareListKey = redisConfig.generateKey('hardware', 'list', 'admin', '1', '10')
      testKeys.push(hardwareListKey)
      
      const hardwareListData = {
        success: true,
        data: [
          {
            id: 1,
            asset_tag: 'HW001',
            name: 'Dell Laptop',
            category: 'Laptop',
            status: 'Active',
            assigned_to: 1
          },
          {
            id: 2,
            asset_tag: 'HW002',
            name: 'HP Desktop',
            category: 'Desktop',
            status: 'Available',
            assigned_to: null
          }
        ],
        pagination: { page: 1, limit: 10, total: 2, pages: 1 }
      }
      
      // Cache hardware list
      const result = await redisConfig.set(hardwareListKey, hardwareListData, 300)
      expect(result).toBe(true)
      
      // Retrieve cached data
      const cachedData = await redisConfig.get(hardwareListKey)
      expect(cachedData).toBeDefined()
      expect(cachedData.data).toHaveLength(2)
      expect(cachedData.data[0].asset_tag).toBe('HW001')
    })
  })

  describe('Software Controller Cache Integration', () => {
    it('should cache software list data', async () => {
      const softwareListKey = redisConfig.generateKey('software', 'list', 'admin', '1', '10')
      testKeys.push(softwareListKey)
      
      const softwareListData = {
        success: true,
        data: [
          {
            id: 1,
            name: 'Microsoft Office',
            version: '2021',
            license_type: 'Commercial',
            status: 'Active'
          },
          {
            id: 2,
            name: 'Adobe Creative Suite',
            version: '2023',
            license_type: 'Commercial',
            status: 'Active'
          }
        ],
        pagination: { page: 1, limit: 10, total: 2, pages: 1 }
      }
      
      // Cache software list
      const result = await redisConfig.set(softwareListKey, softwareListData, 300)
      expect(result).toBe(true)
      
      // Retrieve cached data
      const cachedData = await redisConfig.get(softwareListKey)
      expect(cachedData).toBeDefined()
      expect(cachedData.data).toHaveLength(2)
      expect(cachedData.data[0].name).toBe('Microsoft Office')
    })
  })

  describe('License Controller Cache Integration', () => {
    it('should cache license list data', async () => {
      const licenseListKey = redisConfig.generateKey('license', 'list', 'admin', '1', '10')
      testKeys.push(licenseListKey)
      
      const licenseListData = {
        success: true,
        data: [
          {
            id: 1,
            software_name: 'Microsoft Office',
            license_key: 'XXXXX-XXXXX-XXXXX-XXXXX-XXXXX',
            license_type: 'Commercial',
            seats: 100,
            used_seats: 45,
            expiry_date: '2024-12-31'
          }
        ],
        pagination: { page: 1, limit: 10, total: 1, pages: 1 }
      }
      
      // Cache license list
      const result = await redisConfig.set(licenseListKey, licenseListData, 300)
      expect(result).toBe(true)
      
      // Retrieve cached data
      const cachedData = await redisConfig.get(licenseListKey)
      expect(cachedData).toBeDefined()
      expect(cachedData.data).toHaveLength(1)
      expect(cachedData.data[0].software_name).toBe('Microsoft Office')
    })
  })

  describe('Integration Controller Cache Integration', () => {
    it('should cache integration list data', async () => {
      const integrationListKey = redisConfig.generateKey('integration', 'list', 'admin', '1', '10')
      testKeys.push(integrationListKey)
      
      const integrationListData = {
        success: true,
        data: [
          {
            id: 1,
            name: 'Slack Integration',
            type: 'notification',
            status: 'active',
            description: 'Slack notifications for ticket updates'
          },
          {
            id: 2,
            name: 'Email Integration',
            type: 'notification',
            status: 'active',
            description: 'Email notifications for system events'
          }
        ],
        pagination: { page: 1, limit: 10, total: 2, pages: 1 }
      }
      
      // Cache integration list
      const result = await redisConfig.set(integrationListKey, integrationListData, 300)
      expect(result).toBe(true)
      
      // Retrieve cached data
      const cachedData = await redisConfig.get(integrationListKey)
      expect(cachedData).toBeDefined()
      expect(cachedData.data).toHaveLength(2)
      expect(cachedData.data[0].name).toBe('Slack Integration')
    })
  })

  describe('Cache Invalidation Patterns', () => {
    it('should handle cache invalidation for employee updates', async () => {
      const employeeListKey = redisConfig.generateKey('employee', 'list', '*')
      const employeeDetailKey = redisConfig.generateKey('employee', 'detail', '123')
      
      testKeys.push(employeeListKey, employeeDetailKey)
      
      // Set initial cache
      await redisConfig.set(employeeListKey, { data: [] }, 300)
      await redisConfig.set(employeeDetailKey, { data: { id: 123 } }, 300)
      
      // Simulate cache invalidation (delete all employee-related keys)
      const listResult = await redisConfig.del(employeeListKey)
      const detailResult = await redisConfig.del(employeeDetailKey)
      
      expect(listResult).toBe(true)
      expect(detailResult).toBe(true)
      
      // Verify keys are deleted
      const listExists = await redisConfig.exists(employeeListKey)
      const detailExists = await redisConfig.exists(employeeDetailKey)
      
      expect(listExists).toBe(false)
      expect(detailExists).toBe(false)
    })

    it('should handle cache invalidation for ticket updates', async () => {
      const ticketListKey = redisConfig.generateKey('ticket', 'list', '*')
      const ticketDetailKey = redisConfig.generateKey('ticket', 'detail', '123')
      
      testKeys.push(ticketListKey, ticketDetailKey)
      
      // Set initial cache
      await redisConfig.set(ticketListKey, { data: [] }, 300)
      await redisConfig.set(ticketDetailKey, { data: { id: 123 } }, 300)
      
      // Simulate cache invalidation
      const listResult = await redisConfig.del(ticketListKey)
      const detailResult = await redisConfig.del(ticketDetailKey)
      
      expect(listResult).toBe(true)
      expect(detailResult).toBe(true)
    })
  })

  describe('Role-Based Cache Keys', () => {
    it('should generate different cache keys for different user roles', () => {
      const adminKey = redisConfig.generateKey('employee', 'list', 'admin', '1', '10')
      const managerKey = redisConfig.generateKey('employee', 'list', 'manager', '1', '10')
      const employeeKey = redisConfig.generateKey('employee', 'list', 'employee', '123', '1', '10')
      
      expect(adminKey).toBe('employee:list:admin:1:10')
      expect(managerKey).toBe('employee:list:manager:1:10')
      expect(employeeKey).toBe('employee:list:employee:123:1:10')
      
      // Keys should be different
      expect(adminKey).not.toBe(managerKey)
      expect(adminKey).not.toBe(employeeKey)
      expect(managerKey).not.toBe(employeeKey)
    })

    it('should cache data with role-specific keys', async () => {
      const adminKey = redisConfig.generateKey('ticket', 'list', 'admin', '1', '10')
      const employeeKey = redisConfig.generateKey('ticket', 'list', 'employee', '123', '1', '10')
      
      testKeys.push(adminKey, employeeKey)
      
      const adminData = { data: [], role: 'admin' }
      const employeeData = { data: [], role: 'employee', userId: 123 }
      
      // Cache with different keys
      await redisConfig.set(adminKey, adminData, 300)
      await redisConfig.set(employeeKey, employeeData, 300)
      
      // Retrieve and verify
      const cachedAdminData = await redisConfig.get(adminKey)
      const cachedEmployeeData = await redisConfig.get(employeeKey)
      
      expect(cachedAdminData.role).toBe('admin')
      expect(cachedEmployeeData.role).toBe('employee')
      expect(cachedEmployeeData.userId).toBe(123)
    })
  })

  describe('Cache Performance Tests', () => {
    it('should handle multiple concurrent cache operations', async () => {
      const promises = []
      const baseKey = 'test:performance:' + Date.now()
      
      // Create 20 concurrent cache operations
      for (let i = 0; i < 20; i++) {
        const key = `${baseKey}:${i}`
        const data = { id: i, timestamp: Date.now() }
        testKeys.push(key)
        promises.push(redisConfig.set(key, data, 60))
      }
      
      const results = await Promise.all(promises)
      expect(results.every(result => result === true)).toBe(true)
      
      // Verify all keys exist
      const verifyPromises = []
      for (let i = 0; i < 20; i++) {
        const key = `${baseKey}:${i}`
        verifyPromises.push(redisConfig.exists(key))
      }
      
      const existsResults = await Promise.all(verifyPromises)
      expect(existsResults.every(exists => exists === true)).toBe(true)
    })

    it('should handle cache operations with different TTL values', async () => {
      const shortTtlKey = 'test:short-ttl:' + Date.now()
      const longTtlKey = 'test:long-ttl:' + Date.now()
      
      testKeys.push(shortTtlKey, longTtlKey)
      
      const data = { message: 'TTL test' }
      
      // Set with different TTL values
      await redisConfig.set(shortTtlKey, data, 5) // 5 seconds
      await redisConfig.set(longTtlKey, data, 300) // 5 minutes
      
      // Both should exist immediately
      const shortExists = await redisConfig.exists(shortTtlKey)
      const longExists = await redisConfig.exists(longTtlKey)
      
      expect(shortExists).toBe(true)
      expect(longExists).toBe(true)
    })
  })
})
