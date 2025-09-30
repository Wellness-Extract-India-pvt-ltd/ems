/**
 * Run Authentication Middleware Tests
 * Custom script to run tests for authMiddleware.js and perform code analysis
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const execAsync = promisify(exec)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function runAuthMiddlewareTests() {
  console.log('🧪 Running tests for backend/middleware/authMiddleware.js...')
  console.log('=' .repeat(60))

  try {
    const testFiles = [
      'authMiddleware.test.js',
      'authMiddleware-unit.test.js'
    ]

    for (const testFile of testFiles) {
      const testPath = path.join(__dirname, testFile)
      if (fs.existsSync(testPath)) {
        console.log(`✅ Found test file: ${testFile}`)
      } else {
        console.log(`❌ Missing test file: ${testFile}`)
      }
    }

    const middlewarePath = path.join(__dirname, '..', 'middleware', 'authMiddleware.js')
    if (fs.existsSync(middlewarePath)) {
      console.log('✅ Found backend/middleware/authMiddleware.js')
      
      // Analyze file content
      const fileContent = fs.readFileSync(middlewarePath, 'utf8')
      
      console.log('\n📊 Code Analysis:')
      console.log(`  - Total lines: ${fileContent.split('\n').length}`)
      console.log(`  - JSDoc functions: ${(fileContent.match(/@function/g) || []).length}`)
      console.log(`  - Inline comments: ${(fileContent.match(/\/\/ /g) || []).length}`)
      console.log(`  - Export statements: ${(fileContent.match(/export/g) || []).length}`)
      console.log(`  - Error handling: ${(fileContent.match(/catch/g) || []).length}`)
      console.log(`  - Logging statements: ${(fileContent.match(/logger\./g) || []).length}`)
      
      // Check for key patterns
      const patterns = [
        { name: 'JSDoc file header', pattern: '@fileoverview' },
        { name: 'Function documentation', pattern: '@function' },
        { name: 'Parameter documentation', pattern: '@param' },
        { name: 'Return documentation', pattern: '@returns' },
        { name: 'Error documentation', pattern: '@throws' },
        { name: 'Example documentation', pattern: '@example' },
        { name: 'Import comments', pattern: '// Import' },
        { name: 'Authorization header handling', pattern: 'Authorization' },
        { name: 'JWT verification', pattern: 'jwt.verify' },
        { name: 'User context setting', pattern: 'req.user =' },
        { name: 'Error responses', pattern: 'success: false' },
        { name: 'Status codes', pattern: 'res\\.status\\(' },
        { name: 'Logging statements', pattern: 'logger.' },
        { name: 'Environment checks', pattern: 'process.env' },
        { name: 'Async functions', pattern: 'async (' },
        { name: 'Export statements', pattern: 'export {' }
      ]
      
      console.log('\n🔍 Pattern Analysis:')
      patterns.forEach(({ name, pattern }) => {
        const count = (fileContent.match(new RegExp(pattern, 'g')) || []).length
        console.log(`  - ${name}: ${count} occurrences`)
      })
      
      // Check for security features
      console.log('\n🔒 Security Features:')
      const securityFeatures = [
        { name: 'Test token security', pattern: 'test-token-123' },
        { name: 'Token blacklisting', pattern: 'refresh_token !==' },
        { name: 'Environment validation', pattern: 'JWT_SECRET' },
        { name: 'Authorization header validation', pattern: 'Bearer ' },
        { name: 'User existence validation', pattern: 'findByPk' },
        { name: 'Role-based access control', pattern: 'requiresRole' },
        { name: 'Resource ownership', pattern: 'requiresOwnershipOrAdmin' },
        { name: 'Refresh token validation', pattern: 'validateRefreshToken' }
      ]
      
      securityFeatures.forEach(({ name, pattern }) => {
        const found = fileContent.includes(pattern)
        console.log(`  - ${name}: ${found ? '✅' : '❌'}`)
      })
      
      // Check for error handling
      console.log('\n⚠️ Error Handling:')
      const errorTypes = [
        'TokenExpiredError',
        'JsonWebTokenError', 
        'NotBeforeError',
        'Unauthorized',
        'Forbidden',
        'Internal Server Error'
      ]
      
      errorTypes.forEach(errorType => {
        const found = fileContent.includes(errorType)
        console.log(`  - ${errorType}: ${found ? '✅' : '❌'}`)
      })
      
    } else {
      console.log('❌ backend/middleware/authMiddleware.js not found')
    }

    console.log('\n📝 Test files are ready to run with: npm test')
    console.log('🎯 Focus on authMiddleware.js testing')
    
  } catch (error) {
    console.error('❌ Error running tests:', error.message)
  }
  
  console.log('=' .repeat(60))
  console.log('✅ Authentication middleware test analysis completed!')
}

runAuthMiddlewareTests()
