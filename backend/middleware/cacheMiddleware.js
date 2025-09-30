/**
 * @fileoverview Redis Caching Middleware
 * @description Comprehensive caching middleware for API responses with TTL management,
 * cache invalidation, and performance optimization
 * @author EMS Development Team
 * @version 1.0.0
 */

import redisConfig from '../config/redis.js';
import logger from '../utils/logger.js';
import crypto from 'crypto';

/**
 * Generate cache key from request
 * @param {Object} req - Express request object
 * @param {string} prefix - Cache key prefix
 * @returns {string} Generated cache key
 */
function generateCacheKey(req, prefix = 'api') {
  const { method, url, query, body, user } = req;
  
  // Create hash from request data
  const requestData = {
    method,
    url,
    query,
    body: method !== 'GET' ? body : undefined,
    userId: user?.id
  };
  
  const dataString = JSON.stringify(requestData);
  const hash = crypto.createHash('md5').update(dataString).digest('hex');
  
  return `${prefix}:${method.toLowerCase()}:${hash}`;
}

/**
 * Cache middleware factory
 * @param {Object} options - Cache options
 * @param {number} options.ttl - Time to live in seconds
 * @param {string} options.prefix - Cache key prefix
 * @param {Function} options.keyGenerator - Custom key generator function
 * @param {Array} options.skipPaths - Paths to skip caching
 * @param {Array} options.onlyMethods - Only cache these HTTP methods
 * @returns {Function} Express middleware function
 */
export function cacheMiddleware(options = {}) {
  const {
    ttl = 3600, // 1 hour default
    prefix = 'api',
    keyGenerator = generateCacheKey,
    skipPaths = ['/health', '/status'],
    onlyMethods = ['GET'],
    skipAuth = false // Skip caching for authenticated requests
  } = options;

  return async (req, res, next) => {
    try {
      // Skip caching for certain paths
      if (skipPaths.some(path => req.path.includes(path))) {
        return next();
      }

      // Skip caching for non-allowed methods
      if (!onlyMethods.includes(req.method)) {
        return next();
      }

      // Skip caching for authenticated requests if configured
      if (skipAuth && req.user) {
        return next();
      }

      // Generate cache key
      const cacheKey = keyGenerator(req, prefix);
      
      // Try to get from cache
      const cachedData = await redisConfig.get(cacheKey);
      
      if (cachedData) {
        logger.debug('Cache hit', {
          key: cacheKey,
          url: req.url,
          method: req.method
        });
        
        return res.json(cachedData);
      }

      // Cache miss - continue to route handler
      logger.debug('Cache miss', {
        key: cacheKey,
        url: req.url,
        method: req.method
      });

      // Override res.json to cache response
      const originalJson = res.json;
      res.json = function(data) {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // Cache the response
          redisConfig.set(cacheKey, data, ttl).catch(error => {
            logger.error('Cache set error', {
              key: cacheKey,
              error: error.message
            });
          });
          
          logger.debug('Response cached', {
            key: cacheKey,
            ttl,
            statusCode: res.statusCode
          });
        }
        
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error', {
        error: error.message,
        url: req.url,
        method: req.method
      });
      
      // Continue without caching on error
      next();
    }
  };
}

/**
 * Cache invalidation middleware
 * @param {Object} options - Invalidation options
 * @param {Array} options.patterns - Cache key patterns to invalidate
 * @param {Function} options.keyGenerator - Custom key generator for invalidation
 * @returns {Function} Express middleware function
 */
export function cacheInvalidation(options = {}) {
  const {
    patterns = [],
    keyGenerator = (req) => `api:${req.method.toLowerCase()}:*`
  } = options;

  return async (req, res, next) => {
    try {
      // Override res.json to invalidate cache after successful operations
      const originalJson = res.json;
      res.json = function(data) {
        // Only invalidate on successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // Invalidate cache patterns
          const invalidationPromises = patterns.map(pattern => {
            return redisConfig.del(pattern).catch(error => {
              logger.error('Cache invalidation error', {
                pattern,
                error: error.message
              });
            });
          });

          // Add custom key invalidation
          if (keyGenerator) {
            const customKey = keyGenerator(req);
            invalidationPromises.push(
              redisConfig.del(customKey).catch(error => {
                logger.error('Custom cache invalidation error', {
                  key: customKey,
                  error: error.message
                });
              })
            );
          }

          Promise.all(invalidationPromises).then(() => {
            logger.debug('Cache invalidated', {
              patterns,
              url: req.url,
              method: req.method
            });
          });
        }
        
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      logger.error('Cache invalidation middleware error', {
        error: error.message,
        url: req.url,
        method: req.method
      });
      
      next();
    }
  };
}

