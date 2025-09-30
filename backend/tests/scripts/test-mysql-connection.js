/**
 * Simple MySQL Connection Test
 * Tests actual database connection with provided credentials
 */

import { testConnection, getDatabaseHealth, getDatabaseInfo, executeRawQuery } from '../database/connection.js'

async function testMySQLConnection() {
  console.log('🧪 Testing MySQL Database Connection...')
  console.log('=' .repeat(60))

  try {
    // Test basic connection
    console.log('📡 Testing database connection...')
    const connected = await testConnection()
    
    if (connected) {
      console.log('✅ Database connection successful!')
      
      // Get database health
      console.log('🏥 Getting database health...')
      const health = await getDatabaseHealth()
      console.log('Health Status:', health.status)
      console.log('Response Time:', health.responseTime + 'ms')
      console.log('Pool Stats:', health.pool)
      
      // Get database info
      console.log('📊 Getting database information...')
      const info = await getDatabaseInfo()
      if (info.success) {
        console.log('Database Version:', info.data.version?.version)
        console.log('Current Database:', info.data.version?.current_database)
        console.log('Tables Count:', info.data.tables?.length || 0)
      }
      
      // Test raw query
      console.log('🔍 Testing raw query execution...')
      const result = await executeRawQuery('SELECT 1 as test_value')
      console.log('Query Result:', result)
      
      console.log('✅ All MySQL tests passed!')
      
    } else {
      console.log('❌ Database connection failed!')
      console.log('Please check your database credentials and ensure MySQL is running.')
    }
    
  } catch (error) {
    console.error('❌ Error during MySQL testing:', error.message)
    console.error('Stack:', error.stack)
  }
  
  console.log('=' .repeat(60))
  console.log('✅ MySQL connection test completed!')
}

testMySQLConnection()
