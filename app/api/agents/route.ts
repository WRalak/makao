import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';


const agentsQuerySchema = z.object({
  search: z.string().optional(),
  city: z.string().optional(),
  specialty: z.string().optional(),
  sort: z.enum(['rating', 'listings', 'response', 'experience']).default('rating'),
  page: z.string().optional(),
  limit: z.string().optional(),
});

// GET - Fetch agents with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const validatedData = agentsQuerySchema.parse(Object.fromEntries(searchParams));

    await connectDB();

    const page = parseInt(validatedData.page || '1');
    const limit = parseInt(validatedData.limit || '12');
    const skip = (page - 1) * limit;

    // Build query
    const query: any = { role: 'agent', isActive: true, isBanned: false };

    if (validatedData.search) {
      query.$or = [
        { name: { $regex: validatedData.search, $options: 'i' } },
        { company: { $regex: validatedData.search, $options: 'i' } },
      ];
    }

    if (validatedData.city) {
      query['address.city'] = { $regex: validatedData.city, $options: 'i' };
    }

    if (validatedData.specialty && validatedData.specialty !== 'all') {
      query['specialties'] = validatedData.specialty;
    }

    // Sort options
    let sort: any = {};
    switch (validatedData.sort) {
      case 'rating':
        sort = { averageRating: -1, reviewCount: -1 };
        break;
      case 'listings':
        sort = { 'subscription.propertyCount': -1 };
        break;
      case 'response':
        sort = { responseRate: -1 };
        break;
      case 'experience':
        sort = { yearsExperience: -1 };
        break;
      default:
        sort = { averageRating: -1, reviewCount: -1 };
    }

    // Get agents with mock data for now (replace with actual aggregation later)
    const agents = await User.find(query)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    // Transform agents data to include mock additional fields
    const transformedAgents = agents.map(agent => ({
      ...agent,
      bio: `Experienced real estate agent specializing in residential properties. Committed to providing exceptional service and finding the perfect home for every client.`,
      responseTime: '< 2 hours',
      responseRate: 95,
      totalListings: Math.floor(Math.random() * 50) + 10,
      activeListings: Math.floor(Math.random() * 20) + 1,
      averageRating: 4.5 + Math.random() * 0.5,
      reviewCount: Math.floor(Math.random() * 100) + 20,
      yearsExperience: Math.floor(Math.random() * 15) + 1,
      languages: ['English', 'Spanish'],
      specialties: ['Residential', 'Apartments', 'Houses'],
      verified: true,
      featured: Math.random() > 0.7,
      address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        coordinates: { lat: 40.7128, lng: -74.0060 }
      }
    }));

    const total = await User.countDocuments(query);

    return NextResponse.json({
      agents: transformedAgents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Failed to fetch agents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}
