import redis from './redis.js';

/**
 * SIMPLE RATE LIMITER
 * Kayt7akem f nombre dyal requests kaysawbhom user f wa9t m3ayen
 */

/**
 * Rate Limiter Function - Simple w Sa3l l'fahm
 * @param {string} key - Unique key (phone, IP, etc.)
 * @param {number} maxRequests - Maximum requests allowed
 * @param {number} windowSeconds - Time window in seconds
 * @returns {Promise<{allowed: boolean, remaining: number, resetIn: number}>}
 */
export async function checkRateLimit(key, maxRequests, windowSeconds) {
  try {
    const redisKey = `ratelimit:${key}`;
    
    // 1. Chof wach key kayna f Redis
    const current = await redis.get(redisKey);
    
    if (!current) {
      // Awel mera - Saweb counter = 1
      await redis.set(redisKey, '1', { EX: windowSeconds });
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetIn: windowSeconds,
      };
    }
    
    // 2. Parse current count
    const count = parseInt(current, 10);
    
    // 3. Chof wach wsel l limit
    if (count >= maxRequests) {
      const ttl = await redis.ttl(redisKey);
      return {
        allowed: false,
        remaining: 0,
        resetIn: ttl > 0 ? ttl : windowSeconds,
      };
    }
    
    // 4. Zid 1 l counter
    await redis.incr(redisKey);
    
    return {
      allowed: true,
      remaining: maxRequests - count - 1,
      resetIn: await redis.ttl(redisKey),
    };
    
  } catch (error) {
    console.error('Rate limiter error:', error);
    // F7alet chi mushkil, kheliha tmchi (fail open)
    return { allowed: true, remaining: 0, resetIn: 0 };
  }
}

/**
 * Reset rate limit for a key (optional - for testing)
 */
export async function resetRateLimit(key) {
  try {
    await redis.del(`ratelimit:${key}`);
    return true;
  } catch (error) {
    console.error('Reset rate limit error:', error);
    return false;
  }
}

/**
 * Rate Limit Configurations - Sa3l bach tbedel
 */
export const RATE_LIMITS = {
  // Login: 5 attempts f 15 d9ay9
  LOGIN: {
    maxRequests: 5,
    windowSeconds: 15 * 60, // 15 minutes
    message: 'Too many login attempts. Please try again in 15 minutes.',
  },
  
  // Register OTP: 3 requests f 10 d9ay9
  REGISTER_OTP: {
    maxRequests: 3,
    windowSeconds: 10 * 60, // 10 minutes
    message: 'Too many registration attempts. Please try again in 10 minutes.',
  },
  
  // Password Reset OTP: 3 requests f 10 d9ay9
  PASSWORD_RESET_OTP: {
    maxRequests: 3,
    windowSeconds: 10 * 60, // 10 minutes
    message: 'Too many password reset attempts. Please try again in 10 minutes.',
  },
  
  // OTP Verification: 5 attempts f 10 d9ay9
  OTP_VERIFY: {
    maxRequests: 5,
    windowSeconds: 10 * 60, // 10 minutes
    message: 'Too many verification attempts. Please try again in 10 minutes.',
  },
};

/**
 * Express Middleware for Rate Limiting
 * @param {string} limitType - Type from RATE_LIMITS
 * @param {function} getKey - Function to extract unique key from request
 */
export function rateLimitMiddleware(limitType, getKey) {
  return async (req, res, next) => {
    try {
      const limit = RATE_LIMITS[limitType];
      if (!limit) {
        return next(); // No limit configured, pass through
      }
      
      const key = getKey(req);
      if (!key) {
        return next(); // No key, pass through
      }
      
      const result = await checkRateLimit(key, limit.maxRequests, limit.windowSeconds);
      
      // Add rate limit info to response headers
      res.setHeader('X-RateLimit-Limit', limit.maxRequests);
      res.setHeader('X-RateLimit-Remaining', result.remaining);
      res.setHeader('X-RateLimit-Reset', result.resetIn);
      
      if (!result.allowed) {
        return res.status(429).json({
          message: limit.message,
          retryAfter: result.resetIn,
        });
      }
      
      next();
    } catch (error) {
      console.error('Rate limit middleware error:', error);
      next(); // Fail open - allow request
    }
  };
}
