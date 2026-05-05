import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import { verifyToken } from '@/lib/auth';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'super_admin') {
      return NextResponse.json({ error: 'Super Admin access required' }, { status: 403 });
    }

    const userId = parseInt(params.id);

    let pool;
    try {
      pool = await connectDB();
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id, name, email, role, status FROM users WHERE id = $1',
      [userId]
    );

    if (existingUser.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (existingUser.rows[0].status !== 'banned') {
      return NextResponse.json({ error: 'User is not banned' }, { status: 400 });
    }

    // Update user status to active
    await pool.query(
      'UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2',
      ['active', userId]
    );

    // Log the action
    await pool.query(
      `INSERT INTO admin_logs (admin_id, action, details, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [
        decoded.userId,
        'user_unbanned',
        JSON.stringify({
          target_user_id: userId,
          target_user_name: existingUser.rows[0].name,
          target_user_email: existingUser.rows[0].email,
          unbanned_by: decoded.email
        })
      ]
    );

    return NextResponse.json({
      message: 'User unbanned successfully',
      user: { ...existingUser.rows[0], status: 'active' }
    });

  } catch (error) {
    console.error('Unban user error:', error);
    return NextResponse.json({ error: 'Failed to unban user' }, { status: 500 });
  }
}


export const runtime = 'nodejs';
