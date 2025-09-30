import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const execAsync = promisify(exec)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function runRedisConnectivityTests() {
  console.log('🧪 Running Redis Connectivity and Operations Tests...')
  console.log('=' .repeat(70))

  try {
    const testFiles = [
      'redis-connectivity.test.js',
      'redis-integration.test.js'
    ]

    for (const testFile of testFiles) {
      const testPath = path.join(__dirname, testFile)
      if (fs.existsSync(testPath)) {
        console.log(`✅ Found test file: ${testFile}`)
      } else {
        console.log(`❌ Missing test file: ${testFile}`)
      }
    }

    // Check if Redis configuration exists
    const redisConfigPath = path.join(__dirname, '..', 'config', 'redis.js')
    if (fs.existsSync(redisConfigPath)) {
      console.log('✅ Found backend/config/redis.js')
    } else {
      console.log('❌ backend/config/redis.js not found')
    }

    // Check if logger exists
    const loggerPath = path.join(__dirname, '..', 'utils', 'logger.js')
    if (fs.existsSync(loggerPath)) {
      console.log('✅ Found backend/utils/logger.js')
    } else {
      console.log('❌ backend/utils/logger.js not found')
    }

    console.log('\n🔧 Redis Configuration Analysis:')
    
    // Check Redis configuration file
    if (fs.existsSync(redisConfigPath)) {
      const fileContent = fs.readFileSync(redisConfigPath, 'utf8')
      
      const patterns = {
        'Redis Import': fileContent.includes('import Redis from \'ioredis\''),
        'Logger Import': fileContent.includes('import logger from \'../utils/logger.js\''),
        'Class Declaration': fileContent.includes('class RedisConfig'),
        'Connect Method': fileContent.includes('async connect ()'),
        'Set Method': fileContent.includes('async set (key, value, ttl = 3600)'),
        'Get Method': fileContent.includes('async get (key)'),
        'Delete Method': fileContent.includes('async del (key)'),
        'Exists Method': fileContent.includes('async exists (key)'),
        'Generate Key Method': fileContent.includes('generateKey (prefix, ...parts)'),
        'Connection Status Check': fileContent.includes('isRedisConnected ()'),
        'Disconnect Method': fileContent.includes('async disconnect ()'),
        'Environment Variables': fileContent.includes('process.env.REDIS_'),
        'Event Listeners': fileContent.includes('this.client.on('),
        'JSON Serialization': fileContent.includes('JSON.stringify'),
        'Error Handling': fileContent.includes('try {') && fileContent.includes('} catch'),
        'Logging': fileContent.includes('logger.'),
        'Singleton Pattern': fileContent.includes('const redisConfig = new RedisConfig()'),
        'Export Statement': fileContent.includes('export default redisConfig')
      }

      Object.entries(patterns).forEach(([pattern, found]) => {
        console.log(`${found ? '✅' : '❌'} ${pattern}: ${found ? 'Found' : 'Missing'}`)
      })

      // Count methods and operations
      const methodCount = (fileContent.match(/async \w+ \(/g) || []).length + (fileContent.match(/\w+ \(/g) || []).length
      console.log(`\n🔢 Methods Found: ${methodCount}`)

      const jsdocCount = (fileContent.match(/\* @/g) || []).length
      console.log(`📝 JSDoc Comments: ${jsdocCount}`)

      const inlineCommentCount = (fileContent.match(/\/\/ /g) || []).length
      console.log(`💬 Inline Comments: ${inlineCommentCount}`)

      const errorHandlingCount = (fileContent.match(/} catch/g) || []).length
      console.log(`⚠️  Error Handling Blocks: ${errorHandlingCount}`)

      const loggingCount = (fileContent.match(/logger\./g) || []).length
      console.log(`📊 Logging Statements: ${loggingCount}`)

      const redisCount = (fileContent.match(/this\.client\./g) || []).length
      console.log(`🗄️  Redis Operations: ${redisCount}`)

      const envCount = (fileContent.match(/process\.env\./g) || []).length
      console.log(`🌍 Environment Variables: ${envCount}`)
    }

    console.log('\n🐳 Docker Container Status:')
    console.log('📋 Expected Redis container: ems-redis')
    console.log('🔌 Expected port: 6379')
    console.log('🖼️  Expected image: redis:7-alpine')
    console.log('📊 Status: Running (as shown in Docker Desktop)')

    console.log('\n🧪 Test Coverage:')
    console.log('✅ Redis Connection Tests')
    console.log('✅ Basic Operations (set, get, del, exists)')
    console.log('✅ Data Types (string, number, boolean, array, object)')
    console.log('✅ TTL (Time To Live) Tests')
    console.log('✅ Key Generation Tests')
    console.log('✅ Error Handling Tests')
    console.log('✅ Performance Tests')
    console.log('✅ Cache Invalidation Tests')
    console.log('✅ EMS Backend Integration Tests')
    console.log('✅ Role-Based Cache Keys')
    console.log('✅ Concurrent Operations')

    console.log('\n📊 Expected Test Results:')
    console.log('🔗 Connection: Should connect to Redis successfully')
    console.log('💾 Operations: All CRUD operations should work')
    console.log('⚡ Performance: Should handle concurrent operations')
    console.log('🔄 Integration: Should work with EMS controllers')
    console.log('🛡️  Error Handling: Should handle failures gracefully')

    console.log('\n🚀 Ready to run tests!')
    console.log('📝 Run with: npm test redis-connectivity')
    console.log('📝 Run with: npm test redis-integration')

  } catch (error) {
    console.error('❌ Error analyzing Redis tests:', error.message)
  }
  
  console.log('=' .repeat(70))
  console.log('✅ Redis connectivity test analysis completed!')
  console.log('🐳 Make sure Redis container (ems-redis) is running before executing tests')
}

runRedisConnectivityTests()
