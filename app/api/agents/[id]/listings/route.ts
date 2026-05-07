import { NextRequest, NextResponse } from 'next/server';
import Property from '@/models/Property';

// GET - Fetch agent's property listings
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    // Build query
    const query: any = { agentId: id };
    if (status !== 'all') {
      query.status = status;
    }

    // Get all properties (already sorted by created_at DESC in the model)
    const allProperties = await Property.find(query);
    
    // Apply pagination manually
    const total = allProperties.length;
    const properties = allProperties.slice(skip, skip + limit);

    return NextResponse.json({
      properties,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Failed to fetch agent listings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent listings' },
      { status: 500 }
    );
  }
}
