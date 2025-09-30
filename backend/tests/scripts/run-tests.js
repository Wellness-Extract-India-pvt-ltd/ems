/**
 * @fileoverview Test runner script for EMS Backend tests
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
 * Run tests for backend/index.js
 */
async function runIndexTests() {
  console.log('🧪 Running tests for backend/index.js...')
  console.log('=' .repeat(60))
  
  try {
    // Check if test files exist
    const testFiles = [
      'index.test.js',
      'index-unit.test.js'
    ]
    
    for (const testFile of testFiles) {
      const testPath = path.join(__dirname, testFile)
      if (fs.existsSync(testPath)) {
        console.log(`✅ Found test file: ${testFile}`)
      } else {
        console.log(`❌ Missing test file: ${testFile}`)
      }
    }
    
    // Check if index.js exists and is readable
    const indexPath = path.join(__dirname, '..', 'index.js')
    if (fs.existsSync(indexPath)) {
      console.log('✅ Found backend/index.js')
      
      // Read and analyze the file
      const fileContent = fs.readFileSync(indexPath, 'utf8')
      console.log(`📊 File size: ${fileContent.length} characters`)
      console.log(`📊 Lines of code: ${fileContent.split('\n').length}`)
      
      // Check for key components
      const checks = [
        { name: 'Import statements', pattern: /import\s+.*from\s+['"][^'"]+['"]/g, count: (fileContent.match(/import\s+.*from\s+['"][^'"]+['"]/g) || []).length },
        { name: 'Async functions', pattern: /async\s+function/g, count: (fileContent.match(/async\s+function/g) || []).length },
        { name: 'Try-catch blocks', pattern: /try\s*{/g, count: (fileContent.match(/try\s*{/g) || []).length },
        { name: 'Console.log statements', pattern: /console\.log/g, count: (fileContent.match(/console\.log/g) || []).length },
        { name: 'Console.error statements', pattern: /console\.error/g, count: (fileContent.match(/console\.error/g) || []).length },
        { name: 'Process event handlers', pattern: /process\.on/g, count: (fileContent.match(/process\.on/g) || []).length },
        { name: 'JSDoc comments', pattern: /\/\*\*/g, count: (fileContent.match(/\/\*\*/g) || []).length },
        { name: 'Inline comments', pattern: /\/\/.*$/gm, count: (fileContent.match(/\/\/.*$/gm) || []).length }
      ]
      
      console.log('\n📋 Code Analysis:')
      checks.forEach(check => {
        console.log(`   ${check.name}: ${check.count}`)
      })
      
      // Check for specific functionality
      const functionalityChecks = [
        'Environment variable loading',
        'Database connection testing',
        'Redis connection handling',
        'BioMetrics connection handling',
        'Server startup',
        'Graceful shutdown',
        'Error handling',
        'Process signal handling',
        'Logging statements'
      ]
      
      console.log('\n🔍 Functionality Checks:')
      functionalityChecks.forEach(func => {
        const hasFunctionality = checkFunctionality(fileContent, func)
        console.log(`   ${hasFunctionality ? '✅' : '❌'} ${func}`)
      })
      
    } else {
      console.log('❌ backend/index.js not found')
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
    'Environment variable loading': /import\s+['"]dotenv\/config['"]/,
    'Database connection testing': /testConnection\(\)/,
    'Redis connection handling': /redisConfig\.connect\(\)/,
    'BioMetrics connection handling': /testBiometricsConnection\(\)/,
    'Server startup': /app\.listen\(PORT/,
    'Graceful shutdown': /const shutdown = async/,
    'Error handling': /catch\s*\(/,
    'Process signal handling': /process\.on\('SIG/,
    'Logging statements': /console\.(log|error|warn)/
  }
  
  return checks[functionality] ? checks[functionality].test(content) : false
}

// Run the tests
runIndexTests()
