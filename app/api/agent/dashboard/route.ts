import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import User from '@/models/User';
import Property from '@/models/Property';
import Message from '@/models/Message';
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

    await connectDB();

    const agent = await User.findById(decoded.userId);
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
    const properties = await Property.find({ agentId: agent._id })
      .sort({ createdAt: -1 })
      .lean();

    // Calculate stats
    const totalProperties = properties.length;
    const activeProperties = properties.filter(p => p.status === 'available').length;
    const totalViews = properties.reduce((sum, p) => sum + (p.views || 0), 0);
    const totalMessages = properties.reduce((sum, p) => sum + (p.messagesCount || 0), 0);

    // Get recent properties (last 5)
    const recentProperties = properties.slice(0, 5).map(property => ({
      _id: property._id,
      title: property.title,
      address: property.address,
      status: property.status,
      views: property.views,
      messagesCount: property.messagesCount,
      images: property.images,
      createdAt: property.createdAt,
    }));

    // Get top performing properties (by views)
    const topProperties = properties
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 3)
      .map(property => ({
        _id: property._id,
        title: property.title,
        views: property.views,
        messagesCount: property.messagesCount,
        address: property.address,
      }));

    // Get monthly views data (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyViews = await Property.aggregate([
      {
        $match: {
          agentId: agent._id,
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          views: { $sum: '$views' },
          messages: { $sum: '$messagesCount' },
          properties: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

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
