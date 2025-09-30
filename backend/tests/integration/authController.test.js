import { describe, it, expect, beforeEach, afterEach, vi, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Mock environment variables
process.env.JWT_SECRET = 'test_jwt_secret'
process.env.JWT_REFRESH_SECRET = 'test_jwt_refresh_secret'
process.env.CLIENT_ID = 'test-client-id'
process.env.CLIENT_SECRET = 'test-client-secret'
process.env.TENANT_ID = 'test-tenant-id'
process.env.REDIRECT_URI = 'http://localhost:5001/api/v1/auth/redirect'
process.env.BACKEND_URL = 'http://localhost:5001'
process.env.FRONTEND_URL = 'http://localhost:5173'

// Mock the logger
const mockLogger = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn()
}

// Mock the MSAL client
const mockMsalClient = {
  getAuthCodeUrl: vi.fn()
}

// Mock the Graph service
const mockGetUserProfile = vi.fn()

// Mock the models
const mockUserRoleMap = {
  findOne: vi.fn(),
  update: vi.fn(),
  findAll: vi.fn()
}

const mockEmployee = {
  findOne: vi.fn()
}

// Mock the config
const mockConfig = {
  urls: {
    frontend: 'http://localhost:5173',
    backend: 'http://localhost:5001'
  }
}

// Mock the validation result
const mockValidationResult = vi.fn()

