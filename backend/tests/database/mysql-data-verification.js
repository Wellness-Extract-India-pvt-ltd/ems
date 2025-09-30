/**
 * MySQL Data Verification Test
 * Verifies existing data and prepares for employee data insertion
 */

import { Sequelize } from 'sequelize'

async function verifyMySQLData() {
  console.log('🔍 Verifying MySQL Database Data...')
  console.log('=' .repeat(60))

  // Database configuration
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    database: process.env.DB_NAME || 'ems_db',
    username: process.env.DB_USER || 'ems_user',
    password: process.env.DB_PASSWORD || 'ems_root_password',
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      charset: 'utf8mb4'
    }
  }

  let sequelize = null

  try {
    // Create Sequelize instance
    sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
      host: dbConfig.host,
      port: dbConfig.port,
      dialect: dbConfig.dialect,
      logging: dbConfig.logging,
      pool: dbConfig.pool,
      dialectOptions: dbConfig.dialectOptions
    })

    await sequelize.authenticate()
    console.log('✅ Database connection established')

    // Check existing departments
    console.log('🏢 Checking existing departments...')
    const [departments] = await sequelize.query('SELECT * FROM departments')
    console.log(`📊 Found ${departments.length} departments:`)
    departments.forEach(dept => {
      console.log(`  - ID: ${dept.id}, Name: ${dept.name}, Status: ${dept.status}`)
    })

    // Check existing employees
    console.log('👥 Checking existing employees...')
    const [employees] = await sequelize.query('SELECT * FROM employees')
    console.log(`📊 Found ${employees.length} employees:`)
    employees.forEach(emp => {
      console.log(`  - ID: ${emp.id}, Employee ID: ${emp.employee_id}, Name: ${emp.first_name} ${emp.last_name}`)
    })

    // Check existing user roles
    console.log('🔐 Checking existing user roles...')
    const [userRoles] = await sequelize.query('SELECT * FROM user_role_maps')
    console.log(`📊 Found ${userRoles.length} user roles:`)
    userRoles.forEach(role => {
      console.log(`  - ID: ${role.id}, Employee ID: ${role.employee_id}, Role: ${role.role}`)
    })

    // Check table structures
    console.log('📋 Verifying table structures...')
    const tables = ['employees', 'departments', 'user_role_maps', 'hardware', 'software', 'licenses', 'tickets', 'integrations', 'biometric_employees']
    
    for (const tableName of tables) {
      try {
        const [columns] = await sequelize.query(`
          SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY, COLUMN_DEFAULT
          FROM information_schema.COLUMNS 
          WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '${tableName}'
          ORDER BY ORDINAL_POSITION
        `)
        console.log(`✅ Table ${tableName}: ${columns.length} columns`)
      } catch (error) {
        console.log(`❌ Table ${tableName}: ${error.message}`)
      }
    }

    // Test data insertion capability
    console.log('🧪 Testing data insertion capability...')
    
    // Test department insertion
    try {
      const [deptResult] = await sequelize.query(`
        INSERT INTO departments (name, description, status, created_at, updated_at) 
        VALUES ('Test Department', 'Test department for verification', 'Active', NOW(), NOW())
      `)
      console.log('✅ Department insertion test successful')
      
      // Clean up test data
      await sequelize.query('DELETE FROM departments WHERE name = "Test Department"')
      console.log('🧹 Test data cleaned up')
    } catch (error) {
      console.log('❌ Department insertion test failed:', error.message)
    }

    // Test employee insertion
    try {
      const [empResult] = await sequelize.query(`
        INSERT INTO employees (
          employee_id, first_name, last_name, email, join_date, employment_type, status, created_at, updated_at
        ) VALUES (
          'TEST001', 'Test', 'User', 'test@company.com', '2024-01-01', 'Full-time', 'Active', NOW(), NOW()
        )
      `)
      console.log('✅ Employee insertion test successful')
      
      // Clean up test data
      await sequelize.query('DELETE FROM employees WHERE employee_id = "TEST001"')
      console.log('🧹 Test data cleaned up')
    } catch (error) {
      console.log('❌ Employee insertion test failed:', error.message)
    }

    // Check foreign key relationships
    console.log('🔗 Checking foreign key relationships...')
    const [foreignKeys] = await sequelize.query(`
      SELECT 
        TABLE_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM information_schema.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND REFERENCED_TABLE_NAME IS NOT NULL
    `)
    
    console.log(`📊 Found ${foreignKeys.length} foreign key relationships:`)
    foreignKeys.forEach(fk => {
      console.log(`  - ${fk.TABLE_NAME}.${fk.COLUMN_NAME} -> ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`)
    })

    console.log('✅ Database verification completed successfully!')
    console.log('📝 Database is ready for employee data insertion')
    
  } catch (error) {
    console.error('❌ Error during database verification:')
    console.error('  Message:', error.message)
    console.error('  Code:', error.code)
  } finally {
    if (sequelize) {
      try {
        await sequelize.close()
        console.log('🔌 Database connection closed')
      } catch (error) {
        console.error('❌ Error closing connection:', error.message)
      }
    }
  }
  
  console.log('=' .repeat(60))
  console.log('✅ MySQL data verification completed!')
}

verifyMySQLData()
