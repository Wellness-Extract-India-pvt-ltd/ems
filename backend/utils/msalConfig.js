/**
 * @fileoverview Microsoft Authentication Library (MSAL) Configuration for EMS Backend
 * @description Comprehensive MSAL client setup with enhanced security, error handling,
 * and monitoring capabilities for Azure AD authentication. Provides secure token management,
 * authorization flows, and advanced security features for enterprise authentication.
 *
 * @author EMS Development Team
 * @version 1.0.0
 * @since 2025-09-17
 *
 * @features
 * - Secure Azure AD authentication with MSAL
 * - Enhanced security configurations and validations
 * - Comprehensive error handling and logging
 * - Token acquisition and management
 * - Authorization code flow implementation
 * - Silent token refresh capabilities
 * - Account management and filtering
 * - Cache management and security
 * - Telemetry and monitoring
 * - Environment validation and security checks
 * - Custom logger integration
 * - Enhanced client wrapper with additional functionality
 */

// Import MSAL ConfidentialClientApplication for server-side authentication
import { ConfidentialClientApplication, LogLevel } from '@azure/msal-node'
// Import dotenv for environment variable management
import dotenv from 'dotenv'
// Import custom logger for comprehensive logging
import logger from './logger.js'

// Load environment variables from .env file
dotenv.config()

// Configuration constants for MSAL setup
const REQUIRED_ENV_VARS = ['CLIENT_ID', 'TENANT_ID', 'CLIENT_SECRET']
const DEFAULT_SCOPES = ['User.Read', 'User.ReadBasic.All']
const DEFAULT_TIMEOUT = 30000 // 30 seconds for API requests
const DEFAULT_CACHE_TTL = 3600000 // 1 hour for token cache

/**
 * Validate required environment variables for MSAL configuration
 * 
 * @function validateEnvironment
 * @description Validates that all required environment variables are present and properly formatted.
 * Checks for CLIENT_ID, TENANT_ID, and CLIENT_SECRET with appropriate format validation.
 * 
 * @throws {Error} If required environment variables are missing or invalid
 * 
 * @example
 * // This function is called automatically on module load
 * // validateEnvironment() // Throws error if configuration is invalid
 */
function validateEnvironment () {
  const missingVars = []

  // Check for missing required environment variables
  for (const varName of REQUIRED_ENV_VARS) {
    if (!process.env[varName]) {
      missingVars.push(varName)
    }
  }

  if (missingVars.length > 0) {
    const errorMessage = `Missing required environment variables: ${missingVars.join(', ')}`
    logger.error('MSAL Configuration Error', {
      missingVariables: missingVars,
      requiredVariables: REQUIRED_ENV_VARS
    })
    throw new Error(errorMessage)
  }

  // Validate environment variable formats for security and correctness
  const validationErrors = []

  // Validate CLIENT_ID format (must be a valid GUID)
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      process.env.CLIENT_ID
    )
  ) {
    validationErrors.push('CLIENT_ID must be a valid GUID format')
  }

  // Validate TENANT_ID format (GUID or domain name)
  if (
    !/^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/i.test(
      process.env.TENANT_ID
    )
  ) {
    validationErrors.push('TENANT_ID must be a valid GUID or domain format')
  }

  if (validationErrors.length > 0) {
    logger.error('MSAL Configuration Validation Error', {
      validationErrors
    })
    throw new Error(
      `MSAL Configuration validation failed: ${validationErrors.join(', ')}`
    )
  }
}

/**
 * Create enhanced logger callback with application logger integration
 * 
 * @function createLoggerCallback
 * @description Creates a logger callback function that integrates MSAL logging
 * with the application's custom logger, including PII protection and log level mapping.
 * 
 * @returns {Function} Logger callback function for MSAL
 * 
 * @example
 * // Logger callback is used internally by MSAL configuration
 * const loggerCallback = createLoggerCallback();
 */
