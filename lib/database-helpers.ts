import getDatabase from './database';

// PostgreSQL types
interface QueryResult<T = any> {
  rows: T[];
  rowCount: number | null;
}

interface ResultSetHeader {
  rowCount: number | null;
  rows: any[];
}

// Type-safe query helper
export async function query<T = any>(
  sql: string, 
  params?: any[]
): Promise<T[]> {
  const pool = await getDatabase();
  const result = await pool.query(sql, params);
  return result.rows;
}

// Type-safe single row query
export async function queryOne<T = any>(
  sql: string, 
  params?: any[]
): Promise<T | null> {
  const pool = await getDatabase();
  const result = await pool.query(sql, params);
  return result.rows[0] || null;
}

// Type-safe insert query
export async function insert(
  sql: string, 
  params?: any[]
): Promise<ResultSetHeader> {
  const pool = await getDatabase();
  const result = await pool.query(sql, params);
  return result;
}

// Type-safe update query
export async function update(
  sql: string, 
  params?: any[]
): Promise<ResultSetHeader> {
  const pool = await getDatabase();
  const result = await pool.query(sql, params);
  return result;
}

// Type-safe delete query
export async function deleteQuery(
  sql: string, 
  params?: any[]
): Promise<ResultSetHeader> {
  const pool = await getDatabase();
  const result = await pool.query(sql, params);
  return result;
}

// Transaction helper
export async function transaction<T>(
  callback: (client: any) => Promise<T>
): Promise<T> {
  const pool = await getDatabase();
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Pagination helper
export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export async function paginate<T>(
  baseQuery: string,
  countQuery: string,
  params: any[],
  options: PaginationOptions
): Promise<PaginatedResult<T>> {
  const { page, limit, sortBy, sortOrder = 'DESC' } = options;
  const offset = (page - 1) * limit;

  // Add sorting if specified
  let finalQuery = baseQuery;
  if (sortBy) {
    finalQuery += ` ORDER BY ${sortBy} ${sortOrder}`;
  }

  // Add pagination
  finalQuery += ` LIMIT ${limit} OFFSET ${offset}`;

  const [data, countResult] = await Promise.all([
    query<T>(finalQuery, params),
    queryOne<{ total: number }>(countQuery, params)
  ]);

  const total = countResult?.total || 0;
  const pages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages
    }
  };
}

// Search helper
export interface SearchOptions {
  query?: string;
  filters?: Record<string, any>;
  pagination?: PaginationOptions;
}

export function buildSearchQuery(
  baseQuery: string,
  options: SearchOptions,
  searchFields: string[] = []
): { query: string; params: any[] } {
  let query = baseQuery;
  const params: any[] = [];
  let paramIndex = 1;

  // Add text search
  if (options.query && searchFields.length > 0) {
    const searchConditions = searchFields.map(field => `${field} ILIKE $${paramIndex}`);
    query += ` WHERE (${searchConditions.join(' OR ')})`;
    params.push(`%${options.query}%`);
    paramIndex++;
  }

  // Add filters
  if (options.filters) {
    const filterConditions = Object.entries(options.filters).map(([key, value]) => {
      if (Array.isArray(value)) {
        const placeholders = value.map(() => `$${paramIndex++}`).join(', ');
        return `${key} IN (${placeholders})`;
      } else {
        query += ` AND ${key} = $${paramIndex}`;
        params.push(value);
        paramIndex++;
        return null;
      }
    }).filter(Boolean);

    if (filterConditions.length > 0) {
      const hasWhere = query.includes('WHERE');
      query += hasWhere ? ' AND ' : ' WHERE ';
      query += filterConditions.join(' AND ');
    }
  }

  return { query, params };
}

// Validation helper
export function validateRequired(data: any, requiredFields: string[]): string[] {
  const missing: string[] = [];
  
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      missing.push(field);
    }
  }
  
  return missing;
}

// Error handling helper
export class DatabaseError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

// Helper to handle database errors consistently
export function handleDatabaseError(error: any): DatabaseError {
  console.error('Database error:', error);
  
  if (error.code === '23505') {
    return new DatabaseError('Duplicate entry found', 'DUPLICATE_ENTRY');
  }
  
  if (error.code === '23503') {
    return new DatabaseError('Foreign key constraint violation', 'FOREIGN_KEY_VIOLATION');
  }
  
  if (error.code === '23502') {
    return new DatabaseError('Not null constraint violation', 'NOT_NULL_VIOLATION');
  }
  
  if (error.code === '23514') {
    return new DatabaseError('Check constraint violation', 'CHECK_CONSTRAINT_VIOLATION');
  }
  
  return new DatabaseError(error.message || 'Unknown database error');
}
