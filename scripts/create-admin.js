const bcrypt = require('bcrypt');

async function createAdminUser() {
  try {
    // Hash the password
    const password = '12345';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('Creating admin user...');
    console.log('Email: wallaceralak@gmail.com');
    console.log('Password: 12345');
    console.log('Hashed password:', hashedPassword);
    
    // Create the admin user data
    const adminUser = {
      name: 'Admin User',
      email: 'wallaceralak@gmail.com',
      password: hashedPassword,
      role: 'admin',
      is_active: true,
      is_banned: false,
      email_verified: true
    };
    
    console.log('Admin user data prepared:', {
      ...adminUser,
      password: '[HASHED]'
    });
    
    // Since we can't connect to the database directly,
    // let's create a simple API endpoint or provide instructions
    console.log('\n=== ADMIN USER CREATION INSTRUCTIONS ===');
    console.log('1. Run the development server: npm run dev');
    console.log('2. Use the following SQL to create the admin user:');
    console.log('\n-- Copy and run this SQL in your Neon database:');
    console.log(`INSERT INTO users (name, email, password, role, is_active, is_banned, email_verified, created_at, updated_at) VALUES ('Admin User', 'wallaceralak@gmail.com', '${hashedPassword}', 'admin', true, false, true, NOW(), NOW()) ON CONFLICT (email) DO NOTHING;`);
    
    return adminUser;
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

createAdminUser();
