// Test current environment variables
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Testing current environment...');

// Force reload environment
delete process.env.DATABASE_URL;
require('dotenv').config({ path: '.env.local' });

const dbUrl = process.env.DATABASE_URL;
console.log('📡 DATABASE_URL:', dbUrl ? '✅ Found' : '❌ Not found');

if (dbUrl) {
  console.log('🌐 Host:', dbUrl.includes('ep-lively-rain') ? '✅ Correct (lively-rain)' : '❌ Wrong host');
  console.log('📡 Full URL (masked):', dbUrl.replace(/npg_[^@]+/, 'npg_***'));
  
  // Test connection with current env
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  pool.connect()
    .then(client => {
      console.log('✅ Connection test successful!');
      return client.query('SELECT NOW() as current_time');
    })
    .then(result => {
      console.log('⏰ Server time:', result.rows[0].current_time);
      pool.end();
    })
    .catch(error => {
      console.error('❌ Connection failed:', error.message);
      pool.end();
    });
}
