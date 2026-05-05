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
    if (!decoded || decoded.role !== 'agent') {
      return NextResponse.json({ error: 'Agent access required' }, { status: 403 });
    }

    // Get agent from database
    const agent = await queryOne(
      'SELECT id, name, email, subscription FROM users WHERE id = $1 AND role = $2',
      [decoded.userId, 'agent']
    );

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Check if agent has active subscription
    if (!agent.subscription || agent.subscription.status !== 'active') {
      return NextResponse.json({ 
        error: 'Active subscription required',
        subscriptionStatus: agent.subscription?.status || 'inactive',
        subscriptionPlan: agent.subscription?.plan || 'basic',
        propertyLimit: 0,
      }, { status: 403 });
    }

    // Get agent's properties
    const properties = await query(
      'SELECT id, title, street, city, state, status, view_count, message_count, images, created_at FROM properties WHERE agent_id = $1 ORDER BY created_at DESC',
      [agent.id]
    );

    // Calculate stats
    const totalProperties = properties.length;
    const activeProperties = properties.filter((p: any) => p.status === 'available').length;
    const totalViews = properties.reduce((sum: number, p: any) => sum + (p.view_count || 0), 0);
    const totalMessages = properties.reduce((sum: number, p: any) => sum + (p.message_count || 0), 0);

    // Get recent properties (last 5)
    const recentProperties = properties.slice(0, 5).map((property: any) => ({
      _id: property.id,
      title: property.title,
      address: {
        street: property.street,
        city: property.city,
        state: property.state
      },
      status: property.status,
      views: property.view_count,
      messagesCount: property.message_count,
      images: property.images,
      createdAt: property.created_at,
    }));

    // Get top performing properties (by views)
    const topProperties = properties
      .sort((a: any, b: any) => (b.view_count || 0) - (a.view_count || 0))
      .slice(0, 3)
      .map((property: any) => ({
        _id: property.id,
        title: property.title,
        views: property.view_count,
        messagesCount: property.message_count,
        address: {
          street: property.street,
          city: property.city,
          state: property.state
        },
      }));

    // Get monthly views data (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyViews = await query(`
      SELECT 
        EXTRACT(YEAR FROM created_at) as year,
        EXTRACT(MONTH FROM created_at) as month,
        SUM(view_count) as views,
        SUM(message_count) as messages,
        COUNT(*) as properties
      FROM properties 
      WHERE agent_id = $1 AND created_at >= $2
      GROUP BY year, month
      ORDER BY year, month
    `, [agent.id, sixMonthsAgo]);

    return NextResponse.json({
      totalProperties,
      activeProperties,
      totalViews,
      totalMessages,
      subscriptionStatus: agent.subscription.status,
      subscriptionPlan: agent.subscription.plan,
      propertyLimit: agent.subscription.propertyLimit,
      recentProperties,
      monthlyViews,
      topProperties,
    });

  } catch (error) {
    console.error('Agent dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}


export const runtime = 'nodejs';
