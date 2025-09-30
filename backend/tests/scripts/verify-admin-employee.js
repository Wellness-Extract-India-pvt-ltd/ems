/**
 * Verify Admin Employee Data
 * Checks for employee WE_IN017 with admin role and correct email
 */

import { Sequelize } from 'sequelize'

async function verifyAdminEmployee() {
  console.log('🔍 Verifying Admin Employee Data...')
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

    // Check for employee WE_IN017
    console.log('👤 Checking for employee WE_IN017...')
    const [employees] = await sequelize.query(`
      SELECT * FROM employees 
      WHERE employee_id = 'WE_IN017'
    `)
    
    if (employees.length > 0) {
      const emp = employees[0]
      console.log('✅ Employee WE_IN017 found:')
      console.log(`  - ID: ${emp.id}`)
      console.log(`  - Employee ID: ${emp.employee_id}`)
      console.log(`  - Name: ${emp.first_name} ${emp.last_name}`)
      console.log(`  - Email: ${emp.email}`)
      console.log(`  - Contact Email: ${emp.contact_email}`)
      console.log(`  - Status: ${emp.status}`)
      console.log(`  - Department ID: ${emp.department_id}`)
      
      // Check if email matches requirement
      if (emp.email === 'sawan@wellnessextract.com' || emp.contact_email === 'sawan@wellnessextract.com') {
        console.log('✅ Email matches requirement: sawan@wellnessextract.com')
      } else {
        console.log('⚠️  Email does not match requirement:')
        console.log(`  Current email: ${emp.email}`)
        console.log(`  Current contact_email: ${emp.contact_email}`)
        console.log(`  Required: sawan@wellnessextract.com`)
      }
    } else {
      console.log('❌ Employee WE_IN017 not found')
    }

    // Check user role for this employee
    console.log('🔐 Checking user role for employee WE_IN017...')
    const [userRoles] = await sequelize.query(`
      SELECT urm.*, e.employee_id, e.first_name, e.last_name, e.email
      FROM user_role_maps urm
      JOIN employees e ON urm.employee_id = e.id
      WHERE e.employee_id = 'WE_IN017'
    `)
    
    if (userRoles.length > 0) {
      const role = userRoles[0]
      console.log('✅ User role found:')
      console.log(`  - Employee ID: ${role.employee_id}`)
      console.log(`  - Employee Name: ${role.first_name} ${role.last_name}`)
      console.log(`  - Email: ${role.email}`)
      console.log(`  - Role: ${role.role}`)
      console.log(`  - Is Active: ${role.is_active}`)
      console.log(`  - MS Graph User ID: ${role.ms_graph_user_id}`)
      
      if (role.role === 'admin') {
        console.log('✅ Admin role confirmed')
      } else {
        console.log('⚠️  Role is not admin:', role.role)
      }
    } else {
      console.log('❌ No user role found for employee WE_IN017')
    }

    // Check if email needs to be updated
    console.log('📧 Checking email configuration...')
    const [emailCheck] = await sequelize.query(`
      SELECT id, employee_id, email, contact_email 
      FROM employees 
      WHERE employee_id = 'WE_IN017'
    `)
    
    if (emailCheck.length > 0) {
      const emp = emailCheck[0]
      let needsUpdate = false
      
      if (emp.email !== 'sawan@wellnessextract.com') {
        console.log('📝 Updating email field...')
        await sequelize.query(`
          UPDATE employees 
          SET email = 'sawan@wellnessextract.com' 
          WHERE employee_id = 'WE_IN017'
        `)
        needsUpdate = true
      }
      
      if (emp.contact_email !== 'sawan@wellnessextract.com') {
        console.log('📝 Updating contact_email field...')
        await sequelize.query(`
          UPDATE employees 
          SET contact_email = 'sawan@wellnessextract.com' 
          WHERE employee_id = 'WE_IN017'
        `)
        needsUpdate = true
      }
      
      if (needsUpdate) {
        console.log('✅ Email fields updated to sawan@wellnessextract.com')
      } else {
        console.log('✅ Email fields already correct')
      }
    }

    // Verify final state
    console.log('🔍 Final verification...')
    const [finalCheck] = await sequelize.query(`
      SELECT 
        e.id, e.employee_id, e.first_name, e.last_name, e.email, e.contact_email, e.status,
        urm.role, urm.is_active, urm.ms_graph_user_id
      FROM employees e
      LEFT JOIN user_role_maps urm ON e.id = urm.employee_id
      WHERE e.employee_id = 'WE_IN017'
    `)
    
    if (finalCheck.length > 0) {
      const emp = finalCheck[0]
      console.log('📊 Final Employee Status:')
      console.log(`  ✅ Employee ID: ${emp.employee_id}`)
      console.log(`  ✅ Name: ${emp.first_name} ${emp.last_name}`)
      console.log(`  ✅ Email: ${emp.email}`)
      console.log(`  ✅ Contact Email: ${emp.contact_email}`)
      console.log(`  ✅ Status: ${emp.status}`)
      console.log(`  ✅ Role: ${emp.role}`)
      console.log(`  ✅ Is Active: ${emp.is_active}`)
      console.log(`  ✅ MS Graph User ID: ${emp.ms_graph_user_id}`)
      
      // Verify all requirements
      const requirements = [
        emp.employee_id === 'WE_IN017',
        emp.email === 'sawan@wellnessextract.com',
        emp.contact_email === 'sawan@wellnessextract.com',
        emp.role === 'admin',
        emp.is_active === 1
      ]
      
      const allMet = requirements.every(req => req)
      
      if (allMet) {
        console.log('🎉 All requirements met! Employee WE_IN017 is properly configured with admin role.')
      } else {
        console.log('⚠️  Some requirements not met. Please check the configuration.')
      }
    }

    console.log('✅ Admin employee verification completed!')
    
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
  console.log('✅ Admin employee verification completed!')
}

verifyAdminEmployee()
