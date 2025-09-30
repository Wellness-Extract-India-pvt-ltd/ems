# EMS Backend Test Suite

This directory contains the comprehensive test suite for the EMS (Employee Management System) backend application.

## 📁 Directory Structure

```
tests/
├── unit/                    # Unit tests for individual components
│   ├── app-unit.test.js
│   ├── authController-unit.test.js
│   ├── authMiddleware-unit.test.js
│   ├── biometricsController-unit.test.js
│   ├── employeeController-unit.test.js
│   ├── hardwareController-unit.test.js
│   ├── index-unit.test.js
│   ├── integrationController-unit.test.js
│   ├── licenseController-unit.test.js
│   ├── redis-unit.test.js
│   ├── softwareController-unit.test.js
│   └── ticketController-unit.test.js
│
├── integration/            # Integration tests for API endpoints
│   ├── app.test.js
│   ├── authController.test.js
│   ├── authMiddleware.test.js
│   ├── biometricsController.test.js
│   ├── employeeController.test.js
│   ├── hardwareController.test.js
│   ├── index.test.js
│   ├── integrationController.test.js
│   ├── licenseController.test.js
│   ├── softwareController.test.js
│   └── ticketController.test.js
│
├── database/               # Database connectivity and operations tests
│   ├── mysql-connectivity.test.js
│   ├── mysql-data-insertion.test.js
│   ├── mysql-data-verification.js
│   ├── mysql-operations.test.js
│   ├── mysql-performance.test.js
│   ├── mysql-schema.test.js
│   ├── mysql-simple-test.js
│   ├── redis-connectivity.test.js
│   ├── redis-integration.test.js
│   ├── redis.test.js
│   └── simple-mysql-test.js
│
├── external/               # External service integration tests
│   ├── basic-ms-graph-test.js
│   ├── ms-graph-integration-test.js
│   ├── ms-graph-test-with-env.js
│   ├── run-ms-graph-tests.js
│   ├── simple-ms-graph-test.js
│   └── MS-Graph-Integration-Test-Report.docx
│
├── scripts/                # Utility scripts and test runners
│   ├── fix-department-mapping.js
│   ├── insert-employee-data.js
│   ├── run-app-tests.js
│   ├── run-auth-tests.js
│   ├── run-authMiddleware-tests.js
│   ├── run-biometrics-tests.js
│   ├── run-employee-tests.js
│   ├── run-hardware-tests.js
│   ├── run-integration-tests.js
│   ├── run-license-tests.js
│   ├── run-mysql-tests.js
│   ├── run-redis-connectivity-tests.js
│   ├── run-redis-tests.js
│   ├── run-software-tests.js
│   ├── run-tests.js
│   ├── run-ticket-tests.js
│   ├── test-mysql-connection.js
│   ├── verify-admin-employee.js
│   └── verify-inserted-data.js
│
├── reports/                # Test reports and logs
│   └── logs/               # Test execution logs
│       ├── combined-*.log
│       ├── error-*.log
│       ├── exceptions-*.log
│       ├── http-*.log
│       ├── performance-*.log
│       └── security-*.log
│
├── package.json            # Test dependencies
├── vitest.config.js        # Vitest configuration
├── setup.js               # Test setup and mocks
└── README.md              # This file
```

## 🧪 Test Categories

### Unit Tests (`unit/`)
- **Purpose**: Test individual functions and components in isolation
- **Scope**: Single files, functions, classes
- **Dependencies**: Mocked external dependencies
- **Execution**: Fast, can run in parallel

### Integration Tests (`integration/`)
- **Purpose**: Test API endpoints and component interactions
- **Scope**: Multiple components working together
- **Dependencies**: Real database connections, mocked external services
- **Execution**: Slower, requires setup

### Database Tests (`database/`)
- **Purpose**: Test database connectivity, operations, and performance
- **Scope**: MySQL, Redis, data integrity
- **Dependencies**: Real database instances
- **Execution**: Requires database setup

### External Service Tests (`external/`)
- **Purpose**: Test third-party service integrations
- **Scope**: Microsoft Graph API, MSAL authentication
- **Dependencies**: External service credentials
- **Execution**: Requires internet connectivity

