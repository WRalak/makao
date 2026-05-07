import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Mock subscription data
  const mockSubscription = {
    id: '1',
    plan: 'basic',
    status: 'active',
    created_at: new Date().toISOString()
  };

  return NextResponse.json(mockSubscription);
}