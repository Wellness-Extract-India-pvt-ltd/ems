/**
 * @fileoverview EMS Backend Configuration Manager
 * @description Centralized configuration management with validation, security,
 * environment-specific settings, and comprehensive error handling.
 * @author EMS Development Team
 * @version 1.0.0
 * @since 2024-01-01
 */

import dotenv from 'dotenv'
import logger from './utils/logger.js'

// Load environment variables
dotenv.config()

/**
 * Configuration validation utilities
 * @namespace ConfigValidation
 */
const ConfigValidation = {
  /**
   * Validates required environment variables
   * @param {string[]} requiredVars - Array of required environment variable names
   * @throws {Error} If any required variables are missing
   */
  validateRequired (requiredVars) {
    const missing = requiredVars.filter((varName) => !process.env[varName])
    if (missing.length > 0) {
      const error = `Missing required environment variables: ${missing.join(', ')}`
      logger.error('Configuration validation failed', { missing })
      throw new Error(error)
    }
  },

  /**
   * Validates and parses integer environment variables
   * @param {string} varName - Environment variable name
   * @param {number} defaultValue - Default value if not set or invalid
   * @returns {number} Parsed integer value
   */
  parseInt (varName, defaultValue = 0) {
    const value = process.env[varName]
    if (!value) return defaultValue
    const parsed = parseInt(value, 10)
    return isNaN(parsed) ? defaultValue : parsed
  },

  /**
   * Validates and parses boolean environment variables
   * @param {string} varName - Environment variable name
   * @param {boolean} defaultValue - Default value if not set
   * @returns {boolean} Parsed boolean value
   */
  parseBoolean (varName, defaultValue = false) {
    const value = process.env[varName]
    if (!value) return defaultValue
    return value.toLowerCase() === 'true'
  },

  /**
   * Validates URL format
   * @param {string} url - URL to validate
   * @returns {boolean} True if URL is valid
   */
  isValidUrl (url) {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }
}

/**
 * Environment-specific configuration
 * @namespace EnvironmentConfig
 */
const EnvironmentConfig = {
  /**
   * Get environment-specific database configuration
   * @param {string} env - Environment name
   * @returns {Object} Database configuration
   */
  getDatabaseConfig (env) {
    const baseConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: ConfigValidation.parseInt('DB_PORT', 3306),
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'ems_db',
      dialect: 'mysql',
      logging: env === 'development' ? console.log : false,
      pool: {
        max: env === 'production' ? 20 : 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
        evict: 1000,
        handleDisconnects: true
      },
      define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true
      },
      dialectOptions: {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci'
      }
    }

    // Production-specific settings
    if (env === 'production') {
      baseConfig.pool.acquire = 60000
      baseConfig.pool.idle = 30000
      baseConfig.dialectOptions = {
        ...baseConfig.dialectOptions,
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    }

    return baseConfig
  },

  /**
   * Get environment-specific rate limiting configuration
   * @param {string} env - Environment name
   * @returns {Object} Rate limiting configuration
   */
  getRateLimitConfig (env) {
    const baseConfig = {
      windowMs: ConfigValidation.parseInt(
        'RATE_LIMIT_WINDOW_MS',
        15 * 60 * 1000
      ),
      max: ConfigValidation.parseInt('RATE_LIMIT_MAX_REQUESTS', 100),
      message: {
        success: false,
        error: 'Rate limit exceeded',
        message: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil(
          ConfigValidation.parseInt('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000) /
            1000
        )
      },
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: false,
      skipFailedRequests: false
    }

    // Stricter limits for production
    if (env === 'production') {
      baseConfig.max = Math.min(baseConfig.max, 50)
      baseConfig.windowMs = Math.max(baseConfig.windowMs, 15 * 60 * 1000)
    }

    return baseConfig
  }
}

// Validate critical environment variables
try {
  ConfigValidation.validateRequired([
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'CLIENT_ID',
    'CLIENT_SECRET',
    'TENANT_ID'
  ])
} catch (error) {
  logger.error('Critical configuration validation failed', {
    error: error.message
  })
  throw error
}

