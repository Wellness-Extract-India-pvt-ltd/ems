/**
 * Authentication Controller
 * Handles user registration, login, logout, token refresh, and related auth actions.
 */

import jwt from 'jsonwebtoken';
import msalClient from '../utils/msalConfig.js';
import { getUserProfile } from '../utils/graphService.js';
import UserRoleMap from '../models/UserRoleMap.js';
import Employee from '../models/Employee.js';
import logger from '../utils/logger.js';
import config from '../config.js';
import { validationResult } from 'express-validator';

const { frontendUrl, backendUrl } = config;
const redirectUri = `${backendUrl}/api/v1/auth/redirect`;

async function resolveEmail(identifier) {
  const candidate = identifier.trim();

  if (candidate.includes('@')) {
    return candidate.toLowerCase();
  }
  const employee = await Employee.findOne({ employeeCode: candidate.toUpperCase() });
  return employee?.contactEmail.toLowerCase() || null;
}

/**
 * Registers a new user.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const register = async (req, res, next) => {
  try {
    // Create a new user with the provided request body
    const user = new Employee(req.body);
    await user.save();
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (err) {
    // Pass error to global error handler
    next(err);
  }
};

/**
 * Logs in a user and returns JWT tokens.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { identifier } = req.query;

  try {
    const email = await resolveEmail(identifier);
    if (!email) {
      return res.status(404).json({ message: 'Unknown employee code or email' });
    }

    const authCodeUrlParams = {
      scopes: ['User.Read'],
      redirectUri,
      loginHint: email
    };

    const authCodeUrl = await msalClient.getAuthCodeUrl(authCodeUrlParams);
    return res.redirect(authCodeUrl);
  } catch (error) {
    logger.error('Auth code URL generation failed', { error, identifier });
    return res.status(500).json({
      message: 'Authentication service unavailable',
      referenceId: req.id || 'unknown'
    });
  }
};

/**
 * Handles the redirect from the authentication provider.
 * Exchanges the auth code for tokens and redirects to the frontend.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function redirectHandler(req, res) {
  if (!req.query.code) {
    logger.warn('Missing auth code in redirect');
    return res.redirect(`${frontendUrl}/login?error=invalid_request`);
  }

  const tokenRequest = {
    code: req.query.code,
    scopes: ['User.Read'],
    redirectUri
  };

  try {
    const authResult = await msalClient.acquireTokenByCode(tokenRequest);

    const profile = await getUserProfile(authResult.accessToken);
    const msGraphUserId = profile.id;
    const email = (profile.mail || profile.userPrincipalName || '').toLowerCase();

    const user = await UserRoleMap.findOne({ 
      $or: [
        { msGraphUserId }, 
        { email }
      ], 
      isActive: true 
    }).populate('employee');

    if (!user) {
      return res.redirect(`${frontendUrl}/login?error=not_found`);
    }

    const jwtPayload = {
      id: user._id,
      msGraphUserId: user.msGraphUserId,
      email: user.email,
      role: user.role,
      employee: user.employee ? user.employee._id : null
    };

    console.log("JWT ", jwtPayload);

   const jwtToken = jwt.sign(
      jwtPayload,
      process.env.JWT_SECRET,
      {
        expiresIn: '1h',
        issuer: 'wellness-extract-auth'
      }
    );

    console.log("Token ", jwtToken);

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    console.log("Refresh Token", refreshToken);
    
    await UserRoleMap.findByIdAndUpdate(user._id, { refreshToken });
    console.log("Have fun");
    return res.redirect(`${frontendUrl}/auth/redirect?token=${jwtToken}&refreshToken=${refreshToken}`);
  } catch (error) {
    logger.error('MSAL authentication failed', { error });
    return res.redirect(`${frontendUrl}/login?error=auth_failed`);
  }
}

/**
 * Logs out a user.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const logout = (req, res) => {
  // Invalidate refresh token on client side (stateless JWT)
  res.status(200).json({ message: 'Logged out successfully' });
};

/**
 * Refreshes JWT access token using a valid refresh token.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const refreshToken = (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token required' });
  }
  try {
    // Verify refresh token and issue new access token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const accessToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ accessToken });
  } catch (err) {
    next(err);
  }
};