const fs = require('fs');

console.log('🔍 Debugging .env.local file...');

try {
  const content = fs.readFileSync('.env.local', 'utf8');
  console.log('📄 Raw file content:');
  console.log(content);
  
  // Check for encoding issues
  const bytes = Buffer.from(content, 'utf8');
  console.log('📊 File size:', bytes.length, 'bytes');
  
  // Show first 200 characters
  console.log('📋 First 200 chars:', content.substring(0, 200));
  
} catch (error) {
  console.error('❌ Error reading file:', error.message);
}
