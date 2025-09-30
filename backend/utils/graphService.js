/**
 * @fileoverview Microsoft Graph Service for EMS Backend
 * @description Comprehensive Microsoft Graph API service with integrated token management,
 * user operations, license management, and organizational data retrieval.
 * Provides robust error handling, retry mechanisms, and automatic token refresh capabilities.
 *
 * @author EMS Development Team
 * @version 1.0.0
 * @since 2025-09-17
 *
 * @features
 * - Automatic access token acquisition and refresh
 * - Token caching with expiration management
 * - Comprehensive error handling and retry mechanisms
 * - User profile and organizational data retrieval
 * - License assignment and management
 * - User creation, update, and deletion operations
 * - Group membership and manager hierarchy operations
 * - Search and discovery capabilities
 * - Rate limiting and timeout handling
 * - Request/response interceptors for logging
 */

// Import Axios for HTTP client operations
import axios from 'axios';
// Import dotenv for environment variable management
import dotenv from 'dotenv';
// Import logger for comprehensive logging and monitoring
import logger from './logger.js';

// Load environment variables from .env file
dotenv.config();

// Microsoft Graph API configuration constants
const GRAPH_API_BASE_URL = 'https://graph.microsoft.com/v1.0';
const GRAPH_API_BETA_URL = 'https://graph.microsoft.com/beta';
const DEFAULT_TIMEOUT = 10000; // 10 seconds for API requests
const TOKEN_TIMEOUT = 30000; // 30 seconds for token acquisition
const MAX_RETRIES = 3; // Maximum retry attempts for failed requests
const RETRY_DELAY = 1000; // 1 second base delay between retries
const DEFAULT_CACHE_TTL = 3300000; // 55 minutes (tokens expire in 1 hour)

// Required environment variables for Microsoft Graph authentication
const REQUIRED_ENV_VARS = ['TENANT_ID', 'CLIENT_ID', 'CLIENT_SECRET'];

// Token cache for storing and managing access tokens
let tokenCache = {
  token: null, // Current access token
  expiresAt: null, // Token expiration timestamp
  refreshPromise: null, // Promise for ongoing token refresh
};

/**
 * Validate required environment variables for Microsoft Graph token acquisition
 *
 * @function validateTokenEnvironment
 * @description Validates that all required environment variables are present and properly formatted.
 * Checks for TENANT_ID, CLIENT_ID, and CLIENT_SECRET with appropriate format validation.
 *
 * @throws {Error} If required environment variables are missing or invalid
 *
 * @example
 * // This function is called automatically on module load
 * // validateTokenEnvironment() // Throws error if configuration is invalid
 */
function validateTokenEnvironment() {
  // Check for missing environment variables
  const missingVars = [];

  for (const varName of REQUIRED_ENV_VARS) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }

  if (missingVars.length > 0) {
    const errorMessage = `Missing required environment variables: ${missingVars.join(', ')}`;
    logger.error('Microsoft Graph Token Configuration Error', {
      missingVariables: missingVars,
      requiredVariables: REQUIRED_ENV_VARS,
    });
    throw new Error(errorMessage);
  }

  // Validate environment variable formats for security and correctness
  const validationErrors = [];

  // Validate CLIENT_ID format (must be a valid GUID)
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      process.env.CLIENT_ID
    )
  ) {
    validationErrors.push('CLIENT_ID must be a valid GUID format');
  }

  // Validate TENANT_ID format (GUID or domain name)
  if (
    !/^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/i.test(
      process.env.TENANT_ID
    )
  ) {
    validationErrors.push('TENANT_ID must be a valid GUID or domain format');
  }

  if (validationErrors.length > 0) {
    logger.error('Microsoft Graph Token Configuration Validation Error', {
      validationErrors,
    });
    throw new Error(
      `Microsoft Graph token configuration validation failed: ${validationErrors.join(', ')}`
    );
  }
}

/**
 * Check if the cached access token is still valid and not expired
 *
 * @function isTokenValid
 * @description Validates the cached token by checking its existence and expiration time.
 * Includes a 5-minute buffer to prevent token expiration during API calls.
 *
 * @returns {boolean} True if token is valid and not expired, false otherwise
 *
 * @example
 * // Check token validity before making API calls
 * if (isTokenValid()) {
 *   // Use cached token
 * } else {
 *   // Acquire new token
 * }
 */
