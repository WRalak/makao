import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { verifyToken } from '@/lib/auth';

// GET: Get agent registration status
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!userRole || userRole !== 'agent') {
      return NextResponse.json({ error: 'Agent access required' }, { status: 403 });
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

    // Get agent details and space status
    const agentResult = await pool.query(
      'SELECT id, name, email, phone, mpesa_number, company_name, email_verified, phone_verified, created_at FROM users WHERE id = $1',
      [decoded.userId]
    );

    const agent = agentResult.rows[0];
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Get space status if exists
    const spaceResult = await pool.query(
      'SELECT id, name, subscription_status, is_approved, monthly_fee, property_limit, created_at FROM spaces WHERE agent_id = $1 ORDER BY created_at DESC',
      [decoded.userId]
    );

    const space = spaceResult.rows[0];

    return NextResponse.json({
      agent: {
        id: agent.id,
        name: agent.name,
        email: agent.email,
        phone: agent.phone,
        mpesaNumber: agent.mpesaNumber,
        companyName: agent.company_name,
        emailVerified: agent.email_verified,
        phoneVerified: agent.phone_verified,
        createdAt: agent.created_at
      },
      space: space ? {
        id: space.id,
        name: space.name,
        subscriptionStatus: space.subscription_status,
        isApproved: space.is_approved,
        monthlyFee: space.monthly_fee,
        propertyLimit: space.property_limit,
        createdAt: space.created_at
      } : null
    });

  } catch (error) {
    console.error('Get agent status error:', error);
    return NextResponse.json(
      { error: 'Failed to get agent status' },
      { status: 500 }
    );
  }
}


export const runtime = 'nodejs';