/**
 * Employee-specific caching middleware
 * Caches employee data with appropriate TTL
 */
export const employeeCache = cacheMiddleware({
  ttl: 1800, // 30 minutes
  prefix: 'employees',
  skipPaths: ['/employees/search', '/employees/export']
});

/**
 * Hardware-specific caching middleware
 * Caches hardware data with appropriate TTL
 */
export const hardwareCache = cacheMiddleware({
  ttl: 3600, // 1 hour
  prefix: 'hardware',
  skipPaths: ['/hardware/search', '/hardware/export']
});

/**
 * Software-specific caching middleware
 * Caches software data with appropriate TTL
 */
export const softwareCache = cacheMiddleware({
  ttl: 3600, // 1 hour
  prefix: 'software',
  skipPaths: ['/software/search', '/software/export']
});

/**
 * License-specific caching middleware
 * Caches license data with appropriate TTL
 */
export const licenseCache = cacheMiddleware({
  ttl: 1800, // 30 minutes
  prefix: 'licenses',
  skipPaths: ['/licenses/search', '/licenses/export']
});

/**
 * Ticket-specific caching middleware
 * Caches ticket data with shorter TTL due to frequent updates
 */
export const ticketCache = cacheMiddleware({
  ttl: 300, // 5 minutes
  prefix: 'tickets',
  skipPaths: ['/tickets/search', '/tickets/export']
});

/**
 * Cache invalidation for employee operations
 */
export const employeeCacheInvalidation = cacheInvalidation({
  patterns: ['employees:*']
});

/**
 * Cache invalidation for hardware operations
 */
export const hardwareCacheInvalidation = cacheInvalidation({
  patterns: ['hardware:*']
});

/**
 * Cache invalidation for software operations
 */
export const softwareCacheInvalidation = cacheInvalidation({
  patterns: ['software:*']
});

/**
 * Cache invalidation for license operations
 */
export const licenseCacheInvalidation = cacheInvalidation({
  patterns: ['licenses:*']
});

/**
 * Cache invalidation for ticket operations
 */
export const ticketCacheInvalidation = cacheInvalidation({
  patterns: ['tickets:*']
});

/**
 * Clear all cache
 * @returns {Promise<boolean>} Success status
 */
export async function clearAllCache() {
  try {
    // This would need to be implemented based on your Redis setup
    // For now, we'll clear common patterns
    const patterns = [
      'api:*',
      'employees:*',
      'hardware:*',
      'software:*',
      'licenses:*',
      'tickets:*'
    ];

    const results = await Promise.allSettled(
      patterns.map(pattern => redisConfig.del(pattern))
    );

    logger.info('Cache cleared', {
      patterns,
      results: results.map(r => r.status)
    });

    return true;
  } catch (error) {
    logger.error('Error clearing cache', { error: error.message });
    return false;
  }
}

/**
 * Get cache statistics
 * @returns {Promise<Object>} Cache statistics
 */
export async function getCacheStats() {
  try {
    // This would need to be implemented based on your Redis setup
    // For now, return basic info
    return {
      connected: redisConfig.isRedisConnected(),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error('Error getting cache stats', { error: error.message });
    return {
      connected: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

export default {
  cacheMiddleware,
  cacheInvalidation,
  employeeCache,
  hardwareCache,
  softwareCache,
  licenseCache,
  ticketCache,
  employeeCacheInvalidation,
  hardwareCacheInvalidation,
  softwareCacheInvalidation,
  licenseCacheInvalidation,
  ticketCacheInvalidation,
  clearAllCache,
  getCacheStats
};
