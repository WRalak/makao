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

    // Extract role from decoded token (handle both string and object cases)
    const userRole = typeof decoded === 'string' ? null : (decoded as any).role;
    
    if (!userRole || userRole !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
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

    // Get total revenue by currency
    const revenueQuery = `
      SELECT 
        currency,
        COALESCE(SUM(amount), 0) as total,
        COUNT(*) as transaction_count
      FROM payments 
      WHERE status = 'completed'
      GROUP BY currency
    `;

    const revenueResult = await pool.query(revenueQuery);

    // Get active agents
    const agentsQuery = `
      SELECT COUNT(*) as count
      FROM users 
      WHERE role = 'agent' AND is_active = true AND is_banned = false
    `;

    const agentsResult = await pool.query(agentsQuery);

    // Get total tenants
    const tenantsQuery = `
      SELECT COUNT(*) as count
      FROM users 
      WHERE role = 'tenant' AND is_active = true AND is_banned = false
    `;

    const tenantsResult = await pool.query(tenantsQuery);

    // Get total properties
    const propertiesQuery = `
      SELECT COUNT(*) as count
      FROM properties
    `;

    const propertiesResult = await pool.query(propertiesQuery);

    // Get pending spaces
    const pendingSpacesQuery = `
      SELECT COUNT(*) as count
      FROM spaces 
      WHERE subscription_status = 'pending' OR is_approved = false
    `;

    const pendingSpacesResult = await pool.query(pendingSpacesQuery);

    // Get payment status breakdown
    const paymentStatusQuery = `
      SELECT 
        status,
        COUNT(*) as count,
        COALESCE(SUM(amount), 0) as total_amount
      FROM payments 
      GROUP BY status
    `;

    const paymentStatusResult = await pool.query(paymentStatusQuery);

    // Format revenue by currency
    const revenue = {
      KES: 0,
      UGX: 0,
      TZS: 0,
      USD: 0,
      total: 0
    };

    revenueResult.rows.forEach(row => {
      revenue[row.currency as keyof typeof revenue] = parseFloat(row.total);
      revenue.total += parseFloat(row.total);
    });

    return NextResponse.json({
      revenue,
      stats: {
        activeAgents: parseInt(agentsResult.rows[0].count),
        totalTenants: parseInt(tenantsResult.rows[0].count),
        totalProperties: parseInt(propertiesResult.rows[0].count),
        pendingSpaces: parseInt(pendingSpacesResult.rows[0].count)
      },
      paymentStatus: paymentStatusResult.rows
    });

  } catch (error) {
    console.error('Get admin stats error:', error);
    return NextResponse.json(
      { error: 'Failed to get admin stats' },
      { status: 500 }
    );
  }
}


export const runtime = 'nodejs';