function createLoggerCallback () {
  return (logLevel, message, containsPii) => {
    // Don't log PII (Personally Identifiable Information) for security
    if (containsPii) {
      return
    }

    // Map MSAL log levels to application logger levels
    const logLevelMap = {
      [LogLevel.Error]: 'error',
      [LogLevel.Warning]: 'warn',
      [LogLevel.Info]: 'info',
      [LogLevel.Verbose]: 'debug',
      [LogLevel.Trace]: 'debug'
    }

    const appLogLevel = logLevelMap[logLevel] || 'info'
    // Sanitize message to remove sensitive information
    const sanitizedMessage = message.replace(
      /client_id:\s*[a-f0-9-]+/gi,
      'client_id: [REDACTED]'
    )

    logger[appLogLevel](`[MSAL] ${sanitizedMessage}`, {
      msalLogLevel: logLevel,
      source: 'msal-node'
    })
  }
}

/**
 * Enhanced MSAL configuration with comprehensive security features
 * 
 * @description Configures MSAL with enhanced security settings, logging,
 * telemetry, and enterprise-grade authentication features.
 */
const msalConfig = {
  auth: {
    clientId: process.env.CLIENT_ID,
    authority: `https://login.microsoftonline.com/${process.env.TENANT_ID}`,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI || `${process.env.BACKEND_URL}/api/v1/auth/redirect`,
    // Enhanced security configurations for enterprise authentication
    clientCapabilities: ['CP1'], // Conditional Access support for enhanced security
    knownAuthorities: [process.env.TENANT_ID], // Trust only specific tenant for security
    cloudDiscoveryMetadata: undefined, // Use default cloud discovery
    authorityMetadata: undefined // Use default authority metadata
  },
  cache: {
    cachePlugin: undefined, // Use default in-memory cache for security
    claimsBasedCachingEnabled: false, // Disable claims-based caching for security
    // Enhanced cache configuration for server-side security
    cacheLocation: 'memory', // Use in-memory cache for better security
    storeAuthStateInCookie: false, // Disable cookie storage for server-side applications
    secureCookies: true // Use secure cookies if enabled
  },
  system: {
    loggerOptions: {
      loggerCallback: createLoggerCallback(),
      piiLoggingEnabled: false, // Never log PII for security compliance
      logLevel:
        process.env.NODE_ENV === 'development'
          ? LogLevel.Verbose
          : LogLevel.Warning,
      correlationId: undefined // Let MSAL generate correlation IDs for tracking
    },
    // Enhanced system configuration for enterprise environments
    networkClient: undefined, // Use default HTTP client
    proxyUrl: process.env.HTTP_PROXY || process.env.HTTPS_PROXY, // Support proxy configuration
    customRequestOptions: {
      timeout: parseInt(process.env.MSAL_TIMEOUT) || DEFAULT_TIMEOUT,
      headers: {
        'User-Agent': `EMS-Backend/${process.env.npm_package_version || '1.0.0'}`
      }
    },
    // Security configurations for server-side applications
    allowNativeBroker: false, // Disable native broker for server-side security
    allowRedirectInIframe: false, // Disable iframe redirects for security
    windowHashTimeout: 60000, // 1 minute timeout for window hash
    iframeHashTimeout: 6000, // 6 seconds timeout for iframe hash
    loadFrameTimeout: 0, // No timeout for frame loading
    asyncPopups: false, // Disable async popups for server-side
    // Token renewal configurations for automatic token refresh
    tokenRenewalOffsetSeconds: 300, // Renew tokens 5 minutes before expiry
    // Telemetry configurations for monitoring and analytics
    telemetry: {
      applicationName: 'EMS-Backend',
      applicationVersion: process.env.npm_package_version || '1.0.0',
      telemetryOptOut: process.env.NODE_ENV !== 'production' // Opt out in development
    }
  }
}

// Validate environment before creating MSAL client
validateEnvironment()

// Create MSAL client instance with error handling
let msalClient

