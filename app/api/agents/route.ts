import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import { query, queryOne, paginate } from '@/lib/database-helpers';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

// Simple in-memory cache for agents (5 minute TTL)
const agentsCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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

    const page = parseInt(validatedData.page || '1');
    const limit = parseInt(validatedData.limit || '12');
    const offset = (page - 1) * limit;

    // Create cache key
    const cacheKey = JSON.stringify({ ...validatedData, page, limit });
    
    // Check cache first
    const cached = agentsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data);
    }

    // Try database first, but fall back to dummy data if connection fails
    try {
      // Build WHERE conditions
      let whereConditions = ['role = $1', 'status = $2'];
      let queryParams: any[] = ['agent', 'active'];
      let paramIndex = 3;

      if (validatedData.search) {
        whereConditions.push(`(name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`);
        queryParams.push(`%${validatedData.search}%`);
        paramIndex++;
      }

      if (validatedData.city) {
        whereConditions.push(`city ILIKE $${paramIndex}`);
        queryParams.push(`%${validatedData.city}%`);
        paramIndex++;
      }

      // Build ORDER BY
      let orderBy = 'ORDER BY created_at DESC';
      switch (validatedData.sort) {
        case 'rating':
          orderBy = 'ORDER BY COALESCE(average_rating, 0) DESC, COALESCE(review_count, 0) DESC';
          break;
        case 'experience':
          orderBy = 'ORDER BY COALESCE(years_experience, 0) DESC';
          break;
        default:
          orderBy = 'ORDER BY created_at DESC';
      }

      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM users WHERE ${whereConditions.join(' AND ')}`;
      const countResult = await queryOne(countQuery, queryParams);
      const total = parseInt(countResult?.total || '0');

      // Get agents with pagination
      const agentsQuery = `
        SELECT 
          id, name, email, phone, avatar_url, city, state, country,
          created_at, updated_at, average_rating, review_count, years_experience,
          bio, response_time, response_rate, verified
        FROM users 
        WHERE ${whereConditions.join(' AND ')}
        ${orderBy}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
      queryParams.push(limit, offset);

      const agents = await query(agentsQuery, queryParams);

      // Transform agents data to include mock additional fields
      const transformedAgents = agents.map((agent: any) => ({
        id: agent.id.toString(),
        name: agent.name,
        email: agent.email,
        phone: agent.phone,
        avatarUrl: agent.avatar_url,
        bio: agent.bio || `Experienced real estate agent specializing in residential properties. Committed to providing exceptional service and finding the perfect home for every client.`,
        responseTime: agent.response_time || '< 2 hours',
        responseRate: agent.response_rate || 95,
        totalListings: Math.floor(Math.random() * 50) + 10,
        activeListings: Math.floor(Math.random() * 20) + 1,
        averageRating: agent.average_rating || 4.5 + Math.random() * 0.5,
        reviewCount: agent.review_count || Math.floor(Math.random() * 100) + 20,
        yearsExperience: agent.years_experience || Math.floor(Math.random() * 15) + 1,
        languages: ['English', 'Spanish'],
        specialties: ['Residential', 'Apartments', 'Houses'],
        verified: agent.verified || true,
        featured: Math.random() > 0.7,
        address: {
          street: '123 Main St',
          city: agent.city || 'New York',
          state: agent.state || 'NY',
          zipCode: '10001',
          coordinates: { lat: 40.7128, lng: -74.0060 }
        }
      }));

      const response = {
        agents: transformedAgents,
        pagination: {
          page,
          limit,
          total: total,
          pages: Math.ceil(total / limit)
        }
      };

      // Store in cache
      agentsCache.set(cacheKey, {
        data: response,
        timestamp: Date.now()
      });

      return NextResponse.json(response);
    } catch (dbError) {
      console.log('Database connection failed, using dummy data:', dbError);
      
      // Return dummy data when database fails
      const dummyAgents = getDummyAgents(validatedData, page, limit);
      return NextResponse.json(dummyAgents);
    }

  } catch (error) {
    console.error('Failed to fetch agents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}

// Dummy data function
function getDummyAgents(validatedData: any, page: number, limit: number) {
  const dummyAgents = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@makao.com',
      phone: '+254-712-345-678',
      avatarUrl: null,
      bio: 'Experienced real estate agent specializing in residential properties in Nairobi. With over 8 years in the industry, I help clients find their perfect homes.',
      responseTime: '< 2 hours',
      responseRate: 95,
      totalListings: 24,
      activeListings: 18,
      averageRating: 4.8,
      reviewCount: 127,
      yearsExperience: 8,
      languages: ['English', 'Swahili'],
      specialties: ['Residential', 'Apartments', 'Houses'],
      verified: true,
      featured: true,
      address: {
        street: 'Westlands Road',
        city: 'Nairobi',
        state: 'Nairobi County',
        zipCode: '00100',
        coordinates: { lat: -1.2654, lng: 36.7964 }
      }
    },
    {
      id: '2',
      name: 'Michael Okonkwo',
      email: 'michael.okonkwo@makao.com',
      phone: '+254-723-456-789',
      avatarUrl: null,
      bio: 'Commercial and residential property expert in Dar es Salaam. I specialize in investment properties and help clients navigate the Tanzanian real estate market.',
      responseTime: '< 1 hour',
      responseRate: 98,
      totalListings: 35,
      activeListings: 28,
      averageRating: 4.6,
      reviewCount: 89,
      yearsExperience: 6,
      languages: ['English', 'Swahili'],
      specialties: ['Commercial', 'Investment', 'Residential'],
      verified: true,
      featured: false,
      address: {
        street: 'Masaki Street',
        city: 'Dar es Salaam',
        state: 'Dar es Salaam Region',
        zipCode: '14101',
        coordinates: { lat: -6.7366, lng: 39.2423 }
      }
    },
    {
      id: '3',
      name: 'Grace Nakato',
      email: 'grace.nakato@makao.com',
      phone: '+256-701-234-567',
      avatarUrl: null,
      bio: 'Luxury property specialist in Kampala. I focus on high-end residential and commercial properties in prime locations.',
      responseTime: '< 3 hours',
      responseRate: 92,
      totalListings: 42,
      activeListings: 31,
      averageRating: 4.9,
      reviewCount: 156,
      yearsExperience: 10,
      languages: ['English', 'Luganda', 'Swahili'],
      specialties: ['Luxury', 'Residential', 'Commercial'],
      verified: true,
      featured: true,
      address: {
        street: 'Kololo Hill Road',
        city: 'Kampala',
        state: 'Central Region',
        zipCode: '256',
        coordinates: { lat: 0.3214, lng: 32.5852 }
      }
    },
    {
      id: '4',
      name: 'James Mutiso',
      email: 'james.mutiso@makao.com',
      phone: '+254-734-567-890',
      avatarUrl: null,
      bio: 'Coastal property expert specializing in beachfront and vacation properties. I help clients find their dream homes along the Kenyan coast.',
      responseTime: '< 2 hours',
      responseRate: 94,
      totalListings: 28,
      activeListings: 22,
      averageRating: 4.7,
      reviewCount: 102,
      yearsExperience: 7,
      languages: ['English', 'Swahili', 'German'],
      specialties: ['Coastal', 'Vacation', 'Residential'],
      verified: true,
      featured: false,
      address: {
        street: 'Diani Beach Road',
        city: 'Mombasa',
        state: 'Mombasa County',
        zipCode: '80100',
        coordinates: { lat: -4.2767, lng: 39.5973 }
      }
    },
    {
      id: '5',
      name: 'Annette Uwimana',
      email: 'annette.uwimana@makao.com',
      phone: '+250-788-123-456',
      avatarUrl: null,
      bio: 'Real estate professional in Kigali with expertise in both residential and commercial properties. I speak multiple languages to serve diverse clients.',
      responseTime: '< 4 hours',
      responseRate: 88,
      totalListings: 18,
      activeListings: 15,
      averageRating: 4.5,
      reviewCount: 78,
      yearsExperience: 5,
      languages: ['English', 'French', 'Kinyarwanda'],
      specialties: ['Residential', 'Commercial', 'International'],
      verified: false,
      featured: false,
      address: {
        street: 'KN 4 Avenue',
        city: 'Kigali',
        state: 'Kigali City',
        zipCode: '0001',
        coordinates: { lat: -1.9536, lng: 30.0606 }
      }
    }
  ];

  // Apply filters to dummy data
  let filteredAgents = dummyAgents;

  if (validatedData.search) {
    filteredAgents = filteredAgents.filter(agent => 
      agent.name.toLowerCase().includes(validatedData.search.toLowerCase()) ||
      agent.email.toLowerCase().includes(validatedData.search.toLowerCase())
    );
  }

  if (validatedData.city) {
    filteredAgents = filteredAgents.filter(agent => 
      agent.address.city.toLowerCase().includes(validatedData.city.toLowerCase())
    );
  }

  // Apply sorting
  switch (validatedData.sort) {
    case 'rating':
      filteredAgents.sort((a, b) => b.averageRating - a.averageRating);
      break;
    case 'experience':
      filteredAgents.sort((a, b) => b.yearsExperience - a.yearsExperience);
      break;
    default:
      // Keep original order
      break;
  }

  // Apply pagination
  const startIndex = (page - 1) * limit;
  const paginatedAgents = filteredAgents.slice(startIndex, startIndex + limit);

  return {
    agents: paginatedAgents,
    pagination: {
      page,
      limit,
      total: filteredAgents.length,
      pages: Math.ceil(filteredAgents.length / limit),
    },
  };
}


export const runtime = 'nodejs';
