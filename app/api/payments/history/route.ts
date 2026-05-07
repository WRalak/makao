import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Mock payment history
  const mockPayments = [
    {
      id: '1',
      amount: 4900,
      currency: 'USD',
      status: 'completed',
      type: 'subscription',
      description: 'Monthly subscription',
      date: new Date().toISOString()
    }
  ];

  return NextResponse.json(mockPayments);
}