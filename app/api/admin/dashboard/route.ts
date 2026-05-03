import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import User from '@/models/User';
import Property from '@/models/Property';
import Payment from '@/models/Payment';
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

    await connectDB();

    // Get total revenue from successful payments
    const revenueResult = await Payment.aggregate([
      { $match: { status: 'succeeded' } },
      { $group: { _id: null, total: { $sum: '$commissionAmount' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Get active agents (with active subscriptions)
    const activeAgents = await User.countDocuments({
      role: 'agent',
      'subscription.status': 'active',
      isBanned: false,
    });

    // Get total tenants
    const totalTenants = await User.countDocuments({
      role: 'tenant',
      isBanned: false,
    });

    // Get pending properties
    const pendingProperties = await Property.countDocuments({
      status: 'pending',
      isApproved: false,
    });

    // Get total properties
    const totalProperties = await Property.countDocuments();

    // Get recent payments with agent details
    const recentPayments = await Payment.find({ status: 'succeeded' })
      .populate('agentId', 'name email')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const formattedPayments = recentPayments.map(payment => ({
      agentName: (payment.agentId as any).name,
      plan: payment.plan,
      amount: payment.amount,
      commissionAmount: payment.commissionAmount,
      createdAt: payment.createdAt,
    }));

    // Get user growth data (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            role: '$role'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Get popular cities by property count
    const popularCities = await Property.aggregate([
      {
        $group: {
          _id: '$address.city',
          propertyCount: { $sum: 1 }
        }
      },
      {
        $sort: { propertyCount: -1 }
      },
      {
        $limit: 10
      }
    ]);

    const formattedCities = popularCities.map(city => ({
      name: city._id,
      propertyCount: city.propertyCount,
    }));

    return NextResponse.json({
      totalRevenue,
      activeAgents,
      totalTenants,
      pendingProperties,
      totalProperties,
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
