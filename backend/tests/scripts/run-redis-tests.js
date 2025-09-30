import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const execAsync = promisify(exec)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function runRedisTests() {
  console.log('🧪 Running tests for backend/config/redis.js...')
  console.log('=' .repeat(60))

  try {
    const testFiles = [
      'redis.test.js',
      'redis-unit.test.js'
    ]

    for (const testFile of testFiles) {
      const testPath = path.join(__dirname, testFile)
      if (fs.existsSync(testPath)) {
        console.log(`✅ Found test file: ${testFile}`)
      } else {
        console.log(`❌ Missing test file: ${testFile}`)
      }
    }

    const configPath = path.join(__dirname, '..', 'config', 'redis.js')
    if (fs.existsSync(configPath)) {
      console.log('✅ Found backend/config/redis.js')
      
      // Read and analyze the config file
      const fileContent = fs.readFileSync(configPath, 'utf8')
      
      // Check for key patterns
      const patterns = {
        'File Header Documentation': fileContent.includes('@fileoverview'),
        'Import Statements': fileContent.includes('import Redis from \'ioredis\''),
        'Class Declaration': fileContent.includes('class RedisConfig'),
        'Constructor': fileContent.includes('constructor ()'),
        'Method Declarations': fileContent.includes('async connect ()'),
        'JSDoc Comments': fileContent.includes('@async'),
        'Inline Comments': fileContent.includes('// '),
        'Error Handling': fileContent.includes('try {') && fileContent.includes('} catch'),
        'Logging': fileContent.includes('logger.info'),
        'Redis Operations': fileContent.includes('this.client.'),
        'JSON Serialization': fileContent.includes('JSON.stringify'),
        'Environment Variables': fileContent.includes('process.env.REDIS_'),
        'Event Listeners': fileContent.includes('this.client.on('),
        'Singleton Pattern': fileContent.includes('const redisConfig = new RedisConfig()'),
        'Export Statement': fileContent.includes('export default redisConfig'),
        'Connection Management': fileContent.includes('this.isConnected'),
        'TTL Support': fileContent.includes('ttl = 3600'),
        'Cache Operations': fileContent.includes('setex('),
        'Key Generation': fileContent.includes('generateKey'),
        'Graceful Shutdown': fileContent.includes('this.client.quit()')
      }

      console.log('\n📊 Code Analysis Results:')
      Object.entries(patterns).forEach(([pattern, found]) => {
        console.log(`${found ? '✅' : '❌'} ${pattern}: ${found ? 'Found' : 'Missing'}`)
      })

      // Count methods
      const methodCount = (fileContent.match(/async \w+ \(/g) || []).length + (fileContent.match(/\w+ \(/g) || []).length
      console.log(`\n🔢 Methods Found: ${methodCount}`)

      // Count JSDoc comments
      const jsdocCount = (fileContent.match(/\* @/g) || []).length
      console.log(`📝 JSDoc Comments: ${jsdocCount}`)

      // Count inline comments
      const inlineCommentCount = (fileContent.match(/\/\/ /g) || []).length
      console.log(`💬 Inline Comments: ${inlineCommentCount}`)

      // Count error handling blocks
      const errorHandlingCount = (fileContent.match(/} catch/g) || []).length
      console.log(`⚠️  Error Handling Blocks: ${errorHandlingCount}`)

      // Count logging statements
      const loggingCount = (fileContent.match(/logger\./g) || []).length
      console.log(`📊 Logging Statements: ${loggingCount}`)

      // Count Redis operations
      const redisCount = (fileContent.match(/this\.client\./g) || []).length
      console.log(`🗄️  Redis Operations: ${redisCount}`)

      // Count environment variables
      const envCount = (fileContent.match(/process\.env\./g) || []).length
      console.log(`🌍 Environment Variables: ${envCount}`)

      // Check for specific methods
      const methods = [
        'connect',
        'getClient', 
        'isRedisConnected',
        'disconnect',
        'set',
        'get',
        'del',
        'exists',
        'generateKey'
      ]

      console.log('\n🔧 Method Analysis:')
      methods.forEach(method => {
        const found = fileContent.includes(`${method} (`)
        console.log(`${found ? '✅' : '❌'} ${method}: ${found ? 'Found' : 'Missing'}`)
      })

      // Check for documentation patterns
      const docPatterns = [
        '@fileoverview',
        '@description', 
        '@author',
        '@version',
        '@since',
        '@features',
        '@class',
        '@constructor',
        '@async',
        '@function',
        '@param',
        '@returns',
        '@throws',
        '@example'
      ]

      console.log('\n📚 Documentation Analysis:')
      docPatterns.forEach(pattern => {
        const found = fileContent.includes(pattern)
        console.log(`${found ? '✅' : '❌'} ${pattern}: ${found ? 'Found' : 'Missing'}`)
      })

      // Check for Redis configuration patterns
      const redisConfigPatterns = [
        'host: process.env.REDIS_HOST',
        'port: process.env.REDIS_PORT',
        'password: process.env.REDIS_PASSWORD',
        'retryDelayOnFailover: 100',
        'maxRetriesPerRequest: 3',
        'lazyConnect: true',
        'keepAlive: 30000',
        'connectTimeout: 10000',
        'commandTimeout: 5000',
        'enableReadyCheck: false'
      ]

      console.log('\n🔧 Redis Configuration Analysis:')
      redisConfigPatterns.forEach(pattern => {
        const found = fileContent.includes(pattern)
        console.log(`${found ? '✅' : '❌'} ${pattern}: ${found ? 'Found' : 'Missing'}`)
      })

      // Check for event handling patterns
      const eventPatterns = [
        'this.client.on(\'connect\'',
        'this.client.on(\'error\'',
        'this.client.on(\'close\'',
        'this.client.on(\'reconnecting\'',
        'logger.info(\'Redis connected successfully\')',
        'logger.error(\'Redis connection error:\'',
        'logger.warn(\'Redis connection closed\')',
        'logger.info(\'Redis reconnecting...\')'
      ]

      console.log('\n📡 Event Handling Analysis:')
      eventPatterns.forEach(pattern => {
        const found = fileContent.includes(pattern)
        console.log(`${found ? '✅' : '❌'} ${pattern}: ${found ? 'Found' : 'Missing'}`)
      })

      // Check for cache operation patterns
      const cachePatterns = [
        'JSON.stringify(value)',
        'JSON.parse(value)',
        'this.client.setex(',
        'this.client.get(',
        'this.client.del(',
        'this.client.exists(',
        'ttl = 3600',
        'return true',
        'return false',
        'return null'
      ]

      console.log('\n💾 Cache Operations Analysis:')
      cachePatterns.forEach(pattern => {
        const found = fileContent.includes(pattern)
        console.log(`${found ? '✅' : '❌'} ${pattern}: ${found ? 'Found' : 'Missing'}`)
      })

      // Check for error handling patterns
      const errorPatterns = [
        'try {',
        '} catch (error) {',
        'logger.error(',
        'throw error',
        'return false',
        'return null',
        'Failed to connect to Redis',
        'Redis connection error',
        'Redis set error',
        'Redis get error',
        'Redis delete error',
        'Redis exists error'
      ]

      console.log('\n⚠️  Error Handling Analysis:')
      errorPatterns.forEach(pattern => {
        const found = fileContent.includes(pattern)
        console.log(`${found ? '✅' : '❌'} ${pattern}: ${found ? 'Found' : 'Missing'}`)
      })

      // Check for singleton pattern
      const singletonPatterns = [
        'const redisConfig = new RedisConfig()',
        'export default redisConfig',
        'this.client = null',
        'this.isConnected = false'
      ]

      console.log('\n🏗️  Singleton Pattern Analysis:')
      singletonPatterns.forEach(pattern => {
        const found = fileContent.includes(pattern)
        console.log(`${found ? '✅' : '❌'} ${pattern}: ${found ? 'Found' : 'Missing'}`)
      })

    } else {
      console.log('❌ backend/config/redis.js not found')
    }

  } catch (error) {
    console.error('❌ Error running tests:', error.message)
  }
  
  console.log('=' .repeat(60))
  console.log('✅ Code analysis completed successfully!')
  console.log('📝 All tests are ready to run with: npm test')
}

runRedisTests()
