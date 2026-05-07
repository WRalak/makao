// Fresh test without any cached modules
console.log('🔄 Fresh database connection test...');

// Clear require cache
delete require.cache[require.resolve('dotenv')];

// Load environment fresh
require('dotenv').config({ path: '.env.local' });

const dbUrl = process.env.DATABASE_URL;
console.log('📡 DATABASE_URL:', dbUrl ? '✅ Found' : '❌ Not found');

if (dbUrl) {
  console.log('🌐 Host:', dbUrl.includes('ep-lively-rain') ? '✅ Correct (lively-rain)' : '❌ Wrong host');
  
  // Test connection directly
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  pool.connect()
    .then(client => {
      console.log('✅ Direct connection successful!');
      return client.query('SELECT NOW() as current_time');
    })
    .then(result => {
      console.log('⏰ Server time:', result.rows[0].current_time);
      pool.end();
    })
    .catch(error => {
      console.error('❌ Direct connection failed:', error.message);
      pool.end();
    });
}
