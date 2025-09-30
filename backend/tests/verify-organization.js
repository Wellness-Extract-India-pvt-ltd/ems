#!/usr/bin/env node

/**
 * @fileoverview Test Organization Verification Script
 * @description Verifies that the test directory is properly organized
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// ES6 module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Expected directory structure
const EXPECTED_STRUCTURE = {
  'unit': ['*-unit.test.js'],
  'integration': ['*.test.js'],
  'database': ['mysql-*.test.js', 'redis-*.test.js', 'mysql-*.js', 'redis-*.js'],
  'external': ['*ms-graph*.js', '*MS-Graph*.docx'],
  'scripts': ['run-*.js', 'insert-*.js', 'verify-*.js', 'test-*.js', 'fix-*.js'],
  'reports': ['logs']
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkDirectory(directory, patterns) {
  const dirPath = join(__dirname, directory);
  
  if (!fs.existsSync(dirPath)) {
    log(`❌ Directory ${directory} does not exist`, colors.red);
    return false;
  }

  const files = fs.readdirSync(dirPath);
  let isValid = true;

  log(`\n📁 Checking ${directory}/:`, colors.blue);
  
  for (const pattern of patterns) {
    const matchingFiles = files.filter(file => {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(file);
      }
      return file === pattern;
    });

    if (matchingFiles.length > 0) {
      log(`  ✅ ${pattern}: ${matchingFiles.length} files found`, colors.green);
      matchingFiles.forEach(file => log(`     - ${file}`, colors.cyan));
    } else {
      log(`  ⚠️  ${pattern}: No files found`, colors.yellow);
    }
  }

  // Check for unexpected files
  const expectedPatterns = patterns.map(p => p.replace(/\*/g, '.*'));
  const unexpectedFiles = files.filter(file => {
    return !expectedPatterns.some(pattern => {
      const regex = new RegExp(pattern);
      return regex.test(file);
    });
  });

  if (unexpectedFiles.length > 0) {
    log(`  ⚠️  Unexpected files found:`, colors.yellow);
    unexpectedFiles.forEach(file => log(`     - ${file}`, colors.yellow));
  }

  return isValid;
}

function checkMainDirectory() {
  const mainFiles = fs.readdirSync(__dirname);
  const expectedMainFiles = [
    'package.json',
    'vitest.config.js',
    'setup.js',
    'README.md',
    'run-all-tests.js',
    'verify-organization.js'
  ];

  log(`\n📁 Checking main directory:`, colors.blue);
  
  let allPresent = true;
  for (const file of expectedMainFiles) {
    if (mainFiles.includes(file)) {
      log(`  ✅ ${file}`, colors.green);
    } else {
      log(`  ❌ ${file} - Missing`, colors.red);
      allPresent = false;
    }
  }

  // Check for unexpected files in main directory
  const unexpectedFiles = mainFiles.filter(file => {
    return !expectedMainFiles.includes(file) && 
           !file.startsWith('.') && 
           file !== 'node_modules';
  });

  if (unexpectedFiles.length > 0) {
    log(`  ⚠️  Unexpected files in main directory:`, colors.yellow);
    unexpectedFiles.forEach(file => log(`     - ${file}`, colors.yellow));
  }

  return allPresent;
}

function generateReport() {
  log(`\n${'='.repeat(60)}`, colors.cyan);
  log(`📊 TEST ORGANIZATION VERIFICATION REPORT`, colors.cyan);
  log(`${'='.repeat(60)}`, colors.cyan);

  let totalChecks = 0;
  let passedChecks = 0;

  // Check main directory
  totalChecks++;
  if (checkMainDirectory()) {
    passedChecks++;
  }

  // Check each category directory
  for (const [directory, patterns] of Object.entries(EXPECTED_STRUCTURE)) {
    totalChecks++;
    if (checkDirectory(directory, patterns)) {
      passedChecks++;
    }
  }

  // Summary
  log(`\n📈 SUMMARY:`, colors.blue);
  log(`Total Checks: ${totalChecks}`);
  log(`Passed: ${passedChecks} ✅`);
  log(`Failed: ${totalChecks - passedChecks} ❌`);
  log(`Success Rate: ${((passedChecks / totalChecks) * 100).toFixed(2)}%`);

  if (passedChecks === totalChecks) {
    log(`\n🎉 All organization checks passed!`, colors.green);
    log(`The test directory is properly organized.`, colors.green);
  } else {
    log(`\n⚠️  Some organization issues found.`, colors.yellow);
    log(`Please review the report above and fix any issues.`, colors.yellow);
  }

  return passedChecks === totalChecks;
}

// Run the verification
log(`🚀 Starting Test Organization Verification...`, colors.blue);
log(`Directory: ${__dirname}`, colors.cyan);

const isOrganized = generateReport();

process.exit(isOrganized ? 0 : 1);
