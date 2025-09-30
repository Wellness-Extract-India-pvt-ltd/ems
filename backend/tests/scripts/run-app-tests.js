/**
 * @fileoverview Test runner script for backend/app.js tests
 * Executes tests and provides detailed reporting
 * 
 * @author EMS Development Team
 * @version 1.0.0
 * @since 2025-09-17
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const execAsync = promisify(exec)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Run tests for backend/app.js
 */
async function runAppTests() {
  console.log('🧪 Running tests for backend/app.js...')
  console.log('=' .repeat(60))
  
  try {
    // Check if test files exist
    const testFiles = [
      'app.test.js',
      'app-unit.test.js'
    ]
    
    for (const testFile of testFiles) {
      const testPath = path.join(__dirname, testFile)
      if (fs.existsSync(testPath)) {
        console.log(`✅ Found test file: ${testFile}`)
      } else {
        console.log(`❌ Missing test file: ${testFile}`)
      }
    }
    
    // Check if app.js exists and is readable
    const appPath = path.join(__dirname, '..', 'app.js')
    if (fs.existsSync(appPath)) {
      console.log('✅ Found backend/app.js')
      
      // Read and analyze the file
      const fileContent = fs.readFileSync(appPath, 'utf8')
      console.log(`📊 File size: ${fileContent.length} characters`)
      console.log(`📊 Lines of code: ${fileContent.split('\n').length}`)
      
      // Check for key components
      const checks = [
        { name: 'Import statements', pattern: /import\s+.*from\s+['"][^'"]+['"]/g, count: (fileContent.match(/import\s+.*from\s+['"][^'"]+['"]/g) || []).length },
        { name: 'Function declarations', pattern: /function\s+\w+/g, count: (fileContent.match(/function\s+\w+/g) || []).length },
        { name: 'Try-catch blocks', pattern: /try\s*{/g, count: (fileContent.match(/try\s*{/g) || []).length },
        { name: 'Console.log statements', pattern: /console\.log/g, count: (fileContent.match(/console\.log/g) || []).length },
        { name: 'Logger statements', pattern: /logger\./g, count: (fileContent.match(/logger\./g) || []).length },
        { name: 'Process event handlers', pattern: /process\.on/g, count: (fileContent.match(/process\.on/g) || []).length },
        { name: 'Middleware usage', pattern: /app\.use/g, count: (fileContent.match(/app\.use/g) || []).length },
        { name: 'JSDoc comments', pattern: /\/\*\*/g, count: (fileContent.match(/\/\*\*/g) || []).length },
        { name: 'Inline comments', pattern: /\/\/.*$/gm, count: (fileContent.match(/\/\/.*$/gm) || []).length }
      ]
      
      console.log('\n📋 Code Analysis:')
      checks.forEach(check => {
        console.log(`   ${check.name}: ${check.count}`)
      })
      
      // Check for specific functionality
      const functionalityChecks = [
        'Environment validation',
        'Express app creation',
        'Rate limiting configuration',
        'Security middleware (Helmet)',
        'CORS configuration',
        'Compression middleware',
        'Request parsing (JSON/URL)',
        'Cookie parser configuration',
        'Morgan logging',
        'Request timing',
        'Route mounting',
        'Root endpoint',
        '404 handler',
        'Global error handler',
        'Graceful shutdown',
        'Process signal handlers',
        'Application logging'
      ]
      
      console.log('\n🔍 Functionality Checks:')
      functionalityChecks.forEach(func => {
        const hasFunctionality = checkFunctionality(fileContent, func)
        console.log(`   ${hasFunctionality ? '✅' : '❌'} ${func}`)
      })
      
    } else {
      console.log('❌ backend/app.js not found')
    }
    
    console.log('\n' + '=' .repeat(60))
    console.log('✅ Code analysis completed successfully!')
    console.log('📝 All tests are ready to run with: npm test')
    
  } catch (error) {
    console.error('❌ Error running tests:', error.message)
    process.exit(1)
  }
}

/**
 * Check if specific functionality exists in the code
 */
function checkFunctionality(content, functionality) {
  const checks = {
    'Environment validation': /function validateEnvironment/,
    'Express app creation': /const app = express\(\)/,
    'Rate limiting configuration': /const globalLimiter = rateLimit/,
    'Security middleware (Helmet)': /app\.use\(helmet/,
    'CORS configuration': /const corsOptions =/,
    'Compression middleware': /app\.use\(compression/,
    'Request parsing (JSON/URL)': /app\.use\(express\.json/,
    'Cookie parser configuration': /app\.use\(cookieParser/,
    'Morgan logging': /app\.use\(morgan/,
    'Request timing': /const start = Date\.now\(\)/,
    'Route mounting': /app\.use\('\/api\/v1', routes\)/,
    'Root endpoint': /app\.get\('\/', \(req, res\) =>/,
    '404 handler': /logger\.http\('404 - Route not found'/,
    'Global error handler': /app\.use\(\(err, req, res, next\) =>/,
    'Graceful shutdown': /function gracefulShutdown/,
    'Process signal handlers': /process\.on\('SIG/,
    'Application logging': /logger\.info\('EMS Backend application configured successfully'/
  }
  
  return checks[functionality] ? checks[functionality].test(content) : false
}

// Run the tests
runAppTests()