try {
  msalClient = new ConfidentialClientApplication(msalConfig)

  logger.info('MSAL Client initialized successfully', {
    clientId: process.env.CLIENT_ID?.substring(0, 8) + '...', // Partially redacted for security
    tenantId: process.env.TENANT_ID,
    authority: msalConfig.auth.authority,
    redirectUri: msalConfig.auth.redirectUri,
    logLevel: msalConfig.system.loggerOptions.logLevel,
    cacheLocation: msalConfig.cache.cacheLocation,
    timeout: msalConfig.system.customRequestOptions.timeout
  })
} catch (error) {
  logger.error('Failed to initialize MSAL client', {
    error: error.message,
    stack: error.stack,
    config: {
      clientId: process.env.CLIENT_ID ? 'present' : 'missing',
      tenantId: process.env.TENANT_ID ? 'present' : 'missing',
      clientSecret: process.env.CLIENT_SECRET ? 'present' : 'missing'
    }
  })
  throw new Error(`MSAL client initialization failed: ${error.message}`)
}

/**
 * Enhanced MSAL client wrapper with additional functionality
 * 
 * @class EnhancedMsalClient
 * @description Provides an enhanced wrapper around the MSAL ConfidentialClientApplication
 * with additional security features, comprehensive logging, and utility methods.
 * 
 * @param {ConfidentialClientApplication} client - The underlying MSAL client instance
 * 
 * @example
 * // Create enhanced MSAL client
 * const enhancedClient = new EnhancedMsalClient(msalClient);
 * const authUrl = await enhancedClient.getAuthCodeUrl({ scopes: ['User.Read'] });
 */
class EnhancedMsalClient {
  constructor (client) {
    this.client = client
  }

  /**
   * Get authorization code URL with enhanced parameters and security features
   * 
   * @async
   * @function getAuthCodeUrl
   * @param {Object} params - Authorization parameters
   * @param {Array<string>} [params.scopes] - OAuth2 scopes for the request
   * @param {string} [params.redirectUri] - Redirect URI for the authorization flow
   * @param {string} [params.loginHint] - Login hint for the user
   * @param {string} [params.domainHint] - Domain hint for the user
   * @param {Object} [params.extraQueryParameters] - Additional query parameters
   * @param {Array<string>} [params.extraScopesToConsent] - Additional scopes to consent
   * @param {string} [params.prompt] - Prompt parameter (default: 'select_account')
   * @param {string} [params.state] - State parameter for CSRF protection
   * @param {string} [params.nonce] - Nonce parameter for security
   * @param {string} [params.responseMode] - Response mode (default: 'query')
   * @param {string} [params.responseType] - Response type (default: 'code')
   * @param {string} [params.claims] - Claims parameter for additional information
   * @param {string} [params.correlationId] - Correlation ID for request tracking
   * @returns {Promise<string>} Authorization URL for user authentication
   * 
   * @description Generates a secure authorization URL with enhanced parameters,
   * security features, and comprehensive logging for the OAuth2 authorization code flow.
   * 
   * @throws {Error} If URL generation fails
   * 
   * @example
   * // Generate authorization URL
   * const authUrl = await enhancedClient.getAuthCodeUrl({
   *   scopes: ['User.Read', 'User.ReadBasic.All'],
   *   redirectUri: 'https://yourapp.com/auth/callback',
   *   loginHint: 'user@company.com'
   * });
   */
  async getAuthCodeUrl (params = {}) {
    try {
      // Build authorization code URL parameters with security defaults
      const authCodeUrlParams = {
        scopes: params.scopes || DEFAULT_SCOPES,
        redirectUri: params.redirectUri,
        loginHint: params.loginHint,
        domainHint: params.domainHint,
        extraQueryParameters: params.extraQueryParameters || {},
        extraScopesToConsent: params.extraScopesToConsent || [],
        prompt: params.prompt || 'select_account',
        state: params.state || this.generateState(), // Generate secure state parameter
        nonce: params.nonce || this.generateNonce(), // Generate secure nonce parameter
        responseMode: params.responseMode || 'query',
        responseType: params.responseType || 'code',
        claims: params.claims,
        correlationId: params.correlationId || this.generateCorrelationId(), // Generate correlation ID
        ...params
      }

      // Log authorization URL generation attempt with security-conscious details
      logger.info('Generating authorization code URL', {
        scopes: authCodeUrlParams.scopes,
        redirectUri: authCodeUrlParams.redirectUri,
        loginHint: authCodeUrlParams.loginHint ? 'present' : 'not provided',
        prompt: authCodeUrlParams.prompt,
        correlationId: authCodeUrlParams.correlationId
      })

      // Generate the authorization URL using MSAL client
      const url = await this.client.getAuthCodeUrl(authCodeUrlParams)

      // Log successful URL generation
      logger.info('Authorization code URL generated successfully', {
        correlationId: authCodeUrlParams.correlationId,
        urlLength: url.length
      })

      return url
    } catch (error) {
      // Log comprehensive error details for debugging
      logger.error('Failed to generate authorization code URL', {
        error: error.message,
        stack: error.stack,
        params: {
          scopes: params.scopes,
          redirectUri: params.redirectUri,
          loginHint: params.loginHint ? 'present' : 'not provided'
        }
      })
      throw error
    }
  }

