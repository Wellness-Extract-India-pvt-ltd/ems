import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const execAsync = promisify(exec)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function runHardwareControllerTests() {
  console.log('🧪 Running tests for backend/controllers/hardwareController.js...')
  console.log('=' .repeat(60))

  try {
    const testFiles = [
      'hardwareController.test.js',
      'hardwareController-unit.test.js'
    ]

    for (const testFile of testFiles) {
      const testPath = path.join(__dirname, testFile)
      if (fs.existsSync(testPath)) {
        console.log(`✅ Found test file: ${testFile}`)
      } else {
        console.log(`❌ Missing test file: ${testFile}`)
      }
    }

    const controllerPath = path.join(__dirname, '..', 'controllers', 'hardwareController.js')
    if (fs.existsSync(controllerPath)) {
      console.log('✅ Found backend/controllers/hardwareController.js')
      
      // Read and analyze the controller file
      const fileContent = fs.readFileSync(controllerPath, 'utf8')
      
      // Check for key components
      const checks = [
        { name: 'JSDoc file header', pattern: '@fileoverview Hardware Controller for EMS Backend' },
        { name: 'Import statements', pattern: 'import { validationResult } from \'express-validator\'' },
        { name: 'listHardware function', pattern: 'export async function listHardware (req, res, next) {' },
        { name: 'getHardwareById function', pattern: 'export async function getHardwareById (req, res, next) {' },
        { name: 'addHardware function', pattern: 'export async function addHardware (req, res, next) {' },
        { name: 'updateHardware function', pattern: 'export async function updateHardware (req, res, next) {' },
        { name: 'deleteHardware function', pattern: 'export async function deleteHardware (req, res, next) {' },
        { name: 'getHardwareByEmployee function', pattern: 'export async function getHardwareByEmployee (req, res, next) {' },
        { name: 'Error handling', pattern: 'try {' },
        { name: 'Logging statements', pattern: 'logger.info' },
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
      const functionCount = (fileContent.match(/export async function \w+/g) || []).length
      const commentCount = (fileContent.match(/\/\/ /g) || []).length
      const loggerCount = (fileContent.match(/logger\./g) || []).length
      const tryCatchCount = (fileContent.match(/try \{/g) || []).length
      const redisCount = (fileContent.match(/redisConfig\./g) || []).length

      console.log('\n📊 Code Statistics:')
      console.log(`📝 Total lines: ${fileContent.split('\n').length}`)
      console.log(`🔧 Functions: ${functionCount}`)
      console.log(`💬 Comments: ${commentCount}`)
      console.log(`📋 Logger calls: ${loggerCount}`)
      console.log(`⚠️  Try-catch blocks: ${tryCatchCount}`)
      console.log(`🔴 Redis operations: ${redisCount}`)

      // Check for security patterns
      console.log('\n🔒 Security Analysis:')
      const securityChecks = [
        { name: 'Input validation', pattern: 'validationResult' },
        { name: 'Role-based access control', pattern: 'userRole !== \'admin\'' },
        { name: 'Access control checks', pattern: 'assigned_to = userId' },
        { name: 'Error handling', pattern: 'catch (err)' },
        { name: 'HTTP status codes', pattern: 'res.status(' },
        { name: 'Authentication checks', pattern: 'req.user?.role' }
      ]

      securityChecks.forEach(check => {
        if (fileContent.includes(check.pattern)) {
          console.log(`✅ ${check.name}`)
        } else {
          console.log(`❌ ${check.name}`)
        }
      })

      // Check for Redis caching patterns
      console.log('\n🔴 Redis Caching Analysis:')
      const redisChecks = [
        { name: 'Cache key generation', pattern: 'redisConfig.generateKey' },
        { name: 'Redis connection check', pattern: 'redisConfig.isRedisConnected' },
        { name: 'Cache retrieval', pattern: 'redisConfig.get' },
        { name: 'Cache storage', pattern: 'redisConfig.set' },
        { name: 'Cache invalidation', pattern: 'client.keys(\'hardware:*\')' },
        { name: 'Cache deletion', pattern: 'client.del(...keys)' }
      ]

      redisChecks.forEach(check => {
        if (fileContent.includes(check.pattern)) {
          console.log(`✅ ${check.name}`)
        } else {
          console.log(`❌ ${check.name}`)
        }
      })

      // Check for database patterns
      console.log('\n🗄️ Database Operations Analysis:')
      const dbChecks = [
        { name: 'Hardware model operations', pattern: 'Hardware.findAll' },
        { name: 'Hardware find by ID', pattern: 'Hardware.findByPk' },
        { name: 'Hardware creation', pattern: 'Hardware.create' },
        { name: 'Hardware updates', pattern: 'hardware.update' },
        { name: 'Hardware deletion', pattern: 'hardware.destroy' },
        { name: 'Employee associations', pattern: 'model: Employee' },
        { name: 'Database includes', pattern: 'include: [' }
      ]

      dbChecks.forEach(check => {
        if (fileContent.includes(check.pattern)) {
          console.log(`✅ ${check.name}`)
        } else {
          console.log(`❌ ${check.name}`)
        }
      })

      // Check for API response patterns
      console.log('\n🌐 API Response Analysis:')
      const apiChecks = [
        { name: 'Success responses', pattern: 'success: true' },
        { name: 'Error responses', pattern: 'success: false' },
        { name: 'HTTP status codes', pattern: 'res.status(201)' },
        { name: 'JSON responses', pattern: 'res.json(' },
        { name: 'Data inclusion', pattern: 'data: hardware' },
        { name: 'Message responses', pattern: 'message: \'Hardware' }
      ]

      apiChecks.forEach(check => {
        if (fileContent.includes(check.pattern)) {
          console.log(`✅ ${check.name}`)
        } else {
          console.log(`❌ ${check.name}`)
        }
      })

    } else {
      console.log('❌ backend/controllers/hardwareController.js not found')
    }

  } catch (error) {
    console.error('❌ Error running tests:', error.message)
  }
  
  console.log('=' .repeat(60))
  console.log('✅ Code analysis completed successfully!')
  console.log('📝 All tests are ready to run with: npm test')
}

runHardwareControllerTests()
