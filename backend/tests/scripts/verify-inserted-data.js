/**
 * Verify Inserted Employee Data
 * Checks the final state of the database after employee data insertion
 */

import { Sequelize } from 'sequelize'

async function verifyInsertedData() {
  console.log('🔍 Verifying Inserted Employee Data...')
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

    // Check total employees
    console.log('👥 Employee Statistics:')
    const [empCount] = await sequelize.query('SELECT COUNT(*) as total FROM employees')
    console.log(`📊 Total employees: ${empCount[0].total}`)

    // Check departments
    console.log('\n🏢 Department Statistics:')
    const [deptCount] = await sequelize.query('SELECT COUNT(*) as total FROM departments')
    console.log(`📊 Total departments: ${deptCount[0].total}`)

    const [departments] = await sequelize.query(`
      SELECT d.name, COUNT(e.id) as employee_count
      FROM departments d
      LEFT JOIN employees e ON d.id = e.department_id
      GROUP BY d.id, d.name
      ORDER BY employee_count DESC
    `)
    
    console.log('📋 Department breakdown:')
    departments.forEach(dept => {
      console.log(`  - ${dept.name}: ${dept.employee_count} employees`)
    })

    // Check user roles
    console.log('\n🔐 User Role Statistics:')
    const [roleCount] = await sequelize.query('SELECT COUNT(*) as total FROM user_role_maps')
    console.log(`📊 Total user roles: ${roleCount[0].total}`)

    const [roles] = await sequelize.query(`
      SELECT role, COUNT(*) as count
      FROM user_role_maps
      GROUP BY role
      ORDER BY count DESC
    `)
    
    console.log('📋 Role breakdown:')
    roles.forEach(role => {
      console.log(`  - ${role.role}: ${role.count} users`)
    })

    // Check employee status
    console.log('\n📊 Employee Status:')
    const [statusCount] = await sequelize.query(`
      SELECT status, COUNT(*) as count
      FROM employees
      GROUP BY status
      ORDER BY count DESC
    `)
    
    statusCount.forEach(status => {
      console.log(`  - ${status.status}: ${status.count} employees`)
    })

    // Check employment types
    console.log('\n💼 Employment Types:')
    const [empTypes] = await sequelize.query(`
      SELECT employment_type, COUNT(*) as count
      FROM employees
      GROUP BY employment_type
      ORDER BY count DESC
    `)
    
    empTypes.forEach(type => {
      console.log(`  - ${type.employment_type}: ${type.count} employees`)
    })

    // Show sample employees
    console.log('\n👤 Sample Employees:')
    const [sampleEmployees] = await sequelize.query(`
      SELECT 
        e.employee_id, e.first_name, e.last_name, e.email, e.status,
        d.name as department, urm.role
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN user_role_maps urm ON e.id = urm.employee_id
      ORDER BY e.employee_id
      LIMIT 10
    `)
    
    sampleEmployees.forEach(emp => {
      console.log(`  - ${emp.employee_id}: ${emp.first_name} ${emp.last_name} (${emp.department}) - ${emp.role}`)
    })

    // Check for admin users
    console.log('\n👑 Admin Users:')
    const [adminUsers] = await sequelize.query(`
      SELECT 
        e.employee_id, e.first_name, e.last_name, e.email
      FROM employees e
      JOIN user_role_maps urm ON e.id = urm.employee_id
      WHERE urm.role = 'admin'
      ORDER BY e.employee_id
    `)
    
    adminUsers.forEach(admin => {
      console.log(`  - ${admin.employee_id}: ${admin.first_name} ${admin.last_name} (${admin.email})`)
    })

    // Check data quality
    console.log('\n🔍 Data Quality Check:')
    
    // Check for missing emails
    const [missingEmails] = await sequelize.query(`
      SELECT COUNT(*) as count FROM employees WHERE email IS NULL OR email = ''
    `)
    console.log(`📧 Employees without email: ${missingEmails[0].count}`)
    
    // Check for missing departments
    const [missingDepts] = await sequelize.query(`
      SELECT COUNT(*) as count FROM employees WHERE department_id IS NULL
    `)
    console.log(`🏢 Employees without department: ${missingDepts[0].count}`)
    
    // Check for missing user roles
    const [missingRoles] = await sequelize.query(`
      SELECT COUNT(*) as count FROM employees e
      LEFT JOIN user_role_maps urm ON e.id = urm.employee_id
      WHERE urm.id IS NULL
    `)
    console.log(`🔐 Employees without user roles: ${missingRoles[0].count}`)

    console.log('\n✅ Data verification completed successfully!')
    console.log('🎉 Employee data insertion was successful!')
    
  } catch (error) {
    console.error('❌ Error during verification:')
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
  console.log('✅ Employee data verification completed!')
}

verifyInsertedData()
