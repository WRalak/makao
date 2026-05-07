const fs = require('fs');
const path = require('path');

console.log('🔍 Checking .env.local file...');

const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  console.log('✅ .env.local file exists');
  const content = fs.readFileSync(envPath, 'utf8');
  console.log('� File content preview:');
  console.log(content.substring(0, 200) + '...');
} else {
  console.log('❌ .env.local file not found');
}

// Try loading dotenv
try {
  require('dotenv').config();
  console.log('✅ dotenv loaded');
} catch (error) {
  console.log('❌ dotenv error:', error.message);
}

console.log('🔍 Process env after dotenv:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Found' : '❌ Not found');

if (process.env.DATABASE_URL) {
  const dbUrl = process.env.DATABASE_URL;
  console.log('📡 Connection:', dbUrl.replace(/npg_[^@]+/, 'npg_***'));
  console.log('🌐 Host:', dbUrl.includes('ep-lively-rain') ? '✅ Correct (lively-rain)' : '❌ Wrong host');
}
