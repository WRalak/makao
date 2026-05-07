import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // Mock user data
  const mockUser = {
    id,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'tenant',
    status: 'active',
    created_at: new Date().toISOString()
  };

  return NextResponse.json(mockUser);
}