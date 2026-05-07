import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Mock admin data
  const mockAdmins = [
    {
      id: '1',
      name: 'Super Admin',
      email: 'admin@makao.com',
      role: 'admin',
      status: 'active',
      created_at: new Date().toISOString()
    }
  ];

  return NextResponse.json(mockAdmins);
}