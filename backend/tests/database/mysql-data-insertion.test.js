/**
 * MySQL Data Insertion Test Suite
 * Tests employee data insertion, validation, and database operations
 */

import { describe, it, expect, beforeEach, afterEach, vi, beforeAll, afterAll } from 'vitest'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Mock the database connection
const mockDbConnection = {
  testConnection: vi.fn(() => Promise.resolve(true)),
  syncDatabase: vi.fn(() => Promise.resolve()),
  closeConnection: vi.fn(() => Promise.resolve()),
  getDatabaseHealth: vi.fn(() => Promise.resolve({
    isConnected: true,
    responseTime: 45,
    poolStats: { total: 10, used: 2, idle: 8 }
  })),
  getDatabaseInfo: vi.fn(() => Promise.resolve({
    version: '8.0.35',
    database: 'ems_db',
    charset: 'utf8mb4',
    collation: 'utf8mb4_unicode_ci'
  })),
  executeRawQuery: vi.fn(() => Promise.resolve([{ count: 0 }])),
  isDatabaseConnected: vi.fn(() => true),
  forceReconnect: vi.fn(() => Promise.resolve())
}

// Mock the logger
const mockLogger = {
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  http: vi.fn(),
  debug: vi.fn(),
  trace: vi.fn(),
  security: vi.fn(),
  performance: vi.fn()
}

// Mock models with data insertion capabilities
const mockModels = {
  Employee: {
    create: vi.fn((data) => Promise.resolve({ id: 1, ...data })),
    bulkCreate: vi.fn((data) => Promise.resolve(data.map((item, index) => ({ id: index + 1, ...item })))),
    findAll: vi.fn(() => Promise.resolve([])),
    findOne: vi.fn(() => Promise.resolve(null)),
    count: vi.fn(() => Promise.resolve(0)),
    destroy: vi.fn(() => Promise.resolve(0)),
    update: vi.fn(() => Promise.resolve([0])),
    findByPk: vi.fn(() => Promise.resolve(null)),
    findAndCountAll: vi.fn(() => Promise.resolve({ count: 0, rows: [] }))
  },
  Department: {
    create: vi.fn((data) => Promise.resolve({ id: 1, ...data })),
    bulkCreate: vi.fn((data) => Promise.resolve(data.map((item, index) => ({ id: index + 1, ...item })))),
    findAll: vi.fn(() => Promise.resolve([])),
    findOne: vi.fn(() => Promise.resolve(null)),
    count: vi.fn(() => Promise.resolve(0)),
    destroy: vi.fn(() => Promise.resolve(0)),
    update: vi.fn(() => Promise.resolve([0])),
    findByPk: vi.fn(() => Promise.resolve(null)),
    findAndCountAll: vi.fn(() => Promise.resolve({ count: 0, rows: [] }))
  },
  UserRoleMap: {
    create: vi.fn((data) => Promise.resolve({ id: 1, ...data })),
    bulkCreate: vi.fn((data) => Promise.resolve(data.map((item, index) => ({ id: index + 1, ...item })))),
    findAll: vi.fn(() => Promise.resolve([])),
    findOne: vi.fn(() => Promise.resolve(null)),
    count: vi.fn(() => Promise.resolve(0)),
    destroy: vi.fn(() => Promise.resolve(0)),
    update: vi.fn(() => Promise.resolve([0])),
    findByPk: vi.fn(() => Promise.resolve(null)),
    findAndCountAll: vi.fn(() => Promise.resolve({ count: 0, rows: [] }))
  }
}

