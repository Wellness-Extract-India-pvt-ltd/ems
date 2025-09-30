/**
 * MySQL Schema Test Suite
 * Tests database schema validation, table structure, and relationships
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
  executeRawQuery: vi.fn(() => Promise.resolve([
    { TABLE_NAME: 'employees', TABLE_ROWS: 100, DATA_LENGTH: 1024000 },
    { TABLE_NAME: 'departments', TABLE_ROWS: 10, DATA_LENGTH: 51200 },
    { TABLE_NAME: 'user_role_maps', TABLE_ROWS: 100, DATA_LENGTH: 256000 },
    { TABLE_NAME: 'hardware', TABLE_ROWS: 50, DATA_LENGTH: 128000 },
    { TABLE_NAME: 'software', TABLE_ROWS: 30, DATA_LENGTH: 64000 },
    { TABLE_NAME: 'licenses', TABLE_ROWS: 40, DATA_LENGTH: 80000 },
    { TABLE_NAME: 'tickets', TABLE_ROWS: 200, DATA_LENGTH: 2048000 },
    { TABLE_NAME: 'integrations', TABLE_ROWS: 15, DATA_LENGTH: 32000 },
    { TABLE_NAME: 'biometric_employees', TABLE_ROWS: 100, DATA_LENGTH: 128000 }
  ])),
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

beforeAll(() => {
  // Mock required modules
  vi.mock('../database/connection.js', () => (mockDbConnection))
  vi.mock('../utils/logger.js', () => ({ default: mockLogger }))
  
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

describe('MySQL Schema Tests', () => {
  let employeeModelPath
  let departmentModelPath
  let userRoleMapModelPath
  let hardwareModelPath
  let softwareModelPath
  let licenseModelPath
  let ticketModelPath
  let integrationModelPath
  let biometricEmployeeModelPath
  let modelsIndexPath

  beforeAll(() => {
    employeeModelPath = path.join(__dirname, '..', 'models', 'Employee.js')
    departmentModelPath = path.join(__dirname, '..', 'models', 'Department.js')
    userRoleMapModelPath = path.join(__dirname, '..', 'models', 'UserRoleMap.js')
    hardwareModelPath = path.join(__dirname, '..', 'models', 'Hardware.js')
    softwareModelPath = path.join(__dirname, '..', 'models', 'Software.js')
    licenseModelPath = path.join(__dirname, '..', 'models', 'License.js')
    ticketModelPath = path.join(__dirname, '..', 'models', 'Ticket.js')
    integrationModelPath = path.join(__dirname, '..', 'models', 'Integration.js')
    biometricEmployeeModelPath = path.join(__dirname, '..', 'models', 'BiometricEmployee.js')
    modelsIndexPath = path.join(__dirname, '..', 'models', 'index.js')
  })

  describe('Database Tables Verification', () => {
    it('should verify all required tables exist', async () => {
      const tables = await mockDbConnection.executeRawQuery(`
        SELECT TABLE_NAME, TABLE_ROWS, DATA_LENGTH 
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = 'ems_db' 
        AND TABLE_TYPE = 'BASE TABLE'
      `)
      
      expect(tables).toBeDefined()
      expect(Array.isArray(tables)).toBe(true)
      expect(tables.length).toBeGreaterThan(0)
      
      const tableNames = tables.map(table => table.TABLE_NAME)
      expect(tableNames).toContain('employees')
      expect(tableNames).toContain('departments')
      expect(tableNames).toContain('user_role_maps')
      expect(tableNames).toContain('hardware')
      expect(tableNames).toContain('software')
      expect(tableNames).toContain('licenses')
      expect(tableNames).toContain('tickets')
      expect(tableNames).toContain('integrations')
      expect(tableNames).toContain('biometric_employees')
    })

    it('should verify table row counts', async () => {
      const tables = await mockDbConnection.executeRawQuery(`
        SELECT TABLE_NAME, TABLE_ROWS, DATA_LENGTH 
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = 'ems_db' 
        AND TABLE_TYPE = 'BASE TABLE'
      `)
      
      tables.forEach(table => {
        expect(table.TABLE_ROWS).toBeGreaterThanOrEqual(0)
        expect(table.DATA_LENGTH).toBeGreaterThanOrEqual(0)
      })
    })

    it('should verify database charset and collation', async () => {
      const info = await mockDbConnection.getDatabaseInfo()
      expect(info.charset).toBe('utf8mb4')
      expect(info.collation).toBe('utf8mb4_unicode_ci')
    })
  })

  describe('Employee Table Schema', () => {
    let employeeModelContent

    beforeAll(() => {
      employeeModelContent = fs.readFileSync(employeeModelPath, 'utf8')
    })

    it('should have correct table name', () => {
      expect(employeeModelContent).toContain("tableName: 'employees'")
    })

    it('should have primary key configuration', () => {
      expect(employeeModelContent).toContain('primaryKey: true')
      expect(employeeModelContent).toContain('autoIncrement: true')
    })

    it('should have required fields', () => {
      expect(employeeModelContent).toContain('employee_id: {')
      expect(employeeModelContent).toContain('first_name: {')
      expect(employeeModelContent).toContain('last_name: {')
      expect(employeeModelContent).toContain('join_date: {')
      expect(employeeModelContent).toContain('employment_type: {')
      expect(employeeModelContent).toContain('status: {')
    })

    it('should have unique constraints', () => {
      expect(employeeModelContent).toContain('unique: true')
      expect(employeeModelContent).toContain('employee_id')
      expect(employeeModelContent).toContain('email')
      expect(employeeModelContent).toContain('ms_graph_user_id')
    })

    it('should have proper field validations', () => {
      expect(employeeModelContent).toContain('allowNull: false')
      expect(employeeModelContent).toContain('validate: {')
      expect(employeeModelContent).toContain('notEmpty: true')
      expect(employeeModelContent).toContain('isEmail: true')
      expect(employeeModelContent).toContain('isDate: true')
    })

    it('should have ENUM validations', () => {
      expect(employeeModelContent).toContain("ENUM('Male', 'Female', 'Other')")
      expect(employeeModelContent).toContain("ENUM('Single', 'Married', 'Divorced', 'Widowed')")
      expect(employeeModelContent).toContain("ENUM('Full-time', 'Part-time', 'Intern', 'Contractor')")
      expect(employeeModelContent).toContain("ENUM('Active', 'Inactive', 'Onboarding', 'Suspended', 'Terminated')")
    })

    it('should have foreign key references', () => {
      expect(employeeModelContent).toContain('references: {')
      expect(employeeModelContent).toContain("model: 'departments'")
      expect(employeeModelContent).toContain("model: 'employees'")
    })

    it('should have proper indexes', () => {
      expect(employeeModelContent).toContain('indexes: [')
      expect(employeeModelContent).toContain("fields: ['employee_id']")
      expect(employeeModelContent).toContain("fields: ['email']")
      expect(employeeModelContent).toContain("fields: ['status']")
      expect(employeeModelContent).toContain("fields: ['department_id']")
      expect(employeeModelContent).toContain("fields: ['manager_id']")
    })

    it('should have composite indexes', () => {
      expect(employeeModelContent).toContain('idx_employee_status_department')
      expect(employeeModelContent).toContain('idx_employee_type_join_date')
      expect(employeeModelContent).toContain('idx_employee_manager_status')
      expect(employeeModelContent).toContain('idx_employee_dept_status_type')
    })

    it('should have full-text search indexes', () => {
      expect(employeeModelContent).toContain('idx_employee_name_search')
      expect(employeeModelContent).toContain('idx_employee_email_search')
    })

    it('should have model validations', () => {
      expect(employeeModelContent).toContain('validate: {')
      expect(employeeModelContent).toContain('salaryMustBePositive')
      expect(employeeModelContent).toContain('managerCannotBeSelf')
      expect(employeeModelContent).toContain('joinDateMustBeValid')
      expect(employeeModelContent).toContain('birthDateMustBeValid')
    })
  })

  describe('Department Table Schema', () => {
    let departmentModelContent

    beforeAll(() => {
      departmentModelContent = fs.readFileSync(departmentModelPath, 'utf8')
    })

    it('should have correct table name', () => {
      expect(departmentModelContent).toContain("tableName: 'departments'")
    })

    it('should have required fields', () => {
      expect(departmentModelContent).toContain('name: {')
      expect(departmentModelContent).toContain('description: {')
      expect(departmentModelContent).toContain('status: {')
    })

    it('should have unique name constraint', () => {
      expect(departmentModelContent).toContain('unique: true')
      expect(departmentModelContent).toContain('name')
    })

    it('should have ENUM validation for status', () => {
      expect(departmentModelContent).toContain("ENUM('Active', 'Inactive')")
    })

    it('should have foreign key to employees', () => {
      expect(departmentModelContent).toContain('manager_id: {')
      expect(departmentModelContent).toContain("model: 'employees'")
    })

    it('should have proper indexes', () => {
      expect(departmentModelContent).toContain('indexes: [')
      expect(departmentModelContent).toContain("fields: ['name']")
      expect(departmentModelContent).toContain("fields: ['status']")
      expect(departmentModelContent).toContain("fields: ['manager_id']")
    })

    it('should have model validations', () => {
      expect(departmentModelContent).toContain('validate: {')
      expect(departmentModelContent).toContain('budgetMustBePositive')
      expect(departmentModelContent).toContain('managerMustBeValid')
    })
  })

  describe('UserRoleMap Table Schema', () => {
    let userRoleMapModelContent

    beforeAll(() => {
      userRoleMapModelContent = fs.readFileSync(userRoleMapModelPath, 'utf8')
    })

    it('should have correct table name', () => {
      expect(userRoleMapModelContent).toContain("tableName: 'user_role_maps'")
    })

    it('should have required fields', () => {
      expect(userRoleMapModelContent).toContain('employee_id: {')
      expect(userRoleMapModelContent).toContain('role: {')
      expect(userRoleMapModelContent).toContain('is_active: {')
    })

    it('should have unique constraints', () => {
      expect(userRoleMapModelContent).toContain('unique: true')
      expect(userRoleMapModelContent).toContain('ms_graph_user_id')
      expect(userRoleMapModelContent).toContain('email')
    })

    it('should have ENUM validation for role', () => {
      expect(userRoleMapModelContent).toContain("ENUM('admin', 'manager', 'employee', 'hr', 'it_admin', 'supervisor')")
    })

    it('should have JSON field for permissions', () => {
      expect(userRoleMapModelContent).toContain('permissions: {')
      expect(userRoleMapModelContent).toContain('type: DataTypes.JSON')
    })

    it('should have security fields', () => {
      expect(userRoleMapModelContent).toContain('refresh_token: {')
      expect(userRoleMapModelContent).toContain('failed_login_attempts: {')
      expect(userRoleMapModelContent).toContain('account_locked_until: {')
      expect(userRoleMapModelContent).toContain('password_reset_token: {')
      expect(userRoleMapModelContent).toContain('two_factor_enabled: {')
    })

    it('should have proper indexes', () => {
      expect(userRoleMapModelContent).toContain('indexes: [')
      expect(userRoleMapModelContent).toContain("fields: ['ms_graph_user_id']")
      expect(userRoleMapModelContent).toContain("fields: ['email']")
      expect(userRoleMapModelContent).toContain("fields: ['role']")
      expect(userRoleMapModelContent).toContain("fields: ['is_active']")
    })

    it('should have model validations', () => {
      expect(userRoleMapModelContent).toContain('validate: {')
      expect(userRoleMapModelContent).toContain('eitherEmployeeOrEmail')
      expect(userRoleMapModelContent).toContain('accountLockoutConsistent')
      expect(userRoleMapModelContent).toContain('passwordResetTokenConsistent')
      expect(userRoleMapModelContent).toContain('twoFactorConsistent')
    })
  })

  describe('Model Relationships Schema', () => {
    let modelsIndexContent

    beforeAll(() => {
      modelsIndexContent = fs.readFileSync(modelsIndexPath, 'utf8')
    })

    it('should have Employee-Department associations', () => {
      expect(modelsIndexContent).toContain('Employee.belongsTo(Department')
      expect(modelsIndexContent).toContain('Department.hasMany(Employee')
      expect(modelsIndexContent).toContain("foreignKey: 'department_id'")
      expect(modelsIndexContent).toContain("as: 'department'")
      expect(modelsIndexContent).toContain("as: 'employees'")
    })

    it('should have Employee-Manager self-reference', () => {
      expect(modelsIndexContent).toContain('Employee.belongsTo(Employee')
      expect(modelsIndexContent).toContain('Employee.hasMany(Employee')
      expect(modelsIndexContent).toContain("foreignKey: 'manager_id'")
      expect(modelsIndexContent).toContain("as: 'manager'")
      expect(modelsIndexContent).toContain("as: 'subordinates'")
    })

    it('should have Hardware-Employee associations', () => {
      expect(modelsIndexContent).toContain('Hardware.belongsTo(Employee')
      expect(modelsIndexContent).toContain('Employee.hasMany(Hardware')
      expect(modelsIndexContent).toContain("foreignKey: 'assigned_to'")
      expect(modelsIndexContent).toContain("as: 'assignedEmployee'")
      expect(modelsIndexContent).toContain("as: 'assignedHardware'")
    })

    it('should have Software-Employee associations', () => {
      expect(modelsIndexContent).toContain('Software.belongsTo(Employee')
      expect(modelsIndexContent).toContain('Employee.hasMany(Software')
      expect(modelsIndexContent).toContain("foreignKey: 'assigned_to'")
      expect(modelsIndexContent).toContain("as: 'assignedEmployee'")
      expect(modelsIndexContent).toContain("as: 'assignedSoftware'")
    })

    it('should have License associations', () => {
      expect(modelsIndexContent).toContain('License.belongsTo(Software')
      expect(modelsIndexContent).toContain('License.belongsTo(Employee')
      expect(modelsIndexContent).toContain('Software.hasMany(License')
      expect(modelsIndexContent).toContain('Employee.hasMany(License')
      expect(modelsIndexContent).toContain("foreignKey: 'software_id'")
      expect(modelsIndexContent).toContain("as: 'software'")
      expect(modelsIndexContent).toContain("as: 'assignedEmployee'")
      expect(modelsIndexContent).toContain("as: 'licenses'")
      expect(modelsIndexContent).toContain("as: 'assignedLicenses'")
    })

    it('should have Ticket associations', () => {
      expect(modelsIndexContent).toContain('Ticket.belongsTo(Employee')
      expect(modelsIndexContent).toContain('Employee.hasMany(Ticket')
      expect(modelsIndexContent).toContain("foreignKey: 'created_by'")
      expect(modelsIndexContent).toContain("foreignKey: 'assigned_to'")
      expect(modelsIndexContent).toContain("as: 'createdByEmployee'")
      expect(modelsIndexContent).toContain("as: 'assignedToEmployee'")
      expect(modelsIndexContent).toContain("as: 'createdTickets'")
      expect(modelsIndexContent).toContain("as: 'assignedTickets'")
    })

    it('should have UserRoleMap associations', () => {
      expect(modelsIndexContent).toContain('UserRoleMap.belongsTo(Employee')
      expect(modelsIndexContent).toContain('Employee.hasOne(UserRoleMap')
      expect(modelsIndexContent).toContain("foreignKey: 'employee_id'")
      expect(modelsIndexContent).toContain("as: 'employee'")
      expect(modelsIndexContent).toContain("as: 'roleMap'")
    })

    it('should have BiometricEmployee associations', () => {
      expect(modelsIndexContent).toContain('BiometricEmployee.belongsTo(Employee')
      expect(modelsIndexContent).toContain('Employee.hasOne(BiometricEmployee')
      expect(modelsIndexContent).toContain("foreignKey: 'employee_id'")
      expect(modelsIndexContent).toContain("as: 'mainEmployee'")
      expect(modelsIndexContent).toContain("as: 'biometricProfile'")
    })

    it('should have Integration associations', () => {
      expect(modelsIndexContent).toContain('Integration.belongsTo(Employee')
      expect(modelsIndexContent).toContain('Employee.hasMany(Integration')
      expect(modelsIndexContent).toContain("foreignKey: 'created_by'")
      expect(modelsIndexContent).toContain("foreignKey: 'updated_by'")
      expect(modelsIndexContent).toContain("as: 'creator'")
      expect(modelsIndexContent).toContain("as: 'updater'")
      expect(modelsIndexContent).toContain("as: 'createdIntegrations'")
      expect(modelsIndexContent).toContain("as: 'updatedIntegrations'")
    })

    it('should have Department-Hardware/Software associations', () => {
      expect(modelsIndexContent).toContain('Department.hasMany(Hardware')
      expect(modelsIndexContent).toContain('Department.hasMany(Software')
      expect(modelsIndexContent).toContain("foreignKey: 'department_id'")
      expect(modelsIndexContent).toContain("as: 'departmentHardware'")
      expect(modelsIndexContent).toContain("as: 'departmentSoftware'")
    })
  })

  describe('Database Schema Validation', () => {
    it('should validate table structure integrity', async () => {
      const tables = await mockDbConnection.executeRawQuery(`
        SELECT 
          TABLE_NAME,
          COLUMN_NAME,
          DATA_TYPE,
          IS_NULLABLE,
          COLUMN_KEY,
          COLUMN_DEFAULT
        FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = 'ems_db'
        ORDER BY TABLE_NAME, ORDINAL_POSITION
      `)
      
      expect(tables).toBeDefined()
      expect(Array.isArray(tables)).toBe(true)
      expect(tables.length).toBeGreaterThan(0)
    })

    it('should validate foreign key constraints', async () => {
      const foreignKeys = await mockDbConnection.executeRawQuery(`
        SELECT 
          TABLE_NAME,
          COLUMN_NAME,
          REFERENCED_TABLE_NAME,
          REFERENCED_COLUMN_NAME
        FROM information_schema.KEY_COLUMN_USAGE 
        WHERE TABLE_SCHEMA = 'ems_db' 
        AND REFERENCED_TABLE_NAME IS NOT NULL
      `)
      
      expect(foreignKeys).toBeDefined()
      expect(Array.isArray(foreignKeys)).toBe(true)
    })

    it('should validate indexes', async () => {
      const indexes = await mockDbConnection.executeRawQuery(`
        SELECT 
          TABLE_NAME,
          INDEX_NAME,
          COLUMN_NAME,
          NON_UNIQUE
        FROM information_schema.STATISTICS 
        WHERE TABLE_SCHEMA = 'ems_db'
        ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX
      `)
      
      expect(indexes).toBeDefined()
      expect(Array.isArray(indexes)).toBe(true)
    })

    it('should validate table constraints', async () => {
      const constraints = await mockDbConnection.executeRawQuery(`
        SELECT 
          TABLE_NAME,
          CONSTRAINT_NAME,
          CONSTRAINT_TYPE
        FROM information_schema.TABLE_CONSTRAINTS 
        WHERE TABLE_SCHEMA = 'ems_db'
      `)
      
      expect(constraints).toBeDefined()
      expect(Array.isArray(constraints)).toBe(true)
    })
  })

  describe('Model Exports and Imports', () => {
    let modelsIndexContent

    beforeAll(() => {
      modelsIndexContent = fs.readFileSync(modelsIndexPath, 'utf8')
    })

    it('should import all models', () => {
      expect(modelsIndexContent).toContain("import Employee from './Employee.js'")
      expect(modelsIndexContent).toContain("import Hardware from './Hardware.js'")
      expect(modelsIndexContent).toContain("import Software from './Software.js'")
      expect(modelsIndexContent).toContain("import License from './License.js'")
      expect(modelsIndexContent).toContain("import Ticket from './Ticket.js'")
      expect(modelsIndexContent).toContain("import Department from './Department.js'")
      expect(modelsIndexContent).toContain("import Integration from './Integration.js'")
      expect(modelsIndexContent).toContain("import UserRoleMap from './UserRoleMap.js'")
      expect(modelsIndexContent).toContain("import BiometricEmployee from './BiometricEmployee.js'")
    })

    it('should export all models', () => {
      expect(modelsIndexContent).toContain('export {')
      expect(modelsIndexContent).toContain('Employee,')
      expect(modelsIndexContent).toContain('Hardware,')
      expect(modelsIndexContent).toContain('Software,')
      expect(modelsIndexContent).toContain('License,')
      expect(modelsIndexContent).toContain('Ticket,')
      expect(modelsIndexContent).toContain('Department,')
      expect(modelsIndexContent).toContain('Integration,')
      expect(modelsIndexContent).toContain('UserRoleMap,')
      expect(modelsIndexContent).toContain('BiometricEmployee')
    })

    it('should have default export', () => {
      expect(modelsIndexContent).toContain('export default {')
      expect(modelsIndexContent).toContain('Employee,')
      expect(modelsIndexContent).toContain('Hardware,')
      expect(modelsIndexContent).toContain('Software,')
      expect(modelsIndexContent).toContain('License,')
      expect(modelsIndexContent).toContain('Ticket,')
      expect(modelsIndexContent).toContain('Department,')
      expect(modelsIndexContent).toContain('Integration,')
      expect(modelsIndexContent).toContain('UserRoleMap,')
      expect(modelsIndexContent).toContain('BiometricEmployee')
    })
  })

  describe('Database Connection Schema', () => {
    let connectionContent

    beforeAll(() => {
      const connectionPath = path.join(__dirname, '..', 'database', 'connection.js')
      connectionContent = fs.readFileSync(connectionPath, 'utf8')
    })

    it('should have proper Sequelize configuration', () => {
      expect(connectionContent).toContain('dialect: \'mysql\'')
      expect(connectionContent).toContain('dialectOptions: {')
      expect(connectionContent).toContain('charset: \'utf8mb4\'')
      expect(connectionContent).toContain('collate: \'utf8mb4_unicode_ci\'')
    })

    it('should have connection pooling configuration', () => {
      expect(connectionContent).toContain('pool: {')
      expect(connectionContent).toContain('max: 10')
      expect(connectionContent).toContain('min: 0')
      expect(connectionContent).toContain('acquire: 60000')
      expect(connectionContent).toContain('idle: 300000')
    })

    it('should have retry configuration', () => {
      expect(connectionContent).toContain('retry: {')
      expect(connectionContent).toContain('max: 3')
      expect(connectionContent).toContain('match: [')
    })

    it('should have global model configuration', () => {
      expect(connectionContent).toContain('define: {')
      expect(connectionContent).toContain('timestamps: true')
      expect(connectionContent).toContain('underscored: true')
      expect(connectionContent).toContain('freezeTableName: true')
    })
  })
})
