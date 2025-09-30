/**
 * Employee Data Insertion Script
 * Reads Excel file and inserts employee data into MySQL database
 */

import { Sequelize } from 'sequelize'
import XLSX from 'xlsx'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Helper function to convert Excel date serial numbers to proper date format
function convertExcelDate(excelDate) {
  if (!excelDate || isNaN(excelDate)) return null
  
  // Excel date serial number to JavaScript date conversion
  // Excel counts days since 1900-01-01, but has a leap year bug
  const excelEpoch = new Date(1900, 0, 1)
  const jsDate = new Date(excelEpoch.getTime() + (excelDate - 2) * 24 * 60 * 60 * 1000)
  
  // Format as YYYY-MM-DD for MySQL
  return jsDate.toISOString().split('T')[0]
}

// Helper function to map employment types to valid enum values
function mapEmploymentType(empType) {
  if (!empType) return 'Full-time'
  
  const type = empType.toString().toLowerCase().trim()
  
  if (type.includes('full') || type.includes('permanent')) return 'Full-time'
  if (type.includes('part')) return 'Part-time'
  if (type.includes('intern') || type.includes('trainee')) return 'Intern'
  if (type.includes('contract') || type.includes('freelance')) return 'Contractor'
  
  // Default to Full-time if unknown
  return 'Full-time'
}

// Helper function to map employee status to valid enum values
function mapEmployeeStatus(status) {
  if (!status) return 'Active'
  
  const stat = status.toString().toLowerCase().trim()
  
  if (stat.includes('active') || stat.includes('working')) return 'Active'
  if (stat.includes('inactive') || stat.includes('in active')) return 'Inactive'
  if (stat.includes('onboard') || stat.includes('on board')) return 'Onboarding'
  if (stat.includes('suspend')) return 'Suspended'
  if (stat.includes('terminat') || stat.includes('left') || stat.includes('resign')) return 'Terminated'
  
  // Default to Active if unknown
  return 'Active'
}

// Helper function to map marital status to valid enum values
function mapMaritalStatus(maritalStatus) {
  if (!maritalStatus) return null
  
  const status = maritalStatus.toString().toLowerCase().trim()
  
  if (status.includes('single') || status.includes('unmarried')) return 'Single'
  if (status.includes('married')) return 'Married'
  if (status.includes('divorce')) return 'Divorced'
  if (status.includes('widow')) return 'Widowed'
  
  // Return null if unknown to avoid truncation
  return null
}

async function insertEmployeeData() {
  console.log('📊 Starting Employee Data Insertion...')
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
      max: 10,
      min: 0,
      acquire: 60000,
      idle: 30000
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

    // Read Excel file
    const excelPath = path.join(__dirname, '..', 'EMS Emp.Data.xlsx')
    console.log('📁 Reading Excel file:', excelPath)
    
    if (!fs.existsSync(excelPath)) {
      throw new Error('Excel file not found: ' + excelPath)
    }

    const workbook = XLSX.readFile(excelPath)
    const sheetNames = workbook.SheetNames
    console.log('📋 Available sheets:', sheetNames)

    // Process each sheet
    for (const sheetName of sheetNames) {
      console.log(`\n📊 Processing sheet: ${sheetName}`)
      const worksheet = workbook.Sheets[sheetName]
      const data = XLSX.utils.sheet_to_json(worksheet)
      
      console.log(`📈 Found ${data.length} rows in ${sheetName}`)
      
      if (data.length === 0) {
        console.log('⚠️  No data found in sheet, skipping...')
        continue
      }

      // Show first few rows for verification
      console.log('📋 Sample data (first 3 rows):')
      data.slice(0, 3).forEach((row, index) => {
        console.log(`  Row ${index + 1}:`, Object.keys(row).slice(0, 5).map(key => `${key}: ${row[key]}`).join(', '))
      })

      // Process based on sheet name or content
      if (sheetName.toLowerCase().includes('employee') || sheetName.toLowerCase().includes('emp') || 
          data.length > 0 && (data[0]['Employee ID'] || data[0]['First Name'])) {
        await processEmployeeData(sequelize, data)
      } else if (sheetName.toLowerCase().includes('department') || sheetName.toLowerCase().includes('dept')) {
        await processDepartmentData(sequelize, data)
      } else if (sheetName.toLowerCase().includes('role') || sheetName.toLowerCase().includes('user')) {
        await processUserRoleData(sequelize, data)
      } else {
        console.log('⚠️  Unknown sheet type, processing as generic data...')
        await processGenericData(sequelize, data, sheetName)
      }
    }

    console.log('\n✅ Employee data insertion completed successfully!')
    
  } catch (error) {
    console.error('❌ Error during data insertion:')
    console.error('  Message:', error.message)
    console.error('  Stack:', error.stack)
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
  console.log('✅ Employee data insertion process completed!')
}

