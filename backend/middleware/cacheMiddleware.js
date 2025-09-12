import redisConfig from '../config/redis.js';
import logger from '../utils/logger.js';

/**
 * Cache middleware for API responses
 */
export const cacheMiddleware = (ttl = 300) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip caching if Redis is not connected
    if (!redisConfig.isRedisConnected()) {
      return next();
    }

    try {
      // Generate cache key based on URL and query parameters
      const cacheKey = redisConfig.generateKey(
        'api',
        req.originalUrl.replace(/[^a-zA-Z0-9]/g, '_'),
        JSON.stringify(req.query)
      );

      // Try to get cached response
      const cachedResponse = await redisConfig.get(cacheKey);
      
      if (cachedResponse) {
        logger.info(`Cache hit for key: ${cacheKey}`);
        return res.json(cachedResponse);
      }

      // Store original res.json method
      const originalJson = res.json;

      // Override res.json to cache the response
      res.json = function(data) {
        // Cache the response
        redisConfig.set(cacheKey, data, ttl).catch(error => {
          logger.error('Failed to cache response:', error);
        });

        // Call original json method
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
};

/**
 * Cache invalidation middleware
 */
export const invalidateCache = (patterns = []) => {
  return async (req, res, next) => {
    // Store original methods
    const originalJson = res.json;
    const originalSend = res.send;

    // Override response methods to invalidate cache after successful operations
    res.json = function(data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        invalidateCachePatterns(patterns).catch(error => {
          logger.error('Failed to invalidate cache:', error);
        });
      }
      return originalJson.call(this, data);
    };

    res.send = function(data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        invalidateCachePatterns(patterns).catch(error => {
          logger.error('Failed to invalidate cache:', error);
        });
      }
      return originalSend.call(this, data);
    };

    next();
  };
};

/**
 * Invalidate cache patterns
 */
async function invalidateCachePatterns(patterns) {
  if (!redisConfig.isRedisConnected()) {
    return;
  }

  try {
    const client = redisConfig.getClient();
    
    for (const pattern of patterns) {
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(...keys);
        logger.info(`Invalidated ${keys.length} cache keys for pattern: ${pattern}`);
      }
    }
  } catch (error) {
    logger.error('Cache invalidation error:', error);
  }
}

/**
 * Session cache middleware
 */
export const sessionCache = {
  async set(sessionId, sessionData, ttl = 86400) { // 24 hours default
    const key = redisConfig.generateKey('session', sessionId);
    return await redisConfig.set(key, sessionData, ttl);
  },

  async get(sessionId) {
    const key = redisConfig.generateKey('session', sessionId);
    return await redisConfig.get(key);
  },

  async delete(sessionId) {
    const key = redisConfig.generateKey('session', sessionId);
    return await redisConfig.del(key);
  },

  async exists(sessionId) {
    const key = redisConfig.generateKey('session', sessionId);
    return await redisConfig.exists(key);
  }
};
