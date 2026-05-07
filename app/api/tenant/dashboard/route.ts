import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import { db } from '@/lib/neon';
import { users, properties, messages, favorites } from '@/lib/schema';
import { eq, desc, count } from 'drizzle-orm';
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

    // Get tenant
    const [tenant] = await db.select()
      .from(users)
      .where(eq(users.id, parseInt(decoded.userId)))
      .limit(1);
    
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Get tenant's favorites with property and agent info
    const favoritesData = await db.select({
      favorite: favorites,
      property: properties,
      agent: {
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone
      }
    })
    .from(favorites)
    .leftJoin(properties, eq(favorites.propertyId, properties.id))
    .leftJoin(users, eq(properties.agentId, users.id))
    .where(eq(favorites.userId, tenant.id))
    .orderBy(desc(favorites.createdAt))
    .limit(5);

    // Get tenant's messages with sender and property info
    const messagesData = await db.select({
      message: messages,
      sender: {
        id: users.id,
        name: users.name,
        email: users.email
      },
      property: {
        id: properties.id,
        title: properties.title,
        street: properties.street,
        city: properties.city,
        rentAmount: properties.rentAmount,
        images: properties.images
      }
    })
    .from(messages)
    .leftJoin(users, eq(messages.senderId, users.id))
    .leftJoin(properties, eq(messages.propertyId, properties.id))
    .where(eq(messages.receiverId, tenant.id))
    .orderBy(desc(messages.createdAt))
    .limit(10);

    // Calculate stats
    const [totalFavoritesResult] = await db.select({ count: count() })
      .from(favorites)
      .where(eq(favorites.userId, tenant.id));
    
    const [totalMessagesResult] = await db.select({ count: count() })
      .from(messages)
      .where(eq(messages.receiverId, tenant.id));
    
    const totalFavorites = totalFavoritesResult?.count || 0;
    const totalMessages = totalMessagesResult?.count || 0;

    // Format recent favorites
    const recentFavorites = favoritesData.map(({ favorite, property, agent }) => ({
      id: favorite.id,
      property: property ? {
        id: property.id,
        title: property.title,
        street: property.street,
        city: property.city,
        rentAmount: property.rentAmount,
        images: property.images,
        agent: agent
      } : null,
      createdAt: favorite.createdAt,
    }));

    // Format recent messages
    const recentMessages = messagesData.map(({ message, sender, property }) => ({
      id: message.id,
      content: message.content,
      sender: sender,
      property: property,
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
