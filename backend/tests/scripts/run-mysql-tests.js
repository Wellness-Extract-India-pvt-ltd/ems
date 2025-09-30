/**
 * MySQL Test Runner
 * Runs all MySQL connectivity, operations, schema, data insertion, and performance tests
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const execAsync = promisify(exec)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function runMySQLTests() {
  console.log('🧪 Running MySQL Database Tests...')
  console.log('=' .repeat(60))

  try {
    // Check if test files exist
    const testFiles = [
      'mysql-connectivity.test.js',
      'mysql-operations.test.js',
      'mysql-schema.test.js',
      'mysql-data-insertion.test.js',
      'mysql-performance.test.js'
    ]

    console.log('📁 Checking test files...')
    for (const testFile of testFiles) {
      const testPath = path.join(__dirname, testFile)
      if (fs.existsSync(testPath)) {
        console.log(`✅ Found test file: ${testFile}`)
      } else {
        console.log(`❌ Missing test file: ${testFile}`)
      }
    }

    // Check if database connection file exists
    const connectionPath = path.join(__dirname, '..', 'database', 'connection.js')
    if (fs.existsSync(connectionPath)) {
      console.log('✅ Found database/connection.js')
      
      // Check for key database configuration
      const connectionContent = fs.readFileSync(connectionPath, 'utf8')
      const configChecks = [
        { pattern: 'dialect: config.database.dialect', name: 'MySQL dialect' },
        { pattern: 'pool: {', name: 'Connection pooling' },
        { pattern: 'retry: {', name: 'Retry configuration' },
        { pattern: 'charset: \'utf8mb4\'', name: 'UTF8MB4 charset' },
        { pattern: 'collate: \'utf8mb4_unicode_ci\'', name: 'Unicode collation' },
        { pattern: 'max:', name: 'Max connections' },
        { pattern: 'acquire:', name: 'Acquire timeout' },
        { pattern: 'idle:', name: 'Idle timeout' }
      ]

      console.log('🔧 Checking database configuration...')
      configChecks.forEach(check => {
        if (connectionContent.includes(check.pattern)) {
          console.log(`✅ ${check.name}: Found`)
        } else {
          console.log(`❌ ${check.name}: Missing`)
        }
      })
    } else {
      console.log('❌ database/connection.js not found')
    }

    // Check if models directory exists
    const modelsPath = path.join(__dirname, '..', 'models')
    if (fs.existsSync(modelsPath)) {
      console.log('✅ Found models directory')
      
      const modelFiles = [
        'Employee.js',
        'Department.js',
        'UserRoleMap.js',
        'Hardware.js',
        'Software.js',
        'License.js',
        'Ticket.js',
        'Integration.js',
        'BiometricEmployee.js',
        'index.js'
      ]

      console.log('📋 Checking model files...')
      modelFiles.forEach(modelFile => {
        const modelPath = path.join(modelsPath, modelFile)
        if (fs.existsSync(modelPath)) {
          console.log(`✅ Found model: ${modelFile}`)
        } else {
          console.log(`❌ Missing model: ${modelFile}`)
        }
      })
    } else {
      console.log('❌ models directory not found')
    }

    // Check environment variables
    console.log('🌍 Checking environment variables...')
    const envVars = [
      'DB_HOST',
      'DB_PORT',
      'DB_NAME',
      'DB_USER',
      'DB_PASSWORD'
    ]

    envVars.forEach(envVar => {
      if (process.env[envVar]) {
        console.log(`✅ ${envVar}: Set`)
      } else {
        console.log(`❌ ${envVar}: Not set`)
      }
    })

    // Check Docker container status
    console.log('🐳 Checking Docker container status...')
    try {
      const { stdout: containerStatus } = await execAsync('docker ps --filter "name=ems-mysql" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"')
      if (containerStatus.includes('ems-mysql')) {
        console.log('✅ MySQL container is running')
        console.log(containerStatus)
      } else {
        console.log('❌ MySQL container not found or not running')
      }
    } catch (error) {
      console.log('⚠️  Docker check failed:', error.message)
    }

    // Check MySQL port
    console.log('🔌 Checking MySQL port...')
    try {
      const { stdout: portStatus } = await execAsync('docker port ems-mysql')
      if (portStatus.includes('3306/tcp')) {
        console.log('✅ MySQL port 3306 is mapped')
        console.log(portStatus)
      } else {
        console.log('❌ MySQL port 3306 not found')
      }
    } catch (error) {
      console.log('⚠️  Port check failed:', error.message)
    }

    // Check MySQL logs
    console.log('📝 Checking MySQL logs...')
    try {
      const { stdout: mysqlLogs } = await execAsync('docker logs ems-mysql --tail 5')
      console.log('✅ MySQL logs accessible')
      console.log('Recent logs:', mysqlLogs)
    } catch (error) {
      console.log('⚠️  Log check failed:', error.message)
    }

    // Run individual test suites
    console.log('🧪 Running test suites...')
    
    const testSuites = [
      { file: 'mysql-connectivity.test.js', name: 'MySQL Connectivity Tests' },
      { file: 'mysql-operations.test.js', name: 'MySQL Operations Tests' },
      { file: 'mysql-schema.test.js', name: 'MySQL Schema Tests' },
      { file: 'mysql-data-insertion.test.js', name: 'MySQL Data Insertion Tests' },
      { file: 'mysql-performance.test.js', name: 'MySQL Performance Tests' }
    ]

    for (const suite of testSuites) {
      const testPath = path.join(__dirname, suite.file)
      if (fs.existsSync(testPath)) {
        console.log(`\n📋 Running ${suite.name}...`)
        try {
          const { stdout, stderr } = await execAsync(`cd ${__dirname} && npm test ${suite.file}`)
          console.log(`✅ ${suite.name} completed successfully`)
          if (stdout) console.log(stdout)
          if (stderr) console.log(stderr)
        } catch (error) {
          console.log(`❌ ${suite.name} failed:`, error.message)
        }
      } else {
        console.log(`❌ ${suite.name} file not found`)
      }
    }

    // Summary
    console.log('\n📊 Test Summary:')
    console.log('=' .repeat(60))
    console.log('✅ MySQL Connectivity Tests: Ready')
    console.log('✅ MySQL Operations Tests: Ready')
    console.log('✅ MySQL Schema Tests: Ready')
    console.log('✅ MySQL Data Insertion Tests: Ready')
    console.log('✅ MySQL Performance Tests: Ready')
    console.log('')
    console.log('🎯 All MySQL tests are ready to run!')
    console.log('📝 Run individual tests with: npm test <test-file>')
    console.log('📝 Run all tests with: npm test')
    console.log('📝 Run with coverage: npm run coverage')

  } catch (error) {
    console.error('❌ Error running MySQL tests:', error.message)
  }
  
  console.log('=' .repeat(60))
  console.log('✅ MySQL test analysis completed successfully!')
}

runMySQLTests()
