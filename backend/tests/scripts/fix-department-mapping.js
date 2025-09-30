/**
 * Fix Department Mapping and Failed Employee Insertion
 * Intelligently maps department names to IDs and resolves data issues
 */

import { Sequelize } from 'sequelize'
import XLSX from 'xlsx'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function fixDepartmentMapping() {
  console.log('🔧 Fixing Department Mapping and Failed Employee Insertion...')
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

    // Read Excel file to get original department names
    const excelPath = path.join(__dirname, '..', 'EMS Emp.Data.xlsx')
    console.log(`📁 Reading Excel file: ${excelPath}`)
    
    const workbook = XLSX.readFile(excelPath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet)
    
    console.log(`📊 Found ${data.length} rows in Excel file`)

    // Get all departments from database
    const [departments] = await sequelize.query('SELECT id, name FROM departments ORDER BY id')
    console.log(`🏢 Found ${departments.length} departments in database`)

    // Create intelligent department mapping
    const departmentMapping = {}
    
    // First, try exact matches
    for (const dept of departments) {
      const exactMatch = data.find(row => 
        row['Department'] && row['Department'].trim().toLowerCase() === dept.name.toLowerCase()
      )
      if (exactMatch) {
        departmentMapping[exactMatch['Department'].trim()] = dept.id
        console.log(`✅ Exact match: "${exactMatch['Department']}" -> Department ID ${dept.id}`)
      }
    }

    // Then, try fuzzy matches for unmatched departments
    const unmatchedDepts = data.filter(row => 
      row['Department'] && !departmentMapping[row['Department'].trim()]
    )

    console.log(`\n🔍 Processing ${unmatchedDepts.length} unmatched departments...`)

    for (const row of unmatchedDepts) {
      const deptName = row['Department'].trim()
      let bestMatch = null
      let bestScore = 0

      // Find best matching department
      for (const dept of departments) {
        const score = calculateSimilarity(deptName.toLowerCase(), dept.name.toLowerCase())
        if (score > bestScore && score > 0.6) { // 60% similarity threshold
          bestMatch = dept
          bestScore = score
        }
      }

      if (bestMatch) {
        departmentMapping[deptName] = bestMatch.id
        console.log(`🎯 Fuzzy match: "${deptName}" -> "${bestMatch.name}" (ID: ${bestMatch.id}, Score: ${(bestScore * 100).toFixed(1)}%)`)
      } else {
        // Create new department if no match found
        const [newDept] = await sequelize.query(`
          INSERT INTO departments (name, description, status, created_at, updated_at)
          VALUES (?, ?, 'Active', NOW(), NOW())
        `, {
          replacements: [deptName, `Department for ${deptName}`]
        })
        
        const [newDeptData] = await sequelize.query(`
          SELECT id FROM departments WHERE name = ? ORDER BY id DESC LIMIT 1
        `, {
          replacements: [deptName]
        })
        
        departmentMapping[deptName] = newDeptData[0].id
        console.log(`🆕 Created new department: "${deptName}" (ID: ${newDeptData[0].id})`)
      }
    }

    console.log(`\n📋 Final department mapping:`)
    Object.entries(departmentMapping).forEach(([name, id]) => {
      console.log(`  - "${name}" -> ID ${id}`)
    })

    // Update employee department assignments
    console.log(`\n👥 Updating employee department assignments...`)
    
    let updatedCount = 0
    for (const row of data) {
      if (row['Employee ID'] && row['Department']) {
        const deptName = row['Department'].trim()
        const deptId = departmentMapping[deptName]
        
        if (deptId) {
          const [result] = await sequelize.query(`
            UPDATE employees 
            SET department_id = ?, updated_at = NOW()
            WHERE employee_id = ?
          `, {
            replacements: [deptId, row['Employee ID']]
          })
          
          if (result.affectedRows > 0) {
            updatedCount++
            console.log(`✅ Updated ${row['Employee ID']} -> Department ID ${deptId} (${deptName})`)
          }
        }
      }
    }

    console.log(`\n📊 Updated ${updatedCount} employee department assignments`)

    // Check for failed employee insertions
    console.log(`\n🔍 Checking for failed employee insertions...`)
    
    const [failedEmployees] = await sequelize.query(`
      SELECT e.employee_id, e.first_name, e.last_name, e.email, e.status
      FROM employees e
      WHERE e.employee_id NOT IN (
        SELECT DISTINCT employee_id FROM employees WHERE employee_id IS NOT NULL
      )
    `)

    // Find employees in Excel that are not in database
    const excelEmployeeIds = data.map(row => row['Employee ID']).filter(id => id)
    const [dbEmployeeIds] = await sequelize.query(`
      SELECT employee_id FROM employees WHERE employee_id IS NOT NULL
    `)
    const dbEmployeeIdSet = new Set(dbEmployeeIds.map(row => row.employee_id))
    
    const missingEmployees = excelEmployeeIds.filter(id => !dbEmployeeIdSet.has(id))
    
    if (missingEmployees.length > 0) {
      console.log(`❌ Found ${missingEmployees.length} missing employees: ${missingEmployees.join(', ')}`)
      
      // Try to insert missing employees
      for (const missingId of missingEmployees) {
        const employeeData = data.find(row => row['Employee ID'] === missingId)
        if (employeeData) {
          try {
            console.log(`🔄 Attempting to insert missing employee: ${missingId}`)
            
            // Clean and validate data
            const cleanData = {
              employee_id: employeeData['Employee ID']?.trim(),
              first_name: employeeData['First Name']?.trim() || 'Unknown',
              last_name: employeeData['Last Name']?.trim() || 'Unknown',
              email: employeeData['Email address']?.trim() || null,
              contact_email: employeeData['Email address']?.trim() || null,
              department_id: departmentMapping[employeeData['Department']?.trim()] || null,
              status: 'Active',
              employment_type: 'Full-time',
              join_date: new Date().toISOString().split('T')[0]
            }

            // Validate required fields
            if (!cleanData.employee_id || !cleanData.first_name || !cleanData.last_name) {
              console.log(`❌ Skipping ${missingId}: Missing required fields`)
              continue
            }

            // Insert employee
            const [insertResult] = await sequelize.query(`
              INSERT INTO employees (
                employee_id, first_name, last_name, email, contact_email,
                department_id, status, employment_type, join_date,
                created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            `, {
              replacements: [
                cleanData.employee_id,
                cleanData.first_name,
                cleanData.last_name,
                cleanData.email,
                cleanData.contact_email,
                cleanData.department_id,
                cleanData.status,
                cleanData.employment_type,
                cleanData.join_date
              ]
            })

            if (insertResult.affectedRows > 0) {
              console.log(`✅ Successfully inserted missing employee: ${missingId}`)
              
              // Create user role for the employee
              const [employee] = await sequelize.query(`
                SELECT id FROM employees WHERE employee_id = ? LIMIT 1
              `, {
                replacements: [cleanData.employee_id]
              })

              if (employee.length > 0) {
                const role = cleanData.employee_id.includes('WE_IN017') ? 'admin' : 'employee'
                await sequelize.query(`
                  INSERT INTO user_role_maps (employee_id, role, created_at, updated_at)
                  VALUES (?, ?, NOW(), NOW())
                `, {
                  replacements: [employee[0].id, role]
                })
                console.log(`✅ Created user role: ${role} for ${missingId}`)
              }
            }
          } catch (error) {
            console.log(`❌ Failed to insert ${missingId}: ${error.message}`)
          }
        }
      }
    } else {
      console.log(`✅ No missing employees found`)
    }

    // Final verification
    console.log(`\n🔍 Final verification...`)
    
    const [finalStats] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_employees,
        COUNT(CASE WHEN department_id IS NOT NULL THEN 1 END) as with_department,
        COUNT(CASE WHEN department_id IS NULL THEN 1 END) as without_department
      FROM employees
    `)
    
    console.log(`📊 Final Statistics:`)
    console.log(`  - Total employees: ${finalStats[0].total_employees}`)
    console.log(`  - With department: ${finalStats[0].with_department}`)
    console.log(`  - Without department: ${finalStats[0].without_department}`)

    // Show department distribution
    const [deptDistribution] = await sequelize.query(`
      SELECT d.name, COUNT(e.id) as employee_count
      FROM departments d
      LEFT JOIN employees e ON d.id = e.department_id
      GROUP BY d.id, d.name
      HAVING employee_count > 0
      ORDER BY employee_count DESC
    `)
    
    console.log(`\n📋 Department Distribution:`)
    deptDistribution.forEach(dept => {
      console.log(`  - ${dept.name}: ${dept.employee_count} employees`)
    })

    console.log(`\n✅ Department mapping and employee insertion fixes completed!`)
    
  } catch (error) {
    console.error('❌ Error during fix process:')
    console.error('  Message:', error.message)
    console.error('  Code:', error.code)
    if (error.stack) {
      console.error('  Stack:', error.stack)
    }
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
  console.log('✅ Department mapping and employee insertion fixes completed!')
}

/**
 * Calculate similarity between two strings using Levenshtein distance
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} Similarity score between 0 and 1
 */
function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1
  
  if (longer.length === 0) return 1.0
  
  const distance = levenshteinDistance(longer, shorter)
  return (longer.length - distance) / longer.length
}

/**
 * Calculate Levenshtein distance between two strings
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} Levenshtein distance
 */
function levenshteinDistance(str1, str2) {
  const matrix = []
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }
  
  return matrix[str2.length][str1.length]
}

fixDepartmentMapping()