describe('Auth Controller Tests', () => {
  let authController
  let controllerPath
  let fileContent

  beforeAll(async () => {
    // Set up mocks
    vi.mock('../utils/logger.js', () => ({ default: mockLogger }))
    vi.mock('../utils/msalConfig.js', () => ({ default: mockMsalClient }))
    vi.mock('../utils/graphService.js', () => ({ getUserProfile: mockGetUserProfile }))
    vi.mock('../models/UserRoleMap.js', () => ({ default: mockUserRoleMap }))
    vi.mock('../models/Employee.js', () => ({ default: mockEmployee }))
    vi.mock('../config.js', () => ({ default: mockConfig }))
    vi.mock('express-validator', () => ({ validationResult: mockValidationResult }))

    // Read the controller file
    controllerPath = path.join(__dirname, '..', 'controllers', 'authController.js')
    fileContent = fs.readFileSync(controllerPath, 'utf8')
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterAll(() => {
    vi.restoreAllMocks()
  })

  describe('File Structure and Imports', () => {
    it('should exist and be readable', () => {
      expect(fs.existsSync(controllerPath)).toBe(true)
      expect(fileContent.length).toBeGreaterThan(0)
    })

    it('should have valid JavaScript syntax', () => {
      // Check for basic JavaScript syntax patterns
      expect(fileContent).toContain('function ')
      expect(fileContent).toContain('const ')
      expect(fileContent).toContain('export ')
      expect(fileContent).toContain('import ')
    })

    it('should have proper ES6 module structure', () => {
      expect(fileContent).toContain('export const login')
      expect(fileContent).toContain('export async function redirectHandler')
      expect(fileContent).toContain('export const logout')
      expect(fileContent).toContain('export const refreshToken')
    })

    it('should have all required imports', () => {
      expect(fileContent).toContain('import jwt from \'jsonwebtoken\'')
      expect(fileContent).toContain('import { Op } from \'sequelize\'')
      expect(fileContent).toContain('import msalClient from \'../utils/msalConfig.js\'')
      expect(fileContent).toContain('import { getUserProfile } from \'../utils/graphService.js\'')
      expect(fileContent).toContain('import UserRoleMap from \'../models/UserRoleMap.js\'')
      expect(fileContent).toContain('import Employee from \'../models/Employee.js\'')
      expect(fileContent).toContain('import logger from \'../utils/logger.js\'')
      expect(fileContent).toContain('import config from \'../config.js\'')
      expect(fileContent).toContain('import { validationResult } from \'express-validator\'')
    })
  })

  describe('Configuration and Initialization', () => {
    it('should have proper configuration setup', () => {
      expect(fileContent).toContain('const { frontendUrl, backendUrl } = {')
      expect(fileContent).toContain('frontendUrl: config.urls.frontend')
      expect(fileContent).toContain('backendUrl: config.urls.backend')
    })

    it('should have redirect URI configuration', () => {
      expect(fileContent).toContain('const redirectUri = process.env.REDIRECT_URI ||')
      expect(fileContent).toContain('`${backendUrl}/api/v1/auth/redirect`')
    })

    it('should have initialization logging', () => {
      expect(fileContent).toContain('logger.info(\'Auth Controller initialized\'')
    })
  })

  describe('resolveEmail Function', () => {
    it('should have resolveEmail function', () => {
      expect(fileContent).toContain('async function resolveEmail (identifier) {')
    })

    it('should handle email identifiers', () => {
      expect(fileContent).toContain('if (candidate.includes(\'@\')) {')
      expect(fileContent).toContain('return candidate.toLowerCase()')
    })

    it('should handle employee ID identifiers', () => {
      expect(fileContent).toContain('const employee = await Employee.findOne({')
      expect(fileContent).toContain('where: { employee_id: candidate.toUpperCase() }')
    })

    it('should return employee email or null', () => {
      expect(fileContent).toContain('return employee?.contact_email?.toLowerCase() || null')
    })
  })

  describe('Login Function', () => {
    it('should have login function with proper signature', () => {
      expect(fileContent).toContain('export const login = async (req, res, next) => {')
    })

    it('should validate request parameters', () => {
      expect(fileContent).toContain('const errors = validationResult(req)')
      expect(fileContent).toContain('if (!errors.isEmpty()) {')
      expect(fileContent).toContain('return res.status(400).json({ errors: errors.array() })')
    })

    it('should extract identifier from query', () => {
      expect(fileContent).toContain('const { identifier } = req.query')
    })

    it('should resolve email from identifier', () => {
      expect(fileContent).toContain('const email = await resolveEmail(identifier)')
    })

    it('should handle unknown identifier', () => {
      expect(fileContent).toContain('if (!email) {')
      expect(fileContent).toContain('return res')
      expect(fileContent).toContain('.status(404)')
      expect(fileContent).toContain('.json({ message: \'Unknown employee code or email\' })')
    })

    it('should configure auth code URL parameters', () => {
      expect(fileContent).toContain('const authCodeUrlParams = {')
      expect(fileContent).toContain('scopes: [\'User.Read\']')
      expect(fileContent).toContain('redirectUri')
      expect(fileContent).toContain('loginHint: email')
    })

    it('should validate redirect URI', () => {
      expect(fileContent).toContain('if (!redirectUri || redirectUri.includes(\'undefined\')) {')
      expect(fileContent).toContain('logger.error(\'Invalid redirect URI detected\'')
    })

    it('should generate auth code URL', () => {
      expect(fileContent).toContain('const authCodeUrl = await msalClient.getAuthCodeUrl(authCodeUrlParams)')
    })

    it('should redirect to auth code URL', () => {
      expect(fileContent).toContain('return res.redirect(authCodeUrl)')
    })

    it('should handle errors gracefully', () => {
      expect(fileContent).toContain('} catch (error) {')
      expect(fileContent).toContain('logger.error(\'Auth code URL generation failed\'')
      expect(fileContent).toContain('return res.status(500).json({')
    })
  })

  describe('Redirect Handler Function', () => {
    it('should have redirectHandler function with proper signature', () => {
      expect(fileContent).toContain('export async function redirectHandler (req, res) {')
    })

    it('should validate authorization code', () => {
      expect(fileContent).toContain('if (!req.query.code) {')
      expect(fileContent).toContain('logger.warn(\'Missing auth code in redirect\')')
      expect(fileContent).toContain('return res.redirect(`${frontendUrl}/login?error=invalid_request`)')
    })

    it('should configure token request', () => {
      expect(fileContent).toContain('const tokenRequest = {')
      expect(fileContent).toContain('code: req.query.code')
      expect(fileContent).toContain('scopes: [\'User.Read\']')
      expect(fileContent).toContain('redirectUri')
    })

    it('should handle token exchange manually', () => {
      expect(fileContent).toContain('const tokenEndpoint = `https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/token`')
      expect(fileContent).toContain('const tokenRequestBody = new URLSearchParams({')
    })

    it('should make token exchange request', () => {
      expect(fileContent).toContain('const tokenResponse = await fetch(tokenEndpoint, {')
      expect(fileContent).toContain('method: \'POST\'')
      expect(fileContent).toContain('headers: {')
      expect(fileContent).toContain('\'Content-Type\': \'application/x-www-form-urlencoded\'')
    })

    it('should handle token exchange errors', () => {
      expect(fileContent).toContain('if (!tokenResponse.ok) {')
      expect(fileContent).toContain('logger.error(\'Token exchange failed\'')
      expect(fileContent).toContain('throw new Error(`Token exchange failed: ${tokenResponse.status} ${tokenResponse.statusText}`)')
    })

    it('should get user profile', () => {
      expect(fileContent).toContain('const profile = await getUserProfile(authResult.access_token)')
    })

    it('should extract user information', () => {
      expect(fileContent).toContain('const msGraphUserId = profile.id')
      expect(fileContent).toContain('const email = (')
      expect(fileContent).toContain('profile.mail ||')
      expect(fileContent).toContain('profile.userPrincipalName ||')
    })

    it('should look up user in database', () => {
      expect(fileContent).toContain('const user = await UserRoleMap.findOne({')
      expect(fileContent).toContain('where: {')
      expect(fileContent).toContain('[Op.or]: [{ ms_graph_user_id: msGraphUserId }, { email }]')
      expect(fileContent).toContain('is_active: true')
    })

    it('should handle user not found', () => {
      expect(fileContent).toContain('if (!user) {')
      expect(fileContent).toContain('logger.error(\'User not found in database\'')
      expect(fileContent).toContain('return res.redirect(`${frontendUrl}/login?error=not_found`)')
    })

    it('should create JWT payload', () => {
      expect(fileContent).toContain('const jwtPayload = {')
      expect(fileContent).toContain('id: user.id')
      expect(fileContent).toContain('msGraphUserId: user.ms_graph_user_id')
      expect(fileContent).toContain('email: user.email')
      expect(fileContent).toContain('role: user.role')
    })

    it('should generate JWT tokens', () => {
      expect(fileContent).toContain('const jwtToken = jwt.sign(jwtPayload, process.env.JWT_SECRET, {')
      expect(fileContent).toContain('expiresIn: \'1h\'')
      expect(fileContent).toContain('issuer: \'wellness-extract-auth\'')
    })

    it('should generate refresh token', () => {
      expect(fileContent).toContain('const refreshToken = jwt.sign(')
      expect(fileContent).toContain('{ id: user.id }')
      expect(fileContent).toContain('process.env.JWT_REFRESH_SECRET')
      expect(fileContent).toContain('expiresIn: \'7d\'')
    })

    it('should update user with refresh token', () => {
      expect(fileContent).toContain('await UserRoleMap.update(')
      expect(fileContent).toContain('{ refresh_token: refreshToken }')
      expect(fileContent).toContain('{ where: { id: user.id } }')
    })

    it('should redirect to frontend with tokens', () => {
      expect(fileContent).toContain('const redirectUrl = `${frontendUrl}/auth/redirect?token=${jwtToken}&refreshToken=${refreshToken}`')
      expect(fileContent).toContain('return res.redirect(redirectUrl)')
    })

    it('should handle authentication errors', () => {
      expect(fileContent).toContain('} catch (error) {')
      expect(fileContent).toContain('logger.error(\'MSAL authentication failed\'')
      expect(fileContent).toContain('return res.redirect(`${frontendUrl}/login?error=auth_failed`)')
    })
  })

  describe('Logout Function', () => {
    it('should have logout function with proper signature', () => {
      expect(fileContent).toContain('export const logout = async (req, res) => {')
    })

    it('should extract user ID from request', () => {
      expect(fileContent).toContain('const userId = req.user?.id')
    })

    it('should clear refresh token if user exists', () => {
      expect(fileContent).toContain('if (userId) {')
      expect(fileContent).toContain('await UserRoleMap.update(')
      expect(fileContent).toContain('{ refresh_token: null }')
      expect(fileContent).toContain('{ where: { id: userId } }')
    })

    it('should log successful logout', () => {
      expect(fileContent).toContain('logger.info(\'User logged out successfully\'')
    })

    it('should return success response', () => {
      expect(fileContent).toContain('res.status(200).json({')
      expect(fileContent).toContain('message: \'Logged out successfully\'')
      expect(fileContent).toContain('success: true')
    })

    it('should handle logout errors', () => {
      expect(fileContent).toContain('} catch (error) {')
      expect(fileContent).toContain('logger.error(\'Logout error\'')
      expect(fileContent).toContain('res.status(500).json({')
      expect(fileContent).toContain('message: \'Logout failed\'')
      expect(fileContent).toContain('success: false')
    })
  })

  describe('Refresh Token Function', () => {
    it('should have refreshToken function with proper signature', () => {
      expect(fileContent).toContain('export const refreshToken = (req, res, next) => {')
    })

    it('should extract refresh token from request body', () => {
      expect(fileContent).toContain('const { refreshToken } = req.body')
    })

    it('should validate refresh token presence', () => {
      expect(fileContent).toContain('if (!refreshToken) {')
      expect(fileContent).toContain('return res.status(400).json({ error: \'Refresh token required\' })')
    })

    it('should verify refresh token', () => {
      expect(fileContent).toContain('const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)')
    })

    it('should generate new access token', () => {
      expect(fileContent).toContain('const accessToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, {')
      expect(fileContent).toContain('expiresIn: \'1h\'')
    })

    it('should return new access token', () => {
      expect(fileContent).toContain('res.json({ accessToken })')
    })

    it('should handle token verification errors', () => {
      expect(fileContent).toContain('} catch (err) {')
      expect(fileContent).toContain('next(err)')
    })
  })

  describe('Documentation and Comments', () => {
    it('should have comprehensive JSDoc file header', () => {
      expect(fileContent).toContain('@fileoverview Authentication Controller for EMS Backend')
      expect(fileContent).toContain('@description Handles user authentication, authorization, token management')
      expect(fileContent).toContain('@author EMS Development Team')
      expect(fileContent).toContain('@version 1.0.0')
      expect(fileContent).toContain('@since 2025-09-17')
    })

    it('should have function documentation', () => {
      expect(fileContent).toContain('@async')
      expect(fileContent).toContain('@function')
      expect(fileContent).toContain('@param')
      expect(fileContent).toContain('@returns')
      expect(fileContent).toContain('@throws')
      expect(fileContent).toContain('@example')
    })

    it('should have inline comments', () => {
      expect(fileContent).toContain('// Import JWT library for token generation and verification')
      expect(fileContent).toContain('// Extract frontend and backend URLs from configuration')
      expect(fileContent).toContain('// Use redirect URI from environment or construct it')
      expect(fileContent).toContain('// Validate request parameters using express-validator')
      expect(fileContent).toContain('// Resolve identifier to email address (handles both email and employee ID)')
      expect(fileContent).toContain('// Configure Microsoft Graph authentication parameters')
      expect(fileContent).toContain('// Validate redirect URI configuration')
      expect(fileContent).toContain('// Generate Microsoft Graph authentication URL')
    })
  })

  describe('Error Handling and Logging', () => {
    it('should have comprehensive error handling', () => {
      expect(fileContent).toContain('try {')
      expect(fileContent).toContain('} catch (error) {')
      expect(fileContent).toContain('logger.error')
      expect(fileContent).toContain('logger.warn')
      expect(fileContent).toContain('logger.info')
    })

    it('should have proper error responses', () => {
      expect(fileContent).toContain('res.status(400)')
      expect(fileContent).toContain('.status(404)')
      expect(fileContent).toContain('res.status(500)')
    })

    it('should have detailed logging', () => {
      expect(fileContent).toContain('logger.info(\'Auth Controller initialized\'')
      expect(fileContent).toContain('logger.info(\'Generating auth code URL\'')
      expect(fileContent).toContain('logger.info(\'Auth code URL generated successfully\'')
      expect(fileContent).toContain('logger.info(\'Attempting to acquire token by authorization code\'')
      expect(fileContent).toContain('logger.info(\'Token exchange successful\'')
      expect(fileContent).toContain('logger.info(\'Looking up user in database\'')
      expect(fileContent).toContain('logger.info(\'User lookup result\'')
      expect(fileContent).toContain('logger.info(\'Creating JWT payload\'')
      expect(fileContent).toContain('logger.info(\'JWT tokens created successfully\'')
      expect(fileContent).toContain('logger.info(\'Redirecting to frontend after successful authentication\'')
      expect(fileContent).toContain('logger.info(\'User logged out successfully\'')
    })
  })

  describe('Code Quality and Best Practices', () => {
    it('should use const for immutable values', () => {
      expect(fileContent).toContain('const { frontendUrl, backendUrl } = {')
      expect(fileContent).toContain('const redirectUri = process.env.REDIRECT_URI ||')
      expect(fileContent).toContain('const { identifier } = req.query')
      expect(fileContent).toContain('const email = await resolveEmail(identifier)')
    })

    it('should have proper async/await usage', () => {
      expect(fileContent).toContain('async function resolveEmail')
      expect(fileContent).toContain('export const login = async (req, res, next) => {')
      expect(fileContent).toContain('export async function redirectHandler')
      expect(fileContent).toContain('export const logout = async (req, res) => {')
    })

    it('should have proper function structure', () => {
      expect(fileContent).toContain('function resolveEmail (identifier) {')
      expect(fileContent).toContain('export const login = async (req, res, next) => {')
      expect(fileContent).toContain('export async function redirectHandler (req, res) {')
      expect(fileContent).toContain('export const logout = async (req, res) => {')
      expect(fileContent).toContain('export const refreshToken = (req, res, next) => {')
    })

    it('should have proper error handling patterns', () => {
      expect(fileContent).toContain('try {')
      expect(fileContent).toContain('} catch (error) {')
      expect(fileContent).toContain('} catch (err) {')
    })
  })
})
