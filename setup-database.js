const { Pool } = require('pg');
const fs = require('fs');

const DATABASE_URL = 'postgresql://neondb_owner:npg_6KEwYlCmR3vW@ep-lively-rain-angs50rn-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function setupDatabase() {
  console.log('🚀 Setting up database...');
  
  const pool = new Pool({
    connectionString: DATABASE_URL
  });

  try {
    // Read and execute the schema file
    const schemaSQL = fs.readFileSync('./create-tables.sql', 'utf8');
    
    console.log('📋 Creating tables...');
    await pool.query(schemaSQL);
    console.log('✅ Tables created successfully!');
    
    // Check if we have data
    const propertiesResult = await pool.query('SELECT COUNT(*) FROM properties');
    const propertyCount = parseInt(propertiesResult.rows[0].count);
    
    console.log(`📊 Current property count: ${propertyCount}`);
    
    if (propertyCount === 0) {
      console.log('📝 Database is empty. You may need to run the seed script.');
      console.log('💡 Run: node lib/seed.js (if it exists) or create sample data');
    } else {
      console.log('✅ Database has data!');
    }
    
    // Test query to show sample data
    if (propertyCount > 0) {
      const sampleProperties = await pool.query('SELECT title, rent, city FROM properties LIMIT 3');
      console.log('\n🏠 Sample properties:');
      sampleProperties.rows.forEach((prop, index) => {
        console.log(`${index + 1}. ${prop.title} - $${prop.rent} (${prop.city})`);
      });
    }
    
    await pool.end();
    console.log('\n🎉 Database setup complete!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    await pool.end();
  }
}

setupDatabase();