### Utility Scripts (`scripts/`)
- **Purpose**: Data setup, verification, and test execution
- **Scope**: Database seeding, test runners, verification
- **Dependencies**: Various based on script purpose
- **Execution**: Manual or automated

## 🚀 Running Tests

### Prerequisites
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

### Running All Tests
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage
```

### Running Specific Test Categories
```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# Database tests only
npm run test:database

# External service tests only
npm run test:external
```

### Running Individual Test Files
```bash
# Run specific test file
npx vitest run unit/app-unit.test.js

# Run with watch mode
npx vitest unit/app-unit.test.js
```

### Running Utility Scripts
```bash
# Database setup
node scripts/insert-employee-data.js

# Data verification
node scripts/verify-inserted-data.js

# MS Graph testing
node scripts/run-ms-graph-tests.js
```

## 📊 Test Configuration

### Vitest Configuration (`vitest.config.js`)
- **Test Environment**: Node.js with happy-dom
- **Coverage**: Comprehensive coverage reporting
- **Timeout**: 30 seconds per test
- **Setup**: Custom setup file for mocks

### Test Setup (`setup.js`)
- **Mock Logger**: Custom logger implementation
- **Environment**: Test environment configuration
- **Mocks**: External service mocks

## 🔧 Test Utilities

### Test Runners (`scripts/run-*.js`)
- Individual test file runners
- Custom test execution logic
- Error handling and reporting

### Data Scripts (`scripts/`)
- **insert-employee-data.js**: Populate database with test data
- **verify-inserted-data.js**: Verify data integrity
- **fix-department-mapping.js**: Fix data mapping issues

## 📈 Test Reports

### Log Files (`reports/logs/`)
- **combined-*.log**: All log levels
- **error-*.log**: Error messages only
- **http-*.log**: HTTP request logs
- **performance-*.log**: Performance metrics
- **security-*.log**: Security-related logs

### Test Reports
- **MS-Graph-Integration-Test-Report.docx**: Microsoft Graph API test results
- Console output with detailed test results
- Coverage reports (when enabled)

## 🛠️ Development Guidelines

### Adding New Tests
1. **Unit Tests**: Add to `unit/` directory
2. **Integration Tests**: Add to `integration/` directory
3. **Database Tests**: Add to `database/` directory
4. **External Tests**: Add to `external/` directory

### Test Naming Convention
- **Unit Tests**: `{component}-unit.test.js`
- **Integration Tests**: `{component}.test.js`
- **Database Tests**: `{database}-{operation}.test.js`
- **External Tests**: `{service}-{operation}.test.js`

### Test Structure
```javascript
describe('Component Name', () => {
  describe('Feature', () => {
    it('should do something', () => {
      // Test implementation
    });
  });
});
```

## 🔍 Troubleshooting

### Common Issues
1. **Database Connection**: Ensure MySQL and Redis are running
2. **Environment Variables**: Check `.env` file configuration
3. **External Services**: Verify API credentials and connectivity
4. **Test Dependencies**: Run `npm install` to update dependencies

### Debug Mode
```bash
# Run tests with debug output
DEBUG=* npm test

# Run specific test with debug
DEBUG=* npx vitest run unit/app-unit.test.js
```

## 📝 Best Practices

1. **Test Isolation**: Each test should be independent
2. **Mock External Dependencies**: Use mocks for external services
3. **Clean Up**: Clean up test data after tests
4. **Descriptive Names**: Use clear, descriptive test names
5. **Error Handling**: Test both success and failure scenarios
6. **Performance**: Consider test execution time
7. **Documentation**: Document complex test scenarios

## 🎯 Test Coverage Goals

- **Unit Tests**: 90%+ coverage
- **Integration Tests**: Critical paths covered
- **Database Tests**: All operations tested
- **External Tests**: All integrations verified

---

**Last Updated**: September 18, 2025  
**Test Framework**: Vitest  
**Node.js Version**: 18+  
**Database**: MySQL 8.0+, Redis 6.0+