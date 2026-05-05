import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/database-helpers';
import { verifyToken } from '@/lib/auth';

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

    // Get total revenue from successful payments
    const revenueResult = await queryOne(
      'SELECT COALESCE(SUM(commission_amount), 0) as total FROM payments WHERE status = $1',
      ['completed']
    );
    const totalRevenue = parseFloat(revenueResult?.total || '0');

    // Get active agents (with active subscriptions)
    const activeAgents = await queryOne(
      'SELECT COUNT(*) as count FROM users WHERE role = $1 AND status = $2',
      ['agent', 'active']
    );
    const activeAgentsCount = parseInt(activeAgents?.count || '0');

    // Get total tenants
    const totalTenants = await queryOne(
      'SELECT COUNT(*) as count FROM users WHERE role = $1 AND status != $2',
      ['tenant', 'banned']
    );
    const totalTenantsCount = parseInt(totalTenants?.count || '0');

    // Get pending properties
    const pendingProperties = await queryOne(
      'SELECT COUNT(*) as count FROM properties WHERE status = $1 AND is_active = $2',
      ['pending_approval', true]
    );
    const pendingPropertiesCount = parseInt(pendingProperties?.count || '0');

    // Get total properties
    const totalProperties = await queryOne(
      'SELECT COUNT(*) as count FROM properties',
      []
    );
    const totalPropertiesCount = parseInt(totalProperties?.count || '0');

    // Get recent payments with agent details
    const recentPayments = await query(`
      SELECT 
        p.amount, p.commission_amount, p.created_at,
        u.name as agent_name, u.email as agent_email
      FROM payments p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.status = $1
      ORDER BY p.created_at DESC
      LIMIT 10
    `, ['completed']);

    const formattedPayments = recentPayments.map((payment: any) => ({
      agentName: payment.agent_name,
      plan: 'subscription', // Default plan since we don't have this field
      amount: parseFloat(payment.amount),
      commissionAmount: parseFloat(payment.commission_amount || '0'),
      createdAt: payment.created_at,
    }));

    // Get user growth data (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const userGrowth = await query(`
      SELECT 
        EXTRACT(YEAR FROM created_at) as year,
        EXTRACT(MONTH FROM created_at) as month,
        role,
        COUNT(*) as count
      FROM users 
      WHERE created_at >= $1
      GROUP BY year, month, role
      ORDER BY year, month
    `, [sixMonthsAgo]);

    // Get popular cities by property count
    const popularCities = await query(`
      SELECT 
        city,
        COUNT(*) as property_count
      FROM properties 
      GROUP BY city
      ORDER BY property_count DESC
      LIMIT 10
    `, []);

    const formattedCities = popularCities.map((city: any) => ({
      name: city.city,
      propertyCount: parseInt(city.property_count),
    }));

    return NextResponse.json({
      totalRevenue,
      activeAgents: activeAgentsCount,
      totalTenants: totalTenantsCount,
      pendingProperties: pendingPropertiesCount,
      totalProperties: totalPropertiesCount,
      recentPayments: formattedPayments,
      userGrowth,
      popularCities: formattedCities,
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}


export const runtime = 'nodejs';
