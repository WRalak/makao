// Force reload of environment variables
console.log('🔄 Testing with forced environment reload...');

// Clear all environment variables
delete process.env.DATABASE_URL;

// Force dotenv reload with explicit path
const dotenv = require('dotenv');
const result = dotenv.config({ 
  path: '.env.local',
  override: true  // Force override existing values
});

console.log('📋 Dotenv result:', result.error ? '❌ Error' : '✅ Success');
if (result.error) {
  console.error('Dotenv error:', result.error);
}

const dbUrl = process.env.DATABASE_URL;
console.log('📡 DATABASE_URL after reload:', dbUrl ? '✅ Found' : '❌ Not found');

if (dbUrl) {
  console.log('🌐 Host check:', dbUrl.includes('ep-lively-rain') ? '✅ Correct (lively-rain)' : '❌ Wrong host');
  console.log('📡 URL (masked):', dbUrl.replace(/npg_[^@]+/, 'npg_***'));
  
  // Test connection
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  pool.connect()
    .then(client => {
      console.log('🎉 Database connection successful with reloaded environment!');
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