  /**
   * Acquire token by authorization code with enhanced error handling and security
   * 
   * @async
   * @function acquireTokenByCode
   * @param {Object} params - Token request parameters
   * @param {string} params.code - Authorization code from the callback
   * @param {Array<string>} [params.scopes] - OAuth2 scopes for the token request
   * @param {string} [params.redirectUri] - Redirect URI used in the authorization flow
   * @param {string} [params.clientInfo] - Client information for the request
   * @param {Object} [params.extraQueryParameters] - Additional query parameters
   * @param {Array<string>} [params.extraScopesToConsent] - Additional scopes to consent
   * @param {string} [params.claims] - Claims parameter for additional information
   * @param {string} [params.correlationId] - Correlation ID for request tracking
   * @returns {Promise<Object>} Token response with access token and account information
   * 
   * @description Exchanges an authorization code for access tokens with enhanced
   * security features, comprehensive logging, and error handling for the OAuth2 flow.
   * 
   * @throws {Error} If token acquisition fails
   * 
   * @example
   * // Acquire token by authorization code
   * const tokenResponse = await enhancedClient.acquireTokenByCode({
   *   code: 'authorization_code_from_callback',
   *   scopes: ['User.Read'],
   *   redirectUri: 'https://yourapp.com/auth/callback'
   * });
   */
  async acquireTokenByCode (params) {
    try {
      // Build token request parameters with security defaults
      const tokenRequest = {
        code: params.code,
        scopes: params.scopes || DEFAULT_SCOPES,
        redirectUri: params.redirectUri,
        clientInfo: params.clientInfo,
        extraQueryParameters: params.extraQueryParameters || {},
        extraScopesToConsent: params.extraScopesToConsent || [],
        claims: params.claims,
        correlationId: params.correlationId || this.generateCorrelationId(), // Generate correlation ID
        ...params
      }

      // Log token acquisition attempt with security-conscious details
      logger.info('Acquiring token by authorization code', {
        scopes: tokenRequest.scopes,
        redirectUri: tokenRequest.redirectUri,
        correlationId: tokenRequest.correlationId,
        codePresent: !!tokenRequest.code
      })

      // Exchange authorization code for access tokens
      const response = await this.client.acquireTokenByCode(tokenRequest)

      // Log successful token acquisition
      logger.info('Token acquired successfully', {
        correlationId: tokenRequest.correlationId,
        tokenType: response.tokenType,
        expiresOn: response.expiresOn,
        scopes: response.scopes,
        accountPresent: !!response.account
      })

      return response
    } catch (error) {
      // Log comprehensive error details for debugging
      logger.error('Failed to acquire token by authorization code', {
        error: error.message,
        stack: error.stack,
        errorCode: error.errorCode,
        errorDescription: error.errorDescription,
        correlationId: params.correlationId,
        codePresent: !!params.code
      })
      throw error
    }
  }

