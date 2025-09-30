/**
 * Simple MySQL Connection Test
 * Direct database connection test without configuration validation
 */

import { Sequelize } from 'sequelize'

async function testMySQLConnection() {
  console.log('🧪 Testing MySQL Database Connection...')
  console.log('=' .repeat(60))

  // Database configuration
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    database: process.env.DB_NAME || 'ems_db',
    username: process.env.DB_USER || 'ems_user',
    password: process.env.DB_PASSWORD || 'ems_root_password',
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      charset: 'utf8mb4'
    }
  }

  console.log('📡 Database Configuration:')
  console.log(`  Host: ${dbConfig.host}`)
  console.log(`  Port: ${dbConfig.port}`)
  console.log(`  Database: ${dbConfig.database}`)
  console.log(`  Username: ${dbConfig.username}`)
  console.log(`  Password: ${'*'.repeat(dbConfig.password.length)}`)

  let sequelize = null

  try {
    // Create Sequelize instance
    console.log('🔧 Creating Sequelize instance...')
    sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
      host: dbConfig.host,
      port: dbConfig.port,
      dialect: dbConfig.dialect,
      logging: dbConfig.logging,
      pool: dbConfig.pool,
      dialectOptions: dbConfig.dialectOptions
    })

    // Test connection
    console.log('📡 Testing database connection...')
    const startTime = Date.now()
    await sequelize.authenticate()
    const responseTime = Date.now() - startTime

    console.log('✅ Database connection successful!')
    console.log(`⏱️  Response time: ${responseTime}ms`)

    // Test basic query
    console.log('🔍 Testing basic query...')
    const [results] = await sequelize.query('SELECT 1 as test_value')
    console.log('✅ Query executed successfully!')
    console.log('📊 Query result:', results[0])

    // Test database info
    console.log('📊 Getting database information...')
    const [versionResult] = await sequelize.query('SELECT VERSION() as version, DATABASE() as current_database')
    console.log('📋 Database Info:')
    console.log(`  Version: ${versionResult[0].version}`)
    console.log(`  Current Database: ${versionResult[0].current_database}`)

    // Test table listing
    console.log('📋 Listing database tables...')
    const [tables] = await sequelize.query(`
      SELECT TABLE_NAME, TABLE_ROWS, DATA_LENGTH
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
      ORDER BY TABLE_NAME
    `)
    
    console.log(`📊 Found ${tables.length} tables:`)
    tables.forEach(table => {
      console.log(`  - ${table.TABLE_NAME} (${table.TABLE_ROWS || 0} rows)`)
    })

    // Test if EMS tables exist
    console.log('🔍 Checking for EMS tables...')
    const emsTables = tables.filter(table => 
      table.TABLE_NAME.includes('employee') || 
      table.TABLE_NAME.includes('department') ||
      table.TABLE_NAME.includes('user_role') ||
      table.TABLE_NAME.includes('hardware') ||
      table.TABLE_NAME.includes('software') ||
      table.TABLE_NAME.includes('license') ||
      table.TABLE_NAME.includes('ticket') ||
      table.TABLE_NAME.includes('integration') ||
      table.TABLE_NAME.includes('biometric')
    )

    if (emsTables.length > 0) {
      console.log('✅ Found EMS tables:')
      emsTables.forEach(table => {
        console.log(`  - ${table.TABLE_NAME} (${table.TABLE_ROWS || 0} rows)`)
      })
    } else {
      console.log('⚠️  No EMS tables found. Database may need to be initialized.')
    }

    // Test connection pool status
    console.log('🏊 Testing connection pool...')
    const pool = sequelize.connectionManager.pool
    console.log('📊 Pool Status:')
    console.log(`  Total: ${pool?.size || 0}`)
    console.log(`  Used: ${pool?.used || 0}`)
    console.log(`  Available: ${pool?.available || 0}`)

    console.log('✅ All MySQL tests passed!')
    
  } catch (error) {
    console.error('❌ Error during MySQL testing:')
    console.error('  Message:', error.message)
    console.error('  Code:', error.code)
    console.error('  SQL State:', error.sqlState)
    console.error('  SQL Message:', error.sqlMessage)
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('💡 Suggestion: Check if MySQL container is running')
    } else if (error.message.includes('Access denied')) {
      console.error('💡 Suggestion: Check database credentials')
    } else if (error.message.includes('Unknown database')) {
      console.error('💡 Suggestion: Check if database exists')
    }
  } finally {
    // Close connection
    if (sequelize) {
      try {
        await sequelize.close()
        console.log('🔌 Database connection closed')
      } catch (error) {
        console.error('❌ Error closing connection:', error.message)
      }
    }
  }
  
  console.log('=' .repeat(60))
  console.log('✅ MySQL connection test completed!')
}

testMySQLConnection()