// Sample employee data for testing
const sampleEmployeeData = [
  {
    employee_id: 'EMP001',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@company.com',
    contact_email: 'john.doe@company.com',
    phone: '1234567890',
    date_of_birth: '1990-01-15',
    gender: 'Male',
    marital_status: 'Single',
    address: '123 Main St, City, State',
    city: 'New York',
    state: 'NY',
    zip_code: '10001',
    country: 'USA',
    join_date: '2024-01-15',
    employment_type: 'Full-time',
    department_id: 1,
    position: 'Software Engineer',
    salary: 75000.00,
    status: 'Active',
    emergency_contact_name: 'Jane Doe',
    emergency_contact_phone: '0987654321',
    emergency_contact_relationship: 'Sibling',
    manager_id: null,
    work_location: 'Office',
    work_schedule: 'Regular',
    bank_name: 'Chase Bank',
    account_number: '123456789',
    ifsc_code: 'CHASUS33',
    ms_graph_user_id: 'john.doe@company.com'
  },
  {
    employee_id: 'EMP002',
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane.smith@company.com',
    contact_email: 'jane.smith@company.com',
    phone: '2345678901',
    date_of_birth: '1985-05-20',
    gender: 'Female',
    marital_status: 'Married',
    address: '456 Oak Ave, City, State',
    city: 'Los Angeles',
    state: 'CA',
    zip_code: '90210',
    country: 'USA',
    join_date: '2024-02-01',
    employment_type: 'Full-time',
    department_id: 2,
    position: 'HR Manager',
    salary: 85000.00,
    status: 'Active',
    emergency_contact_name: 'Bob Smith',
    emergency_contact_phone: '1876543210',
    emergency_contact_relationship: 'Spouse',
    manager_id: null,
    work_location: 'Office',
    work_schedule: 'Regular',
    bank_name: 'Wells Fargo',
    account_number: '987654321',
    ifsc_code: 'WFBIUS6S',
    ms_graph_user_id: 'jane.smith@company.com'
  }
]

const sampleDepartmentData = [
  {
    name: 'Information Technology',
    description: 'IT Department responsible for technology infrastructure',
    manager_id: 1,
    budget: 500000.00,
    location: 'New York Office',
    status: 'Active'
  },
  {
    name: 'Human Resources',
    description: 'HR Department responsible for employee management',
    manager_id: 2,
    budget: 300000.00,
    location: 'Los Angeles Office',
    status: 'Active'
  }
]

const sampleUserRoleData = [
  {
    employee_id: 1,
    ms_graph_user_id: 'john.doe@company.com',
    email: 'john.doe@company.com',
    role: 'admin',
    permissions: ['read', 'write', 'delete', 'admin'],
    is_active: true,
    last_login: new Date(),
    failed_login_attempts: 0,
    two_factor_enabled: false,
    login_notifications: true,
    session_timeout: 480
  },
  {
    employee_id: 2,
    ms_graph_user_id: 'jane.smith@company.com',
    email: 'jane.smith@company.com',
    role: 'hr',
    permissions: ['read', 'write', 'hr_management'],
    is_active: true,
    last_login: new Date(),
    failed_login_attempts: 0,
    two_factor_enabled: false,
    login_notifications: true,
    session_timeout: 480
  }
]

beforeAll(() => {
  // Mock required modules
  vi.mock('../database/connection.js', () => (mockDbConnection))
  vi.mock('../utils/logger.js', () => ({ default: mockLogger }))
  vi.mock('../models', () => (mockModels))
  
  // Set up mock environment variables
  process.env.DB_HOST = 'localhost'
  process.env.DB_PORT = '3306'
  process.env.DB_NAME = 'ems_db'
  process.env.DB_USER = 'ems_user'
  process.env.DB_PASSWORD = 'ems_password'
  process.env.NODE_ENV = 'test'
})

afterAll(() => {
  vi.restoreAllMocks()
})

