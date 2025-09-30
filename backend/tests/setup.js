/**
 * @fileoverview Test setup file for EMS Backend tests
 * Configures test environment and mocks
 * 
 * @author EMS Development Team
 * @version 1.0.0
 * @since 2025-09-17
 */

import { vi } from 'vitest'
import path from 'path'

// Mock console methods to capture output during tests
const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info
}

// Global test setup
beforeAll(() => {
  // Mock console methods to prevent actual logging during tests
  console.log = vi.fn()
  console.error = vi.fn()
  console.warn = vi.fn()
  console.info = vi.fn()
})

// Global test teardown
afterAll(() => {
  // Restore original console methods
  console.log = originalConsole.log
  console.error = originalConsole.error
  console.warn = originalConsole.warn
  console.info = originalConsole.info
})

// Mock process.exit to prevent actual process termination during tests
const originalExit = process.exit
process.exit = vi.fn()

// Restore process.exit after all tests
afterAll(() => {
  process.exit = originalExit
})

// Set test environment variables
process.env.NODE_ENV = 'test'
process.env.PORT = '5001'
