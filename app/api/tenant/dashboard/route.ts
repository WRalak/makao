import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import connectDB from '@/lib/mongoose';
import User from '@/models/User';
import Property from '@/models/Property';
import Message from '@/models/Message';
import Favorite from '@/models/Favorite';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'tenant') {
      return NextResponse.json({ error: 'Tenant access required' }, { status: 403 });
    }

    await connectDB();

    const tenant = await User.findById(decoded.userId);
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Get tenant's favorites
    const favorites = await Favorite.find({ tenantId: tenant._id })
      .populate({
        path: 'propertyId',
        populate: {
          path: 'agentId',
          select: 'name email phone'
        }
      })
      .sort({ createdAt: -1 })
      .lean();

    // Get tenant's messages
    const messages = await Message.find({ receiverId: tenant._id })
      .populate({
        path: 'senderId',
        select: 'name email'
      })
      .populate({
        path: 'propertyId',
        select: 'title address rent images'
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Calculate stats
    const totalFavorites = favorites.length;
    const totalMessages = await Message.countDocuments({ receiverId: tenant._id });

    // Format recent favorites
    const recentFavorites = favorites.slice(0, 5).map(favorite => ({
      _id: favorite._id,
      property: favorite.propertyId,
      createdAt: favorite.createdAt,
    }));

    // Format recent messages
    const recentMessages = messages.map(message => ({
      _id: message._id,
      content: message.content,
      agentId: message.senderId,
      property: message.propertyId,
      createdAt: message.createdAt,
      isRead: message.isRead,
    }));

    // Mock upcoming tours (would come from a Tour model in production)
    const upcomingTours: any[] = [];

    return NextResponse.json({
      totalFavorites,
      totalMessages,
      recentFavorites,
      recentMessages,
      upcomingTours,
    });

  } catch (error) {
    console.error('Tenant dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}


export const runtime = 'nodejs';
