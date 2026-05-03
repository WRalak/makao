import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import User from '@/models/User';
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

    await connectDB();

    const user = await User.findById(decoded.userId).select('-password');
    if (!user || user.isBanned) {
      return NextResponse.json(
        { error: 'User not found or banned' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        emailVerified: user.emailVerified,
        subscription: user.subscription,
        isActive: user.isActive,
        isBanned: user.isBanned,
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