function isTokenValid() {
  // Check if token and expiration time exist
  if (!tokenCache.token || !tokenCache.expiresAt) {
    return false;
  }

  // Check if token expires within the next 5 minutes (buffer time)
  const now = new Date();
  const expiresAt = new Date(tokenCache.expiresAt);
  const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds

  return expiresAt.getTime() - now.getTime() > bufferTime;
}

/**
 * Acquire a new access token from Microsoft Graph API using client credentials flow
 *
 * @async
 * @function acquireNewToken
 * @param {number} retryCount - Current retry count for retry logic
 * @returns {Promise<string>} Valid access token for Microsoft Graph API
 *
 * @description
 * This function handles the complete token acquisition process:
 * 1. Validates environment variables
 * 2. Makes OAuth2 client credentials request to Microsoft
 * 3. Caches the token with expiration time
 * 4. Implements retry logic for transient failures
 * 5. Provides comprehensive error handling and logging
 *
 * @throws {Error} If token acquisition fails after all retry attempts
 *
 * @example
 * // Acquire a new token
 * const token = await acquireNewToken();
 * console.log('Access token acquired:', token.substring(0, 20) + '...');
 */
async function acquireNewToken(retryCount = 0) {
  // Extract required environment variables for OAuth2 client credentials flow
  const tenantId = process.env.TENANT_ID;
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;

  // Construct Microsoft OAuth2 token endpoint URL
  const url = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

  // Prepare OAuth2 client credentials request parameters
  const params = new URLSearchParams({
    client_id: clientId,
    scope: 'https://graph.microsoft.com/.default',
    client_secret: clientSecret,
    grant_type: 'client_credentials',
  });

  try {
    // Log token acquisition attempt with security-conscious details
    logger.debug('Acquiring Microsoft Graph access token', {
      tenantId,
      clientId: clientId.substring(0, 8) + '...', // Partially redacted for security
      retryCount,
      url,
    });

    // Make OAuth2 client credentials request to Microsoft
    const response = await axios.post(url, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': `EMS-Backend/${process.env.npm_package_version || '1.0.0'}`,
      },
      timeout: TOKEN_TIMEOUT,
    });

    // Extract token information from response
    const { access_token, expires_in, token_type } = response.data;

    // Validate that we received a token
    if (!access_token) {
      throw new Error('No access token received from Microsoft Graph API');
    }

    // Cache the token with expiration time for future use
    const now = new Date();
    const expiresAt = new Date(now.getTime() + expires_in * 1000);

    tokenCache = {
      token: access_token,
      expiresAt: expiresAt.toISOString(),
      refreshPromise: null,
    };

    // Log successful token acquisition
    logger.info('Microsoft Graph access token acquired successfully', {
      tokenType: token_type,
      expiresIn: expires_in,
      expiresAt: expiresAt.toISOString(),
      retryCount,
    });

    return access_token;
  } catch (error) {
    // Collect comprehensive error details for logging and debugging
    const errorDetails = {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data,
      retryCount,
      url,
    };

    // Log the error with full context
    logger.error(
      'Failed to acquire Microsoft Graph access token',
      errorDetails
    );

    // Implement retry logic for transient errors (server errors, network issues)
    if (
      retryCount < MAX_RETRIES &&
      (error.response?.status >= 500 ||
        error.code === 'ECONNRESET' ||
        error.code === 'ETIMEDOUT')
    ) {
      logger.warn('Retrying Microsoft Graph token acquisition', {
        retryCount: retryCount + 1,
        maxRetries: MAX_RETRIES,
        delay: RETRY_DELAY * (retryCount + 1),
      });

      // Wait before retrying with exponential backoff
      await new Promise((resolve) =>
        setTimeout(resolve, RETRY_DELAY * (retryCount + 1))
      );
      return acquireNewToken(retryCount + 1);
    }

    // Throw error if all retry attempts failed or error is not retryable
    throw new Error(
      `Unable to fetch Microsoft Graph API access token: ${error.message}`
    );
  }
}

/**
 * Get a valid access token for Microsoft Graph API (cached or newly acquired)
 *
 * @async
 * @function getAccessToken
 * @returns {Promise<string>} Valid access token for Microsoft Graph API calls
 *
 * @description
 * This is the main function for obtaining access tokens. It implements intelligent caching:
 * 1. Checks if cached token is still valid
 * 2. Reuses ongoing token refresh operations to prevent duplicate requests
 * 3. Acquires new token only when necessary
 * 4. Handles concurrent requests efficiently
 * 5. Provides comprehensive error handling and logging
 *
 * @throws {Error} If token acquisition fails
 *
 * @example
 * // Get access token for API calls
 * const token = await getAccessToken();
 * const response = await fetch('https://graph.microsoft.com/v1.0/me', {
 *   headers: { Authorization: `Bearer ${token}` }
 * });
 */
