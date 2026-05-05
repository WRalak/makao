const { Pool } = require('pg');

async function testConnection() {
  const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_6KEwYlCmR3vW@ep-lively-rain-angs50rn-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=verify-full&channel_binding=require',
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔌 Testing database connection...');
    const result = await pool.query('SELECT NOW() as current_time, version() as version');
    console.log('✅ Database connected successfully!');
    console.log('📊 Current time:', result.rows[0].current_time);
    console.log('📋 PostgreSQL version:', result.rows[0].version);
    
    // Check if tables exist
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    console.log('📁 Available tables:', tables.rows.map(row => row.table_name));
    
    // Check users table
    const userCount = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log('👥 Users in database:', userCount.rows[0].count);
    
    // Check properties table
    const propertyCount = await pool.query('SELECT COUNT(*) as count FROM properties');
    console.log('🏠 Properties in database:', propertyCount.rows[0].count);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Code:', error.code);
    console.error('Hint:', error.hint);
  } finally {
    await pool.end();
  }
}

testConnection();
