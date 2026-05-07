import { NextRequest, NextResponse } from 'next/server';
import Property from '@/models/Property';

// GET - Fetch similar properties
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const property = await Property.findById(params.id);
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Find similar properties using the new findSimilar method
    const similarProperties = await Property.findSimilar(params.id, property);

    return NextResponse.json(similarProperties);
  } catch (error) {
    console.error('Failed to fetch similar properties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch similar properties' },
      { status: 500 }
    );
  }
}
