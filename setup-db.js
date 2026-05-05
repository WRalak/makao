const { Pool } = require('pg');
const fs = require('fs');

// Connection configuration
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_6KEwYlCmR3vW@ep-lively-rain-angs50rn-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function setupDatabase() {
  console.log('🚀 Setting up Neon database...');
  
  try {
    // Read the SQL file
    const sql = fs.readFileSync('create-tables.sql', 'utf8');
    
    // Connect to database
    const client = await pool.connect();
    console.log('✅ Connected to Neon database');
    
    // Execute SQL
    await client.query(sql);
    console.log('✅ Database schema created successfully');
    
    // Release client
    client.release();
    
    console.log('🎉 Database setup complete!');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  } finally {
    // End pool
    await pool.end();
  }
}

setupDatabase();
