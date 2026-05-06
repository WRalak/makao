import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import connectDB from '@/lib/database';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ 
        message: 'No token found',
        authenticated: false,
        superAdmin: false
      });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ 
        message: 'Invalid token',
        authenticated: false,
        superAdmin: false
      });
    }

    // Extract role from decoded token
    const userRole = typeof decoded === 'string' ? null : (decoded as any).role;
    const userId = typeof decoded === 'string' ? null : (decoded as any).userId;
    
    return NextResponse.json({
      message: 'Authentication successful',
      authenticated: true,
      userId: userId,
      role: userRole,
      superAdmin: userRole === 'super_admin'
    });

  } catch (error) {
    console.error('Super admin test error:', error);
    return NextResponse.json({
      message: 'Error occurred',
      authenticated: false,
      superAdmin: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}


export const runtime = 'nodejs';
