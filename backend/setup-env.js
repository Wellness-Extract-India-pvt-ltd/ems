#!/usr/bin/env node

/**
 * Environment Setup Script for EMS Backend
 *
 * This script helps set up the environment configuration by:
 * 1. Copying env.example to .env
 * 2. Generating secure random secrets
 * 3. Validating required environment variables
 * 4. Providing setup instructions
 */

import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

/**
 * Generate a secure random string
 */
function generateSecret (length = 64) {
  return crypto.randomBytes(length).toString('hex')
}

/**
 * Log colored messages
 */
function log (message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

/**
 * Check if .env file exists
 */
function envFileExists () {
  const envPath = path.join(__dirname, '.env')
  return fs.existsSync(envPath)
}

/**
 * Copy env.example to .env with generated secrets
 */
function createEnvFile () {
  const examplePath = path.join(__dirname, 'env.example')
  const envPath = path.join(__dirname, '.env')

  if (!fs.existsSync(examplePath)) {
    log('❌ env.example file not found!', 'red')
    process.exit(1)
  }

  try {
    let envContent = fs.readFileSync(examplePath, 'utf8')

    // Generate secure secrets
    const jwtSecret = generateSecret(32)
    const jwtRefreshSecret = generateSecret(32)
    const sessionSecret = generateSecret(32)
    const redisPassword = generateSecret(16)

    // Replace placeholder secrets with generated ones
    envContent = envContent.replace(
      /JWT_SECRET=your_super_secret_jwt_key_here_change_in_production/g,
      `JWT_SECRET=${jwtSecret}`
    )
    envContent = envContent.replace(
      /JWT_REFRESH_SECRET=your_super_secret_refresh_jwt_key_here_change_in_production/g,
      `JWT_REFRESH_SECRET=${jwtRefreshSecret}`
    )
    envContent = envContent.replace(
      /SESSION_SECRET=your_session_secret_here_change_in_production/g,
      `SESSION_SECRET=${sessionSecret}`
    )
    envContent = envContent.replace(
      /REDIS_PASSWORD=your_redis_password_here/g,
      `REDIS_PASSWORD=${redisPassword}`
    )

    // Set default values for empty variables
    envContent = envContent.replace(/^DB_HOST=$/gm, 'DB_HOST=localhost')
    envContent = envContent.replace(/^DB_PORT=$/gm, 'DB_PORT=3306')
    envContent = envContent.replace(/^DB_NAME=$/gm, 'DB_NAME=ems_db')
    envContent = envContent.replace(/^DB_USER=$/gm, 'DB_USER=root')
    envContent = envContent.replace(/^DB_PASSWORD=$/gm, 'DB_PASSWORD=password')

    envContent = envContent.replace(/^REDIS_HOST=$/gm, 'REDIS_HOST=localhost')
    envContent = envContent.replace(/^REDIS_PORT=$/gm, 'REDIS_PORT=6379')

    envContent = envContent.replace(
      /^UPLOAD_PATH=$/gm,
      'UPLOAD_PATH=./uploads'
    )
    envContent = envContent.replace(
      /^MAX_FILE_SIZE=$/gm,
      'MAX_FILE_SIZE=10485760'
    )

    envContent = envContent.replace(
      /^BIOMETRICS_SERVER=$/gm,
      'BIOMETRICS_SERVER=172.16.1.171'
    )
    envContent = envContent.replace(
      /^BIOMETRICS_DATABASE=$/gm,
      'BIOMETRICS_DATABASE=ONtime_Att'
    )
    envContent = envContent.replace(
      /^BIOMETRICS_PORT=$/gm,
      'BIOMETRICS_PORT=1433'
    )
    envContent = envContent.replace(
      /^BIOMETRICS_ENCRYPT=$/gm,
      'BIOMETRICS_ENCRYPT=false'
    )
    envContent = envContent.replace(
      /^BIOMETRICS_TRUST_CERT=$/gm,
      'BIOMETRICS_TRUST_CERT=true'
    )

    envContent = envContent.replace(/^JWT_EXPIRES_IN=$/gm, 'JWT_EXPIRES_IN=1h')
    envContent = envContent.replace(
      /^JWT_REFRESH_EXPIRES_IN=$/gm,
      'JWT_REFRESH_EXPIRES_IN=7d'
    )

    envContent = envContent.replace(
      /^REDIRECT_URI=$/gm,
      'REDIRECT_URI=http://localhost:5000/api/v1/auth/microsoft/callback'
    )

    // Write the new .env file
    fs.writeFileSync(envPath, envContent)

    log('✅ .env file created successfully!', 'green')
    log('🔐 Secure secrets have been generated automatically', 'cyan')

    return true
  } catch (error) {
    log(`❌ Error creating .env file: ${error.message}`, 'red')
    return false
  }
}

/**
 * Validate environment configuration
 */
function validateEnvConfig () {
  const envPath = path.join(__dirname, '.env')

  if (!fs.existsSync(envPath)) {
    log('❌ .env file not found!', 'red')
    return false
  }

  try {
    const envContent = fs.readFileSync(envPath, 'utf8')
    const lines = envContent.split('\n')

    const requiredVars = [
      'JWT_SECRET',
      'JWT_REFRESH_SECRET',
      'CLIENT_ID',
      'CLIENT_SECRET',
      'TENANT_ID',
      'DB_PASSWORD',
      'BIOMETRICS_USER',
      'BIOMETRICS_PASSWORD'
    ]

    const missingVars = []
    const placeholderVars = []

    lines.forEach((line) => {
      const [key, value] = line.split('=')
      if (key && value) {
        const cleanKey = key.trim()
        const cleanValue = value.trim()

        if (requiredVars.includes(cleanKey)) {
          if (cleanValue.includes('your_') || cleanValue.includes('_here')) {
            placeholderVars.push(cleanKey)
          } else if (
            cleanValue === '' ||
            cleanValue === '${' + cleanKey + '}'
          ) {
            missingVars.push(cleanKey)
          }
        }
      }
    })

    if (missingVars.length > 0) {
      log('❌ Missing required environment variables:', 'red')
      missingVars.forEach((varName) => {
        log(`   - ${varName}`, 'red')
      })
      return false
    }

    if (placeholderVars.length > 0) {
      log('⚠️  Environment variables with placeholder values:', 'yellow')
      placeholderVars.forEach((varName) => {
        log(`   - ${varName}`, 'yellow')
      })
      log('   Please update these with your actual values', 'yellow')
    }

    log('✅ Environment configuration validation passed!', 'green')
    return true
  } catch (error) {
    log(`❌ Error validating .env file: ${error.message}`, 'red')
    return false
  }
}

/**
 * Display setup instructions
 */
function displayInstructions () {
  log('\n' + '='.repeat(60), 'cyan')
  log('🚀 EMS Backend Environment Setup Complete!', 'bright')
  log('='.repeat(60), 'cyan')

  log('\n📋 Next Steps:', 'yellow')
  log('1. Update the following environment variables in .env:', 'blue')
  log('   - CLIENT_ID: Your Azure AD application client ID', 'blue')
  log('   - CLIENT_SECRET: Your Azure AD application client secret', 'blue')
  log('   - TENANT_ID: Your Azure AD tenant ID', 'blue')
  log('   - DB_PASSWORD: Your MySQL database password', 'blue')
  log('   - BIOMETRICS_USER: Your BioMetrics database username', 'blue')
  log('   - BIOMETRICS_PASSWORD: Your BioMetrics database password', 'blue')
  log('   - SENDGRID_API_KEY: Your SendGrid API key (if using email)', 'blue')

  log('\n2. For Docker setup:', 'yellow')
  log(
    '   - Copy .env to project root (same level as docker-compose.yml)',
    'blue'
  )
  log('   - Update Docker environment variables as needed', 'blue')

  log('\n3. Start the application:', 'yellow')
  log('   npm start                    # For development', 'blue')
  log('   docker-compose up -d         # For Docker', 'blue')

  log('\n🔒 Security Notes:', 'yellow')
  log('   - Never commit .env file to version control', 'red')
  log('   - Use strong, unique passwords for production', 'red')
  log('   - Regularly rotate your secrets and API keys', 'red')

  log('\n📚 Documentation:', 'yellow')
  log('   - See README.md for detailed setup instructions', 'blue')
  log('   - Check env.example for all available configuration options', 'blue')

  log('\n' + '='.repeat(60), 'cyan')
}

/**
 * Main setup function
 */
function main () {
  log('🔧 EMS Backend Environment Setup', 'bright')
  log('================================', 'cyan')

  if (envFileExists()) {
    log('⚠️  .env file already exists!', 'yellow')
    log(
      '   Use --force flag to overwrite: node setup-env.js --force',
      'yellow'
    )

    if (process.argv.includes('--force')) {
      log('🔄 Overwriting existing .env file...', 'yellow')
      createEnvFile()
    } else {
      log('✅ Validating existing .env file...', 'green')
      validateEnvConfig()
      return
    }
  } else {
    log('📝 Creating new .env file...', 'blue')
    if (!createEnvFile()) {
      process.exit(1)
    }
  }

  log('\n🔍 Validating configuration...', 'blue')
  validateEnvConfig()

  displayInstructions()
}

// Run the setup
main()