async function processEmployeeData(sequelize, data) {
  console.log('👥 Processing employee data...')
  
  // First, create departments from unique department names
  console.log('🏢 Creating departments...')
  const departments = [...new Set(data.map(row => row['Department']).filter(Boolean))]
  const departmentMap = {}
  
  for (const deptName of departments) {
    try {
      const [result] = await sequelize.query(`
        INSERT INTO departments (name, description, status, created_at, updated_at)
        VALUES (:name, :description, :status, NOW(), NOW())
        ON DUPLICATE KEY UPDATE name = name
      `, {
        replacements: {
          name: deptName,
          description: `${deptName} Department`,
          status: 'Active'
        }
      })
      
      // Get department ID
      const [deptResult] = await sequelize.query('SELECT id FROM departments WHERE name = :name', {
        replacements: { name: deptName }
      })
      
      if (deptResult.length > 0) {
        departmentMap[deptName] = deptResult[0].id
        console.log(`✅ Created/found department: ${deptName} (ID: ${deptResult[0].id})`)
      }
    } catch (error) {
      console.error(`❌ Error creating department ${deptName}:`, error.message)
    }
  }
  
  let successCount = 0
  let errorCount = 0
  
  for (const [index, row] of data.entries()) {
    try {
      // Map Excel columns to database fields based on actual column names
      const employeeData = {
        employee_id: row['Employee ID'] || `EMP${String(index + 1).padStart(3, '0')}`,
        first_name: row['First Name'] || 'Unknown',
        last_name: row['Last Name'] || 'Unknown',
        email: row['Email address'] || row['Personal Email Address'] || null,
        contact_email: row['Email address'] || row['Personal Email Address'] || null,
        phone: row['Personal Mobile Number'] || null,
        date_of_birth: convertExcelDate(row['Date of Birth']) || null,
        gender: row['Gender'] || null,
        marital_status: mapMaritalStatus(row['Marital Status']),
        address: null, // Not available in Excel
        city: null, // Not available in Excel
        state: null, // Not available in Excel
        zip_code: null, // Not available in Excel
        country: 'India', // Default for Indian company
        join_date: convertExcelDate(row['Date of Joining']) || new Date().toISOString().split('T')[0],
        employment_type: mapEmploymentType(row['Employment Type']) || 'Full-time',
        department_id: departmentMap[row['Department']] || null,
        position: row['Designation'] || null,
        salary: null, // Not available in Excel
        status: mapEmployeeStatus(row['Employee Status']),
        emergency_contact_name: null, // Not available in Excel
        emergency_contact_phone: null, // Not available in Excel
        emergency_contact_relationship: null, // Not available in Excel
        manager_id: null, // Will be set based on manager name
        work_location: row['Seating Location'] || null,
        work_schedule: 'Regular', // Default
        bank_name: null, // Not available in Excel
        account_number: null, // Not available in Excel
        ifsc_code: null, // Not available in Excel
        ms_graph_user_id: null // Will be generated if needed
      }

      // Clean and validate data
      if (employeeData.email && !employeeData.email.includes('@')) {
        employeeData.email = null
      }
      if (employeeData.contact_email && !employeeData.contact_email.includes('@')) {
        employeeData.contact_email = null
      }

      // Insert employee
      const [result] = await sequelize.query(`
        INSERT INTO employees (
          employee_id, first_name, last_name, email, contact_email, phone,
          date_of_birth, gender, marital_status, address, city, state, zip_code, country,
          join_date, employment_type, position, salary, status,
          emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
          work_location, work_schedule, bank_name, account_number, ifsc_code, ms_graph_user_id,
          created_at, updated_at
        ) VALUES (
          :employee_id, :first_name, :last_name, :email, :contact_email, :phone,
          :date_of_birth, :gender, :marital_status, :address, :city, :state, :zip_code, :country,
          :join_date, :employment_type, :position, :salary, :status,
          :emergency_contact_name, :emergency_contact_phone, :emergency_contact_relationship,
          :work_location, :work_schedule, :bank_name, :account_number, :ifsc_code, :ms_graph_user_id,
          NOW(), NOW()
        )
      `, {
        replacements: employeeData
      })

      successCount++
      console.log(`✅ Inserted employee: ${employeeData.employee_id} - ${employeeData.first_name} ${employeeData.last_name}`)
      
      // Create user role for the employee
      try {
        const [empResult] = await sequelize.query('SELECT id FROM employees WHERE employee_id = :employee_id', {
          replacements: { employee_id: employeeData.employee_id }
        })
        
        if (empResult.length > 0) {
          const employeeId = empResult[0].id
          const role = row['Role'] || 'employee'
          
          await sequelize.query(`
            INSERT INTO user_role_maps (
              employee_id, email, role, is_active, created_at, updated_at
            ) VALUES (
              :employee_id, :email, :role, :is_active, NOW(), NOW()
            )
            ON DUPLICATE KEY UPDATE role = :role
          `, {
            replacements: {
              employee_id: employeeId,
              email: employeeData.email,
              role: role,
              is_active: 1
            }
          })
          
          console.log(`  ✅ Created user role: ${role} for ${employeeData.employee_id}`)
        }
      } catch (roleError) {
        console.error(`  ⚠️  Error creating user role for ${employeeData.employee_id}:`, roleError.message)
      }
      
    } catch (error) {
      errorCount++
      console.error(`❌ Error inserting employee ${index + 1}:`, error.message)
    }
  }
  
  console.log(`📊 Employee processing complete: ${successCount} successful, ${errorCount} errors`)
}

