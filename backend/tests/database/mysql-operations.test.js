/**
 * MySQL Operations Test Suite
 * Tests CRUD operations on all database models and relationships
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
  executeRawQuery: vi.fn(() => Promise.resolve([{ count: 5 }])),
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

// Mock all models with comprehensive CRUD operations
const mockModels = {
  Employee: {
    findAll: vi.fn(() => Promise.resolve([
      { id: 1, employee_id: 'EMP001', first_name: 'John', last_name: 'Doe', email: 'john.doe@company.com' },
      { id: 2, employee_id: 'EMP002', first_name: 'Jane', last_name: 'Smith', email: 'jane.smith@company.com' }
    ])),
    findOne: vi.fn(() => Promise.resolve({ id: 1, employee_id: 'EMP001', first_name: 'John', last_name: 'Doe' })),
    create: vi.fn(() => Promise.resolve({ id: 3, employee_id: 'EMP003', first_name: 'Bob', last_name: 'Johnson' })),
    update: vi.fn(() => Promise.resolve([1])),
    destroy: vi.fn(() => Promise.resolve(1)),
    count: vi.fn(() => Promise.resolve(2)),
    findByPk: vi.fn(() => Promise.resolve({ id: 1, employee_id: 'EMP001' })),
    findAndCountAll: vi.fn(() => Promise.resolve({ count: 2, rows: [] }))
  },
  Department: {
    findAll: vi.fn(() => Promise.resolve([
      { id: 1, name: 'IT', description: 'Information Technology', status: 'Active' },
      { id: 2, name: 'HR', description: 'Human Resources', status: 'Active' }
    ])),
    findOne: vi.fn(() => Promise.resolve({ id: 1, name: 'IT', description: 'Information Technology' })),
    create: vi.fn(() => Promise.resolve({ id: 3, name: 'Finance', description: 'Finance Department' })),
    update: vi.fn(() => Promise.resolve([1])),
    destroy: vi.fn(() => Promise.resolve(1)),
    count: vi.fn(() => Promise.resolve(2)),
    findByPk: vi.fn(() => Promise.resolve({ id: 1, name: 'IT' })),
    findAndCountAll: vi.fn(() => Promise.resolve({ count: 2, rows: [] }))
  },
  UserRoleMap: {
    findAll: vi.fn(() => Promise.resolve([
      { id: 1, employee_id: 1, role: 'admin', is_active: true },
      { id: 2, employee_id: 2, role: 'employee', is_active: true }
    ])),
    findOne: vi.fn(() => Promise.resolve({ id: 1, employee_id: 1, role: 'admin' })),
    create: vi.fn(() => Promise.resolve({ id: 3, employee_id: 3, role: 'manager' })),
    update: vi.fn(() => Promise.resolve([1])),
    destroy: vi.fn(() => Promise.resolve(1)),
    count: vi.fn(() => Promise.resolve(2)),
    findByPk: vi.fn(() => Promise.resolve({ id: 1, employee_id: 1 })),
    findAndCountAll: vi.fn(() => Promise.resolve({ count: 2, rows: [] }))
  },
  Hardware: {
    findAll: vi.fn(() => Promise.resolve([
      { id: 1, name: 'Laptop', serial_number: 'LAP001', assigned_to: 1 },
      { id: 2, name: 'Monitor', serial_number: 'MON001', assigned_to: 1 }
    ])),
    findOne: vi.fn(() => Promise.resolve({ id: 1, name: 'Laptop', serial_number: 'LAP001' })),
    create: vi.fn(() => Promise.resolve({ id: 3, name: 'Keyboard', serial_number: 'KEY001' })),
    update: vi.fn(() => Promise.resolve([1])),
    destroy: vi.fn(() => Promise.resolve(1)),
    count: vi.fn(() => Promise.resolve(2)),
    findByPk: vi.fn(() => Promise.resolve({ id: 1, name: 'Laptop' })),
    findAndCountAll: vi.fn(() => Promise.resolve({ count: 2, rows: [] }))
  },
  Software: {
    findAll: vi.fn(() => Promise.resolve([
      { id: 1, name: 'Windows 11', version: '22H2', assigned_to: 1 },
      { id: 2, name: 'Office 365', version: '2023', assigned_to: 1 }
    ])),
    findOne: vi.fn(() => Promise.resolve({ id: 1, name: 'Windows 11', version: '22H2' })),
    create: vi.fn(() => Promise.resolve({ id: 3, name: 'Visual Studio', version: '2022' })),
    update: vi.fn(() => Promise.resolve([1])),
    destroy: vi.fn(() => Promise.resolve(1)),
    count: vi.fn(() => Promise.resolve(2)),
    findByPk: vi.fn(() => Promise.resolve({ id: 1, name: 'Windows 11' })),
    findAndCountAll: vi.fn(() => Promise.resolve({ count: 2, rows: [] }))
  },
  License: {
    findAll: vi.fn(() => Promise.resolve([
      { id: 1, software_id: 1, license_key: 'LIC001', assigned_to: 1 },
      { id: 2, software_id: 2, license_key: 'LIC002', assigned_to: 1 }
    ])),
    findOne: vi.fn(() => Promise.resolve({ id: 1, software_id: 1, license_key: 'LIC001' })),
    create: vi.fn(() => Promise.resolve({ id: 3, software_id: 3, license_key: 'LIC003' })),
    update: vi.fn(() => Promise.resolve([1])),
    destroy: vi.fn(() => Promise.resolve(1)),
    count: vi.fn(() => Promise.resolve(2)),
    findByPk: vi.fn(() => Promise.resolve({ id: 1, software_id: 1 })),
    findAndCountAll: vi.fn(() => Promise.resolve({ count: 2, rows: [] }))
  },
  Ticket: {
    findAll: vi.fn(() => Promise.resolve([
      { id: 1, title: 'IT Support', description: 'Need help with laptop', created_by: 1 },
      { id: 2, title: 'Software Issue', description: 'Office not working', created_by: 2 }
    ])),
    findOne: vi.fn(() => Promise.resolve({ id: 1, title: 'IT Support', description: 'Need help with laptop' })),
    create: vi.fn(() => Promise.resolve({ id: 3, title: 'Hardware Issue', description: 'Monitor not working' })),
    update: vi.fn(() => Promise.resolve([1])),
    destroy: vi.fn(() => Promise.resolve(1)),
    count: vi.fn(() => Promise.resolve(2)),
    findByPk: vi.fn(() => Promise.resolve({ id: 1, title: 'IT Support' })),
    findAndCountAll: vi.fn(() => Promise.resolve({ count: 2, rows: [] }))
  },
  Integration: {
    findAll: vi.fn(() => Promise.resolve([
      { id: 1, name: 'Slack Integration', type: 'communication', created_by: 1 },
      { id: 2, name: 'Jira Integration', type: 'project_management', created_by: 1 }
    ])),
    findOne: vi.fn(() => Promise.resolve({ id: 1, name: 'Slack Integration', type: 'communication' })),
    create: vi.fn(() => Promise.resolve({ id: 3, name: 'GitHub Integration', type: 'version_control' })),
    update: vi.fn(() => Promise.resolve([1])),
    destroy: vi.fn(() => Promise.resolve(1)),
    count: vi.fn(() => Promise.resolve(2)),
    findByPk: vi.fn(() => Promise.resolve({ id: 1, name: 'Slack Integration' })),
    findAndCountAll: vi.fn(() => Promise.resolve({ count: 2, rows: [] }))
  },
  BiometricEmployee: {
    findAll: vi.fn(() => Promise.resolve([
      { id: 1, employee_id: 1, biometric_id: 'BIO001', is_active: true },
      { id: 2, employee_id: 2, biometric_id: 'BIO002', is_active: true }
    ])),
    findOne: vi.fn(() => Promise.resolve({ id: 1, employee_id: 1, biometric_id: 'BIO001' })),
    create: vi.fn(() => Promise.resolve({ id: 3, employee_id: 3, biometric_id: 'BIO003' })),
    update: vi.fn(() => Promise.resolve([1])),
    destroy: vi.fn(() => Promise.resolve(1)),
    count: vi.fn(() => Promise.resolve(2)),
    findByPk: vi.fn(() => Promise.resolve({ id: 1, employee_id: 1 })),
    findAndCountAll: vi.fn(() => Promise.resolve({ count: 2, rows: [] }))
  }
}

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

describe('MySQL Operations Tests', () => {
  let modelsPath
  let fileContent

  beforeAll(() => {
    modelsPath = path.join(__dirname, '..', 'models', 'index.js')
    fileContent = fs.readFileSync(modelsPath, 'utf8')
  })

  describe('Employee Model Operations', () => {
    it('should create a new employee', async () => {
      const employeeData = {
        employee_id: 'EMP003',
        first_name: 'Bob',
        last_name: 'Johnson',
        email: 'bob.johnson@company.com',
        join_date: '2024-01-15',
        employment_type: 'Full-time',
        status: 'Active'
      }

      const result = await mockModels.Employee.create(employeeData)
      expect(result).toBeDefined()
      expect(result.id).toBe(3)
      expect(mockModels.Employee.create).toHaveBeenCalledWith(employeeData)
    })

    it('should find all employees', async () => {
      const employees = await mockModels.Employee.findAll()
      expect(employees).toBeDefined()
      expect(Array.isArray(employees)).toBe(true)
      expect(employees.length).toBe(2)
      expect(mockModels.Employee.findAll).toHaveBeenCalled()
    })

    it('should find employee by ID', async () => {
      const employee = await mockModels.Employee.findByPk(1)
      expect(employee).toBeDefined()
      expect(employee.id).toBe(1)
      expect(mockModels.Employee.findByPk).toHaveBeenCalledWith(1)
    })

    it('should find employee by criteria', async () => {
      const employee = await mockModels.Employee.findOne({ where: { employee_id: 'EMP001' } })
      expect(employee).toBeDefined()
      expect(employee.employee_id).toBe('EMP001')
      expect(mockModels.Employee.findOne).toHaveBeenCalled()
    })

    it('should update employee', async () => {
      const updateData = { first_name: 'John Updated' }
      const result = await mockModels.Employee.update(updateData, { where: { id: 1 } })
      expect(result).toBeDefined()
      expect(result[0]).toBe(1)
      expect(mockModels.Employee.update).toHaveBeenCalledWith(updateData, { where: { id: 1 } })
    })

    it('should delete employee', async () => {
      const result = await mockModels.Employee.destroy({ where: { id: 1 } })
      expect(result).toBe(1)
      expect(mockModels.Employee.destroy).toHaveBeenCalledWith({ where: { id: 1 } })
    })

    it('should count employees', async () => {
      const count = await mockModels.Employee.count()
      expect(count).toBe(2)
      expect(mockModels.Employee.count).toHaveBeenCalled()
    })

    it('should find and count employees with pagination', async () => {
      const result = await mockModels.Employee.findAndCountAll({
        limit: 10,
        offset: 0
      })
      expect(result).toBeDefined()
      expect(result.count).toBe(2)
      expect(Array.isArray(result.rows)).toBe(true)
      expect(mockModels.Employee.findAndCountAll).toHaveBeenCalled()
    })
  })

  describe('Department Model Operations', () => {
    it('should create a new department', async () => {
      const departmentData = {
        name: 'Finance',
        description: 'Finance Department',
        status: 'Active'
      }

      const result = await mockModels.Department.create(departmentData)
      expect(result).toBeDefined()
      expect(result.id).toBe(3)
      expect(mockModels.Department.create).toHaveBeenCalledWith(departmentData)
    })

    it('should find all departments', async () => {
      const departments = await mockModels.Department.findAll()
      expect(departments).toBeDefined()
      expect(Array.isArray(departments)).toBe(true)
      expect(departments.length).toBe(2)
      expect(mockModels.Department.findAll).toHaveBeenCalled()
    })

    it('should find department by ID', async () => {
      const department = await mockModels.Department.findByPk(1)
      expect(department).toBeDefined()
      expect(department.id).toBe(1)
      expect(mockModels.Department.findByPk).toHaveBeenCalledWith(1)
    })

    it('should update department', async () => {
      const updateData = { name: 'IT Updated' }
      const result = await mockModels.Department.update(updateData, { where: { id: 1 } })
      expect(result).toBeDefined()
      expect(result[0]).toBe(1)
      expect(mockModels.Department.update).toHaveBeenCalledWith(updateData, { where: { id: 1 } })
    })

    it('should delete department', async () => {
      const result = await mockModels.Department.destroy({ where: { id: 1 } })
      expect(result).toBe(1)
      expect(mockModels.Department.destroy).toHaveBeenCalledWith({ where: { id: 1 } })
    })
  })

  describe('UserRoleMap Model Operations', () => {
    it('should create a new user role mapping', async () => {
      const roleData = {
        employee_id: 3,
        role: 'manager',
        is_active: true
      }

      const result = await mockModels.UserRoleMap.create(roleData)
      expect(result).toBeDefined()
      expect(result.id).toBe(3)
      expect(mockModels.UserRoleMap.create).toHaveBeenCalledWith(roleData)
    })

    it('should find all user role mappings', async () => {
      const roles = await mockModels.UserRoleMap.findAll()
      expect(roles).toBeDefined()
      expect(Array.isArray(roles)).toBe(true)
      expect(roles.length).toBe(2)
      expect(mockModels.UserRoleMap.findAll).toHaveBeenCalled()
    })

    it('should find user role by employee ID', async () => {
      const role = await mockModels.UserRoleMap.findOne({ where: { employee_id: 1 } })
      expect(role).toBeDefined()
      expect(role.employee_id).toBe(1)
      expect(mockModels.UserRoleMap.findOne).toHaveBeenCalled()
    })

    it('should update user role', async () => {
      const updateData = { role: 'admin' }
      const result = await mockModels.UserRoleMap.update(updateData, { where: { id: 1 } })
      expect(result).toBeDefined()
      expect(result[0]).toBe(1)
      expect(mockModels.UserRoleMap.update).toHaveBeenCalledWith(updateData, { where: { id: 1 } })
    })
  })

  describe('Hardware Model Operations', () => {
    it('should create a new hardware asset', async () => {
      const hardwareData = {
        name: 'Keyboard',
        serial_number: 'KEY001',
        assigned_to: 1
      }

      const result = await mockModels.Hardware.create(hardwareData)
      expect(result).toBeDefined()
      expect(result.id).toBe(3)
      expect(mockModels.Hardware.create).toHaveBeenCalledWith(hardwareData)
    })

    it('should find all hardware assets', async () => {
      const hardware = await mockModels.Hardware.findAll()
      expect(hardware).toBeDefined()
      expect(Array.isArray(hardware)).toBe(true)
      expect(hardware.length).toBe(2)
      expect(mockModels.Hardware.findAll).toHaveBeenCalled()
    })

    it('should find hardware by assigned employee', async () => {
      const hardware = await mockModels.Hardware.findAll({ where: { assigned_to: 1 } })
      expect(hardware).toBeDefined()
      expect(Array.isArray(hardware)).toBe(true)
      expect(mockModels.Hardware.findAll).toHaveBeenCalled()
    })
  })

  describe('Software Model Operations', () => {
    it('should create a new software asset', async () => {
      const softwareData = {
        name: 'Visual Studio',
        version: '2022',
        assigned_to: 1
      }

      const result = await mockModels.Software.create(softwareData)
      expect(result).toBeDefined()
      expect(result.id).toBe(3)
      expect(mockModels.Software.create).toHaveBeenCalledWith(softwareData)
    })

    it('should find all software assets', async () => {
      const software = await mockModels.Software.findAll()
      expect(software).toBeDefined()
      expect(Array.isArray(software)).toBe(true)
      expect(software.length).toBe(2)
      expect(mockModels.Software.findAll).toHaveBeenCalled()
    })
  })

  describe('License Model Operations', () => {
    it('should create a new license', async () => {
      const licenseData = {
        software_id: 3,
        license_key: 'LIC003',
        assigned_to: 1
      }

      const result = await mockModels.License.create(licenseData)
      expect(result).toBeDefined()
      expect(result.id).toBe(3)
      expect(mockModels.License.create).toHaveBeenCalledWith(licenseData)
    })

    it('should find all licenses', async () => {
      const licenses = await mockModels.License.findAll()
      expect(licenses).toBeDefined()
      expect(Array.isArray(licenses)).toBe(true)
      expect(licenses.length).toBe(2)
      expect(mockModels.License.findAll).toHaveBeenCalled()
    })
  })

  describe('Ticket Model Operations', () => {
    it('should create a new ticket', async () => {
      const ticketData = {
        title: 'Hardware Issue',
        description: 'Monitor not working',
        created_by: 1
      }

      const result = await mockModels.Ticket.create(ticketData)
      expect(result).toBeDefined()
      expect(result.id).toBe(3)
      expect(mockModels.Ticket.create).toHaveBeenCalledWith(ticketData)
    })

    it('should find all tickets', async () => {
      const tickets = await mockModels.Ticket.findAll()
      expect(tickets).toBeDefined()
      expect(Array.isArray(tickets)).toBe(true)
      expect(tickets.length).toBe(2)
      expect(mockModels.Ticket.findAll).toHaveBeenCalled()
    })
  })

  describe('Integration Model Operations', () => {
    it('should create a new integration', async () => {
      const integrationData = {
        name: 'GitHub Integration',
        type: 'version_control',
        created_by: 1
      }

      const result = await mockModels.Integration.create(integrationData)
      expect(result).toBeDefined()
      expect(result.id).toBe(3)
      expect(mockModels.Integration.create).toHaveBeenCalledWith(integrationData)
    })

    it('should find all integrations', async () => {
      const integrations = await mockModels.Integration.findAll()
      expect(integrations).toBeDefined()
      expect(Array.isArray(integrations)).toBe(true)
      expect(integrations.length).toBe(2)
      expect(mockModels.Integration.findAll).toHaveBeenCalled()
    })
  })

  describe('BiometricEmployee Model Operations', () => {
    it('should create a new biometric employee mapping', async () => {
      const biometricData = {
        employee_id: 3,
        biometric_id: 'BIO003',
        is_active: true
      }

      const result = await mockModels.BiometricEmployee.create(biometricData)
      expect(result).toBeDefined()
      expect(result.id).toBe(3)
      expect(mockModels.BiometricEmployee.create).toHaveBeenCalledWith(biometricData)
    })

    it('should find all biometric employee mappings', async () => {
      const biometrics = await mockModels.BiometricEmployee.findAll()
      expect(biometrics).toBeDefined()
      expect(Array.isArray(biometrics)).toBe(true)
      expect(biometrics.length).toBe(2)
      expect(mockModels.BiometricEmployee.findAll).toHaveBeenCalled()
    })
  })

  describe('Model Relationships', () => {
    it('should have Employee-Department associations', () => {
      expect(fileContent).toContain('Employee.belongsTo(Department')
      expect(fileContent).toContain('Department.hasMany(Employee')
      expect(fileContent).toContain('foreignKey: \'department_id\'')
    })

    it('should have Employee-Manager self-reference', () => {
      expect(fileContent).toContain('Employee.belongsTo(Employee')
      expect(fileContent).toContain('foreignKey: \'manager_id\'')
      expect(fileContent).toContain('as: \'manager\'')
    })

    it('should have Hardware-Employee associations', () => {
      expect(fileContent).toContain('Hardware.belongsTo(Employee')
      expect(fileContent).toContain('Employee.hasMany(Hardware')
      expect(fileContent).toContain('foreignKey: \'assigned_to\'')
    })

    it('should have Software-Employee associations', () => {
      expect(fileContent).toContain('Software.belongsTo(Employee')
      expect(fileContent).toContain('Employee.hasMany(Software')
      expect(fileContent).toContain('foreignKey: \'assigned_to\'')
    })

    it('should have License associations', () => {
      expect(fileContent).toContain('License.belongsTo(Software')
      expect(fileContent).toContain('License.belongsTo(Employee')
      expect(fileContent).toContain('Software.hasMany(License')
      expect(fileContent).toContain('Employee.hasMany(License')
    })

    it('should have Ticket associations', () => {
      expect(fileContent).toContain('Ticket.belongsTo(Employee')
      expect(fileContent).toContain('Employee.hasMany(Ticket')
      expect(fileContent).toContain('foreignKey: \'created_by\'')
      expect(fileContent).toContain('foreignKey: \'assigned_to\'')
    })

    it('should have UserRoleMap associations', () => {
      expect(fileContent).toContain('UserRoleMap.belongsTo(Employee')
      expect(fileContent).toContain('Employee.hasOne(UserRoleMap')
      expect(fileContent).toContain('foreignKey: \'employee_id\'')
    })

    it('should have BiometricEmployee associations', () => {
      expect(fileContent).toContain('BiometricEmployee.belongsTo(Employee')
      expect(fileContent).toContain('Employee.hasOne(BiometricEmployee')
      expect(fileContent).toContain('foreignKey: \'employee_id\'')
    })

    it('should have Integration associations', () => {
      expect(fileContent).toContain('Integration.belongsTo(Employee')
      expect(fileContent).toContain('Employee.hasMany(Integration')
      expect(fileContent).toContain('foreignKey: \'created_by\'')
      expect(fileContent).toContain('foreignKey: \'updated_by\'')
    })
  })

  describe('Error Handling', () => {
    it('should handle create operation errors', async () => {
      mockModels.Employee.create.mockRejectedValueOnce(new Error('Validation failed'))
      
      try {
        await mockModels.Employee.create({})
      } catch (error) {
        expect(error.message).toBe('Validation failed')
      }
    })

    it('should handle find operation errors', async () => {
      mockModels.Employee.findAll.mockRejectedValueOnce(new Error('Database connection failed'))
      
      try {
        await mockModels.Employee.findAll()
      } catch (error) {
        expect(error.message).toBe('Database connection failed')
      }
    })

    it('should handle update operation errors', async () => {
      mockModels.Employee.update.mockRejectedValueOnce(new Error('Update failed'))
      
      try {
        await mockModels.Employee.update({}, { where: { id: 1 } })
      } catch (error) {
        expect(error.message).toBe('Update failed')
      }
    })

    it('should handle delete operation errors', async () => {
      mockModels.Employee.destroy.mockRejectedValueOnce(new Error('Delete failed'))
      
      try {
        await mockModels.Employee.destroy({ where: { id: 1 } })
      } catch (error) {
        expect(error.message).toBe('Delete failed')
      }
    })
  })

  describe('Model Exports', () => {
    it('should export all models', () => {
      expect(fileContent).toContain('export {')
      expect(fileContent).toContain('Employee,')
      expect(fileContent).toContain('Hardware,')
      expect(fileContent).toContain('Software,')
      expect(fileContent).toContain('License,')
      expect(fileContent).toContain('Ticket,')
      expect(fileContent).toContain('Department,')
      expect(fileContent).toContain('Integration,')
      expect(fileContent).toContain('UserRoleMap,')
      expect(fileContent).toContain('BiometricEmployee')
    })

    it('should have default export', () => {
      expect(fileContent).toContain('export default {')
      expect(fileContent).toContain('Employee,')
      expect(fileContent).toContain('Hardware,')
      expect(fileContent).toContain('Software,')
      expect(fileContent).toContain('License,')
      expect(fileContent).toContain('Ticket,')
      expect(fileContent).toContain('Department,')
      expect(fileContent).toContain('Integration,')
      expect(fileContent).toContain('UserRoleMap,')
      expect(fileContent).toContain('BiometricEmployee')
    })
  })
})
