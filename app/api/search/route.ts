import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Mock search results
  const mockResults = [
    {
      id: '1',
      title: 'Modern Apartment in Westlands',
      address: 'Westlands, Nairobi',
      price: 45000,
      bedrooms: 2,
      bathrooms: 2,
      type: 'apartment'
    }
  ];

  return NextResponse.json(mockResults);
}