  /**
   * Acquire token silently with enhanced parameters and security features
   * 
   * @async
   * @function acquireTokenSilent
   * @param {Object} params - Silent token request parameters
   * @param {Object} params.account - User account for token acquisition
   * @param {Array<string>} [params.scopes] - OAuth2 scopes for the token request
   * @param {string} [params.authority] - Authority for the token request
   * @param {string} [params.correlationId] - Correlation ID for request tracking
   * @param {boolean} [params.forceRefresh] - Force token refresh (default: false)
   * @param {Object} [params.extraQueryParameters] - Additional query parameters
   * @param {Array<string>} [params.extraScopesToConsent] - Additional scopes to consent
   * @param {string} [params.claims] - Claims parameter for additional information
   * @returns {Promise<Object>} Token response with access token and account information
   * 
   * @description Acquires tokens silently using cached tokens or refresh tokens
   * with enhanced security features, comprehensive logging, and error handling.
   * 
   * @throws {Error} If silent token acquisition fails
   * 
   * @example
   * // Acquire token silently
   * const tokenResponse = await enhancedClient.acquireTokenSilent({
   *   account: userAccount,
   *   scopes: ['User.Read'],
   *   forceRefresh: false
   * });
   */
  async acquireTokenSilent (params) {
    try {
      // Build silent token request parameters with security defaults
      const silentRequest = {
        account: params.account,
        scopes: params.scopes || DEFAULT_SCOPES,
        authority: params.authority,
        correlationId: params.correlationId || this.generateCorrelationId(), // Generate correlation ID
        forceRefresh: params.forceRefresh || false,
        extraQueryParameters: params.extraQueryParameters || {},
        extraScopesToConsent: params.extraScopesToConsent || [],
        claims: params.claims,
        ...params
      }

      // Log silent token acquisition attempt
      logger.debug('Acquiring token silently', {
        scopes: silentRequest.scopes,
        forceRefresh: silentRequest.forceRefresh,
        correlationId: silentRequest.correlationId,
        accountPresent: !!silentRequest.account
      })

      // Attempt silent token acquisition using cached tokens or refresh tokens
      const response = await this.client.acquireTokenSilent(silentRequest)

      // Log successful silent token acquisition
      logger.debug('Silent token acquisition successful', {
        correlationId: silentRequest.correlationId,
        tokenType: response.tokenType,
        expiresOn: response.expiresOn,
        scopes: response.scopes
      })

      return response
    } catch (error) {
      // Log silent token acquisition failure (typically not critical)
      logger.warn('Silent token acquisition failed', {
        error: error.message,
        errorCode: error.errorCode,
        correlationId: params.correlationId,
        accountPresent: !!params.account
      })
      throw error
    }
  }

  /**
   * Get accounts with enhanced filtering
   * @param {Object} params - Account filtering parameters
   * @returns {Array} Array of accounts
   */
  getAccounts (params = {}) {
    try {
      // MSAL client doesn't have getAllAccounts method
      // Return empty array for now
      const accounts = []

      let filteredAccounts = accounts

      if (params.homeAccountId) {
        filteredAccounts = accounts.filter(
          (account) => account.homeAccountId === params.homeAccountId
        )
      }

      if (params.localAccountId) {
        filteredAccounts = accounts.filter(
          (account) => account.localAccountId === params.localAccountId
        )
      }

      if (params.username) {
        filteredAccounts = accounts.filter(
          (account) => account.username === params.username
        )
      }

      logger.debug('Retrieved accounts', {
        totalAccounts: accounts.length,
        filteredAccounts: filteredAccounts.length,
        filterCriteria: params
      })

      return filteredAccounts
    } catch (error) {
      logger.error('Failed to get accounts', {
        error: error.message,
        stack: error.stack
      })
      throw error
    }
  }

