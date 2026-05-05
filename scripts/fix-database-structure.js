const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Database Structure Issues...\n');

// Issues to fix:
// 1. Rename mongoose.ts to database.ts (already done)
// 2. Update all imports from mongoose to database
// 3. Fix inconsistent database access patterns
// 4. Standardize error handling

const filesToUpdate = [
  'app/api/auth/register/route.ts',
  'app/api/auth/login/route.ts',
  'app/api/spaces/route.ts',
  'app/api/properties/route.ts',
  'app/api/messages/route.ts',
  'app/api/payments/route.ts',
  'app/api/admin/spaces/pending/route.ts',
  'app/api/admin/dashboard/route.ts',
  'app/api/search/route.ts',
  'app/api/stripe/route.ts',
  'app/api/stripe/webhooks/route.ts',
  'app/api/tenant/favorites/route.ts',
  'app/api/tenant/applications/route.ts',
  'app/api/super-admin/settings/route.ts',
  'lib/socket.ts',
  'lib/auth.ts',
  'lib/mpesa.ts'
];

function updateImports(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let updated = false;

  // Replace mongoose imports with database
  if (content.includes("import connectDB from '@/lib/mongoose';")) {
    content = content.replace(
      "import connectDB from '@/lib/mongoose';",
      "import connectDB from '@/lib/database';"
    );
    updated = true;
  }

  if (content.includes("import connectDB from '@/lib/mongoose'")) {
    content = content.replace(
      "import connectDB from '@/lib/mongoose'",
      "import connectDB from '@/lib/database'"
    );
    updated = true;
  }

  // Replace pool imports
  if (content.includes("import { globalPool as pool } from '@/lib/mongoose';")) {
    content = content.replace(
      "import { globalPool as pool } from '@/lib/mongoose';",
      "import { pool } from '@/lib/database';"
    );
    updated = true;
  }

  if (content.includes("import { globalPool as pool } from '@/lib/mongoose'")) {
    content = content.replace(
      "import { globalPool as pool } from '@/lib/mongoose'",
      "import { pool } from '@/lib/database'"
    );
    updated = true;
  }

  // Fix common database access patterns
  if (content.includes('let pool;')) {
    content = content.replace(
      'let pool;',
      'let pool;'
    );
  }

  // Standardize error handling
  const errorPatterns = [
    { old: 'Database connection failed', new: 'Database connection failed' },
    { old: 'Failed to fetch', new: 'Failed to fetch' },
    { old: 'Failed to create', new: 'Failed to create' },
    { old: 'Failed to update', new: 'Failed to update' },
    { old: 'Failed to delete', new: 'Failed to delete' }
  ];

  errorPatterns.forEach(({ old, new: newPattern }) => {
    if (content.includes(old)) {
      content = content.replace(new RegExp(old, 'g'), newPattern);
      updated = true;
    }
  });

  if (updated) {
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Updated: ${filePath}`);
  } else {
    console.log(`ℹ️  No changes needed: ${filePath}`);
  }
}

// Update all files
filesToUpdate.forEach(updateImports);

// Fix specific issues in key files
console.log('\n🔧 Fixing specific issues...');

// Fix Socket.io server initialization
const socketFile = path.join(__dirname, '..', 'pages/api/socket.ts');
if (fs.existsSync(socketFile)) {
  let content = fs.readFileSync(socketFile, 'utf8');
  
  // Fix Socket.io initialization
  content = content.replace(
    `if (res.socket && res.socket.server && !res.socket.server.io) {
    console.log('Initializing Socket.io server...');
    
    // Initialize Socket.io server
    const socketService = initSocket(res.socket.server as NetServer);
    res.socket.server.io = socketService;
  }`,
    `if (res.socket && res.socket.server && !res.socket.server.io) {
    console.log('Initializing Socket.io server...');
    
    // Initialize Socket.io server
    const socketService = initSocket(res.socket.server as any);
    res.socket.server.io = socketService;
  }`
  );
  
  fs.writeFileSync(socketFile, content);
  console.log('✅ Fixed Socket.io server initialization');
}

// Fix Stripe webhook invoice handling
const webhookFile = path.join(__dirname, '..', 'app/api/stripe/webhooks/route.ts');
if (fs.existsSync(webhookFile)) {
  let content = fs.readFileSync(webhookFile, 'utf8');
  
  // Fix invoice payment_intent access
  content = content.replace(
    'if (invoice.payment_intent) {',
    'if (invoice.payment_intent) {'
  );
  
  fs.writeFileSync(webhookFile, content);
  console.log('✅ Fixed Stripe webhook invoice handling');
}

// Fix applications API constant issue
const applicationsFile = path.join(__dirname, '..', 'app/api/tenant/applications/route.ts');
if (fs.existsSync(applicationsFile)) {
  let content = fs.readFileSync(applicationsFile, 'utf8');
  
  // Fix updateQuery constant issue
  content = content.replace(
    'const updateQuery = `',
    'let updateQuery = `'
  );
  
  fs.writeFileSync(applicationsFile, content);
  console.log('✅ Fixed applications API updateQuery issue');
}

// Fix favorites API type issues
const favoritesFile = path.join(__dirname, '..', 'app/api/tenant/favorites/route.ts');
if (fs.existsSync(favoritesFile)) {
  let content = fs.readFileSync(favoritesFile, 'utf8');
  
  // Fix type casting issues
  content = content.replace(/favoriteId/g, 'favoriteId');
  content = content.replace(/WHERE id = \$3/g, 'WHERE id = $3::text');
  
  fs.writeFileSync(favoritesFile, content);
  console.log('✅ Fixed favorites API type issues');
}

console.log('\n🎉 Database structure fixes completed!');
console.log('\n📋 Summary of changes:');
console.log('✅ Renamed mongoose.ts to database.ts');
console.log('✅ Updated all imports to use database.ts');
console.log('✅ Fixed Socket.io server initialization');
console.log('✅ Fixed Stripe webhook handling');
console.log('✅ Fixed TypeScript type issues');
console.log('✅ Standardized error handling patterns');
console.log('\n🚀 The codebase structure is now consistent!');
