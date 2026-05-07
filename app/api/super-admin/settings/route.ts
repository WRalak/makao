import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Mock settings data
  const mockSettings = {
    siteName: 'Makao',
    maintenanceMode: false,
    allowRegistrations: true,
    maxPropertiesPerAgent: 50
  };

  return NextResponse.json(mockSettings);
}