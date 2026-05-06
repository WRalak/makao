import { Pool, PoolConfig } from 'pg';

// Production-ready database connection pool configuration
const poolConfig: PoolConfig = {
  // Connection settings
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'makao',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  
  // Pool settings for high traffic
  max: 20, // Maximum number of connections in pool
  min: 5,  // Minimum number of connections in pool
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 10000, // Return error after 10 seconds if connection not available
  
  // Query timeout
  query_timeout: 30000, // 30 seconds query timeout
  
  // SSL for production
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
  
  // Connection retry handled by connectionTimeoutMillis
  
  // Connection validation
  allowExitOnIdle: false,
  maxUses: 7500, // Number of times a connection can be used before being closed
};

// Create connection pool
const pool = new Pool(poolConfig);

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Health check function
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Get pool stats
export function getPoolStats() {
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
  };
}

// Graceful shutdown
export async function closePool() {
  await pool.end();
}

export default pool;
