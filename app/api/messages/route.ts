import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { verifyToken } from '@/lib/auth';
import { getSocketService } from '@/lib/socket';

// GET - Fetch conversations for a user
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    await connectDB();

    // Get user's conversations
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: decoded.userId },
            { receiverId: decoded.userId }
          ]
        },
        $group: {
          _id: '$conversationId',
          lastMessage: { $last: '$content' },
          lastMessageDate: { $last: '$createdAt' },
          unreadCount: {
            $sum: {
              $cond: [
                { if: { $eq: ['$receiverId', decoded.userId] }, then: 1, else: 0 }
              ]
            }
          }
        },
        $sort: { lastMessageDate: -1 }
      },
      {
        $project: {
          _id: 1,
          conversationId: 1,
          lastMessage: 1,
          lastMessageDate: 1,
          unreadCount: 1,
          participants: {
            $push: {
              $cond: [
                { if: { $eq: ['$senderId', decoded.userId] }, then: '$senderId' },
                { if: { $eq: ['$receiverId', decoded.userId] }, then: '$receiverId' }
              ]
            }
          }
        }
      }
    ]);

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
    await connectDB();

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
    const message = new Message({
      conversationId,
      content,
      senderId: decoded.userId,
      receiverId,
      propertyId,
      type,
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await message.save();

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
    await connectDB();

    const { messageId } = await request.json();

    if (!messageId) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Verify user can mark this message as read
    if (message.receiverId !== decoded.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Mark as read
    message.isRead = true;
    message.readAt = new Date();
    await message.save();

    // Get socket service and emit read receipt
    const socketService = getSocketService();
    if (socketService) {
      socketService.broadcastToConversation(message.conversationId, 'message_read', {
        messageId: message._id.toString(),
        userId: decoded.userId,
        conversationId: message.conversationId,
        readAt: message.readAt
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
    await connectDB();

    const { messageId } = await request.json();

    if (!messageId) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Verify user can delete this message
    if (message.senderId !== decoded.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Soft delete the message
    message.deleted = true;
    message.deletedAt = new Date();
    await message.save();

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
