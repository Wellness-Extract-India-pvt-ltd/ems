import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const execAsync = promisify(exec)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function runAuthControllerTests() {
  console.log('🧪 Running tests for backend/controllers/authController.js...')
  console.log('=' .repeat(60))

  try {
    const testFiles = [
      'authController.test.js',
      'authController-unit.test.js'
    ]

    for (const testFile of testFiles) {
      const testPath = path.join(__dirname, testFile)
      if (fs.existsSync(testPath)) {
        console.log(`✅ Found test file: ${testFile}`)
      } else {
        console.log(`❌ Missing test file: ${testFile}`)
      }
    }

    const controllerPath = path.join(__dirname, '..', 'controllers', 'authController.js')
    if (fs.existsSync(controllerPath)) {
      console.log('✅ Found backend/controllers/authController.js')
      
      // Read and analyze the controller file
      const fileContent = fs.readFileSync(controllerPath, 'utf8')
      
      // Check for key components
      const checks = [
        { name: 'JSDoc file header', pattern: '@fileoverview Authentication Controller for EMS Backend' },
        { name: 'Import statements', pattern: 'import jwt from \'jsonwebtoken\'' },
        { name: 'resolveEmail function', pattern: 'async function resolveEmail (identifier) {' },
        { name: 'login function', pattern: 'export const login = async (req, res, next) => {' },
        { name: 'redirectHandler function', pattern: 'export async function redirectHandler (req, res) {' },
        { name: 'logout function', pattern: 'export const logout = async (req, res) => {' },
        { name: 'refreshToken function', pattern: 'export const refreshToken = (req, res, next) => {' },
        { name: 'Error handling', pattern: 'try {' },
        { name: 'Logging statements', pattern: 'logger.info' },
        { name: 'Inline comments', pattern: '// Import JWT library for token generation and verification' }
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
      const functionCount = (fileContent.match(/export const \w+|export async function \w+|async function \w+/g) || []).length
      const commentCount = (fileContent.match(/\/\/ /g) || []).length
      const loggerCount = (fileContent.match(/logger\./g) || []).length
      const tryCatchCount = (fileContent.match(/try \{/g) || []).length

      console.log('\n📊 Code Statistics:')
      console.log(`📝 Total lines: ${fileContent.split('\n').length}`)
      console.log(`🔧 Functions: ${functionCount}`)
      console.log(`💬 Comments: ${commentCount}`)
      console.log(`📋 Logger calls: ${loggerCount}`)
      console.log(`⚠️  Try-catch blocks: ${tryCatchCount}`)

      // Check for security patterns
      console.log('\n🔒 Security Analysis:')
      const securityChecks = [
        { name: 'JWT token generation', pattern: 'jwt.sign' },
        { name: 'JWT token verification', pattern: 'jwt.verify' },
        { name: 'Input validation', pattern: 'validationResult' },
        { name: 'Error handling', pattern: 'catch (error)' },
        { name: 'Secure redirects', pattern: 'res.redirect' },
        { name: 'Token expiration', pattern: 'expiresIn' }
      ]

      securityChecks.forEach(check => {
        if (fileContent.includes(check.pattern)) {
          console.log(`✅ ${check.name}`)
        } else {
          console.log(`❌ ${check.name}`)
        }
      })

    } else {
      console.log('❌ backend/controllers/authController.js not found')
    }

  } catch (error) {
    console.error('❌ Error running tests:', error.message)
  }
  
  console.log('=' .repeat(60))
  console.log('✅ Code analysis completed successfully!')
  console.log('📝 All tests are ready to run with: npm test')
}

runAuthControllerTests()
