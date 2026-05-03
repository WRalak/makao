import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
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

    await connectDB();

    // Build query
    const query: any = { agentId: id };
    if (status !== 'all') {
      query.status = status;
    }

    const properties = await Property.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Property.countDocuments(query);

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
