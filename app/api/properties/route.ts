import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Property from '@/models/Property';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

// GET - Fetch all approved properties for public browsing
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const bedrooms = searchParams.get('bedrooms');
    const bathrooms = searchParams.get('bathrooms');
    const petsAllowed = searchParams.get('petsAllowed');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    // Build query
    const query: any = {
      isApproved: true,
      status: 'available',
    };

    if (city) {
      query['address.city'] = { $regex: city, $options: 'i' };
    }

    if (minPrice || maxPrice) {
      query.rent = {};
      if (minPrice) query.rent.$gte = parseInt(minPrice);
      if (maxPrice) query.rent.$lte = parseInt(maxPrice);
    }

    if (bedrooms && bedrooms !== 'any') {
      query.bedrooms = parseInt(bedrooms);
    }

    if (bathrooms && bathrooms !== 'any') {
      query.bathrooms = parseInt(bathrooms);
    }

    if (petsAllowed === 'true') {
      query['amenities.petsAllowed'] = true;
    }

    // Get properties with agent details
    const properties = await Property.find(query)
      .populate('agentId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Get total count for pagination
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
    console.error('Failed to fetch properties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}

const createPropertySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  address: z.object({
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(1, 'Zip code is required'),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
  }),
  rent: z.number().min(0, 'Rent must be positive'),
  securityDeposit: z.number().min(0, 'Security deposit must be positive'),
  bedrooms: z.number().min(0, 'Bedrooms must be positive'),
  bathrooms: z.number().min(0, 'Bathrooms must be positive'),
  squareFeet: z.number().min(0, 'Square feet must be positive'),
  images: z.array(z.string()).default([]),
  availabilityDate: z.string(),
  leaseTerm: z.string().min(1, 'Lease term is required'),
  amenities: z.object({
    parking: z.boolean().default(false),
    laundry: z.boolean().default(false),
    petsAllowed: z.boolean().default(false),
    utilitiesIncluded: z.boolean().default(false),
    furnished: z.boolean().default(false),
    airConditioning: z.boolean().default(false),
    heating: z.boolean().default(false),
    internet: z.boolean().default(false),
  }),
});

// POST - Create a new property (agents only)
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'agent') {
      return NextResponse.json({ error: 'Only agents can create properties' }, { status: 403 });
    }

    // Check agent subscription limits
    if (user.subscription && user.subscription.propertyCount >= user.subscription.propertyLimit) {
      return NextResponse.json(
        { error: `You've reached your property limit of ${user.subscription.propertyLimit}` },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createPropertySchema.parse(body);

    const property = new Property({
      ...validatedData,
      agentId: user._id,
      availabilityDate: new Date(validatedData.availabilityDate),
    });

    await property.save();

    // Update agent's property count
    if (user.subscription) {
      user.subscription.propertyCount += 1;
      await user.save();
    }

    return NextResponse.json({
      message: 'Property created successfully',
      property,
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Failed to create property:', error);
    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    );
  }
}
