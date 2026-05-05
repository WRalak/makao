import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';

// STEP 3: Phone Verification (OTP)
export async function POST(request: NextRequest) {
  try {
    const { userId, otpCode } = await request.json();

    if (!userId || !otpCode) {
      return NextResponse.json({ error: 'User ID and OTP code are required' }, { status: 400 });
    }

    let pool;
    try {
      pool = await connectDB();
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed. Please try again later.' },
        { status: 500 }
      );
    }

    // Verify OTP
    const userResult = await pool.query(
      'SELECT id, name, email, phone_verified, otp_code, otp_expires FROM users WHERE id = $1',
      [userId]
    );

    const user = userResult.rows[0];
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if OTP is valid and not expired
    if (user.otp_code !== otpCode) {
      return NextResponse.json({ error: 'Invalid OTP code' }, { status: 400 });
    }

    if (new Date() > new Date(user.otp_expires)) {
      return NextResponse.json({ error: 'OTP code has expired' }, { status: 400 });
    }

    // Mark phone as verified
    await pool.query(
      'UPDATE users SET phone_verified = true, otp_code = NULL, otp_expires = NULL, updated_at = NOW() WHERE id = $1',
      [userId]
    );

    return NextResponse.json({
      message: 'Phone verified successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.email_verified,
        phoneVerified: true
      }
    });

  } catch (error) {
    console.error('Phone verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify phone' },
      { status: 500 }
    );
  }
}
