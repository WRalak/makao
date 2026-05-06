import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import connectDB from '@/lib/database';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Extract role and userId from decoded token (handle both string and object cases)
    const userRole = typeof decoded === 'string' ? null : (decoded as any).role;
    const userId = typeof decoded === 'string' ? null : (decoded as any).userId;

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

    let query = '';
    let params: any[] = [];

    if (decoded.role === 'admin') {
      // Admin can see all payments
      query = `
        SELECT p.*, u.name as agent_name, u.email as agent_email, s.name as space_name
        FROM payments p
        JOIN users u ON p.agent_id = u.id
        LEFT JOIN spaces s ON p.space_id = s.id
        ORDER BY p.created_at DESC
      `;
    } else if (decoded.role === 'agent') {
      // Agents can see their own payments
      query = `
        SELECT p.*, s.name as space_name
        FROM payments p
        LEFT JOIN spaces s ON p.space_id = s.id
        WHERE p.agent_id = $1
        ORDER BY p.created_at DESC
      `;
      params = [decoded.userId];
    } else {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const paymentsResult = await pool.query(query, params);

    return NextResponse.json({
      payments: paymentsResult.rows
    });

  } catch (error) {
    console.error('Get payment history error:', error);
    return NextResponse.json(
      { error: 'Failed to get payment history' },
      { status: 500 }
    );
  }
}


export const runtime = 'nodejs';
