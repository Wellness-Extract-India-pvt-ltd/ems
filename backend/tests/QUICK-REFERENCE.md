# 🚀 EMS Backend Test Suite - Quick Reference

## 📁 Directory Structure
```
tests/
├── unit/           # Unit tests (12 files)
├── integration/    # Integration tests (11 files)  
├── database/       # Database tests (8 files)
├── external/       # External service tests (6 files)
├── scripts/        # Utility scripts (19 files)
├── reports/        # Test reports and logs
└── [config files]  # package.json, vitest.config.js, etc.
```

## 🧪 Quick Commands

### Run All Tests
```bash
npm test                    # Run comprehensive test suite
node run-all-tests.js       # Direct execution
```

### Run Specific Categories
```bash
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests only  
npm run test:database       # Database tests only
npm run test:external       # External service tests only
```

### Run Individual Tests
```bash
npx vitest run unit/app-unit.test.js
npx vitest run integration/authController.test.js
node external/basic-ms-graph-test.js
```

### Watch Mode
```bash
npm run test:watch          # Watch all tests
npm run test:unit-watch     # Watch unit tests
npm run test:integration-watch  # Watch integration tests
```

## 📊 Test Categories

| Category | Purpose | Files | Command |
|----------|---------|-------|---------|
| **Unit** | Individual components | 12 | `npm run test:unit` |
| **Integration** | API endpoints | 11 | `npm run test:integration` |
| **Database** | MySQL/Redis operations | 8 | `npm run test:database` |
| **External** | MS Graph API | 6 | `npm run test:external` |

## 🔧 Utility Scripts

### Data Management
```bash
node scripts/insert-employee-data.js      # Populate database
node scripts/verify-inserted-data.js     # Verify data integrity
node scripts/fix-department-mapping.js   # Fix data mapping
```

### Test Runners
```bash
node scripts/run-app-tests.js            # App-specific tests
node scripts/run-auth-tests.js           # Authentication tests
node scripts/run-mysql-tests.js          # MySQL tests
node scripts/run-redis-tests.js          # Redis tests
```

### Verification
```bash
node verify-organization.js              # Verify test organization
```

## 📈 Test Results

### Success Metrics
- **Unit Tests**: 12 files ✅
- **Integration Tests**: 11 files ✅  
- **Database Tests**: 8 files ✅
- **External Tests**: 6 files ✅
- **Total**: 37+ test files organized

### Coverage Goals
- Unit Tests: 90%+ coverage
- Integration Tests: Critical paths covered
- Database Tests: All operations tested
- External Tests: All integrations verified

## 🛠️ Development Workflow

1. **Write Tests**: Add to appropriate category directory
2. **Run Tests**: Use category-specific commands
3. **Debug**: Use watch mode for development
4. **Verify**: Run organization verification
5. **Report**: Check logs in `reports/logs/`

## 📝 Naming Conventions

- **Unit Tests**: `{component}-unit.test.js`
- **Integration Tests**: `{component}.test.js`
- **Database Tests**: `{database}-{operation}.test.js`
- **External Tests**: `{service}-{operation}.test.js`
- **Scripts**: `{action}-{target}.js`

## 🚨 Troubleshooting

### Common Issues
- **Database**: Ensure MySQL/Redis are running
- **Environment**: Check `.env` configuration
- **External**: Verify API credentials
- **Dependencies**: Run `npm install`

### Debug Commands
```bash
DEBUG=* npm test              # Debug all tests
DEBUG=* npx vitest run unit/  # Debug unit tests
node verify-organization.js   # Check organization
```

---
**Last Updated**: September 18, 2025  
**Status**: ✅ Fully Organized  
**Total Files**: 37+ test files  
**Success Rate**: 100% organized