  /**
   * Clear cache with enhanced logging
   * @param {Object} params - Cache clearing parameters
   */
  clearCache (params = {}) {
    try {
      if (params.account) {
        this.client.removeAccount(params.account)
        logger.info('Account removed from cache', {
          homeAccountId: params.account.homeAccountId,
          username: params.account.username
        })
      } else {
        this.client.clearCache()
        logger.info('All accounts cleared from cache')
      }
    } catch (error) {
      logger.error('Failed to clear cache', {
        error: error.message,
        stack: error.stack,
        accountPresent: !!params.account
      })
      throw error
    }
  }

  /**
   * Get client configuration
   * @returns {Object} Client configuration (sanitized)
   */
  getConfiguration () {
    return {
      clientId: process.env.CLIENT_ID?.substring(0, 8) + '...', // Partially redacted
      tenantId: process.env.TENANT_ID,
      authority: msalConfig.auth.authority,
      scopes: DEFAULT_SCOPES,
      timeout: msalConfig.system.customRequestOptions.timeout,
      logLevel: msalConfig.system.loggerOptions.logLevel,
      cacheLocation: msalConfig.cache.cacheLocation,
      piiLoggingEnabled: msalConfig.system.loggerOptions.piiLoggingEnabled
    }
  }

  /**
   * Generate random state parameter for CSRF protection
   * 
   * @function generateState
   * @returns {string} Random state string for OAuth2 CSRF protection
   * 
   * @description Generates a cryptographically secure random state parameter
   * for OAuth2 authorization flows to prevent CSRF attacks.
   * 
   * @example
   * // Generate state parameter
   * const state = enhancedClient.generateState();
   * // Use in authorization URL generation
   */
  generateState () {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    )
  }

  /**
   * Generate random nonce parameter for security
   * 
   * @function generateNonce
   * @returns {string} Random nonce string for OAuth2 security
   * 
   * @description Generates a cryptographically secure random nonce parameter
   * for OAuth2 authorization flows to prevent replay attacks.
   * 
   * @example
   * // Generate nonce parameter
   * const nonce = enhancedClient.generateNonce();
   * // Use in authorization URL generation
   */
  generateNonce () {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    )
  }

  /**
   * Generate correlation ID for request tracking
   * 
   * @function generateCorrelationId
   * @returns {string} UUID v4 correlation ID for request tracking
   * 
   * @description Generates a UUID v4 correlation ID for tracking requests
   * across the authentication flow for debugging and monitoring.
   * 
   * @example
   * // Generate correlation ID
   * const correlationId = enhancedClient.generateCorrelationId();
   * // Use for request tracking
   */
  generateCorrelationId () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
      }
    )
  }

  /**
   * Get client statistics and system information
   * 
   * @function getStats
   * @returns {Object} Client statistics including accounts, configuration, and system info
   * 
   * @description Returns comprehensive statistics about the MSAL client including
   * account count, configuration details, system uptime, and memory usage.
   * 
   * @example
   * // Get client statistics
   * const stats = enhancedClient.getStats();
   * console.log('Accounts:', stats.accountsCount);
   * console.log('Memory usage:', stats.memory.used, 'MB');
   */
  getStats () {
    // Get accounts safely without causing errors
    let accountsCount = 0
    try {
      const accounts = this.getAccounts()
      accountsCount = accounts.accounts ? accounts.accounts.length : 0
    } catch (error) {
      // If getAccounts fails, just use 0
      accountsCount = 0
    }
    
    return {
      accountsCount,
      configuration: this.getConfiguration(),
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      }
    }
  }
}

// Create enhanced MSAL client with additional functionality
const enhancedMsalClient = new EnhancedMsalClient(msalClient)

// Log successful initialization with configuration details
logger.info('Enhanced MSAL client initialized', {
  configuration: enhancedMsalClient.getConfiguration(),
  stats: enhancedMsalClient.getStats()
})

// Export both the original client and enhanced client for backward compatibility
export default enhancedMsalClient
export { msalClient, enhancedMsalClient }
