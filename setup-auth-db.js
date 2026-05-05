const { Pool } = require('pg');
const fs = require('fs');

async function setupDatabase() {
  console.log('🔧 Setting up PropRent database...');
  
  const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_6KEwYlCmR3vW@ep-lively-rain-angs50rn-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
    ssl: { rejectUnauthorized: false }
  });

  try {
    // Check existing tables first
    console.log('🔍 Checking existing tables...');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('📋 Existing tables:');
    tablesResult.rows.forEach(row => {
      console.log('   - ' + row.table_name);
    });
    
    // Drop existing tables if they exist (for clean setup)
    if (tablesResult.rows.length > 0) {
      console.log('🗑️  Dropping existing tables...');
      await pool.query('DROP TABLE IF EXISTS properties CASCADE');
      await pool.query('DROP TABLE IF EXISTS users CASCADE');
    }
    
    // Read and execute the SQL script
    console.log('⏳ Creating tables and inserting data...');
    const sqlScript = fs.readFileSync('./scripts/setup-auth.sql', 'utf8');
    await pool.query(sqlScript);
    
    console.log('✅ Database setup completed successfully!');
    
    // Test the setup
    const usersResult = await pool.query('SELECT COUNT(*) as count FROM users');
    const propertiesResult = await pool.query('SELECT COUNT(*) as count FROM properties');
    
    console.log('📊 Database Summary:');
    console.log('   Users: ' + usersResult.rows[0].count);
    console.log('   Properties: ' + propertiesResult.rows[0].count);
    
    // Show demo users
    const demoUsers = await pool.query('SELECT email, role FROM users ORDER BY id LIMIT 3');
    console.log('👤 Demo Users:');
    demoUsers.rows.forEach(user => {
      console.log('   - ' + user.email + ' (' + user.role + ') - password: "password"');
    });
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
  }
}

setupDatabase();
