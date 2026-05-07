import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/database-helpers';
import { verifyToken } from '@/lib/auth';
import { getSocketService } from '@/lib/socket';
import Message from '@/models/Message';

// GET - Fetch conversations for a user
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

    // Get user's conversations
    const conversations = await query(`
      SELECT DISTINCT 
        m.property_id,
        p.title as property_title,
        u.name as other_user_name,
        u.email as other_user_email,
        MAX(m.created_at) as last_message_time,
        COUNT(*) as message_count
      FROM messages m
      LEFT JOIN properties p ON m.property_id = p.id
      LEFT JOIN users u ON (
        CASE 
          WHEN m.sender_id = $1 THEN m.receiver_id = u.id
          ELSE m.sender_id = u.id
        END
      )
      WHERE (m.sender_id = $1 OR m.receiver_id = $1)
      GROUP BY m.property_id, p.title, u.name, u.email
      ORDER BY last_message_time DESC
    `, [decoded.userId]);

    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Failed to fetch conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}


// POST - Send a message
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    const { conversationId, content, receiverId, propertyId, type = 'text' } = await request.json();

    if (!conversationId || !content || !receiverId) {
      return NextResponse.json(
        { error: 'Conversation ID, content, and receiver ID are required' },
        { status: 400 }
      );
    }

    // Verify user is part of this conversation
    const existingConversation = await Message.findOne({
      $or: [
        { conversationId, senderId: decoded.userId },
        { conversationId, receiverId: decoded.userId }
      ]
    });

    if (!existingConversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Create new message
    const message = await Message.create({
      conversationId,
      content,
      senderId: typeof decoded.userId === 'string' ? parseInt(decoded.userId) : decoded.userId,
      receiverId: typeof receiverId === 'string' ? parseInt(receiverId) : receiverId,
      status: 'sent'
    });

    // Get socket service and emit real-time notification
    const socketService = getSocketService();
    if (socketService) {
      socketService.broadcastToConversation(conversationId, 'new_message', {
        ...message,
        timestamp: new Date()
      });
    }

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Failed to send message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

// PUT - Mark message as read
export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { messageId } = await request.json();

    if (!messageId) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
    }

    const message = await Message.findById(typeof messageId === 'string' ? parseInt(messageId) : messageId);
    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Verify user can mark this message as read
    if (message.receiverId !== (typeof decoded.userId === 'string' ? parseInt(decoded.userId) : decoded.userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Mark as read
    await Message.updateStatus(message.id, 'read');
    
    // Update readAt timestamp
    const readAt = new Date();

    // Get socket service and emit read receipt
    const socketService = getSocketService();
    if (socketService) {
      socketService.broadcastToConversation(message.conversationId, 'message_read', {
        messageId: message.id.toString(),
        userId: decoded.userId,
        conversationId: message.conversationId,
        readAt: readAt
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to mark message as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark message as read' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a message
export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { messageId } = await request.json();

    if (!messageId) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
    }

    const message = await Message.findById(typeof messageId === 'string' ? parseInt(messageId) : messageId);
    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Verify user can delete this message
    if (message.senderId !== (typeof decoded.userId === 'string' ? parseInt(decoded.userId) : decoded.userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Soft delete the message
    await Message.updateStatus(message.id, 'deleted');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete message:', error);
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    );
  }
}


export const runtime = 'nodejs';
