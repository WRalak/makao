import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';

// STEP 2: Email Verification
export async function POST(request: NextRequest) {
  try {
    const { emailToken } = await request.json();

    if (!emailToken) {
      return NextResponse.json({ error: 'Email token is required' }, { status: 400 });
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

    // Update user as email verified
    const result = await pool.query(
      'UPDATE users SET email_verified = true, updated_at = NOW() WHERE email_token = $1 RETURNING id, name, email',
      [emailToken]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired email token' }, { status: 400 });
    }

    return NextResponse.json({
      message: 'Email verified successfully',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    );
  }
}
