import { NextRequest, NextResponse } from 'next/server';
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

    // Get conversations for the current user
    const conversationsQuery = `
      SELECT DISTINCT 
        CASE 
          WHEN m.sender_id = $1 THEN m.receiver_id 
          ELSE m.sender_id 
        END as other_user_id,
        u.name as other_user_name,
        u.email as other_user_email,
        u.role as other_user_role,
        p.id as property_id,
        p.title as property_title,
        MAX(m.created_at) as last_message_time,
        (SELECT COUNT(*) FROM messages WHERE 
          ((sender_id = $1 AND receiver_id = CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id) OR 
           (receiver_id = $1 AND sender_id = CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id)) 
          AND is_read = false) as unread_count
      FROM messages m
      JOIN users u ON (CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id) = u.id
      LEFT JOIN properties p ON m.property_id = p.id
      WHERE (m.sender_id = $1 OR m.receiver_id = $1)
      GROUP BY other_user_id, u.name, u.email, u.role, p.id, p.title
      ORDER BY last_message_time DESC
    `;

    const conversationsResult = await pool.query(conversationsQuery, [decoded.userId]);

    return NextResponse.json({
      conversations: conversationsResult.rows
    });

  } catch (error) {
    console.error('Get conversations error:', error);
    return NextResponse.json(
      { error: 'Failed to get conversations' },
      { status: 500 }
    );
  }
}


export const runtime = 'nodejs';
