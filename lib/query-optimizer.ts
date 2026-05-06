import { cache, CacheKeys } from './redis-client';
import pool from './database-connection-pool';

export interface QueryOptions {
  useCache?: boolean;
  cacheTTL?: number;
  pagination?: {
    page: number;
    limit: number;
  };
  orderBy?: string;
  filters?: Record<string, any>;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class QueryOptimizer {
  // Optimized query with caching and pagination
  static async query<T>(
    sql: string,
    params: any[] = [],
    options: QueryOptions = {}
  ): Promise<T[]> {
    const { useCache = false, cacheTTL = 300 } = options;

    if (useCache) {
      const cacheKey = this.generateCacheKey(sql, params);
      const cached = await cache.get<T[]>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const result = await pool.query(sql, params);
      const data = result.rows;

      if (useCache) {
        const cacheKey = this.generateCacheKey(sql, params);
        await cache.set(cacheKey, data, cacheTTL);
      }

      return data;
    } catch (error) {
      console.error('Query error:', error);
      throw error;
    }
  }

  // Paginated query with optimized COUNT
  static async paginatedQuery<T>(
    sql: string,
    countSql: string,
    params: any[] = [],
    options: QueryOptions & { pagination: { page: number; limit: number } }
  ): Promise<PaginatedResult<T>> {
    const { pagination, useCache = false, cacheTTL = 300 } = options;
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    if (useCache) {
      const cacheKey = this.generateCacheKey(`${sql}:${countSql}`, [...params, page, limit]);
      const cached = await cache.get<PaginatedResult<T>>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      // Execute both queries in parallel for better performance
      const [dataResult, countResult] = await Promise.all([
        pool.query(`${sql} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`, [...params, limit, offset]),
        pool.query(countSql, params)
      ]);

      const data = dataResult.rows;
      const total = parseInt(countResult.rows[0].count);
      const totalPages = Math.ceil(total / limit);

      const result: PaginatedResult<T> = {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };

      if (useCache) {
        const cacheKey = this.generateCacheKey(`${sql}:${countSql}`, [...params, page, limit]);
        await cache.set(cacheKey, result, cacheTTL);
      }

      return result;
    } catch (error) {
      console.error('Paginated query error:', error);
      throw error;
    }
  }

  // Optimized contact messages query
  static async getContactMessages(
    filters: {
      status?: string;
      category?: string;
      priority?: string;
    } = {},
    pagination: { page: number; limit: number }
  ): Promise<PaginatedResult<any>> {
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    // Build WHERE clause
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.status) {
      conditions.push(`status = $${paramIndex++}`);
      params.push(filters.status);
    }
    if (filters.category) {
      conditions.push(`category = $${paramIndex++}`);
      params.push(filters.category);
    }
    if (filters.priority) {
      conditions.push(`priority = $${paramIndex++}`);
      params.push(filters.priority);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT id, name, email, phone, subject, message, category, priority, status, 
             created_at, updated_at, responded_at, responded_by
      FROM contact_messages 
      ${whereClause}
      ORDER BY created_at DESC
    `;

    const countSql = `
      SELECT COUNT(*) as count 
      FROM contact_messages 
      ${whereClause}
    `;

    return this.paginatedQuery(sql, countSql, params, {
      pagination,
      useCache: true,
      cacheTTL: 60, // 1 minute cache for messages
    });
  }

  // Optimized job applications query
  static async getJobApplications(
    filters: {
      status?: string;
      jobTitle?: string;
      location?: string;
    } = {},
    pagination: { page: number; limit: number }
  ): Promise<PaginatedResult<any>> {
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.status) {
      conditions.push(`status = $${paramIndex++}`);
      params.push(filters.status);
    }
    if (filters.jobTitle) {
      conditions.push(`job_title ILIKE $${paramIndex++}`);
      params.push(`%${filters.jobTitle}%`);
    }
    if (filters.location) {
      conditions.push(`location ILIKE $${paramIndex++}`);
      params.push(`%${filters.location}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT id, job_title, job_type, location, applicant_name, email, phone, 
             resume_url, cover_letter, linkedin_url, portfolio_url, experience_years,
             current_company, current_position, salary_expectations, availability,
             status, created_at, updated_at, reviewed_at, reviewed_by, notes
      FROM job_applications 
      ${whereClause}
      ORDER BY created_at DESC
    `;

    const countSql = `
      SELECT COUNT(*) as count 
      FROM job_applications 
      ${whereClause}
    `;

    return this.paginatedQuery(sql, countSql, params, {
      pagination,
      useCache: true,
      cacheTTL: 60,
    });
  }

  // Optimized newsletter subscriptions query
  static async getNewsletterSubscriptions(
    filters: {
      status?: string;
      source?: string;
      search?: string;
    } = {},
    pagination: { page: number; limit: number }
  ): Promise<PaginatedResult<any>> {
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.status) {
      conditions.push(`status = $${paramIndex++}`);
      params.push(filters.status);
    }
    if (filters.source) {
      conditions.push(`source = $${paramIndex++}`);
      params.push(filters.source);
    }
    if (filters.search) {
      conditions.push(`(email ILIKE $${paramIndex++} OR name ILIKE $${paramIndex++})`);
      params.push(`%${filters.search}%`, `%${filters.search}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT id, email, name, status, source, preferences, 
             created_at, updated_at, unsubscribed_at
      FROM newsletter_subscriptions 
      ${whereClause}
      ORDER BY created_at DESC
    `;

    const countSql = `
      SELECT COUNT(*) as count 
      FROM newsletter_subscriptions 
      ${whereClause}
    `;

    return this.paginatedQuery(sql, countSql, params, {
      pagination,
      useCache: true,
      cacheTTL: 120, // 2 minutes cache for subscriptions
    });
  }

  // Batch insert for high performance
  static async batchInsert(
    tableName: string,
    columns: string[],
    values: any[][],
    options: { batchSize?: number; returning?: string[] } = {}
  ): Promise<any[]> {
    const { batchSize = 1000, returning = ['id'] } = options;

    if (values.length === 0) return [];

    try {
      const results: any[] = [];

      // Process in batches to avoid memory issues
      for (let i = 0; i < values.length; i += batchSize) {
        const batch = values.slice(i, i + batchSize);
        
        const valuePlaceholders = batch.map((_, index) => {
          const rowPlaceholders = columns.map((_, colIndex) => {
            const paramIndex = index * columns.length + colIndex + 1;
            return `$${paramIndex}`;
          });
          return `(${rowPlaceholders.join(', ')})`;
        }).join(', ');

        const sql = `
          INSERT INTO ${tableName} (${columns.join(', ')})
          VALUES ${valuePlaceholders}
          ${returning.length > 0 ? `RETURNING ${returning.join(', ')}` : ''}
        `;

        const flatParams = batch.flat();
        const result = await pool.query(sql, flatParams);
        
        if (returning.length > 0) {
          results.push(...result.rows);
        }
      }

      return results;
    } catch (error) {
      console.error('Batch insert error:', error);
      throw error;
    }
  }

  // Cache key generator
  private static generateCacheKey(sql: string, params: any[]): string {
    const hash = require('crypto')
      .createHash('md5')
      .update(`${sql}:${JSON.stringify(params)}`)
      .digest('hex');
    return `query:${hash}`;
  }

  // Invalidate cache by pattern
  static async invalidateCache(pattern: string): Promise<void> {
    try {
      // This would require Redis SCAN or KEYS command
      // For now, we'll implement a simple version
      console.log(`Cache invalidation for pattern: ${pattern}`);
      // In production, use Redis SCAN with MATCH pattern
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }

  // Database health check
  static async healthCheck(): Promise<{
    database: boolean;
    redis: boolean;
    responseTime: number;
  }> {
    const startTime = Date.now();
    
    try {
      // Check database
      const dbResult = await pool.query('SELECT 1');
      const dbHealthy = dbResult.rows.length > 0;
      
      // Check Redis
      const redisHealthy = await cache.exists('health_check');
      
      const responseTime = Date.now() - startTime;
      
      return {
        database: dbHealthy,
        redis: redisHealthy !== false, // false means error, true means either exists or doesn't exist
        responseTime,
      };
    } catch (error) {
      console.error('Health check error:', error);
      return {
        database: false,
        redis: false,
        responseTime: Date.now() - startTime,
      };
    }
  }
}

export default QueryOptimizer;
