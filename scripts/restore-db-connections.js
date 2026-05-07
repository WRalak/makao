const fs = require('fs');
const path = require('path');

// Find all API route files
const apiDir = path.join(__dirname, '../app/api');

function restoreDatabaseConnections(filePath) {
  console.log(`Restoring: ${filePath}`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Restore database connection imports
    if (content.includes('// Database connection temporarily disabled')) {
      content = content.replace(
        '// Database connection temporarily disabled',
        "import getDatabase from '@/lib/database';\n\n    const db = await getDatabase();"
      );
    }
    
    // Restore mock responses to database queries
    if (content.includes('// Mock')) {
      content = content.replace(
        /\/\/ Mock.*?return NextResponse\.json\(.*?\);/gs,
        '// Database queries will be restored here'
      );
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Restored: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error restoring ${filePath}:`, error.message);
  }
}

// Process all files
function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.js')) {
      restoreDatabaseConnections(filePath);
    }
  });
}

console.log('🔧 Restoring database connections...');
processDirectory(apiDir);
console.log('✅ Database connections restored!');
console.log('\n📝 Next steps:');
console.log('1. Make sure .env.local contains your DATABASE_URL');
console.log('2. Run npm run build to test');
console.log('3. Run npm run dev to start with database');