async function getAccessToken() {
  try {
    // Check if we have a valid cached token (with 5-minute buffer)
    if (isTokenValid()) {
      logger.debug('Using cached Microsoft Graph access token', {
        expiresAt: tokenCache.expiresAt,
      });
      return tokenCache.token;
    }

    // If there's already a token refresh in progress, wait for it to complete
    if (tokenCache.refreshPromise) {
      logger.debug('Waiting for ongoing Microsoft Graph token refresh');
      return await tokenCache.refreshPromise;
    }

    // Start a new token acquisition process
    logger.debug('Acquiring new Microsoft Graph access token');
    tokenCache.refreshPromise = acquireNewToken();

    try {
      const token = await tokenCache.refreshPromise;
      return token;
    } finally {
      // Clear the refresh promise to allow future refreshes
      tokenCache.refreshPromise = null;
    }
  } catch (error) {
    // Log comprehensive error details for debugging
    logger.error('Failed to get Microsoft Graph access token', {
      error: error.message,
      stack: error.stack,
      cached: !!tokenCache.token,
      expiresAt: tokenCache.expiresAt,
    });
    throw error;
  }
}

/**
 * Clear the token cache
 * @param {string} reason - Reason for clearing the cache
 */
function clearTokenCache(reason = 'Manual clear') {
  logger.info('Clearing Microsoft Graph token cache', {
    reason,
    hadToken: !!tokenCache.token,
    expiresAt: tokenCache.expiresAt,
  });

  tokenCache = {
    token: null,
    expiresAt: null,
    refreshPromise: null,
  };
}

/**
 * Get token cache information
 * @returns {Object} Token cache information
 */
function getTokenCacheInfo() {
  return {
    hasToken: !!tokenCache.token,
    expiresAt: tokenCache.expiresAt,
    isValid: isTokenValid(),
    isRefreshing: !!tokenCache.refreshPromise,
    timeUntilExpiry: tokenCache.expiresAt
      ? new Date(tokenCache.expiresAt).getTime() - new Date().getTime()
      : null,
  };
}

/**
 * Refresh the access token manually
 * @returns {Promise<string>} New access token
 * @throws {Error} If token refresh fails
 */
async function refreshAccessToken() {
  logger.info('Manually refreshing Microsoft Graph access token');
  clearTokenCache('Manual refresh');
  return await getAccessToken();
}

/**
 * Create axios instance with default configuration
 */
const graphApiClient = axios.create({
  baseURL: GRAPH_API_BASE_URL,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'User-Agent': `EMS-Backend/${process.env.npm_package_version || '1.0.0'}`,
  },
});

// Add request interceptor to automatically add access token when not provided
graphApiClient.interceptors.request.use(async (config) => {
  // Only add token if Authorization header is not already set
  if (!config.headers.Authorization) {
    try {
      // Automatically acquire and add access token to request
      const token = await getAccessToken();
      config.headers.Authorization = `Bearer ${token}`;

      logger.debug('Microsoft Graph API request (auto-token)', {
        method: config.method,
        url: config.url,
        hasToken: !!token,
      });
    } catch (error) {
      // Log error if token acquisition fails
      logger.error(
        'Failed to add access token to Microsoft Graph API request',
        {
          error: error.message,
          url: config.url,
          method: config.method,
        }
      );
      throw error;
    }
  } else {
    // Log request with manually provided token
    logger.debug('Microsoft Graph API request (manual-token)', {
      method: config.method,
      url: config.url,
      hasToken: !!config.headers.Authorization,
    });
  }

  return config;
});

// Add response interceptor for comprehensive error handling and automatic retry
graphApiClient.interceptors.response.use(
  (response) => {
    // Log successful API responses for monitoring
    logger.debug('Microsoft Graph API response', {
      status: response.status,
      url: response.config.url,
      method: response.config.method,
    });
    return response;
  },
  async (error) => {
    // Collect comprehensive error details for logging and debugging
    const errorDetails = {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
    };

    // Handle 401 Unauthorized errors by clearing cache and retrying once
    if (error.response?.status === 401) {
      logger.warn(
        'Microsoft Graph API returned 401, clearing token cache',
        errorDetails
      );
      clearTokenCache('401 Unauthorized');

      // Retry the request once with a new token (only if auto-token was used)
      if (
        !error.config.headers.Authorization ||
        error.config.headers.Authorization.startsWith('Bearer ')
      ) {
        try {
          // Acquire new token and retry the request
          const newToken = await getAccessToken();
          error.config.headers.Authorization = `Bearer ${newToken}`;
          return graphApiClient.request(error.config);
        } catch (retryError) {
          // Log retry failure and continue with original error
          logger.error(
            'Failed to retry Microsoft Graph API request with new token',
            {
              originalError: errorDetails,
              retryError: retryError.message,
            }
          );
        }
      }
    }

    // Log all API errors for monitoring and debugging
    logger.error('Microsoft Graph API error', errorDetails);
    throw error;
  }
);

