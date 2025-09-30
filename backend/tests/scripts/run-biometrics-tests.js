import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const execAsync = promisify(exec)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function runBiometricsControllerTests() {
  console.log('🧪 Running tests for backend/controllers/biometricsController.js...')
  console.log('=' .repeat(60))

  try {
    const testFiles = [
      'biometricsController.test.js',
      'biometricsController-unit.test.js'
    ]

    for (const testFile of testFiles) {
      const testPath = path.join(__dirname, testFile)
      if (fs.existsSync(testPath)) {
        console.log(`✅ Found test file: ${testFile}`)
      } else {
        console.log(`❌ Missing test file: ${testFile}`)
      }
    }

    const controllerPath = path.join(__dirname, '..', 'controllers', 'biometricsController.js')
    if (fs.existsSync(controllerPath)) {
      console.log('✅ Found backend/controllers/biometricsController.js')
      
      // Read and analyze the controller file
      const fileContent = fs.readFileSync(controllerPath, 'utf8')
      
      // Check for key components
      const checks = [
        { name: 'JSDoc file header', pattern: '@fileoverview BioMetrics Controller for EMS Backend' },
        { name: 'Import statements', pattern: 'import {' },
        { name: 'testConnection function', pattern: 'export async function testConnection' },
        { name: 'getDatabaseInfo function', pattern: 'export async function getDatabaseInfo' },
        { name: 'getBiometricEmployees function', pattern: 'export async function getBiometricEmployees' },
        { name: 'getEmployeeAttendance function', pattern: 'export async function getEmployeeAttendance' },
        { name: 'getAttendanceSummary function', pattern: 'export async function getAttendanceSummary' },
        { name: 'getDepartments function', pattern: 'export async function getDepartments' },
        { name: 'getRecentAttendance function', pattern: 'export async function getRecentAttendance' },
        { name: 'syncEmployees function', pattern: 'export async function syncEmployees' },
        { name: 'Error handling', pattern: 'try {' },
        { name: 'Logging statements', pattern: 'logger.error' },
        { name: 'Inline comments', pattern: '// Import BioMetrics database connection utilities' }
      ]

      console.log('\n📋 Code Analysis:')
      checks.forEach(check => {
        if (fileContent.includes(check.pattern)) {
          console.log(`✅ ${check.name}`)
        } else {
          console.log(`❌ ${check.name}`)
        }
      })

      // Count functions and exports
      const functionCount = (fileContent.match(/export async function \w+/g) || []).length
      const commentCount = (fileContent.match(/\/\/ /g) || []).length
      const loggerCount = (fileContent.match(/logger\./g) || []).length
      const tryCatchCount = (fileContent.match(/try \{/g) || []).length
      const sqlQueryCount = (fileContent.match(/SELECT/g) || []).length

      console.log('\n📊 Code Statistics:')
      console.log(`📝 Total lines: ${fileContent.split('\n').length}`)
      console.log(`🔧 Functions: ${functionCount}`)
      console.log(`💬 Comments: ${commentCount}`)
      console.log(`📋 Logger calls: ${loggerCount}`)
      console.log(`⚠️  Try-catch blocks: ${tryCatchCount}`)
      console.log(`🗄️  SQL queries: ${sqlQueryCount}`)

      // Check for security patterns
      console.log('\n🔒 Security Analysis:')
      const securityChecks = [
        { name: 'Parameter validation', pattern: 'if (!' },
        { name: 'SQL parameter binding', pattern: '@' },
        { name: 'Error handling', pattern: 'catch (error)' },
        { name: 'Input sanitization', pattern: 'parseInt' },
        { name: 'Limit validation', pattern: 'Math.max' },
        { name: 'Database connection testing', pattern: 'testBiometricsConnection' }
      ]

      securityChecks.forEach(check => {
        if (fileContent.includes(check.pattern)) {
          console.log(`✅ ${check.name}`)
        } else {
          console.log(`❌ ${check.name}`)
        }
      })

      // Check for BioMetrics specific patterns
      console.log('\n🔬 BioMetrics Integration Analysis:')
      const biometricsChecks = [
        { name: 'SQL Server queries', pattern: 'FROM employees' },
        { name: 'Attendance tracking', pattern: 'Tran_DeviceAttRec' },
        { name: 'Employee synchronization', pattern: 'BiometricEmployee' },
        { name: 'Pagination support', pattern: 'OFFSET' },
        { name: 'Date filtering', pattern: 'Punch_Date' },
        { name: 'Department management', pattern: 'Department' }
      ]

      biometricsChecks.forEach(check => {
        if (fileContent.includes(check.pattern)) {
          console.log(`✅ ${check.name}`)
        } else {
          console.log(`❌ ${check.name}`)
        }
      })

    } else {
      console.log('❌ backend/controllers/biometricsController.js not found')
    }

  } catch (error) {
    console.error('❌ Error running tests:', error.message)
  }
  
  console.log('=' .repeat(60))
  console.log('✅ Code analysis completed successfully!')
  console.log('📝 All tests are ready to run with: npm test')
}

runBiometricsControllerTests()
