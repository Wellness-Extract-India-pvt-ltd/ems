#!/usr/bin/env node

/**
 * @fileoverview Master Test Runner for EMS Backend
 * @description Comprehensive test runner for all test categories
 * @author EMS Development Team
 * @version 1.0.0
 * @since 2025-09-18
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// ES6 module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test configuration
const TEST_CONFIG = {
  categories: {
    unit: {
      path: 'unit',
      description: 'Unit Tests',
      command: 'npx vitest run unit/',
      timeout: 60000
    },
    integration: {
      path: 'integration',
      description: 'Integration Tests',
      command: 'npx vitest run integration/',
      timeout: 120000
    },
    database: {
      path: 'database',
      description: 'Database Tests',
      command: 'npx vitest run database/',
      timeout: 180000
    },
    external: {
      path: 'external',
      description: 'External Service Tests',
      command: 'node external/basic-ms-graph-test.js',
      timeout: 300000
    }
  },
  colors: {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
  }
};

// Test results tracking
let testResults = {
  totalCategories: 0,
  passedCategories: 0,
  failedCategories: 0,
  totalTests: 0,
  passedTests: 0,
  failedTests: 0,
  startTime: Date.now(),
  endTime: null,
  categories: {}
};

/**
 * Utility functions for logging and formatting
 */
const Logger = {
  log: (message, color = TEST_CONFIG.colors.reset) => {
    console.log(`${color}${message}${TEST_CONFIG.colors.reset}`);
  },
  
  success: (message) => Logger.log(`✅ ${message}`, TEST_CONFIG.colors.green),
  error: (message) => Logger.log(`❌ ${message}`, TEST_CONFIG.colors.red),
  warning: (message) => Logger.log(`⚠️  ${message}`, TEST_CONFIG.colors.yellow),
  info: (message) => Logger.log(`ℹ️  ${message}`, TEST_CONFIG.colors.blue),
  header: (message) => Logger.log(`\n${TEST_CONFIG.colors.bright}${TEST_CONFIG.colors.cyan}${message}${TEST_CONFIG.colors.reset}`),
  
  section: (message) => {
    Logger.log(`\n${'='.repeat(60)}`, TEST_CONFIG.colors.cyan);
    Logger.log(`${message}`, TEST_CONFIG.colors.bright);
    Logger.log(`${'='.repeat(60)}`, TEST_CONFIG.colors.cyan);
  }
};

/**
 * Execute a test category
 */
async function runTestCategory(categoryName, config) {
  return new Promise((resolve) => {
    Logger.section(`Running ${config.description}`);
    
    const startTime = Date.now();
    const process = spawn('cmd', ['/c', config.command], {
      cwd: __dirname,
      stdio: 'pipe',
      shell: true
    });

    let output = '';
    let errorOutput = '';

    process.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      process.stdout.write(text);
    });

    process.stderr.on('data', (data) => {
      const text = data.toString();
      errorOutput += text;
      process.stderr.write(text);
    });

    const timeout = setTimeout(() => {
      process.kill('SIGTERM');
      Logger.error(`Test category ${categoryName} timed out after ${config.timeout}ms`);
      resolve({
        category: categoryName,
        status: 'TIMEOUT',
        duration: config.timeout,
        output,
        error: 'Test execution timed out'
      });
    }, config.timeout);

    process.on('close', (code) => {
      clearTimeout(timeout);
      const duration = Date.now() - startTime;
      
      const result = {
        category: categoryName,
        status: code === 0 ? 'PASS' : 'FAIL',
        duration,
        output,
        error: errorOutput,
        exitCode: code
      };

      if (code === 0) {
        Logger.success(`${config.description} completed successfully`);
      } else {
        Logger.error(`${config.description} failed with exit code ${code}`);
      }

      resolve(result);
    });

    process.on('error', (error) => {
      clearTimeout(timeout);
      Logger.error(`Failed to start test category ${categoryName}: ${error.message}`);
      resolve({
        category: categoryName,
        status: 'ERROR',
        duration: 0,
        output: '',
        error: error.message
      });
    });
  });
}

/**
 * Parse test results from output
 */
function parseTestResults(output) {
  const lines = output.split('\n');
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  for (const line of lines) {
    if (line.includes('Tests:') && line.includes('passed')) {
      const match = line.match(/(\d+)\s+passed/);
      if (match) passedTests = parseInt(match[1]);
    }
    if (line.includes('Tests:') && line.includes('failed')) {
      const match = line.match(/(\d+)\s+failed/);
      if (match) failedTests = parseInt(match[1]);
    }
    if (line.includes('Test Files:')) {
      const match = line.match(/(\d+)\s+passed/);
      if (match) totalTests = parseInt(match[1]);
    }
  }

  return { totalTests, passedTests, failedTests };
}

/**
 * Generate comprehensive test report
 */
