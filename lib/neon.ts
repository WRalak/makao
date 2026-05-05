import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Connection string for Neon PostgreSQL
const connectionString = process.env.DATABASE_URL!;

// Create postgres pool
const pool = new Pool({
  connectionString,
  ssl: true
});

// Create drizzle instance
export const db = drizzle(pool, { schema });

// Export schema for easy access
export * from './schema';

// Helper function to test connection
export async function testConnection() {
  try {
    await pool.query('SELECT 1');
    console.log('✅ Connected to Neon PostgreSQL');
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to Neon PostgreSQL:', error);
    return false;
  }
}
