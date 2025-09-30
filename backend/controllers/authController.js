/**
 * @fileoverview Authentication Controller for EMS Backend
 * @description Handles user authentication, authorization, token management, and Microsoft Graph integration.
 * Provides comprehensive authentication flow including login, logout, token refresh, and user profile management.
 * 
 * @author EMS Development Team
 * @version 1.0.0
 * @since 2025-09-17
 * 
 * @features
 * - Microsoft Graph OAuth 2.0 authentication
 * - JWT token generation and validation
 * - User role-based access control
 * - Token refresh mechanism
 * - Secure logout with token invalidation
 * - Employee ID to email resolution
 * - Comprehensive error handling and logging
 */

// Import JWT library for token generation and verification
import jwt from 'jsonwebtoken'
// Import Sequelize operators for database queries
import { Op } from 'sequelize'
// Import Microsoft Authentication Library client
import msalClient from '../utils/msalConfig.js'
// Import Microsoft Graph service for user profile fetching
import { getUserProfile } from '../utils/graphService.js'
// Import user role mapping model
import UserRoleMap from '../models/UserRoleMap.js'
// Import employee model for email resolution
import Employee from '../models/Employee.js'
// Import logger for comprehensive logging
import logger from '../utils/logger.js'
// Import application configuration
import config from '../config.js'
// Import validation result for request validation
import { validationResult } from 'express-validator'

// Extract frontend and backend URLs from configuration
const { frontendUrl, backendUrl } = {
  frontendUrl: config.urls.frontend,
  backendUrl: config.urls.backend
}

// Use redirect URI from environment or construct it
const redirectUri = process.env.REDIRECT_URI || `${backendUrl}/api/v1/auth/redirect`

// Log the redirect URI for debugging and initialization tracking
logger.info('Auth Controller initialized', {
  redirectUri,
  frontendUrl,
  backendUrl,
  envRedirectUri: process.env.REDIRECT_URI
})

/**
 * Resolves an identifier (email or employee ID) to a valid email address
 * 
 * @async
 * @function resolveEmail
 * @param {string} identifier - The identifier to resolve (email or employee ID)
 * @returns {Promise<string|null>} The resolved email address or null if not found
 * 
 * @description
 * This function handles two types of identifiers:
 * 1. Email addresses: Returns the email in lowercase if it contains '@'
 * 2. Employee IDs: Looks up the employee in the database and returns their contact email
 * 
 * @example
 * // Email identifier
 * const email = await resolveEmail('john.doe@company.com')
 * // Returns: 'john.doe@company.com'
 * 
 * @example
 * // Employee ID identifier
 * const email = await resolveEmail('EMP001')
 * // Returns: 'john.doe@company.com' (if employee exists)
 * 
 * @throws {Error} If database query fails
 */
export async function resolveEmail (identifier) {
  const candidate = identifier.trim()

  if (candidate.includes('@')) {
    return candidate.toLowerCase()
  }
  const employee = await Employee.findOne({
    where: { employee_id: candidate.toUpperCase() }
  })
  return employee?.contact_email?.toLowerCase() || null
}

/**
 * Initiates user login process by generating Microsoft Graph authentication URL
 * 
 * @async
 * @function login
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string} req.query.identifier - User identifier (email or employee ID)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * @description
 * This function handles the initial login step by:
 * 1. Validating the request parameters
 * 2. Resolving the identifier to an email address
 * 3. Generating a Microsoft Graph authentication URL
 * 4. Redirecting the user to Microsoft's authentication page
 * 
 * @returns {Promise<void>} Redirects to Microsoft Graph authentication URL
 * 
 * @throws {Error} If authentication configuration is invalid
 * @throws {Error} If Microsoft Graph service is unavailable
 * 
 * @example
 * // Request: GET /api/v1/auth/login?identifier=john.doe@company.com
 * // Response: Redirect to Microsoft Graph authentication URL
 * 
 * @example
 * // Request: GET /api/v1/auth/login?identifier=EMP001
 * // Response: Redirect to Microsoft Graph authentication URL (if employee exists)
 */
