const fs = require('fs');

// Force update .env.local with exact content
const correctContent = `DATABASE_URL="postgresql://neondb_owner:npg_6KEwYlCmR3vW@ep-lively-rain-angs50rn-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"`;

try {
  // Remove existing file
  if (fs.existsSync('.env.local')) {
    fs.unlinkSync('.env.local');
    console.log('🗑️ Removed old .env.local');
  }
  
  // Create new file with correct content
  fs.writeFileSync('.env.local', correctContent, 'utf8');
  console.log('✅ Created new .env.local with correct database URL');
  
  // Verify content
  const verify = fs.readFileSync('.env.local', 'utf8');
  console.log('🔍 Verification:', verify.includes('ep-lively-rain') ? '✅ Correct host' : '❌ Wrong host');
  
} catch (error) {
  console.error('❌ Error:', error.message);
}
