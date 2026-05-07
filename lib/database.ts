import { Pool } from 'pg';

// Function to get current DATABASE_URL
function getDatabaseUrl() {
  return process.env.DATABASE_URL;
}

declare global {
  var pool: Pool | null;
}

// Create or reuse global pool instance
const globalPool = global.pool || (() => {
  // Read DATABASE_URL dynamically to avoid Next.js loading order issues
  const dbUrl = getDatabaseUrl();
  
  if (!dbUrl) {
    console.warn('No DATABASE_URL provided. Database features will be disabled.');
    return null;
  }
  
  console.log('🔌 Connecting to database:', dbUrl.replace(/npg_[^@]+/, 'npg_***'));
  
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: {
      rejectUnauthorized: false
    },
    max: 3, // Further reduced pool size for stability
    idleTimeoutMillis: 30000, // Shorter idle timeout
    connectionTimeoutMillis: 15000, // Longer connection timeout
    query_timeout: 30000, // Query timeout
  });
  
  // Handle pool errors
  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
  });
  
  return pool;
})();

// Assign to global for reuse across hot reloads
if (!global.pool) {
  global.pool = globalPool;
}

async function getDatabase() {
  // If pool doesn't exist, try to create it again
  if (!global.pool) {
    console.warn('Global pool not found, attempting to recreate...');
    const dbUrl = getDatabaseUrl();
    
    if (!dbUrl) {
      throw new Error('DATABASE_URL not set in environment variables.');
    }
    
    // Create new pool
    const pool = new Pool({
      connectionString: dbUrl,
      ssl: {
        rejectUnauthorized: false
      },
      max: 3,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 15000,
      query_timeout: 30000,
    });
    
    global.pool = pool;
  }
  
  if (!global.pool) {
    throw new Error('Failed to create database pool. Please check DATABASE_URL configuration.');
  }
  
  try {
    // Test the connection with timeout
    const client = await global.pool.connect();
    
    // Set a timeout for the query
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Connection test timeout')), 5000);
    });
    
    await Promise.race([
      client.query('SELECT 1'),
      timeoutPromise
    ]);
    
    client.release();
    
    return global.pool;
  } catch (error) {
    console.error('Database connection failed:', error);
    
    // Try to get more specific error information
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        throw new Error('Database connection timeout. Please check your network connection and try again.');
      } else if (error.message.includes('ENOTFOUND')) {
        throw new Error('Database host not found. Please check your connection string.');
      } else if (error.message.includes('ECONNREFUSED')) {
        throw new Error('Database connection refused. The database server may be down.');
      } else if (error.message.includes('password authentication failed')) {
        throw new Error('Database authentication failed. Please check your database credentials.');
      } else {
        throw new Error(`Database connection failed: ${error.message}`);
      }
    }
    
    throw new Error('Database connection failed: Unknown error');
  }
}

// Graceful shutdown handler
process.on('SIGINT', async () => {
  console.log('Received SIGINT, closing database connections...');
  if (global.pool) {
    await global.pool.end();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, closing database connections...');
  if (global.pool) {
    await global.pool.end();
  }
  process.exit(0);
});

export default getDatabase;
export { globalPool as pool };