export const login = async (req, res, next) => {
  // Validate request parameters using express-validator
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  // Extract identifier from query parameters
  const { identifier } = req.query

  try {
    // Resolve identifier to email address (handles both email and employee ID)
    const email = await resolveEmail(identifier)
    if (!email) {
      return res
        .status(404)
        .json({ message: 'Unknown employee code or email' })
    }

    // Configure Microsoft Graph authentication parameters
    const authCodeUrlParams = {
      scopes: ['User.Read'],
      redirectUri,
      loginHint: email,
      extraQueryParameters: {
        login_hint: email
      }
    }

    // Log authentication URL generation for debugging
    logger.info('Generating auth code URL', {
      identifier,
      email,
      redirectUri,
      scopes: authCodeUrlParams.scopes,
      envRedirectUri: process.env.REDIRECT_URI,
      backendUrl: process.env.BACKEND_URL
    })

    // Validate redirect URI configuration
    if (!redirectUri || redirectUri.includes('undefined')) {
      logger.error('Invalid redirect URI detected', {
        redirectUri,
        envRedirectUri: process.env.REDIRECT_URI,
        backendUrl: process.env.BACKEND_URL
      })
      return res.status(500).json({
        message: 'Authentication configuration error',
        referenceId: req.id || 'unknown'
      })
    }

    // Generate Microsoft Graph authentication URL
    const authCodeUrl = await msalClient.getAuthCodeUrl(authCodeUrlParams)
    
    logger.info('Auth code URL generated successfully', {
      urlLength: authCodeUrl.length,
      redirectUri,
      authCodeUrl: authCodeUrl.substring(0, 200) + '...' // Log first 200 chars of the URL
    })
    
    return res.redirect(authCodeUrl)
  } catch (error) {
    logger.error('Auth code URL generation failed', { error, identifier })
    return res.status(500).json({
      message: 'Authentication service unavailable',
      referenceId: req.id || 'unknown'
    })
  }
}

/**
 * Handles the OAuth redirect from Microsoft Graph authentication
 * 
 * @async
 * @function redirectHandler
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters from OAuth redirect
 * @param {string} req.query.code - Authorization code from Microsoft Graph
 * @param {Object} res - Express response object
 * 
 * @description
 * This function handles the OAuth callback by:
 * 1. Validating the authorization code
 * 2. Exchanging the code for access tokens
 * 3. Fetching user profile from Microsoft Graph
 * 4. Looking up the user in the local database
 * 5. Generating JWT tokens for the application
 * 6. Redirecting to the frontend with tokens
 * 
 * @returns {Promise<void>} Redirects to frontend with authentication tokens
 * 
 * @throws {Error} If authorization code is missing
 * @throws {Error} If token exchange fails
 * @throws {Error} If user profile cannot be fetched
 * @throws {Error} If user is not found in database
 * 
 * @example
 * // Request: GET /api/v1/auth/redirect?code=abc123...
 * // Response: Redirect to frontend with JWT tokens
 */
