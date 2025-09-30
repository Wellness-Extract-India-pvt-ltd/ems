/**
 * Database Initialization Script
 * Creates tables and adds test data
 */

import sequelize from './database/connection.js';
import Employee from './models/Employee.js';
import Department from './models/Department.js';
import UserRoleMap from './models/UserRoleMap.js';
import logger from './utils/logger.js';

async function initializeDatabase() {
  try {
    logger.info('Starting database initialization...');

    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully');

    // Create all tables
    await sequelize.sync({ force: true });
    logger.info('Database tables created successfully');

    // Create a test department
    const testDepartment = await Department.create({
      name: 'IT Department',
      description: 'Information Technology Department',
      manager_id: null,
      location: 'Head Office',
      budget: 100000,
      status: 'active'
    });
    logger.info('Test department created:', testDepartment.toJSON());

    // Create the test employee
    const testEmployee = await Employee.create({
      employee_id: 'WE_IN017',
      first_name: 'Sawan',
      last_name: 'Kumar',
      email: 'sawan@wellnessextract.com',
      contact_email: 'sawan@wellnessextract.com',
      phone: '+91-9876543210',
      department_id: testDepartment.id,
      position: 'Software Developer',
      employment_type: 'full-time',
      status: 'active',
      join_date: new Date('2023-01-15'),
      manager_id: null,
      salary: 75000,
      address: {
        street: '123 Tech Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        postal_code: '400001'
      },
      emergency_contact: {
        name: 'Emergency Contact',
        relationship: 'Spouse',
        phone: '+91-9876543211'
      },
      skills: ['JavaScript', 'React', 'Node.js', 'MySQL'],
      notes: 'Test employee for EMS system'
    });
    logger.info('Test employee created:', testEmployee.toJSON());

    // Create user role mapping
    const userRole = await UserRoleMap.create({
      employee_id: testEmployee.id,
      role: 'admin',
      permissions: ['read', 'write', 'delete', 'admin'],
      assigned_by: testEmployee.id,
      assigned_date: new Date(),
      status: 'active'
    });
    logger.info('User role created:', userRole.toJSON());

    logger.info('Database initialization completed successfully!');
    logger.info('Test employee created with:');
    logger.info('- Employee ID: WE_IN017');
    logger.info('- Email: sawan@wellnessextract.com');
    logger.info('- Role: admin');

  } catch (error) {
    logger.error('Database initialization failed:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run the initialization
initializeDatabase()
  .then(() => {
    console.log('✅ Database initialization completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  });