/**
 * Enhanced error handler for Graph API calls
 * @param {Error} error - The error object
 * @param {string} operation - The operation being performed
 * @param {Object} context - Additional context information
 */
function handleGraphError(error, operation, context = {}) {
  const errorDetails = {
    operation,
    context,
    message: error.message,
    status: error.response?.status,
    statusText: error.response?.statusText,
    responseData: error.response?.data,
    requestUrl: error.config?.url,
    requestMethod: error.config?.method,
  };

  // Log the error with appropriate level
  if (error.response?.status >= 500) {
    logger.error(`Graph API Server Error during ${operation}:`, errorDetails);
  } else if (error.response?.status >= 400) {
    logger.warn(`Graph API Client Error during ${operation}:`, errorDetails);
  } else {
    logger.error(`Graph API Network Error during ${operation}:`, errorDetails);
  }

  // Create user-friendly error messages
  let userMessage = `Failed to ${operation}`;

  if (error.response?.status === 401) {
    userMessage = 'Authentication failed. Please check your access token.';
  } else if (error.response?.status === 403) {
    userMessage = 'Access denied. Insufficient permissions for this operation.';
  } else if (error.response?.status === 404) {
    userMessage = 'Resource not found.';
  } else if (error.response?.status === 429) {
    userMessage = 'Rate limit exceeded. Please try again later.';
  } else if (error.response?.status >= 500) {
    userMessage = 'Microsoft Graph service is temporarily unavailable.';
  }

  const enhancedError = new Error(userMessage);
  enhancedError.originalError = error;
  enhancedError.statusCode = error.response?.status;
  enhancedError.operation = operation;
  enhancedError.context = context;

  throw enhancedError;
}

/**
 * Retry mechanism for Graph API calls
 * @param {Function} operation - The operation to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delay - Delay between retries in milliseconds
 */
async function withRetry(
  operation,
  maxRetries = MAX_RETRIES,
  delay = RETRY_DELAY
) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Don't retry on client errors (4xx) except 429 (rate limit)
      if (
        error.response?.status >= 400 &&
        error.response?.status < 500 &&
        error.response?.status !== 429
      ) {
        throw error;
      }

      if (attempt === maxRetries) {
        logger.error(
          `Graph API operation failed after ${maxRetries} attempts:`,
          {
            operation: operation.name,
            attempts: maxRetries,
            lastError: error.message,
          }
        );
        throw error;
      }

      logger.warn(
        `Graph API operation failed, retrying (attempt ${attempt}/${maxRetries}):`,
        {
          operation: operation.name,
          error: error.message,
          nextRetryIn: delay,
        }
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }

  throw lastError;
}

/**
 * Make authenticated request to Microsoft Graph API
 * @param {string} accessToken - The access token for authentication
 * @param {string} endpoint - The Graph API endpoint
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {Object} data - Request body data
 * @param {Object} params - Query parameters
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} The response data
 */
async function makeGraphRequest(
  accessToken,
  endpoint,
  method = 'GET',
  data = null,
  params = null,
  options = {}
) {
  if (!accessToken) {
    throw new Error('Access token is required for Graph API requests');
  }

  if (!endpoint) {
    throw new Error('Graph API endpoint is required');
  }

  const requestConfig = {
    method: method.toUpperCase(),
    url: endpoint,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    timeout: options.timeout || DEFAULT_TIMEOUT,
  };

  if (data) {
    requestConfig.data = data;
  }

  if (params) {
    requestConfig.params = params;
  }

  // Use beta endpoint if specified
  if (options.useBeta) {
    requestConfig.baseURL = GRAPH_API_BETA_URL;
  }

  const operation = async () => {
    try {
      const response = await graphApiClient(requestConfig);

      logger.info('Graph API request successful', {
        endpoint,
        method,
        status: response.status,
        responseSize: JSON.stringify(response.data).length,
      });

      return response.data;
    } catch (error) {
      handleGraphError(error, `${method} ${endpoint}`, {
        endpoint,
        method,
        data,
        params,
      });
    }
  };

  return withRetry(operation, options.maxRetries, options.retryDelay);
}