async function processDepartmentData(sequelize, data) {
  console.log('🏢 Processing department data...')
  
  let successCount = 0
  let errorCount = 0
  
  for (const [index, row] of data.entries()) {
    try {
      const departmentData = {
        name: row['Department Name'] || row['Department_Name'] || row['Name'] || `Department ${index + 1}`,
        description: row['Description'] || row['Desc'] || null,
        manager_id: null, // Will be set based on manager name
        budget: row['Budget'] || null,
        location: row['Location'] || null,
        status: row['Status'] || 'Active'
      }

      // Insert department
      const [result] = await sequelize.query(`
        INSERT INTO departments (
          name, description, manager_id, budget, location, status, created_at, updated_at
        ) VALUES (
          :name, :description, :manager_id, :budget, :location, :status, NOW(), NOW()
        )
      `, {
        replacements: departmentData
      })

      successCount++
      console.log(`✅ Inserted department: ${departmentData.name}`)
      
    } catch (error) {
      errorCount++
      console.error(`❌ Error inserting department ${index + 1}:`, error.message)
    }
  }
  
  console.log(`📊 Department processing complete: ${successCount} successful, ${errorCount} errors`)
}

async function processUserRoleData(sequelize, data) {
  console.log('🔐 Processing user role data...')
  
  let successCount = 0
  let errorCount = 0
  
  for (const [index, row] of data.entries()) {
    try {
      const roleData = {
        employee_id: null, // Will be set based on employee lookup
        ms_graph_user_id: row['MS Graph ID'] || row['MS_Graph_ID'] || null,
        email: row['Email'] || row['Email Address'] || null,
        role: row['Role'] || row['User Role'] || row['User_Role'] || 'employee',
        permissions: row['Permissions'] || '[]',
        is_active: row['Is Active'] || row['Is_Active'] || true,
        last_login: null,
        failed_login_attempts: 0,
        two_factor_enabled: row['2FA Enabled'] || row['2FA_Enabled'] || false,
        login_notifications: row['Login Notifications'] || row['Login_Notifications'] || true,
        session_timeout: row['Session Timeout'] || row['Session_Timeout'] || 480
      }

      // Insert user role
      const [result] = await sequelize.query(`
        INSERT INTO user_role_maps (
          employee_id, ms_graph_user_id, email, role, permissions, is_active,
          last_login, failed_login_attempts, two_factor_enabled, login_notifications, session_timeout,
          created_at, updated_at
        ) VALUES (
          :employee_id, :ms_graph_user_id, :email, :role, :permissions, :is_active,
          :last_login, :failed_login_attempts, :two_factor_enabled, :login_notifications, :session_timeout,
          NOW(), NOW()
        )
      `, {
        replacements: roleData
      })

      successCount++
      console.log(`✅ Inserted user role: ${roleData.role}`)
      
    } catch (error) {
      errorCount++
      console.error(`❌ Error inserting user role ${index + 1}:`, error.message)
    }
  }
  
  console.log(`📊 User role processing complete: ${successCount} successful, ${errorCount} errors`)
}

async function processGenericData(sequelize, data, sheetName) {
  console.log(`📋 Processing generic data from ${sheetName}...`)
  
  // Show column names for reference
  if (data.length > 0) {
    console.log('📊 Available columns:', Object.keys(data[0]))
  }
  
  console.log(`⚠️  Generic data processing not implemented for sheet: ${sheetName}`)
}

insertEmployeeData()
