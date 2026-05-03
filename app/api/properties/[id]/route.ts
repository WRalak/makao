import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Property from '@/models/Property';
import User from '@/models/User';

// GET - Fetch single property by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const property = await Property.findById(params.id)
      .populate('agentId', 'name email phone')
      .lean();

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Increment view count
    await Property.findByIdAndUpdate(params.id, {
      $inc: { views: 1 }
    });

    return NextResponse.json(property);

  } catch (error) {
    console.error('Failed to fetch property:', error);
    return NextResponse.json(
      { error: 'Failed to fetch property' },
      { status: 500 }
    );
  }
}
