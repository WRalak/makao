const fs = require('fs');
const path = require('path');

// Create proper .env.local file with correct encoding
const correctContent = `DATABASE_URL="postgresql://neondb_owner:npg_6KEwYlCmR3vW@ep-lively-rain-angs50rn-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"`;

const envPath = path.join(__dirname, '.env.local');

try {
  // Write with UTF-8 encoding
  fs.writeFileSync(envPath, correctContent, { encoding: 'utf8' });
  
  console.log('✅ .env.local file recreated with correct encoding');
  console.log('🔌 Database: ep-lively-rain-angs50rn-pooler.c-6.us-east-1.aws.neon.tech');
  
  // Verify the content
  const verifyContent = fs.readFileSync(envPath, 'utf8');
  console.log('📋 Verification:', verifyContent.includes('ep-lively-rain') ? '✅ Correct host' : '❌ Wrong host');
  
} catch (error) {
  console.error('❌ Error creating .env.local:', error.message);
}