/**
 * Get user profile information
 * @param {string} accessToken - The access token
 * @param {string} userId - Optional user ID (defaults to 'me')
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} User profile data
 */
export async function getUserProfile(accessToken, userId = 'me', options = {}) {
  try {
    const endpoint = userId === 'me' ? '/me' : `/users/${userId}`;
    const params = {
      $select:
        'id,displayName,mail,userPrincipalName,givenName,surname,jobTitle,department,officeLocation,preferredLanguage,accountEnabled,createdDateTime,lastPasswordChangeDateTime',
    };

    return await makeGraphRequest(
      accessToken,
      endpoint,
      'GET',
      null,
      params,
      options
    );
  } catch (error) {
    logger.error('Failed to get user profile:', error);
    throw error;
  }
}

/**
 * Get user's manager information
 * @param {string} accessToken - The access token
 * @param {string} userId - User ID (defaults to 'me')
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Manager information
 */
export async function getUserManager(accessToken, userId = 'me', options = {}) {
  try {
    const endpoint =
      userId === 'me' ? '/me/manager' : `/users/${userId}/manager`;

    return await makeGraphRequest(
      accessToken,
      endpoint,
      'GET',
      null,
      null,
      options
    );
  } catch (error) {
    logger.error('Failed to get user manager:', error);
    throw error;
  }
}

/**
 * Get user's direct reports
 * @param {string} accessToken - The access token
 * @param {string} userId - User ID (defaults to 'me')
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Direct reports information
 */
export async function getUserDirectReports(
  accessToken,
  userId = 'me',
  options = {}
) {
  try {
    const endpoint =
      userId === 'me' ? '/me/directReports' : `/users/${userId}/directReports`;

    return await makeGraphRequest(
      accessToken,
      endpoint,
      'GET',
      null,
      null,
      options
    );
  } catch (error) {
    logger.error('Failed to get user direct reports:', error);
    throw error;
  }
}

/**
 * Get user's group memberships
 * @param {string} accessToken - The access token
 * @param {string} userId - User ID (defaults to 'me')
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Group memberships
 */
export async function getUserGroups(accessToken, userId = 'me', options = {}) {
  try {
    const endpoint =
      userId === 'me' ? '/me/memberOf' : `/users/${userId}/memberOf`;
    const params = {
      $select:
        'id,displayName,description,groupTypes,mailEnabled,securityEnabled',
    };

    return await makeGraphRequest(
      accessToken,
      endpoint,
      'GET',
      null,
      params,
      options
    );
  } catch (error) {
    logger.error('Failed to get user groups:', error);
    throw error;
  }
}

/**
 * Create a new user in Azure AD
 * @param {string} accessToken - The access token
 * @param {Object} userData - User data to create
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Created user data
 */
export async function createUser(accessToken, userData, options = {}) {
  try {
    const endpoint = '/users';

    return await makeGraphRequest(
      accessToken,
      endpoint,
      'POST',
      userData,
      null,
      options
    );
  } catch (error) {
    logger.error('Failed to create user:', error);
    throw error;
  }
}

/**
 * Update user information
 * @param {string} accessToken - The access token
 * @param {string} userId - User ID to update
 * @param {Object} updateData - Data to update
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Updated user data
 */
export async function updateUser(
  accessToken,
  userId,
  updateData,
  options = {}
) {
  try {
    const endpoint = `/users/${userId}`;

    return await makeGraphRequest(
      accessToken,
      endpoint,
      'PATCH',
      updateData,
      null,
      options
    );
  } catch (error) {
    logger.error('Failed to update user:', error);
    throw error;
  }
}

/**
 * Delete a user
 * @param {string} accessToken - The access token
 * @param {string} userId - User ID to delete
 * @param {Object} options - Additional options
 * @returns {Promise<void>}
 */
export async function deleteUser(accessToken, userId, options = {}) {
  try {
    const endpoint = `/users/${userId}`;

    await makeGraphRequest(
      accessToken,
      endpoint,
      'DELETE',
      null,
      null,
      options
    );

    logger.info('User deleted successfully', { userId });
  } catch (error) {
    logger.error('Failed to delete user:', error);
    throw error;
  }
}

