require('dotenv').config({ path: '.env.local' });

console.log('🔍 Testing database connection...');
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);

if (process.env.DATABASE_URL) {
  console.log('🌐 Host check:', process.env.DATABASE_URL.includes('ep-lively-rain') ? '✅ Correct' : '❌ Wrong');
  
  // Import and test the actual database function
  import('./lib/database.js').then(async ({ default: getDatabase }) => {
    try {
      const db = await getDatabase();
      console.log('✅ Database connection successful!');
      
      const result = await db.query('SELECT NOW() as current_time');
      console.log('⏰ Time:', result.rows[0].current_time);
      
      await db.end();
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
    }
  }).catch(error => {
    console.error('❌ Import failed:', error.message);
  });
} else {
  console.log('❌ DATABASE_URL not found');
}