export async function redirectHandler (req, res) {
  if (!req.query.code) {
    logger.warn('Missing auth code in redirect')
    return res.redirect(`${frontendUrl}/login?error=invalid_request`)
  }

  const tokenRequest = {
    code: req.query.code,
    scopes: ['User.Read'],
    redirectUri
  }

  try {
    logger.info('Attempting to acquire token by authorization code', {
      code: req.query.code ? 'present' : 'missing',
      redirectUri,
      scopes: tokenRequest.scopes
    })
    
    // Manual token exchange using HTTP request (workaround for MSAL issue)
    const tokenEndpoint = `https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/token`
    
    const tokenRequestBody = new URLSearchParams({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      code: tokenRequest.code,
      redirect_uri: tokenRequest.redirectUri,
      grant_type: 'authorization_code',
      scope: tokenRequest.scopes.join(' ')
    })
    
    logger.info('Exchanging authorization code for tokens manually', {
      tokenEndpoint,
      clientId: process.env.CLIENT_ID?.substring(0, 8) + '...',
      redirectUri: tokenRequest.redirectUri,
      scopes: tokenRequest.scopes
    })
    
    const tokenResponse = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: tokenRequestBody.toString()
    })
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      logger.error('Token exchange failed', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorText
      })
      throw new Error(`Token exchange failed: ${tokenResponse.status} ${tokenResponse.statusText}`)
    }
    
    const authResult = await tokenResponse.json()
    
    logger.info('Token exchange successful', {
      tokenType: authResult.token_type,
      expiresIn: authResult.expires_in,
      scope: authResult.scope
    })

    const profile = await getUserProfile(authResult.access_token)
    const msGraphUserId = profile.id
    const email = (
      profile.mail ||
      profile.userPrincipalName ||
      ''
    ).toLowerCase()

    logger.info('Looking up user in database', {
      msGraphUserId,
      email,
      queryConditions: {
        ms_graph_user_id: msGraphUserId,
        email: email,
        is_active: true
      }
    })

    const user = await UserRoleMap.findOne({
      where: {
        [Op.or]: [{ ms_graph_user_id: msGraphUserId }, { email }],
        is_active: true
      },
      include: ['employee']
    })

    logger.info('User lookup result', {
      userFound: !!user,
      userId: user?.id,
      userEmail: user?.email,
      userRole: user?.role,
      msGraphUserId: user?.ms_graph_user_id
    })

    if (!user) {
      logger.error('User not found in database', {
        msGraphUserId,
        email,
        availableUsers: await UserRoleMap.findAll({
          attributes: ['id', 'employee_id', 'ms_graph_user_id', 'email', 'role', 'is_active']
        })
      })
      return res.redirect(`${frontendUrl}/login?error=not_found`)
    }

    const jwtPayload = {
      id: user.id,
      msGraphUserId: user.ms_graph_user_id,
      email: user.email,
      role: user.role,
      employee: user.employee ? user.employee.id : null
    }

    logger.info('Creating JWT payload', {
      jwtPayload,
      userData: {
        id: user.id,
        ms_graph_user_id: user.ms_graph_user_id,
        email: user.email,
        role: user.role,
        employee_id: user.employee_id,
        employee: user.employee ? user.employee.id : null
      }
    })

    const jwtToken = jwt.sign(jwtPayload, process.env.JWT_SECRET, {
      expiresIn: '1h',
      issuer: 'wellness-extract-auth'
    })

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    )

    logger.info('JWT tokens created successfully', {
      jwtTokenLength: jwtToken.length,
      refreshTokenLength: refreshToken.length,
      payload: jwtPayload
    })

    await UserRoleMap.update(
      { refresh_token: refreshToken },
      { where: { id: user.id } }
    )
    const redirectUrl = `${frontendUrl}/auth/redirect?token=${jwtToken}&refreshToken=${refreshToken}`

    logger.info('Redirecting to frontend after successful authentication', {
      frontendUrl,
      redirectUrl: redirectUrl.substring(0, 200) + '...', // Log first 200 chars to avoid token exposure
      tokenLength: jwtToken.length,
      refreshTokenLength: refreshToken.length,
      userInfo: {
        id: user.id,
        email: user.email,
        role: user.role,
        employeeId: user.employee_id
      }
    })
    
    return res.redirect(redirectUrl)
  } catch (error) {
    logger.error('MSAL authentication failed', { error })
    return res.redirect(`${frontendUrl}/login?error=auth_failed`)
  }
}

/**
 * Logs out a user and invalidates their refresh token
 * 
 * @async
 * @function logout
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object (from middleware)
 * @param {number} req.user.id - User ID
 * @param {Object} res - Express response object
 * 
 * @description
 * This function handles user logout by:
 * 1. Extracting the user ID from the authenticated request
 * 2. Clearing the refresh token from the database
 * 3. Logging the logout action
 * 4. Returning a success response
 * 
 * @returns {Promise<void>} JSON response with logout status
 * 
 * @throws {Error} If database update fails
 * 
 * @example
 * // Request: POST /api/v1/auth/logout (with valid JWT token)
 * // Response: { "message": "Logged out successfully", "success": true }
 */
export const logout = async (req, res) => {
  try {
    const userId = req.user?.id

    if (userId) {
      // Clear refresh token from database
      await UserRoleMap.update(
        { refresh_token: null },
        { where: { id: userId } }
      )

      logger.info('User logged out successfully', { userId })
    }

    res.status(200).json({
      message: 'Logged out successfully',
      success: true
    })
  } catch (error) {
    logger.error('Logout error', {
      error: error.message,
      userId: req.user?.id
    })
    res.status(500).json({
      message: 'Logout failed',
      success: false
    })
  }
}

/**
 * Refreshes JWT access token using a valid refresh token
 * 
 * @function refreshToken
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.refreshToken - Valid refresh token
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * @description
 * This function handles token refresh by:
 * 1. Validating the refresh token presence
 * 2. Verifying the refresh token signature and expiration
 * 3. Extracting the user ID from the refresh token
 * 4. Generating a new access token with the user ID
 * 5. Returning the new access token
 * 
 * @returns {void} JSON response with new access token
 * 
 * @throws {Error} If refresh token is missing
 * @throws {Error} If refresh token is invalid or expired
 * 
 * @example
 * // Request: POST /api/v1/auth/refresh
 * // Body: { "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
 * // Response: { "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
 */
export const refreshToken = (req, res, next) => {
  const { refreshToken } = req.body
  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token required' })
  }
  try {
    // Verify refresh token and issue new access token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
    const accessToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    })
    res.json({ accessToken })
  } catch (err) {
    next(err)
  }
}
