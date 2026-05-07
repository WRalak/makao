import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Mock dashboard data
  const mockDashboard = {
    totalUsers: 5678,
    totalAgents: 156,
    totalProperties: 1234,
    totalRevenue: 987654,
    activeUsers: 2341,
    activeAgents: 89,
    activeProperties: 890
  };

  return NextResponse.json(mockDashboard);
}