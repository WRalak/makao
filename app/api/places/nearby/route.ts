import { NextRequest, NextResponse } from 'next/server';

// POST - Get nearby places
export async function POST(request: NextRequest) {
  try {
    const { coordinates } = await request.json();
    
    if (!coordinates || !coordinates.lat || !coordinates.lng) {
      return NextResponse.json({ error: 'Coordinates are required' }, { status: 400 });
    }

    // Mock nearby places data - in production, this would use Google Places API or similar
    const nearbyPlaces = [
      {
        id: '1',
        name: 'Whole Foods Market',
        type: 'grocery',
        distance: 0.3,
        address: '123 Main St',
        rating: 4.5
      },
      {
        id: '2',
        name: 'Central Park',
        type: 'park',
        distance: 0.5,
        address: '456 Park Ave',
        rating: 4.8
      },
      {
        id: '3',
        name: 'Subway Station',
        type: 'transit',
        distance: 0.2,
        address: '789 Transit Blvd',
        rating: 4.2
      },
      {
        id: '4',
        name: 'Elementary School',
        type: 'school',
        distance: 0.8,
        address: '321 Education Dr',
        rating: 4.6
      },
      {
        id: '5',
        name: 'Coffee Shop',
        type: 'cafe',
        distance: 0.1,
        address: '555 Coffee St',
        rating: 4.7
      },
      {
        id: '6',
        name: 'Fitness Center',
        type: 'gym',
        distance: 0.4,
        address: '999 Fitness Ave',
        rating: 4.4
      },
      {
        id: '7',
        name: 'Pharmacy',
        type: 'pharmacy',
        distance: 0.3,
        address: '777 Health St',
        rating: 4.3
      },
      {
        id: '8',
        name: 'Restaurant Row',
        type: 'restaurant',
        distance: 0.6,
        address: '111 Dining Blvd',
        rating: 4.5
      }
    ];

    return NextResponse.json(nearbyPlaces);
  } catch (error) {
    console.error('Failed to fetch nearby places:', error);
    return NextResponse.json(
      { error: 'Failed to fetch nearby places' },
      { status: 500 }
    );
  }
}
