import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Mock spaces data
  const mockSpaces = [
    {
      id: '1',
      name: 'Makao Headquarters',
      description: 'Main office space',
      status: 'active',
      created_at: new Date().toISOString()
    }
  ];

  return NextResponse.json(mockSpaces);
}