/**
 * Assign license to user
 * @param {string} accessToken - The access token
 * @param {string} userId - User ID
 * @param {Array} skuIds - Array of SKU IDs to assign
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} License assignment result
 */
export async function assignLicense(accessToken, userId, skuIds, options = {}) {
  try {
    const endpoint = `/users/${userId}/assignLicense`;
    const data = {
      addLicenses: skuIds.map((skuId) => ({ skuId })),
      removeLicenses: [],
    };

    return await makeGraphRequest(
      accessToken,
      endpoint,
      'POST',
      data,
      null,
      options
    );
  } catch (error) {
    logger.error('Failed to assign license:', error);
    throw error;
  }
}

/**
 * Remove license from user
 * @param {string} accessToken - The access token
 * @param {string} userId - User ID
 * @param {Array} skuIds - Array of SKU IDs to remove
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} License removal result
 */
export async function removeLicense(accessToken, userId, skuIds, options = {}) {
  try {
    const endpoint = `/users/${userId}/assignLicense`;
    const data = {
      addLicenses: [],
      removeLicenses: skuIds,
    };

    return await makeGraphRequest(
      accessToken,
      endpoint,
      'POST',
      data,
      null,
      options
    );
  } catch (error) {
    logger.error('Failed to remove license:', error);
    throw error;
  }
}

/**
 * Get user's assigned licenses
 * @param {string} accessToken - The access token
 * @param {string} userId - User ID (defaults to 'me')
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Assigned licenses
 */
export async function getUserLicenses(
  accessToken,
  userId = 'me',
  options = {}
) {
  try {
    const endpoint =
      userId === 'me'
        ? '/me/licenseDetails'
        : `/users/${userId}/licenseDetails`;

    return await makeGraphRequest(
      accessToken,
      endpoint,
      'GET',
      null,
      null,
      options
    );
  } catch (error) {
    logger.error('Failed to get user licenses:', error);
    throw error;
  }
}

/**
 * Search users
 * @param {string} accessToken - The access token
 * @param {string} searchTerm - Search term
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Search results
 */
export async function searchUsers(accessToken, searchTerm, options = {}) {
  try {
    const endpoint = '/users';
    const params = {
      $search: `"displayName:${searchTerm}" OR "mail:${searchTerm}" OR "userPrincipalName:${searchTerm}"`,
      $select:
        'id,displayName,mail,userPrincipalName,givenName,surname,jobTitle,department,accountEnabled',
    };

    return await makeGraphRequest(
      accessToken,
      endpoint,
      'GET',
      null,
      params,
      options
    );
  } catch (error) {
    logger.error('Failed to search users:', error);
    throw error;
  }
}

/**
 * Get organization information
 * @param {string} accessToken - The access token
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Organization information
 */
export async function getOrganization(accessToken, options = {}) {
  try {
    const endpoint = '/organization';
    const params = {
      $select:
        'id,displayName,verifiedDomains,assignedPlans,technicalNotificationMails',
    };

    return await makeGraphRequest(
      accessToken,
      endpoint,
      'GET',
      null,
      params,
      options
    );
  } catch (error) {
    logger.error('Failed to get organization:', error);
    throw error;
  }
}

/**
 * Get available SKUs (licenses)
 * @param {string} accessToken - The access token
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Available SKUs
 */
export async function getAvailableSkus(accessToken, options = {}) {
  try {
    const endpoint = '/subscribedSkus';

    return await makeGraphRequest(
      accessToken,
      endpoint,
      'GET',
      null,
      null,
      options
    );
  } catch (error) {
    logger.error('Failed to get available SKUs:', error);
    throw error;
  }
}

// Validate environment on module load
try {
  validateTokenEnvironment();
  logger.info('Microsoft Graph Service initialized with token management', {
    tokenManagementEnabled: true,
    cacheEnabled: true,
    autoTokenRefresh: true,
  });
} catch (error) {
  logger.warn('Microsoft Graph Service initialized without token management', {
    error: error.message,
    tokenManagementEnabled: false,
  });
}

// Export the enhanced graph service with token management
export default {
  // Token management
  getAccessToken,
  clearTokenCache,
  getTokenCacheInfo,
  refreshAccessToken,

  // Graph API operations
  getUserProfile,
  getUserManager,
  getUserDirectReports,
  getUserGroups,
  createUser,
  updateUser,
  deleteUser,
  assignLicense,
  removeLicense,
  getUserLicenses,
  searchUsers,
  getOrganization,
  getAvailableSkus,
  makeGraphRequest
};
