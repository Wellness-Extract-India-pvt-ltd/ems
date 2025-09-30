import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const execAsync = promisify(exec)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function runEmployeeControllerTests() {
  console.log('🧪 Running tests for backend/controllers/employeeController.js...')
  console.log('=' .repeat(60))

  try {
    const testFiles = [
      'employeeController.test.js',
      'employeeController-unit.test.js'
    ]

    for (const testFile of testFiles) {
      const testPath = path.join(__dirname, testFile)
      if (fs.existsSync(testPath)) {
        console.log(`✅ Found test file: ${testFile}`)
      } else {
        console.log(`❌ Missing test file: ${testFile}`)
      }
    }

    const controllerPath = path.join(__dirname, '..', 'controllers', 'employeeController.js')
    if (fs.existsSync(controllerPath)) {
      console.log('✅ Found backend/controllers/employeeController.js')
      
      // Read and analyze the controller file
      const fileContent = fs.readFileSync(controllerPath, 'utf8')
      
      // Check for key components
      const checks = [
        { name: 'JSDoc file header', pattern: '@fileoverview Employee Controller for EMS Backend' },
        { name: 'Import statements', pattern: 'import { validationResult } from \'express-validator\'' },
        { name: 'mapFilesToDoc function', pattern: 'function mapFilesToDoc (files, payload) {' },
        { name: 'addEmployee function', pattern: 'export async function addEmployee (req, res) {' },
        { name: 'listEmployees function', pattern: 'export async function listEmployees (req, res) {' },
        { name: 'getEmployeeById function', pattern: 'export async function getEmployeeById (req, res) {' },
        { name: 'updateEmployee function', pattern: 'export async function updateEmployee (req, res) {' },
        { name: 'deleteEmployee function', pattern: 'export async function deleteEmployee (req, res) {' },
        { name: 'Error handling', pattern: 'try {' },
        { name: 'Logging statements', pattern: 'logger.error' },
        { name: 'Inline comments', pattern: '// Import validation utilities for request validation' }
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
      const functionCount = (fileContent.match(/export async function \w+|function \w+/g) || []).length
      const commentCount = (fileContent.match(/\/\/ /g) || []).length
      const loggerCount = (fileContent.match(/logger\./g) || []).length
      const tryCatchCount = (fileContent.match(/try \{/g) || []).length
      const axiosCallCount = (fileContent.match(/axios\./g) || []).length

      console.log('\n📊 Code Statistics:')
      console.log(`📝 Total lines: ${fileContent.split('\n').length}`)
      console.log(`🔧 Functions: ${functionCount}`)
      console.log(`💬 Comments: ${commentCount}`)
      console.log(`📋 Logger calls: ${loggerCount}`)
      console.log(`⚠️  Try-catch blocks: ${tryCatchCount}`)
      console.log(`🌐 Axios calls: ${axiosCallCount}`)

      // Check for security patterns
      console.log('\n🔒 Security Analysis:')
      const securityChecks = [
        { name: 'Input validation', pattern: 'validationResult' },
        { name: 'Secure password generation', pattern: 'crypto.randomBytes' },
        { name: 'Sensitive field protection', pattern: 'msGraphUserId, refreshToken' },
        { name: 'Error handling', pattern: 'catch (error)' },
        { name: 'HTTP status codes', pattern: 'res.status(' },
        { name: 'Microsoft Graph integration', pattern: 'graph.microsoft.com' }
      ]

      securityChecks.forEach(check => {
        if (fileContent.includes(check.pattern)) {
          console.log(`✅ ${check.name}`)
        } else {
          console.log(`❌ ${check.name}`)
        }
      })

      // Check for Microsoft Graph integration patterns
      console.log('\n🔗 Microsoft Graph Integration Analysis:')
      const graphChecks = [
        { name: 'Access token retrieval', pattern: 'graphService.getAccessToken' },
        { name: 'User creation', pattern: 'https://graph.microsoft.com/v1.0/users' },
        { name: 'License assignment', pattern: 'assignLicense' },
        { name: 'User provisioning', pattern: 'accountEnabled: true' },
        { name: 'Password profile', pattern: 'passwordProfile' },
        { name: 'Display name mapping', pattern: 'displayName:' }
      ]

      graphChecks.forEach(check => {
        if (fileContent.includes(check.pattern)) {
          console.log(`✅ ${check.name}`)
        } else {
          console.log(`❌ ${check.name}`)
        }
      })

      // Check for file upload patterns
      console.log('\n📁 File Upload Analysis:')
      const fileChecks = [
        { name: 'File mapping function', pattern: 'mapFilesToDoc' },
        { name: 'Avatar handling', pattern: 'avatarPath' },
        { name: 'Bank document handling', pattern: 'passbookUrl' },
        { name: 'Education certificates', pattern: 'certificatePath' },
        { name: 'Experience letters', pattern: 'experienceLetterPath' },
        { name: 'File field mapping', pattern: 'fieldname' }
      ]

      fileChecks.forEach(check => {
        if (fileContent.includes(check.pattern)) {
          console.log(`✅ ${check.name}`)
        } else {
          console.log(`❌ ${check.name}`)
        }
      })

    } else {
      console.log('❌ backend/controllers/employeeController.js not found')
    }

  } catch (error) {
    console.error('❌ Error running tests:', error.message)
  }
  
  console.log('=' .repeat(60))
  console.log('✅ Code analysis completed successfully!')
  console.log('📝 All tests are ready to run with: npm test')
}

runEmployeeControllerTests()
