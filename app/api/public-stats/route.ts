import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Mock public stats
  const mockStats = {
    totalProperties: 1234,
    totalAgents: 156,
    totalUsers: 5678,
    activeProperties: 890,
    activeAgents: 89,
    activeUsers: 2341
  };

  return NextResponse.json(mockStats);
}