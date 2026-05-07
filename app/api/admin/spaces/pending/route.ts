import { NextRequest, NextResponse } from 'next/server';
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
}