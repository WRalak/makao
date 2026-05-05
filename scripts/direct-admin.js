const { Pool } = require('pg');
const bcrypt = require('bcrypt');

async function createAdminDirectly() {
  const connectionString = 'postgresql://neondb_owner:npg_6KEwYlCmR3vW@ep-lively-rain-angs50rn-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require';
  
  const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    console.log('✅ Connected to database');
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('12345', 10);
    console.log('✅ Password hashed');
    
    // Check if user already exists
    const existingUser = await client.query(
      'SELECT id, email, role FROM users WHERE email = $1',
      ['wallaceralak@gmail.com']
    );
    
    if (existingUser.rows.length > 0) {
      console.log('📋 Admin user already exists:');
      console.log('  Email:', existingUser.rows[0].email);
      console.log('  Role:', existingUser.rows[0].role);
      console.log('  ID:', existingUser.rows[0].id);
    } else {
      // Create the admin user
      const result = await client.query(
        `INSERT INTO users (name, email, password, role, is_active, is_banned, email_verified, created_at, updated_at) 
         VALUES ('Admin User', $1, $2, 'admin', true, false, true, NOW(), NOW()) 
         RETURNING id, email, role, created_at`,
        ['wallaceralak@gmail.com', hashedPassword]
      );
      
      const adminUser = result.rows[0];
      console.log('✅ Admin user created successfully:');
      console.log('  Email:', adminUser.email);
      console.log('  Role:', adminUser.role);
      console.log('  ID:', adminUser.id);
      console.log('  Created:', adminUser.created_at);
    }
    
    client.release();
    console.log('✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    // Provide SQL for manual execution
    const hashedPassword = await bcrypt.hash('12345', 10);
    console.log('\n📝 Manual SQL to execute in Neon dashboard:');
    console.log(`INSERT INTO users (name, email, password, role, is_active, is_banned, email_verified, created_at, updated_at) VALUES ('Admin User', 'wallaceralak@gmail.com', '${hashedPassword}', 'admin', true, false, true, NOW(), NOW()) ON CONFLICT (email) DO NOTHING;`);
    
  } finally {
    await pool.end();
  }
}

createAdminDirectly();
