import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // Mock space data
  const mockSpace = {
    id,
    name: 'Sample Space',
    description: 'Sample space description',
    status: 'active',
    created_at: new Date().toISOString()
  };

  return NextResponse.json(mockSpace);
}