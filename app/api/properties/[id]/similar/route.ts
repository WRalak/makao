import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Property from '@/models/Property';

// GET - Fetch similar properties
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const property = await Property.findById(params.id);
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Find similar properties based on location, price range, and bedrooms
    const minPrice = property.rent * 0.8; // 20% less
    const maxPrice = property.rent * 1.2; // 20% more
    
    const similarProperties = await Property.find({
      _id: { $ne: property._id },
      status: 'available',
      isApproved: true,
      'address.city': property.address.city,
      rent: { $gte: minPrice, $lte: maxPrice },
      bedrooms: { $gte: property.bedrooms - 1, $lte: property.bedrooms + 1 }
    })
    .populate('agentId', 'name email phone')
    .sort({ createdAt: -1 })
    .limit(6)
    .lean();

    return NextResponse.json(similarProperties);
  } catch (error) {
    console.error('Failed to fetch similar properties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch similar properties' },
      { status: 500 }
    );
  }
}