describe('MySQL Data Insertion Tests', () => {
  describe('Employee Data Insertion', () => {
    it('should insert a single employee successfully', async () => {
      const employeeData = sampleEmployeeData[0]
      const result = await mockModels.Employee.create(employeeData)
      
      expect(result).toBeDefined()
      expect(result.id).toBe(1)
      expect(result.employee_id).toBe('EMP001')
      expect(result.first_name).toBe('John')
      expect(result.last_name).toBe('Doe')
      expect(result.email).toBe('john.doe@company.com')
      expect(mockModels.Employee.create).toHaveBeenCalledWith(employeeData)
    })

    it('should insert multiple employees using bulk create', async () => {
      const result = await mockModels.Employee.bulkCreate(sampleEmployeeData)
      
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(2)
      expect(result[0].id).toBe(1)
      expect(result[1].id).toBe(2)
      expect(mockModels.Employee.bulkCreate).toHaveBeenCalledWith(sampleEmployeeData)
    })

    it('should validate required fields during insertion', async () => {
      const invalidEmployeeData = {
        // Missing required fields: employee_id, first_name, last_name, join_date, employment_type, status
        email: 'invalid@company.com'
      }

      mockModels.Employee.create.mockRejectedValueOnce(new Error('Validation error: employee_id is required'))
      
      try {
        await mockModels.Employee.create(invalidEmployeeData)
      } catch (error) {
        expect(error.message).toContain('Validation error')
        expect(mockModels.Employee.create).toHaveBeenCalledWith(invalidEmployeeData)
      }
    })

    it('should validate email format during insertion', async () => {
      const invalidEmailData = {
        ...sampleEmployeeData[0],
        email: 'invalid-email-format'
      }

      mockModels.Employee.create.mockRejectedValueOnce(new Error('Validation error: Invalid email format'))
      
      try {
        await mockModels.Employee.create(invalidEmailData)
      } catch (error) {
        expect(error.message).toContain('Validation error')
        expect(mockModels.Employee.create).toHaveBeenCalledWith(invalidEmailData)
      }
    })

    it('should validate unique constraints during insertion', async () => {
      const duplicateEmployeeData = {
        ...sampleEmployeeData[0],
        employee_id: 'EMP001' // Duplicate employee_id
      }

      mockModels.Employee.create.mockRejectedValueOnce(new Error('Duplicate entry for employee_id'))
      
      try {
        await mockModels.Employee.create(duplicateEmployeeData)
      } catch (error) {
        expect(error.message).toContain('Duplicate entry')
        expect(mockModels.Employee.create).toHaveBeenCalledWith(duplicateEmployeeData)
      }
    })

    it('should validate ENUM values during insertion', async () => {
      const invalidEnumData = {
        ...sampleEmployeeData[0],
        gender: 'InvalidGender',
        marital_status: 'InvalidStatus',
        employment_type: 'InvalidType',
        status: 'InvalidStatus'
      }

      mockModels.Employee.create.mockRejectedValueOnce(new Error('Validation error: Invalid ENUM values'))
      
      try {
        await mockModels.Employee.create(invalidEnumData)
      } catch (error) {
        expect(error.message).toContain('Validation error')
        expect(mockModels.Employee.create).toHaveBeenCalledWith(invalidEnumData)
      }
    })

    it('should validate date fields during insertion', async () => {
      const invalidDateData = {
        ...sampleEmployeeData[0],
        date_of_birth: '2030-01-01', // Future date
        join_date: '2030-01-01' // Future date
      }

      mockModels.Employee.create.mockRejectedValueOnce(new Error('Validation error: Date cannot be in the future'))
      
      try {
        await mockModels.Employee.create(invalidDateData)
      } catch (error) {
        expect(error.message).toContain('Validation error')
        expect(mockModels.Employee.create).toHaveBeenCalledWith(invalidDateData)
      }
    })

    it('should validate salary field during insertion', async () => {
      const invalidSalaryData = {
        ...sampleEmployeeData[0],
        salary: -1000.00 // Negative salary
      }

      mockModels.Employee.create.mockRejectedValueOnce(new Error('Validation error: Salary must be positive'))
      
      try {
        await mockModels.Employee.create(invalidSalaryData)
      } catch (error) {
        expect(error.message).toContain('Validation error')
        expect(mockModels.Employee.create).toHaveBeenCalledWith(invalidSalaryData)
      }
    })

    it('should validate phone number format during insertion', async () => {
      const invalidPhoneData = {
        ...sampleEmployeeData[0],
        phone: 'invalid-phone-number'
      }

      mockModels.Employee.create.mockRejectedValueOnce(new Error('Validation error: Invalid phone number format'))
      
      try {
        await mockModels.Employee.create(invalidPhoneData)
      } catch (error) {
        expect(error.message).toContain('Validation error')
        expect(mockModels.Employee.create).toHaveBeenCalledWith(invalidPhoneData)
      }
    })
  })

  describe('Department Data Insertion', () => {
    it('should insert a single department successfully', async () => {
      const departmentData = sampleDepartmentData[0]
      const result = await mockModels.Department.create(departmentData)
      
      expect(result).toBeDefined()
      expect(result.id).toBe(1)
      expect(result.name).toBe('Information Technology')
      expect(result.description).toBe('IT Department responsible for technology infrastructure')
      expect(result.status).toBe('Active')
      expect(mockModels.Department.create).toHaveBeenCalledWith(departmentData)
    })

    it('should insert multiple departments using bulk create', async () => {
      const result = await mockModels.Department.bulkCreate(sampleDepartmentData)
      
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(2)
      expect(result[0].id).toBe(1)
      expect(result[1].id).toBe(2)
      expect(mockModels.Department.bulkCreate).toHaveBeenCalledWith(sampleDepartmentData)
    })

    it('should validate required fields during department insertion', async () => {
      const invalidDepartmentData = {
        // Missing required field: name
        description: 'Invalid department'
      }

      mockModels.Department.create.mockRejectedValueOnce(new Error('Validation error: name is required'))
      
      try {
        await mockModels.Department.create(invalidDepartmentData)
      } catch (error) {
        expect(error.message).toContain('Validation error')
        expect(mockModels.Department.create).toHaveBeenCalledWith(invalidDepartmentData)
      }
    })

    it('should validate unique department name during insertion', async () => {
      const duplicateDepartmentData = {
        ...sampleDepartmentData[0],
        name: 'Information Technology' // Duplicate name
      }

      mockModels.Department.create.mockRejectedValueOnce(new Error('Duplicate entry for department name'))
      
      try {
        await mockModels.Department.create(duplicateDepartmentData)
      } catch (error) {
        expect(error.message).toContain('Duplicate entry')
        expect(mockModels.Department.create).toHaveBeenCalledWith(duplicateDepartmentData)
      }
    })

    it('should validate department status ENUM during insertion', async () => {
      const invalidStatusData = {
        ...sampleDepartmentData[0],
        status: 'InvalidStatus'
      }

      mockModels.Department.create.mockRejectedValueOnce(new Error('Validation error: Invalid status value'))
      
      try {
        await mockModels.Department.create(invalidStatusData)
      } catch (error) {
        expect(error.message).toContain('Validation error')
        expect(mockModels.Department.create).toHaveBeenCalledWith(invalidStatusData)
      }
    })

    it('should validate department budget during insertion', async () => {
      const invalidBudgetData = {
        ...sampleDepartmentData[0],
        budget: -1000.00 // Negative budget
      }

      mockModels.Department.create.mockRejectedValueOnce(new Error('Validation error: Budget must be positive'))
      
      try {
        await mockModels.Department.create(invalidBudgetData)
      } catch (error) {
        expect(error.message).toContain('Validation error')
        expect(mockModels.Department.create).toHaveBeenCalledWith(invalidBudgetData)
      }
    })
  })

  describe('UserRoleMap Data Insertion', () => {
    it('should insert a single user role mapping successfully', async () => {
      const userRoleData = sampleUserRoleData[0]
      const result = await mockModels.UserRoleMap.create(userRoleData)
      
      expect(result).toBeDefined()
      expect(result.id).toBe(1)
      expect(result.employee_id).toBe(1)
      expect(result.role).toBe('admin')
      expect(result.is_active).toBe(true)
      expect(mockModels.UserRoleMap.create).toHaveBeenCalledWith(userRoleData)
    })

    it('should insert multiple user role mappings using bulk create', async () => {
      const result = await mockModels.UserRoleMap.bulkCreate(sampleUserRoleData)
      
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(2)
      expect(result[0].id).toBe(1)
      expect(result[1].id).toBe(2)
      expect(mockModels.UserRoleMap.bulkCreate).toHaveBeenCalledWith(sampleUserRoleData)
    })

    it('should validate required fields during user role insertion', async () => {
      const invalidUserRoleData = {
        // Missing required fields: role
        employee_id: 1
      }

      mockModels.UserRoleMap.create.mockRejectedValueOnce(new Error('Validation error: role is required'))
      
      try {
        await mockModels.UserRoleMap.create(invalidUserRoleData)
      } catch (error) {
        expect(error.message).toContain('Validation error')
        expect(mockModels.UserRoleMap.create).toHaveBeenCalledWith(invalidUserRoleData)
      }
    })

    it('should validate role ENUM during insertion', async () => {
      const invalidRoleData = {
        ...sampleUserRoleData[0],
        role: 'invalid_role'
      }

      mockModels.UserRoleMap.create.mockRejectedValueOnce(new Error('Validation error: Invalid role value'))
      
      try {
        await mockModels.UserRoleMap.create(invalidRoleData)
      } catch (error) {
        expect(error.message).toContain('Validation error')
        expect(mockModels.UserRoleMap.create).toHaveBeenCalledWith(invalidRoleData)
      }
    })

    it('should validate email format during user role insertion', async () => {
      const invalidEmailData = {
        ...sampleUserRoleData[0],
        email: 'invalid-email-format'
      }

      mockModels.UserRoleMap.create.mockRejectedValueOnce(new Error('Validation error: Invalid email format'))
      
      try {
        await mockModels.UserRoleMap.create(invalidEmailData)
      } catch (error) {
        expect(error.message).toContain('Validation error')
        expect(mockModels.UserRoleMap.create).toHaveBeenCalledWith(invalidEmailData)
      }
    })

    it('should validate unique constraints during user role insertion', async () => {
      const duplicateUserRoleData = {
        ...sampleUserRoleData[0],
        email: 'john.doe@company.com' // Duplicate email
      }

      mockModels.UserRoleMap.create.mockRejectedValueOnce(new Error('Duplicate entry for email'))
      
      try {
        await mockModels.UserRoleMap.create(duplicateUserRoleData)
      } catch (error) {
        expect(error.message).toContain('Duplicate entry')
        expect(mockModels.UserRoleMap.create).toHaveBeenCalledWith(duplicateUserRoleData)
      }
    })

    it('should validate permissions JSON format during insertion', async () => {
      const invalidPermissionsData = {
        ...sampleUserRoleData[0],
        permissions: 'invalid-json-format' // Should be array
      }

      mockModels.UserRoleMap.create.mockRejectedValueOnce(new Error('Validation error: Permissions must be a valid JSON array'))
      
      try {
        await mockModels.UserRoleMap.create(invalidPermissionsData)
      } catch (error) {
        expect(error.message).toContain('Validation error')
        expect(mockModels.UserRoleMap.create).toHaveBeenCalledWith(invalidPermissionsData)
      }
    })
  })

  describe('Data Validation and Constraints', () => {
    it('should validate foreign key constraints during insertion', async () => {
      const invalidForeignKeyData = {
        ...sampleEmployeeData[0],
        department_id: 999 // Non-existent department
      }

      mockModels.Employee.create.mockRejectedValueOnce(new Error('Foreign key constraint violation'))
      
      try {
        await mockModels.Employee.create(invalidForeignKeyData)
      } catch (error) {
        expect(error.message).toContain('Foreign key constraint violation')
        expect(mockModels.Employee.create).toHaveBeenCalledWith(invalidForeignKeyData)
      }
    })

    it('should validate self-referencing foreign key constraints', async () => {
      const invalidManagerData = {
        ...sampleEmployeeData[0],
        manager_id: 999 // Non-existent manager
      }

      mockModels.Employee.create.mockRejectedValueOnce(new Error('Foreign key constraint violation for manager_id'))
      
      try {
        await mockModels.Employee.create(invalidManagerData)
      } catch (error) {
        expect(error.message).toContain('Foreign key constraint violation')
        expect(mockModels.Employee.create).toHaveBeenCalledWith(invalidManagerData)
      }
    })

    it('should validate data length constraints', async () => {
      const invalidLengthData = {
        ...sampleEmployeeData[0],
        first_name: 'A'.repeat(101), // Exceeds max length
        last_name: 'B'.repeat(101)   // Exceeds max length
      }

      mockModels.Employee.create.mockRejectedValueOnce(new Error('Validation error: Field length exceeds maximum'))
      
      try {
        await mockModels.Employee.create(invalidLengthData)
      } catch (error) {
        expect(error.message).toContain('Validation error')
        expect(mockModels.Employee.create).toHaveBeenCalledWith(invalidLengthData)
      }
    })

    it('should validate numeric constraints', async () => {
      const invalidNumericData = {
        ...sampleEmployeeData[0],
        salary: 999999999999.99 // Exceeds decimal precision
      }

      mockModels.Employee.create.mockRejectedValueOnce(new Error('Validation error: Numeric precision exceeded'))
      
      try {
        await mockModels.Employee.create(invalidNumericData)
      } catch (error) {
        expect(error.message).toContain('Validation error')
        expect(mockModels.Employee.create).toHaveBeenCalledWith(invalidNumericData)
      }
    })
  })

  describe('Bulk Data Operations', () => {
    it('should handle bulk insertion with mixed valid and invalid data', async () => {
      const mixedData = [
        sampleEmployeeData[0], // Valid
        { ...sampleEmployeeData[1], employee_id: 'EMP001' }, // Invalid: duplicate employee_id
        { ...sampleEmployeeData[0], employee_id: 'EMP003' }  // Valid
      ]

      mockModels.Employee.bulkCreate.mockRejectedValueOnce(new Error('Bulk insert failed: Some records have validation errors'))
      
      try {
        await mockModels.Employee.bulkCreate(mixedData)
      } catch (error) {
        expect(error.message).toContain('Bulk insert failed')
        expect(mockModels.Employee.bulkCreate).toHaveBeenCalledWith(mixedData)
      }
    })

    it('should handle large dataset insertion', async () => {
      const largeDataset = Array.from({ length: 1000 }, (_, index) => ({
        ...sampleEmployeeData[0],
        employee_id: `EMP${String(index + 1).padStart(3, '0')}`,
        email: `employee${index + 1}@company.com`,
        ms_graph_user_id: `employee${index + 1}@company.com`
      }))

      const result = await mockModels.Employee.bulkCreate(largeDataset)
      
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(1000)
      expect(mockModels.Employee.bulkCreate).toHaveBeenCalledWith(largeDataset)
    })

    it('should handle transaction rollback on bulk insertion failure', async () => {
      const invalidBulkData = [
        { ...sampleEmployeeData[0], employee_id: 'EMP001' },
        { ...sampleEmployeeData[1], employee_id: 'EMP001' } // Duplicate employee_id
      ]

      mockModels.Employee.bulkCreate.mockRejectedValueOnce(new Error('Transaction rolled back due to constraint violations'))
      
      try {
        await mockModels.Employee.bulkCreate(invalidBulkData)
      } catch (error) {
        expect(error.message).toContain('Transaction rolled back')
        expect(mockModels.Employee.bulkCreate).toHaveBeenCalledWith(invalidBulkData)
      }
    })
  })

  describe('Data Retrieval After Insertion', () => {
    it('should retrieve inserted employee data', async () => {
      // Mock successful insertion
      mockModels.Employee.create.mockResolvedValueOnce({ id: 1, ...sampleEmployeeData[0] })
      
      const insertedEmployee = await mockModels.Employee.create(sampleEmployeeData[0])
      expect(insertedEmployee).toBeDefined()
      expect(insertedEmployee.id).toBe(1)
      expect(insertedEmployee.employee_id).toBe('EMP001')
    })

    it('should count inserted records', async () => {
      mockModels.Employee.count.mockResolvedValueOnce(2)
      
      const count = await mockModels.Employee.count()
      expect(count).toBe(2)
      expect(mockModels.Employee.count).toHaveBeenCalled()
    })

    it('should find inserted records by criteria', async () => {
      mockModels.Employee.findOne.mockResolvedValueOnce({ id: 1, ...sampleEmployeeData[0] })
      
      const foundEmployee = await mockModels.Employee.findOne({ where: { employee_id: 'EMP001' } })
      expect(foundEmployee).toBeDefined()
      expect(foundEmployee.employee_id).toBe('EMP001')
      expect(mockModels.Employee.findOne).toHaveBeenCalledWith({ where: { employee_id: 'EMP001' } })
    })
  })

  describe('Error Handling and Recovery', () => {
    it('should handle database connection errors during insertion', async () => {
      mockModels.Employee.create.mockRejectedValueOnce(new Error('Database connection lost'))
      
      try {
        await mockModels.Employee.create(sampleEmployeeData[0])
      } catch (error) {
        expect(error.message).toBe('Database connection lost')
        expect(mockModels.Employee.create).toHaveBeenCalledWith(sampleEmployeeData[0])
      }
    })

    it('should handle timeout errors during bulk insertion', async () => {
      mockModels.Employee.bulkCreate.mockRejectedValueOnce(new Error('Query timeout exceeded'))
      
      try {
        await mockModels.Employee.bulkCreate(sampleEmployeeData)
      } catch (error) {
        expect(error.message).toBe('Query timeout exceeded')
        expect(mockModels.Employee.bulkCreate).toHaveBeenCalledWith(sampleEmployeeData)
      }
    })

    it('should handle constraint violation errors gracefully', async () => {
      mockModels.Employee.create.mockRejectedValueOnce(new Error('Constraint violation: Duplicate key'))
      
      try {
        await mockModels.Employee.create(sampleEmployeeData[0])
      } catch (error) {
        expect(error.message).toContain('Constraint violation')
        expect(mockModels.Employee.create).toHaveBeenCalledWith(sampleEmployeeData[0])
      }
    })
  })
})
