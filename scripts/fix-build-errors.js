const fs = require('fs');
const path = require('path');

// List of files that need fixing
const filesToFix = [
  'app/api/agent/properties/route.ts',
  'app/api/agents/[id]/listings/route.ts',
  'app/api/agents/[id]/reviews/route.ts',
  'app/api/agents/[id]/route.ts',
  'app/api/agents/route.ts',
  'app/api/auth/agent-register/register/route.ts',
  'app/api/auth/agent-register/request-space/route.ts',
  'app/api/auth/agent-register/status/route.ts',
  'app/api/auth/agent-register/verify-email/route.ts',
  'app/api/auth/agent-register/verify-phone/route.ts',
  'app/api/auth/agent-register/route.ts',
  'app/api/auth/login/route.ts',
  'app/api/messages/conversations/route.ts',
  'app/api/messages/[conversationId]/route.ts',
  'app/api/payments/history/route.ts',
  'app/api/payments/mpesa/callback/route.ts',
  'app/api/setup-admin/route.ts',
  'app/api/spaces/[id]/route.ts',
  'app/api/stats/route.ts',
  'app/api/stripe/checkout/route.ts',
  'app/api/stripe/webhook/route.ts',
  'app/api/stripe/route.ts',
  'app/api/subscriptions/callback/route.ts',
  'app/api/subscriptions/route.ts',
  'app/api/super-admin/admins/route.ts',
  'app/api/super-admin/maintenance/route.ts',
  'app/api/super-admin/users/[id]/ban/route.ts',
  'app/api/super-admin/users/[id]/unban/route.ts',
  'app/api/super-admin/users/[id]/route.ts'
];

// Fix function for a single file
function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix mongoose imports
    content = content.replace(/import connectDB from '@\/lib\/mongoose';/g, "import connectDB from '@/lib/database';");
    
    // Fix models imports
    content = content.replace(/import.*from '@\/models\/.*';/g, '// Models import removed - using database directly');
    
    // Fix JWT token parsing - add this pattern after verifyToken calls
    const jwtFixPattern = /const decoded = verifyToken\(token\);\s*if \(!decoded\)/g;
    if (jwtFixPattern.test(content)) {
      content = content.replace(
        jwtFixPattern,
        `const decoded = verifyToken(token);\n    if (!decoded) {\n      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });\n    }\n\n    // Extract role from decoded token (handle both string and object cases)\n    const userRole = typeof decoded === 'string' ? null : (decoded as any).role;\n    const userId = typeof decoded === 'string' ? null : (decoded as any).userId;\n    if (!decoded`
      );
    }
    
    // Fix role checking
    content = content.replace(/if \(!decoded \|\| decoded\.role !== '([^']+)'\)/g, 
      "if (!userRole || userRole !== '$1')");
    
    // Fix userId extraction
    content = content.replace(/const userId = decoded\.userId;/g, '// userId already extracted above');
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
}

// Fix all files
console.log('🔧 Fixing build errors...');
filesToFix.forEach(fixFile);
console.log('✅ Done fixing files!');
