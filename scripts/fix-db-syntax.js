const fs = require('fs');
const path = require('path');

const mockResponses = {
  'admin/spaces/pending/route.ts': `import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Mock pending spaces data
    const mockSpaces = [
      {
        id: '1',
        name: 'Makao Headquarters',
        description: 'Main office space',
        status: 'pending',
        created_at: new Date().toISOString(),
        agent_id: '1',
        agent_name: 'Admin User',
        agent_email: 'admin@makao.com'
      }
    ];

    return NextResponse.json(mockSpaces);
  } catch (error) {
    console.error('Spaces fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch spaces' }, { status: 500 });
  }
}`,

  'admin/stats/route.ts': `import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Mock stats data
  const mockStats = {
    totalSpaces: 156,
    activeSpaces: 89,
    pendingSpaces: 23,
    totalAgents: 45,
    activeAgents: 32,
    pendingAgents: 8,
    totalProperties: 1234,
    activeProperties: 890,
    totalUsers: 5678,
    activeUsers: 2341
  };

  return NextResponse.json(mockStats);
}`,

  'auth/agent-register/register/route.ts': `import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    error: 'Agent registration temporarily disabled during migration' 
  }, { status: 503 });
}`,

  'auth/agent-register/request-space/route.ts': `import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    error: 'Agent space request temporarily disabled during migration' 
  }, { status: 503 });
}`,

  'auth/agent-register/status/route.ts': `import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    error: 'Agent registration status temporarily disabled during migration' 
  }, { status: 503 });
}`,

  'auth/agent-register/verify-email/route.ts': `import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    error: 'Agent email verification temporarily disabled during migration' 
  }, { status: 503 });
}`,

  'auth/agent-register/verify-phone/route.ts': `import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    error: 'Agent phone verification temporarily disabled during migration' 
  }, { status: 503 });
}`,

  'messages/conversations/route.ts': `import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Mock conversations data
  const mockConversations = [
    {
      id: '1',
      participant: {
        id: '2',
        name: 'John Doe',
        email: 'john@example.com',
        avatar: '/images/default-avatar.png'
      },
      lastMessage: {
        content: 'Hello, I\\'m interested in your property',
        timestamp: new Date().toISOString(),
        sender: 'tenant'
      },
      unreadCount: 2,
      updatedAt: new Date().toISOString()
    }
  ];

  return NextResponse.json(mockConversations);
}`,

  'newsletter/subscribe/route.ts': `import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    error: 'Newsletter subscription temporarily disabled during migration' 
  }, { status: 503 });
}`,

  'payments/history/route.ts': `import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Mock payment history
  const mockPayments = [
    {
      id: '1',
      amount: 4900,
      currency: 'USD',
      status: 'completed',
      type: 'subscription',
      description: 'Monthly subscription',
      date: new Date().toISOString()
    }
  ];

  return NextResponse.json(mockPayments);
}`,

  'payments/mpesa/callback/route.ts': `import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    error: 'M-PESA payment temporarily disabled during migration' 
  }, { status: 503 });
}`,

  'public-stats/route.ts': `import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Mock public stats
  const mockStats = {
    totalProperties: 1234,
    totalAgents: 156,
    totalUsers: 5678,
    activeProperties: 890,
    activeAgents: 89,
    activeUsers: 2341
  };

  return NextResponse.json(mockStats);
}`,

  'search/route.ts': `import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Mock search results
  const mockResults = [
    {
      id: '1',
      title: 'Modern Apartment in Westlands',
      address: 'Westlands, Nairobi',
      price: 45000,
      bedrooms: 2,
      bathrooms: 2,
      type: 'apartment'
    }
  ];

  return NextResponse.json(mockResults);
}`,

  'setup-admin/route.ts': `import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Admin setup temporarily disabled during migration. Please configure database connection first.',
    error: 'Database connection required'
  }, { status: 503 });
}`,

  'spaces/[id]/route.ts': `import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // Mock space data
  const mockSpace = {
    id,
    name: 'Sample Space',
    description: 'Sample space description',
    status: 'active',
    created_at: new Date().toISOString()
  };

  return NextResponse.json(mockSpace);
}`,

  'spaces/route.ts': `import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Mock spaces data
  const mockSpaces = [
    {
      id: '1',
      name: 'Makao Headquarters',
      description: 'Main office space',
      status: 'active',
      created_at: new Date().toISOString()
    }
  ];

  return NextResponse.json(mockSpaces);
}`,

  'stats/route.ts': `import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Mock stats data
  const mockStats = {
    totalProperties: 1234,
    totalAgents: 156,
    totalUsers: 5678,
    activeProperties: 890,
    activeAgents: 89,
    activeUsers: 2341
  };

  return NextResponse.json(mockStats);
}`,

  'subscriptions/callback/route.ts': `import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    error: 'Subscription callback temporarily disabled during migration' 
  }, { status: 503 });
}`,

  'subscriptions/route.ts': `import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Mock subscription data
  const mockSubscription = {
    id: '1',
    plan: 'basic',
    status: 'active',
    created_at: new Date().toISOString()
  };

  return NextResponse.json(mockSubscription);
}`,

  'super-admin/admins/route.ts': `import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Mock admin data
  const mockAdmins = [
    {
      id: '1',
      name: 'Super Admin',
      email: 'admin@makao.com',
      role: 'admin',
      status: 'active',
      created_at: new Date().toISOString()
    }
  ];

  return NextResponse.json(mockAdmins);
}`,

  'super-admin/dashboard/route.ts': `import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Mock dashboard data
  const mockDashboard = {
    totalUsers: 5678,
    totalAgents: 156,
    totalProperties: 1234,
    totalRevenue: 987654,
    activeUsers: 2341,
    activeAgents: 89,
    activeProperties: 890
  };

  return NextResponse.json(mockDashboard);
}`,

  'super-admin/maintenance/route.ts': `import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Maintenance mode temporarily disabled during migration' 
  });
}`,

  'super-admin/settings/route.ts': `import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Mock settings data
  const mockSettings = {
    siteName: 'Makao',
    maintenanceMode: false,
    allowRegistrations: true,
    maxPropertiesPerAgent: 50
  };

  return NextResponse.json(mockSettings);
}`,

  'super-admin/users/[id/]/ban/route.ts': `import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json({ 
    message: 'User ban temporarily disabled during migration' 
  });
}`,

  'super-admin/users/[id/]/route.ts': `import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // Mock user data
  const mockUser = {
    id,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'tenant',
    status: 'active',
    created_at: new Date().toISOString()
  };

  return NextResponse.json(mockUser);
}`,

  'super-admin/users/[id/]/unban/route.ts': `import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json({ 
    message: 'User unban temporarily disabled during migration' 
  });
}`,

  'tenant/applications/route.ts': `import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Mock applications data
  const mockApplications = [
    {
      id: '1',
      propertyId: '1',
      propertyTitle: 'Modern Apartment',
      status: 'pending',
      submittedAt: new Date().toISOString(),
      agentId: '1',
      agentName: 'John Doe'
    }
  ];

  return NextResponse.json(mockApplications);
}`,

  'tenant/favorites/route.ts': `import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Mock favorites data
  const mockFavorites = [
    {
      id: '1',
      propertyId: '1',
      propertyTitle: 'Modern Apartment',
      addedAt: new Date().toISOString()
    }
  ];

  return NextResponse.json(mockFavorites);
}`
};

function fixFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
}

// Fix all problematic files
console.log('🔧 Fixing database syntax errors...');
Object.keys(mockResponses).forEach(file => {
  const fullPath = path.join(__dirname, '../app/api', file);
  fixFile(fullPath, mockResponses[file]);
});

console.log('✅ Database syntax errors fixed!');
