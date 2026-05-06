import Redis from 'ioredis';

// Validate required Redis environment variables
const redisHost = process.env.REDIS_HOST;
const redisPort = process.env.REDIS_PORT;
const redisPassword = process.env.REDIS_PASSWORD;
const redisDb = process.env.REDIS_DB;

if (!redisHost) {
  throw new Error('REDIS_HOST environment variable is required');
}

// Redis configuration for production
const redisConfig = {
  host: redisHost,
  port: parseInt(redisPort || '6379'),
  password: redisPassword,
  db: parseInt(redisDb || '0'),
  
  // Connection settings
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  enableReadyCheck: true,
  maxLoadingTimeout: 5000,
  
  // Pool settings
  family: 4,
  keepAlive: 30000,
  
  // Lazy connect for better performance
  lazyConnect: true,
  
  // Reconnect settings
  reconnectOnError: (err: Error) => {
    const targetError = 'READONLY';
    return err.message.includes(targetError);
  },
};

// Create Redis client
const redis = new Redis(redisConfig);

// Handle Redis events
redis.on('connect', () => {
  console.log('Redis connected successfully');
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

redis.on('close', () => {
  console.log('Redis connection closed');
});

// Cache helper functions
export class CacheManager {
  private static instance: CacheManager;
  private redis: Redis;

  constructor() {
    this.redis = redis;
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  // Set cache with TTL
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      if (ttl) {
        await this.redis.setex(key, ttl, serializedValue);
      } else {
        await this.redis.set(key, serializedValue);
      }
    } catch (error) {
      console.error('Cache set error:', error);
      throw error;
    }
  }

  // Get cache value
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      if (value === null) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  // Delete cache key
  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
      throw error;
    }
  }

  // Check if key exists
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  // Set multiple keys
  async mset(keyValuePairs: Record<string, any>): Promise<void> {
    try {
      const serializedPairs: string[] = [];
      for (const [key, value] of Object.entries(keyValuePairs)) {
        serializedPairs.push(key, JSON.stringify(value));
      }
      await this.redis.mset(...serializedPairs);
    } catch (error) {
      console.error('Cache mset error:', error);
      throw error;
    }
  }

  // Get multiple keys
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      const values = await this.redis.mget(...keys);
      return values.map(value => {
        if (value === null) return null;
        try {
          return JSON.parse(value) as T;
        } catch {
          return null;
        }
      });
    } catch (error) {
      console.error('Cache mget error:', error);
      return new Array(keys.length).fill(null);
    }
  }

  // Increment counter
  async incr(key: string): Promise<number> {
    try {
      return await this.redis.incr(key);
    } catch (error) {
      console.error('Cache incr error:', error);
      throw error;
    }
  }

  // Increment counter with expiry
  async incrWithExpiry(key: string, ttl: number): Promise<number> {
    try {
      const value = await this.redis.incr(key);
      await this.redis.expire(key, ttl);
      return value;
    } catch (error) {
      console.error('Cache incrWithExpiry error:', error);
      throw error;
    }
  }

  // Get Redis info/stats
  async getInfo(): Promise<string> {
    try {
      return await this.redis.info();
    } catch (error) {
      console.error('Redis info error:', error);
      throw error;
    }
  }

  // Flush all keys (use with caution)
  async flushall(): Promise<void> {
    try {
      await this.redis.flushall();
    } catch (error) {
      console.error('Cache flushall error:', error);
      throw error;
    }
  }

  // Close Redis connection
  async quit(): Promise<void> {
    try {
      await this.redis.quit();
    } catch (error) {
      console.error('Redis quit error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const cache = CacheManager.getInstance();

// Cache key generators
export const CacheKeys = {
  user: (id: number) => `user:${id}`,
  userSession: (id: number) => `session:${id}`,
  properties: (filters?: string) => `properties:${filters || 'all'}`,
  property: (id: number) => `property:${id}`,
  contactMessages: (page: number, filters?: string) => `contact:page:${page}:${filters || 'all'}`,
  jobApplications: (page: number, filters?: string) => `careers:page:${page}:${filters || 'all'}`,
  newsletterSubscriptions: (page: number, filters?: string) => `newsletter:page:${page}:${filters || 'all'}`,
  rateLimit: (identifier: string) => `rate_limit:${identifier}`,
  searchResults: (query: string) => `search:${query}`,
  analytics: (type: string, period: string) => `analytics:${type}:${period}`,
};

export default redis;
