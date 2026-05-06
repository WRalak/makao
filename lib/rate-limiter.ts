import { cache } from './redis-client';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean; // Skip successful requests from counting
  skipFailedRequests?: boolean; // Skip failed requests from counting
  keyGenerator?: (identifier: string) => string; // Custom key generator
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: Date;
  retryAfter?: number; // Seconds to wait before retry
}

export class RateLimiter {
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  async check(identifier: string): Promise<RateLimitResult> {
    const key = this.config.keyGenerator 
      ? this.config.keyGenerator(identifier)
      : `rate_limit:${identifier}`;

    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    try {
      // Get current request count and timestamps
      const pipeline = cache['redis'].pipeline();
      pipeline.zremrangebyscore(key, 0, windowStart);
      pipeline.zcard(key);
      pipeline.expire(key, Math.ceil(this.config.windowMs / 1000));
      
      const results = await pipeline.exec();
      const requestCount = results?.[1]?.[1] as number || 0;

      const remaining = Math.max(0, this.config.maxRequests - requestCount);
      const success = requestCount < this.config.maxRequests;

      let resetTime = new Date(now + this.config.windowMs);

      if (success) {
        // Add current request to the sorted set
        await cache['redis'].zadd(key, now, `${now}-${Math.random()}`);
      } else {
        // Get the oldest request timestamp to calculate retry after
        const oldest = await cache['redis'].zrange(key, 0, 0, 'WITHSCORES');
        if (oldest && oldest.length > 0) {
          const oldestTimestamp = parseInt(oldest[1]);
          resetTime = new Date(oldestTimestamp + this.config.windowMs);
        }
      }

      const retryAfter = success ? undefined : Math.ceil((resetTime.getTime() - now) / 1000);

      return {
        success,
        limit: this.config.maxRequests,
        remaining,
        resetTime,
        retryAfter,
      };
    } catch (error) {
      console.error('Rate limiter error:', error);
      // Fail open - allow request if rate limiter fails
      return {
        success: true,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests - 1,
        resetTime: new Date(now + this.config.windowMs),
      };
    }
  }

  async reset(identifier: string): Promise<void> {
    const key = this.config.keyGenerator 
      ? this.config.keyGenerator(identifier)
      : `rate_limit:${identifier}`;
    
    await cache.del(key);
  }
}

// Predefined rate limiters for different use cases
export const rateLimiters = {
  // General API rate limiter (100 requests per minute)
  api: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
  }),

  // Contact form rate limiter (5 requests per minute per IP)
  contact: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5,
    keyGenerator: (identifier) => `contact:${identifier}`,
  }),

  // Newsletter subscription rate limiter (3 requests per minute per email)
  newsletter: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 3,
    keyGenerator: (identifier) => `newsletter:${identifier}`,
  }),

  // Job application rate limiter (2 requests per minute per email)
  careers: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 2,
    keyGenerator: (identifier) => `careers:${identifier}`,
  }),

  // Search rate limiter (30 requests per minute per IP)
  search: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
    keyGenerator: (identifier) => `search:${identifier}`,
  }),

  // Admin API rate limiter (1000 requests per minute per admin)
  admin: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 1000,
    keyGenerator: (identifier) => `admin:${identifier}`,
  }),

  // Auth rate limiter (10 requests per minute per IP)
  auth: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    keyGenerator: (identifier) => `auth:${identifier}`,
  }),
};

// Express/Next.js middleware helper
export function createRateLimitMiddleware(limiter: RateLimiter, getIdentifier: (req: any) => string) {
  return async (req: any, res?: any, next?: any) => {
    const identifier = getIdentifier(req);
    const result = await limiter.check(identifier);

    // Set rate limit headers
    if (res) {
      res.setHeader('X-RateLimit-Limit', result.limit);
      res.setHeader('X-RateLimit-Remaining', result.remaining);
      res.setHeader('X-RateLimit-Reset', Math.ceil(result.resetTime.getTime() / 1000));
      
      if (!result.success) {
        res.setHeader('Retry-After', result.retryAfter);
        return res.status(429).json({
          error: 'Too many requests',
          message: `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`,
        });
      }
    }

    if (next) {
      next();
    }

    return result;
  };
}

// Helper function to get client IP
export function getClientIP(req: any): string {
  return req.headers['x-forwarded-for']?.split(',')[0] ||
         req.headers['x-real-ip'] ||
         req.connection?.remoteAddress ||
         req.socket?.remoteAddress ||
         req.ip ||
         'unknown';
}

// Helper function to get user identifier
export function getUserIdentifier(req: any): string {
  // Try to get user ID from token/session first
  const token = req.cookies?.get('auth_token')?.value || req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    // In a real implementation, you'd decode the token to get user ID
    // For now, use the token as identifier
    return `user:${token.substring(0, 10)}`;
  }
  
  // Fall back to IP
  return `ip:${getClientIP(req)}`;
}
