const { Pool } = require('pg');

async function testNeonDirect() {
  console.log('🔌 Testing Neon database connection directly...');
  
  // Use your exact connection string
  const dbUrl = 'postgresql://neondb_owner:npg_6KEwYlCmR3vW@ep-lively-rain-angs50rn-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
  
  console.log('📡 Testing connection to: ep-lively-rain-angs50rn-pooler.c-6.us-east-1.aws.neon.tech');
  
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const client = await pool.connect();
    console.log('✅ Database connection successful!');
    
    const result = await client.query('SELECT NOW() as current_time, version() as version');
    console.log('⏰ Current time:', result.rows[0].current_time);
    console.log('📊 PostgreSQL version:', result.rows[0].version.split(',')[0]);
    
    // Test basic table query
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
      LIMIT 10
    `);
    
    if (tables.rows.length > 0) {
      console.log('📋 Found tables:');
      tables.rows.forEach(row => console.log(`  - ${row.table_name}`));
    } else {
      console.log('📋 No tables found (expected for new database)');
    }
    
    client.release();
    await pool.end();
    
    console.log('🎉 Neon database is ready for use!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('🔧 Details:', error);
  }
}

testNeonDirect();
