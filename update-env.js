const fs = require('fs');

// Update .env.local with correct Neon database URL
const correctDbUrl = 'postgresql://neondb_owner:npg_6KEwYlCmR3vW@ep-lively-rain-angs50rn-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

try {
  let envContent = '';
  
  // Read existing .env.local
  if (fs.existsSync('.env.local')) {
    envContent = fs.readFileSync('.env.local', 'utf8');
  }
  
  // Update or add DATABASE_URL
  const lines = envContent.split('\n');
  let updated = false;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('DATABASE_URL=')) {
      lines[i] = `DATABASE_URL="${correctDbUrl}"`;
      updated = true;
      break;
    }
  }
  
  if (!updated) {
    lines.push(`DATABASE_URL="${correctDbUrl}"`);
  }
  
  // Write back to .env.local
  fs.writeFileSync('.env.local', lines.join('\n'));
  
  console.log('✅ DATABASE_URL updated in .env.local');
  console.log('🔌 New connection: ep-lively-rain-angs50rn-pooler.c-6.us-east-1.aws.neon.tech');
  
} catch (error) {
  console.error('❌ Error updating .env.local:', error.message);
}
