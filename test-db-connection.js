require('dotenv').config();
const { Pool } = require('pg');

async function testConnection() {
  console.log('🔌 Testing Neon database connection...');
  
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ DATABASE_URL not found in .env.local');
    return;
  }
  
  console.log('📡 Connection string:', dbUrl.replace(/npg_[^@]+/, 'npg_***'));
  
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const client = await pool.connect();
    console.log('✅ Database connection successful!');
    
    const result = await client.query('SELECT NOW() as current_time, version() as version');
    console.log('⏰ Current time:', result.rows[0].current_time);
    console.log('📊 PostgreSQL version:', result.rows[0].version);
    
    // Test basic table query
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    if (tables.rows.length > 0) {
      console.log('📋 Existing tables:');
      tables.rows.forEach(row => console.log(`  - ${row.table_name}`));
    } else {
      console.log('📋 No tables found (expected for new database)');
    }
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('🔧 Details:', error);
  }
}

testConnection();
