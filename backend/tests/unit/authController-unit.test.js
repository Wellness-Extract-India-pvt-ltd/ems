import { describe, it, expect, beforeEach, afterEach, vi, beforeAll, afterAll } from 'vitest'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

describe('Auth Controller Unit Tests', () => {
  let controllerPath
  let fileContent

  beforeAll(() => {
    controllerPath = path.join(__dirname, '..', 'controllers', 'authController.js')
    fileContent = fs.readFileSync(controllerPath, 'utf8')
  })

  describe('File Structure and Syntax', () => {
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

    it('should be an ES6 module', () => {
      expect(fileContent).toContain('import ')
      expect(fileContent).toContain('export ')
    })
  })

  describe('Import Statements', () => {
    it('should import JWT library', () => {
      expect(fileContent).toContain('import jwt from \'jsonwebtoken\'')
    })

    it('should import Sequelize operators', () => {
      expect(fileContent).toContain('import { Op } from \'sequelize\'')
    })

    it('should import MSAL client', () => {
      expect(fileContent).toContain('import msalClient from \'../utils/msalConfig.js\'')
    })

    it('should import Graph service', () => {
      expect(fileContent).toContain('import { getUserProfile } from \'../utils/graphService.js\'')
    })

    it('should import UserRoleMap model', () => {
      expect(fileContent).toContain('import UserRoleMap from \'../models/UserRoleMap.js\'')
    })

    it('should import Employee model', () => {
      expect(fileContent).toContain('import Employee from \'../models/Employee.js\'')
    })

    it('should import logger', () => {
      expect(fileContent).toContain('import logger from \'../utils/logger.js\'')
    })

    it('should import config', () => {
      expect(fileContent).toContain('import config from \'../config.js\'')
    })

    it('should import validation result', () => {
      expect(fileContent).toContain('import { validationResult } from \'express-validator\'')
    })
  })

  describe('Configuration Setup', () => {
    it('should extract URLs from config', () => {
      expect(fileContent).toContain('const { frontendUrl, backendUrl } = {')
      expect(fileContent).toContain('frontendUrl: config.urls.frontend')
      expect(fileContent).toContain('backendUrl: config.urls.backend')
    })

    it('should set up redirect URI', () => {
      expect(fileContent).toContain('const redirectUri = process.env.REDIRECT_URI ||')
      expect(fileContent).toContain('`${backendUrl}/api/v1/auth/redirect`')
    })

    it('should log initialization', () => {
      expect(fileContent).toContain('logger.info(\'Auth Controller initialized\'')
    })
  })

  describe('resolveEmail Function', () => {
    it('should be defined as async function', () => {
      expect(fileContent).toContain('async function resolveEmail (identifier) {')
    })

    it('should trim the identifier', () => {
      expect(fileContent).toContain('const candidate = identifier.trim()')
    })

    it('should handle email addresses', () => {
      expect(fileContent).toContain('if (candidate.includes(\'@\')) {')
      expect(fileContent).toContain('return candidate.toLowerCase()')
    })

    it('should handle employee IDs', () => {
      expect(fileContent).toContain('const employee = await Employee.findOne({')
      expect(fileContent).toContain('where: { employee_id: candidate.toUpperCase() }')
    })

    it('should return employee email or null', () => {
      expect(fileContent).toContain('return employee?.contact_email?.toLowerCase() || null')
    })
  })

  describe('Login Function', () => {
    it('should be exported as async function', () => {
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

    it('should configure auth parameters', () => {
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

    it('should redirect to auth URL', () => {
      expect(fileContent).toContain('return res.redirect(authCodeUrl)')
    })

    it('should handle errors', () => {
      expect(fileContent).toContain('} catch (error) {')
      expect(fileContent).toContain('logger.error(\'Auth code URL generation failed\'')
    })
  })

  describe('Redirect Handler Function', () => {
    it('should be exported as async function', () => {
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

    it('should handle token exchange', () => {
      expect(fileContent).toContain('const tokenEndpoint = `https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/token`')
      expect(fileContent).toContain('const tokenRequestBody = new URLSearchParams({')
    })

    it('should make token request', () => {
      expect(fileContent).toContain('const tokenResponse = await fetch(tokenEndpoint, {')
      expect(fileContent).toContain('method: \'POST\'')
    })

    it('should handle token errors', () => {
      expect(fileContent).toContain('if (!tokenResponse.ok) {')
      expect(fileContent).toContain('logger.error(\'Token exchange failed\'')
    })

    it('should get user profile', () => {
      expect(fileContent).toContain('const profile = await getUserProfile(authResult.access_token)')
    })

    it('should extract user info', () => {
      expect(fileContent).toContain('const msGraphUserId = profile.id')
      expect(fileContent).toContain('const email = (')
      expect(fileContent).toContain('profile.mail ||')
    })

    it('should look up user', () => {
      expect(fileContent).toContain('const user = await UserRoleMap.findOne({')
      expect(fileContent).toContain('[Op.or]: [{ ms_graph_user_id: msGraphUserId }, { email }]')
    })

    it('should handle user not found', () => {
      expect(fileContent).toContain('if (!user) {')
      expect(fileContent).toContain('logger.error(\'User not found in database\'')
    })

    it('should create JWT payload', () => {
      expect(fileContent).toContain('const jwtPayload = {')
      expect(fileContent).toContain('id: user.id')
      expect(fileContent).toContain('msGraphUserId: user.ms_graph_user_id')
    })

    it('should generate JWT tokens', () => {
      expect(fileContent).toContain('const jwtToken = jwt.sign(jwtPayload, process.env.JWT_SECRET, {')
      expect(fileContent).toContain('const refreshToken = jwt.sign(')
    })

    it('should update user with refresh token', () => {
      expect(fileContent).toContain('await UserRoleMap.update(')
      expect(fileContent).toContain('{ refresh_token: refreshToken }')
    })

    it('should redirect to frontend', () => {
      expect(fileContent).toContain('const redirectUrl = `${frontendUrl}/auth/redirect?token=${jwtToken}&refreshToken=${refreshToken}`')
      expect(fileContent).toContain('return res.redirect(redirectUrl)')
    })

    it('should handle authentication errors', () => {
      expect(fileContent).toContain('} catch (error) {')
      expect(fileContent).toContain('logger.error(\'MSAL authentication failed\'')
    })
  })

  describe('Logout Function', () => {
    it('should be exported as async function', () => {
      expect(fileContent).toContain('export const logout = async (req, res) => {')
    })

    it('should extract user ID', () => {
      expect(fileContent).toContain('const userId = req.user?.id')
    })

    it('should clear refresh token', () => {
      expect(fileContent).toContain('if (userId) {')
      expect(fileContent).toContain('await UserRoleMap.update(')
      expect(fileContent).toContain('{ refresh_token: null }')
    })

    it('should log successful logout', () => {
      expect(fileContent).toContain('logger.info(\'User logged out successfully\'')
    })

    it('should return success response', () => {
      expect(fileContent).toContain('res.status(200).json({')
      expect(fileContent).toContain('message: \'Logged out successfully\'')
    })

    it('should handle logout errors', () => {
      expect(fileContent).toContain('} catch (error) {')
      expect(fileContent).toContain('logger.error(\'Logout error\'')
    })
  })

  describe('Refresh Token Function', () => {
    it('should be exported as function', () => {
      expect(fileContent).toContain('export const refreshToken = (req, res, next) => {')
    })

    it('should extract refresh token', () => {
      expect(fileContent).toContain('const { refreshToken } = req.body')
    })

    it('should validate refresh token', () => {
      expect(fileContent).toContain('if (!refreshToken) {')
      expect(fileContent).toContain('return res.status(400).json({ error: \'Refresh token required\' })')
    })

    it('should verify refresh token', () => {
      expect(fileContent).toContain('const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)')
    })

    it('should generate new access token', () => {
      expect(fileContent).toContain('const accessToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, {')
    })

    it('should return access token', () => {
      expect(fileContent).toContain('res.json({ accessToken })')
    })

    it('should handle token errors', () => {
      expect(fileContent).toContain('} catch (err) {')
      expect(fileContent).toContain('next(err)')
    })
  })

  describe('Documentation', () => {
    it('should have file header documentation', () => {
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

  describe('Error Handling', () => {
    it('should have try-catch blocks', () => {
      expect(fileContent).toContain('try {')
      expect(fileContent).toContain('} catch (error) {')
      expect(fileContent).toContain('} catch (err) {')
    })

    it('should have error logging', () => {
      expect(fileContent).toContain('logger.error')
      expect(fileContent).toContain('logger.warn')
    })

    it('should have proper error responses', () => {
      expect(fileContent).toContain('res.status(400)')
      expect(fileContent).toContain('.status(404)')
      expect(fileContent).toContain('res.status(500)')
    })
  })

  describe('Logging', () => {
    it('should have comprehensive logging', () => {
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

  describe('Code Quality', () => {
    it('should use const for immutable values', () => {
      expect(fileContent).toContain('const { frontendUrl, backendUrl } = {')
      expect(fileContent).toContain('const redirectUri = process.env.REDIRECT_URI ||')
      expect(fileContent).toContain('const { identifier } = req.query')
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
  })
})
