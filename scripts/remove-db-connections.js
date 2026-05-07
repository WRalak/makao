const fs = require('fs');
const path = require('path');

// Find all API route files
const apiDir = path.join(__dirname, '../app/api');

function removeDatabaseConnections(filePath) {
  console.log(`Processing: ${filePath}`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove database connection imports
    content = content.replace(/import\s+connectDB\s+from\s+['"]@\/lib\/(mongoose|database)['"];?\s*/g, '');
    content = content.replace(/import\s+getDatabase\s+from\s+['"]@\/lib\/database['"];?\s*/g, '');
    
    // Remove database connection calls
    content = content.replace(/await\s+connectDB\(\);?\s*/g, '');
    content = content.replace(/const\s+pool\s*=\s*await\s+connectDB\(\);?\s*/g, '');
    content = content.replace(/const\s+db\s*=\s*await\s+getDatabase\(\);?\s*/g, '');
    content = content.replace(/let\s+pool;?\s*try\s*{\s*pool\s*=\s*await\s+connectDB\(\);?\s*}\s*catch\s*\([^}]*\)\s*{\s*[^}]*\s*}\s*/g, '');
    
    // Replace with mock success response if needed
    if (content.includes('await connectDB()')) {
      content = content.replace(/await\s+connectDB\(\);?\s*/g, '// Database connection temporarily disabled');
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// Recursively process all files
function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.js')) {
      removeDatabaseConnections(filePath);
    }
  });
}

console.log('🔧 Removing database connections from API routes...');
processDirectory(apiDir);
console.log('✅ Database connection removal complete!');
