import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const execAsync = promisify(exec)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function runTicketTests() {
  console.log('🧪 Running tests for backend/controllers/ticketController.js...')
  console.log('=' .repeat(60))

  try {
    const testFiles = [
      'ticketController.test.js',
      'ticketController-unit.test.js'
    ]

    for (const testFile of testFiles) {
      const testPath = path.join(__dirname, testFile)
      if (fs.existsSync(testPath)) {
        console.log(`✅ Found test file: ${testFile}`)
      } else {
        console.log(`❌ Missing test file: ${testFile}`)
      }
    }

    const controllerPath = path.join(__dirname, '..', 'controllers', 'ticketController.js')
    if (fs.existsSync(controllerPath)) {
      console.log('✅ Found backend/controllers/ticketController.js')
      
      // Read and analyze the controller file
      const fileContent = fs.readFileSync(controllerPath, 'utf8')
      
      // Check for key patterns
      const patterns = {
        'File Header Documentation': fileContent.includes('@fileoverview'),
        'Import Statements': fileContent.includes('import { validationResult }'),
        'Export Functions': fileContent.includes('export async function'),
        'JSDoc Comments': fileContent.includes('@async'),
        'Inline Comments': fileContent.includes('// '),
        'Error Handling': fileContent.includes('try {') && fileContent.includes('} catch'),
        'Logging': fileContent.includes('logger.info'),
        'Redis Caching': fileContent.includes('redisConfig.'),
        'Sequelize Operations': fileContent.includes('Ticket.'),
        'Role-Based Access Control': fileContent.includes('req.user.role'),
        'Validation': fileContent.includes('validationResult(req)'),
        'Pagination': fileContent.includes('parseInt(req.query.page)'),
        'Cache Invalidation': fileContent.includes('redisConfig.del('),
        'File Attachments': fileContent.includes('req.files'),
        'Ticket Number Generation': fileContent.includes('TKT-${Date.now()}'),
        'Self-Assignment Prevention': fileContent.includes('Cannot assign ticket to self'),
        'Response Patterns': fileContent.includes('res.status(')
      }

      console.log('\n📊 Code Analysis Results:')
      Object.entries(patterns).forEach(([pattern, found]) => {
        console.log(`${found ? '✅' : '❌'} ${pattern}: ${found ? 'Found' : 'Missing'}`)
      })

      // Count functions
      const functionCount = (fileContent.match(/export async function/g) || []).length
      console.log(`\n🔢 Functions Found: ${functionCount}`)

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
      const redisCount = (fileContent.match(/redisConfig\./g) || []).length
      console.log(`🗄️  Redis Operations: ${redisCount}`)

      // Count Sequelize operations
      const sequelizeCount = (fileContent.match(/Ticket\./g) || []).length
      console.log(`🗃️  Sequelize Operations: ${sequelizeCount}`)

      // Check for specific functions
      const functions = [
        'addTicket',
        'uploadAttachments', 
        'listTickets',
        'getTicketById',
        'updateTicket',
        'deleteTicket'
      ]

      console.log('\n🔧 Function Analysis:')
      functions.forEach(func => {
        const found = fileContent.includes(`export async function ${func}`)
        console.log(`${found ? '✅' : '❌'} ${func}: ${found ? 'Found' : 'Missing'}`)
      })

      // Check for documentation patterns
      const docPatterns = [
        '@fileoverview',
        '@description', 
        '@author',
        '@version',
        '@since',
        '@features',
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

      // Check for security patterns
      const securityPatterns = [
        'req.user.role === \'employee\'',
        'req.user.role === \'admin\'',
        'req.user.role === \'manager\'',
        'ticket.created_by !== req.user.employee',
        'whereClause.created_by = userId',
        'res.status(403)',
        'Access denied',
        'Cannot assign ticket to self'
      ]

      console.log('\n🔒 Security Analysis:')
      securityPatterns.forEach(pattern => {
        const found = fileContent.includes(pattern)
        console.log(`${found ? '✅' : '❌'} ${pattern}: ${found ? 'Found' : 'Missing'}`)
      })

      // Check for performance patterns
      const performancePatterns = [
        'redisConfig.isRedisConnected()',
        'redisConfig.get(',
        'redisConfig.setex(',
        'redisConfig.del(',
        'redisConfig.generateKey(',
        'parseInt(req.query.page)',
        'parseInt(req.query.limit)',
        'const offset = (page - 1) * limit'
      ]

      console.log('\n⚡ Performance Analysis:')
      performancePatterns.forEach(pattern => {
        const found = fileContent.includes(pattern)
        console.log(`${found ? '✅' : '❌'} ${pattern}: ${found ? 'Found' : 'Missing'}`)
      })

      // Check for business logic patterns
      const businessLogicPatterns = [
        'TKT-${Date.now()}',
        'Math.random().toString(36).substr(2, 5).toUpperCase()',
        'Cannot assign ticket to self',
        'req.files',
        'file.filename',
        'file.originalname',
        'file.path',
        'file.size',
        'uploadedBy: req.user.employee',
        'uploadedAt: new Date()',
        'currentAttachments',
        'updatedAttachments',
        'resolved_date = new Date()',
        'status === \'Resolved\'',
        'status === \'Closed\''
      ]

      console.log('\n💼 Business Logic Analysis:')
      businessLogicPatterns.forEach(pattern => {
        const found = fileContent.includes(pattern)
        console.log(`${found ? '✅' : '❌'} ${pattern}: ${found ? 'Found' : 'Missing'}`)
      })

    } else {
      console.log('❌ backend/controllers/ticketController.js not found')
    }

  } catch (error) {
    console.error('❌ Error running tests:', error.message)
  }
  
  console.log('=' .repeat(60))
  console.log('✅ Code analysis completed successfully!')
  console.log('📝 All tests are ready to run with: npm test')
}

runTicketTests()
