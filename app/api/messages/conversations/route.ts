import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Mock conversations data
  const mockConversations = [
    {
      id: '1',
      participant: {
        id: '2',
        name: 'John Doe',
        email: 'john@example.com',
        avatar: '/images/default-avatar.png'
      },
      lastMessage: {
        content: 'Hello, I\'m interested in your property',
        timestamp: new Date().toISOString(),
        sender: 'tenant'
      },
      unreadCount: 2,
      updatedAt: new Date().toISOString()
    }
  ];

  return NextResponse.json(mockConversations);
}