const config = {
  /**
   * Server Configuration
   * @type {Object}
   */
  server: {
    port: ConfigValidation.parseInt('PORT', 5000),
    env: process.env.NODE_ENV || 'development',
    host: process.env.HOST || '0.0.0.0',
    timeout: ConfigValidation.parseInt('API_TIMEOUT', 30000),
    version: process.env.API_VERSION || 'v1'
  },

  /**
   * MySQL Database Configuration
   * @type {Object}
   */
  database: EnvironmentConfig.getDatabaseConfig(
    process.env.NODE_ENV || 'development'
  ),

  /**
   * JWT Configuration
   * @type {Object}
   */
  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessTokenExpiry: process.env.JWT_EXPIRES_IN || '24h',
    refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    issuer: 'wellness-extract-auth',
    audience: 'ems-api',
    algorithm: 'HS256',
    cookieName: 'jwt',
    refreshCookieName: 'refreshJwt'
  },

  /**
   * Microsoft Authentication Library (MSAL) Configuration
   * @type {Object}
   */
  msal: {
    clientId: process.env.CLIENT_ID,
    tenantId: process.env.TENANT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    authority: `https://login.microsoftonline.com/${process.env.TENANT_ID}`,
    redirectUri:
      process.env.REDIRECT_URI || 'http://localhost:5000/api/v1/auth/redirect',
    scopes: ['User.Read', 'User.ReadBasic.All', 'Group.Read.All'],
    clientCapabilities: ['CP1'],
    knownAuthorities: [process.env.TENANT_ID],
    cacheLocation: 'memory',
    storeAuthStateInCookie: false
  },

  /**
   * Microsoft Graph API Configuration
   * @type {Object}
   */
  azureGraph: {
    baseUrl: 'https://graph.microsoft.com/v1.0',
    profileUrl: 'https://graph.microsoft.com/v1.0/me',
    usersUrl: 'https://graph.microsoft.com/v1.0/users',
    groupsUrl: 'https://graph.microsoft.com/v1.0/groups',
    licensesUrl: 'https://graph.microsoft.com/v1.0/subscribedSkus',
    organizationUrl: 'https://graph.microsoft.com/v1.0/organization',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000
  },

  /**
   * Rate Limiting Configuration
   * @type {Object}
   */
  rateLimit: EnvironmentConfig.getRateLimitConfig(
    process.env.NODE_ENV || 'development'
  ),

  /**
   * CORS and URL Configuration
   * @type {Object}
   */
  urls: {
    frontend: process.env.FRONTEND_URL || 'http://localhost:5173',
    backend: process.env.BACKEND_URL || 'http://localhost:5000',
    allowedOrigins: [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'http://localhost:3000',
      'https://ems.wellnessextract.com'
    ].filter(Boolean)
  },

  /**
   * BioMetrics SQL Server Configuration
   * @type {Object}
   */
  biometrics: {
    server: process.env.BIOMETRICS_SERVER || '172.16.1.171',
    database: process.env.BIOMETRICS_DATABASE || 'ONtime_Att',
    port: ConfigValidation.parseInt('BIOMETRICS_PORT', 1433),
    user: process.env.BIOMETRICS_USER || '',
    password: process.env.BIOMETRICS_PASSWORD || '',
    options: {
      encrypt: ConfigValidation.parseBoolean('BIOMETRICS_ENCRYPT', false),
      trustServerCertificate: ConfigValidation.parseBoolean(
        'BIOMETRICS_TRUST_CERT',
        true
      ),
      enableArithAbort: true,
      connectionTimeout: 30000,
      requestTimeout: 30000,
      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
      }
    }
  },

  /**
   * Redis Configuration
   * @type {Object}
   */
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: ConfigValidation.parseInt('REDIS_PORT', 6379),
    password: process.env.REDIS_PASSWORD || '',
    db: ConfigValidation.parseInt('REDIS_DB', 0),
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    keepAlive: 30000,
    connectTimeout: 10000,
    commandTimeout: 5000,
    family: 4,
    keyPrefix: process.env.CACHE_PREFIX || 'ems:'
  },

  /**
   * Email Configuration (SendGrid)
   * @type {Object}
   */
  email: {
    apiKey: process.env.SENDGRID_API_KEY || '',
    from: process.env.EMAIL_FROM || 'noreply@wellnessextract.com',
    fromName: process.env.EMAIL_FROM_NAME || 'Wellness Extract EMS',
    replyTo: process.env.EMAIL_REPLY_TO || 'support@wellnessextract.com',
    templates: {
      welcome: process.env.WELCOME_EMAIL_TEMPLATE || '',
      passwordReset: process.env.PASSWORD_RESET_TEMPLATE || '',
      notification: process.env.NOTIFICATION_EMAIL_TEMPLATE || ''
    }
  },

  /**
   * File Upload Configuration
   * @type {Object}
   */
  upload: {
    path: process.env.UPLOAD_PATH || './uploads',
    maxSize: ConfigValidation.parseInt('MAX_FILE_SIZE', 10485760), // 10MB
    allowedTypes: (
      process.env.ALLOWED_FILE_TYPES ||
      'jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx,txt'
    ).split(','),
    maxFiles: ConfigValidation.parseInt('MAX_FILES_PER_UPLOAD', 5),
    tempPath: './uploads/temp',
    cleanupInterval: 24 * 60 * 60 * 1000 // 24 hours
  },

  /**
   * Logging Configuration
   * @type {Object}
   */
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    dir: process.env.LOG_DIR || './logs',
    maxSize: '20m',
    maxFiles: '14d',
    datePattern: 'YYYY-MM-DD',
    auditLogEnabled: ConfigValidation.parseBoolean('AUDIT_LOG_ENABLED', true),
    performanceLogEnabled: ConfigValidation.parseBoolean(
      'PERFORMANCE_LOG_ENABLED',
      true
    )
  },

  /**
   * Security Configuration
   * @type {Object}
   */
  security: {
    sessionSecret: process.env.SESSION_SECRET || '',
    bcryptRounds: ConfigValidation.parseInt('BCRYPT_ROUNDS', 12),
    passwordMinLength: 8,
    passwordMaxLength: 128,
    accountLockoutThreshold: 5,
    accountLockoutDuration: 15 * 60 * 1000, // 15 minutes
    passwordResetExpiry: 60 * 60 * 1000, // 1 hour
    twoFactorEnabled: ConfigValidation.parseBoolean(
      'TWO_FACTOR_ENABLED',
      false
    )
  },

  /**
   * Cache Configuration
   * @type {Object}
   */
  cache: {
    ttl: ConfigValidation.parseInt('CACHE_TTL', 3600), // 1 hour
    prefix: process.env.CACHE_PREFIX || 'ems:',
    enabled: ConfigValidation.parseBoolean('CACHE_ENABLED', true),
    maxMemory: '256mb'
  },

  /**
   * Health Check Configuration
   * @type {Object}
   */
  healthCheck: {
    interval: ConfigValidation.parseInt('HEALTH_CHECK_INTERVAL', 30000),
    timeout: ConfigValidation.parseInt('HEALTH_CHECK_TIMEOUT', 5000),
    enabled: ConfigValidation.parseBoolean('HEALTH_CHECK_ENABLED', true)
  }
}

/**
 * Configuration validation and initialization
 */
try {
  // Validate URLs
  if (!ConfigValidation.isValidUrl(config.urls.frontend)) {
    logger.warn('Invalid frontend URL in configuration', {
      url: config.urls.frontend
    })
  }

  if (!ConfigValidation.isValidUrl(config.urls.backend)) {
    logger.warn('Invalid backend URL in configuration', {
      url: config.urls.backend
    })
  }

  // Log configuration status
  logger.info('Configuration loaded successfully', {
    environment: config.server.env,
    port: config.server.port,
    database: config.database.database,
    biometrics: config.biometrics.server,
    redis: config.redis.host,
    email: config.email.from ? 'configured' : 'not configured'
  })
} catch (error) {
  logger.error('Configuration validation failed', { error: error.message })
  throw error
}

export default config
