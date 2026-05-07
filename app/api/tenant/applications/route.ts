import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Mock applications data
  const mockApplications = [
    {
      id: '1',
      propertyId: '1',
      propertyTitle: 'Modern Apartment',
      status: 'pending',
      submittedAt: new Date().toISOString(),
      agentId: '1',
      agentName: 'John Doe'
    }
  ];

  return NextResponse.json(mockApplications);
}