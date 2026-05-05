import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Message from '@/models/Message';
import { verifyToken } from '@/lib/auth';

// GET - Fetch messages in a conversation
export async function GET(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    await connectDB();

    const { conversationId } = params;

    // Verify user is part of this conversation
    const conversation = await Message.findOne({
      $or: [
        { conversationId, senderId: decoded.userId },
        { conversationId, receiverId: decoded.userId }
      ]
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Get messages in conversation
    const messages = await Message.find({ conversationId })
      .populate('senderId', 'name email')
      .populate('receiverId', 'name email')
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}


export const runtime = 'nodejs';
