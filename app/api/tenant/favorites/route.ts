import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Mock favorites data
  const mockFavorites = [
    {
      id: '1',
      propertyId: '1',
      propertyTitle: 'Modern Apartment',
      addedAt: new Date().toISOString()
    }
  ];

  return NextResponse.json(mockFavorites);
}