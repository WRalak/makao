import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Mock stats data
  const mockStats = {
    totalSpaces: 156,
    activeSpaces: 89,
    pendingSpaces: 23,
    totalAgents: 45,
    activeAgents: 32,
    pendingAgents: 8,
    totalProperties: 1234,
    activeProperties: 890,
    totalUsers: 5678,
    activeUsers: 2341
  };

  return NextResponse.json(mockStats);
}