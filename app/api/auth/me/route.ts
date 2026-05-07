import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import { queryOne } from '@/lib/database-helpers';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token provided' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await queryOne(
      'SELECT id, name, email, role, avatar, phone, email_verified, is_active, is_banned FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (!user || !user.is_active || user.is_banned) {
      return NextResponse.json(
        { error: 'User not found or banned' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        emailVerified: user.email_verified,
        isActive: user.is_active,
        isBanned: user.is_banned,
      },
    });

  } catch (error) {
    console.error('Auth verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


export const runtime = 'nodejs';
