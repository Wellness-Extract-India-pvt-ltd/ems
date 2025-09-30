/**
 * @fileoverview Vitest configuration for EMS Backend tests
 * 
 * @author EMS Development Team
 * @version 1.0.0
 * @since 2025-09-17
 */

import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./setup.js'],
    testTimeout: 30000,
    hookTimeout: 30000,
    teardownTimeout: 30000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'tests/**',
        '**/*.test.js',
        '**/*.spec.js',
        'coverage/**'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../'),
      '@tests': path.resolve(__dirname, './')
    }
  }
})