function generateTestReport() {
  testResults.endTime = Date.now();
  const totalDuration = testResults.endTime - testResults.startTime;

  Logger.header('📊 COMPREHENSIVE TEST REPORT');
  
  Logger.section('Overall Results');
  Logger.log(`Total Categories: ${testResults.totalCategories}`);
  Logger.log(`Passed Categories: ${testResults.passedCategories} ✅`);
  Logger.log(`Failed Categories: ${testResults.failedCategories} ❌`);
  Logger.log(`Total Tests: ${testResults.totalTests}`);
  Logger.log(`Passed Tests: ${testResults.passedTests} ✅`);
  Logger.log(`Failed Tests: ${testResults.failedTests} ❌`);
  Logger.log(`Success Rate: ${testResults.totalTests > 0 ? ((testResults.passedTests / testResults.totalTests) * 100).toFixed(2) : 0}%`);
  Logger.log(`Total Duration: ${(totalDuration / 1000).toFixed(2)}s`);

  Logger.section('Category Breakdown');
  for (const [categoryName, result] of Object.entries(testResults.categories)) {
    const status = result.status === 'PASS' ? '✅' : '❌';
    Logger.log(`${status} ${categoryName}: ${result.status} (${(result.duration / 1000).toFixed(2)}s)`);
    
    if (result.status !== 'PASS') {
      Logger.warning(`   Error: ${result.error}`);
    }
  }

  if (testResults.failedCategories > 0) {
    Logger.section('Failed Categories Details');
    for (const [categoryName, result] of Object.entries(testResults.categories)) {
      if (result.status !== 'PASS') {
        Logger.error(`${categoryName}:`);
        Logger.log(`   Status: ${result.status}`);
        Logger.log(`   Duration: ${(result.duration / 1000).toFixed(2)}s`);
        Logger.log(`   Exit Code: ${result.exitCode}`);
        if (result.error) {
          Logger.log(`   Error: ${result.error}`);
        }
      }
    }
  }

  Logger.section('Recommendations');
  if (testResults.failedCategories === 0) {
    Logger.success('🎉 All test categories passed! The system is ready for production.');
  } else {
    Logger.warning('⚠️  Some test categories failed. Please review the errors above.');
    Logger.info('💡 Check the individual test outputs for detailed error information.');
    Logger.info('💡 Ensure all required services (MySQL, Redis, external APIs) are running.');
  }

  return testResults;
}

/**
 * Main test execution function
 */
async function runAllTests() {
  Logger.header('🚀 EMS BACKEND COMPREHENSIVE TEST SUITE');
  Logger.info(`Starting comprehensive test execution at ${new Date().toISOString()}`);
  
  testResults.startTime = Date.now();

  // Run each test category
  for (const [categoryName, config] of Object.entries(TEST_CONFIG.categories)) {
    testResults.totalCategories++;
    
    try {
      const result = await runTestCategory(categoryName, config);
      testResults.categories[categoryName] = result;
      
      if (result.status === 'PASS') {
        testResults.passedCategories++;
      } else {
        testResults.failedCategories++;
      }

      // Parse test results from output
      const parsedResults = parseTestResults(result.output);
      testResults.totalTests += parsedResults.totalTests;
      testResults.passedTests += parsedResults.passedTests;
      testResults.failedTests += parsedResults.failedTests;

    } catch (error) {
      Logger.error(`Failed to run test category ${categoryName}: ${error.message}`);
      testResults.categories[categoryName] = {
        category: categoryName,
        status: 'ERROR',
        duration: 0,
        output: '',
        error: error.message
      };
      testResults.failedCategories++;
    }
  }

  // Generate and display comprehensive report
  const finalResults = generateTestReport();
  
  // Exit with appropriate code
  const exitCode = testResults.failedCategories > 0 ? 1 : 0;
  process.exit(exitCode);
}

/**
 * Handle command line arguments
 */
function parseArguments() {
  const args = process.argv.slice(2);
  const options = {
    categories: [],
    help: false,
    verbose: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--help':
      case '-h':
        options.help = true;
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--category':
      case '-c':
        if (i + 1 < args.length) {
          options.categories.push(args[i + 1]);
          i++; // Skip next argument
        }
        break;
      default:
        if (arg.startsWith('--')) {
          Logger.warning(`Unknown option: ${arg}`);
        }
        break;
    }
  }

  return options;
}

/**
 * Display help information
 */
function displayHelp() {
  Logger.header('EMS Backend Test Suite Help');
  Logger.log('Usage: node run-all-tests.js [options]');
  Logger.log('');
  Logger.log('Options:');
  Logger.log('  --help, -h          Display this help message');
  Logger.log('  --verbose, -v        Enable verbose output');
  Logger.log('  --category, -c       Run specific test category');
  Logger.log('                       Available categories: unit, integration, database, external');
  Logger.log('');
  Logger.log('Examples:');
  Logger.log('  node run-all-tests.js                    # Run all tests');
  Logger.log('  node run-all-tests.js -c unit            # Run only unit tests');
  Logger.log('  node run-all-tests.js -c integration -v  # Run integration tests with verbose output');
  Logger.log('');
  Logger.log('Test Categories:');
  Logger.log('  unit        - Unit tests for individual components');
  Logger.log('  integration - Integration tests for API endpoints');
  Logger.log('  database    - Database connectivity and operations tests');
  Logger.log('  external    - External service integration tests');
}

// Parse command line arguments
const options = parseArguments();

if (options.help) {
  displayHelp();
  process.exit(0);
}

// Run the tests
runAllTests().catch(error => {
  Logger.error(`Test execution failed: ${error.message}`);
  Logger.error(`Stack trace: ${error.stack}`);
  process.exit(1);
});
