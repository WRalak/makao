import { NextRequest, NextResponse } from 'next/server';
// import connectDB from '@/lib/mongoose';
// import Property from '@/models/Property';
// import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const propertySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
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
  availabilityDate: z.string().min(1, 'Availability date is required'),
  leaseTerm: z.string().min(1, 'Lease term is required'),
  amenities: z.object({
    parking: z.boolean().optional(),
    laundry: z.boolean().optional(),
    petsAllowed: z.boolean().optional(),
    utilitiesIncluded: z.boolean().optional(),
    furnished: z.boolean().optional(),
    airConditioning: z.boolean().optional(),
    heating: z.boolean().optional(),
    internet: z.boolean().optional(),
  }).optional(),
});

// GET - Fetch agent's properties
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'agent') {
      return NextResponse.json({ error: 'Agent access required' }, { status: 403 });
    }

    // TODO: Implement PostgreSQL query for agent properties
    // For now, return empty array as fallback
    return NextResponse.json([]);

  } catch (error) {
    console.error('Failed to fetch properties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}

// POST - Create new property
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'agent') {
      return NextResponse.json({ error: 'Agent access required' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = propertySchema.parse(body);

    // TODO: Implement PostgreSQL query for creating property
    // For now, return mock response
    return NextResponse.json({
      id: Date.now().toString(),
      ...validatedData,
      agentId: decoded.userId,
      createdAt: new Date().toISOString(),
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


export const runtime = 'nodejs';
