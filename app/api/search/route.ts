import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const searchSchema = z.object({
  // Basic search
  query: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default('KE'),
  
  // Price range
  minRent: z.number().min(0).optional(),
  maxRent: z.number().min(0).optional(),
  
  // Property details
  bedrooms: z.number().min(0).max(20).optional(),
  bathrooms: z.number().min(0).max(20).optional(),
  squareFeet: z.number().min(100).optional(),
  propertyType: z.enum(['apartment', 'house', 'condo', 'townhouse', 'studio', 'loft', 'duplex']).optional(),
  
  // Features
  furnished: z.boolean().optional(),
  petPolicy: z.enum(['allowed', 'not_allowed', 'restricted']).optional(),
  parkingSpaces: z.number().min(0).optional(),
  
  // Utilities
  utilitiesIncluded: z.array(z.string()).optional(),
  
  // Location-based search
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  radius: z.number().min(1).max(50).optional(), // miles
  
  // Sorting and pagination
  sort: z.enum(['price_asc', 'price_desc', 'newest', 'bedrooms', 'sqft', 'relevance']).default('relevance'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  
  // Filters
  availableAfter: z.string().optional(),
  availableBefore: z.string().optional(),
  leaseTerm: z.enum(['6', '12', '18', '24']).optional(),
  amenities: z.array(z.string()).optional(),
  
  // Map bounds for viewport search
  bounds: z.object({
    north: z.number(),
    south: z.number(),
    east: z.number(),
    west: z.number()
  }).optional()
});

// GET - Advanced property search with map integration
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const validatedData = searchSchema.parse({
      query: searchParams.get('query') || undefined,
      city: searchParams.get('city') || undefined,
      state: searchParams.get('state') || undefined,
      country: searchParams.get('country') || 'KE',
      minRent: searchParams.get('minRent') ? parseFloat(searchParams.get('minRent')!) : undefined,
      maxRent: searchParams.get('maxRent') ? parseFloat(searchParams.get('maxRent')!) : undefined,
      bedrooms: searchParams.get('bedrooms') ? parseInt(searchParams.get('bedrooms')!) : undefined,
      bathrooms: searchParams.get('bathrooms') ? parseInt(searchParams.get('bathrooms')!) : undefined,
      squareFeet: searchParams.get('squareFeet') ? parseInt(searchParams.get('squareFeet')!) : undefined,
      propertyType: searchParams.get('propertyType') || undefined,
      furnished: searchParams.get('furnished') === 'true' ? true : searchParams.get('furnished') === 'false' ? false : undefined,
      petPolicy: searchParams.get('petPolicy') as any || undefined,
      parkingSpaces: searchParams.get('parkingSpaces') ? parseInt(searchParams.get('parkingSpaces')!) : undefined,
      utilitiesIncluded: searchParams.get('utilitiesIncluded') ? searchParams.get('utilitiesIncluded').split(',') : undefined,
      latitude: searchParams.get('latitude') ? parseFloat(searchParams.get('latitude')!) : undefined,
      longitude: searchParams.get('longitude') ? parseFloat(searchParams.get('longitude')!) : undefined,
      radius: searchParams.get('radius') ? parseFloat(searchParams.get('radius')!) : undefined,
      sort: (searchParams.get('sort') as any) || 'relevance',
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      availableAfter: searchParams.get('availableAfter') || undefined,
      availableBefore: searchParams.get('availableBefore') || undefined,
      leaseTerm: searchParams.get('leaseTerm') as any || undefined,
      amenities: searchParams.get('amenities') ? searchParams.get('amenities').split(',') : undefined,
      bounds: searchParams.get('bounds') ? JSON.parse(searchParams.get('bounds')!) : undefined
    });

    // Optional authentication for saved properties and preferences
    const token = request.cookies.get('auth_token')?.value;
    let user = null;
    
    if (token) {
      try {
        user = verifyToken(token);
      } catch (authError) {
        // Continue without authentication for public search
        console.warn('Invalid token, proceeding with public search');
      }
    }

    let pool;
    try {
      pool = await connectDB();
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed. Please try again later.' },
        { status: 500 }
      );
    }

    const offset = (validatedData.page - 1) * validatedData.limit;

    // Build WHERE conditions
    const conditions = ['p.is_active = true', 'p.status = $1'];
    const params: any[] = ['available'];
    let paramIndex = 2;

    // Text search
    if (validatedData.query) {
      conditions.push(`(
        p.title ILIKE $${paramIndex} OR 
        p.description ILIKE $${paramIndex} OR 
        p.street ILIKE $${paramIndex} OR
        p.city ILIKE $${paramIndex} OR
        p.state ILIKE $${paramIndex}
      )`);
      params.push(`%${validatedData.query}%`);
      paramIndex++;
    }

    // Location filters
    if (validatedData.city) {
      conditions.push(`p.city ILIKE $${paramIndex}`);
      params.push(`%${validatedData.city}%`);
      paramIndex++;
    }

    if (validatedData.state) {
      conditions.push(`p.state ILIKE $${paramIndex}`);
      params.push(`%${validatedData.state}%`);
      paramIndex++;
    }

    if (validatedData.country) {
      conditions.push(`p.country = $${paramIndex}`);
      params.push(validatedData.country);
      paramIndex++;
    }

    // Price range
    if (validatedData.minRent) {
      conditions.push(`p.rent_amount >= $${paramIndex}`);
      params.push(validatedData.minRent);
      paramIndex++;
    }

    if (validatedData.maxRent) {
      conditions.push(`p.rent_amount <= $${paramIndex}`);
      params.push(validatedData.maxRent);
      paramIndex++;
    }

    // Property details
    if (validatedData.bedrooms) {
      conditions.push(`p.bedrooms >= $${paramIndex}`);
      params.push(validatedData.bedrooms);
      paramIndex++;
    }

    if (validatedData.bathrooms) {
      conditions.push(`p.bathrooms >= $${paramIndex}`);
      params.push(validatedData.bathrooms);
      paramIndex++;
    }

    if (validatedData.squareFeet) {
      conditions.push(`p.square_feet >= $${paramIndex}`);
      params.push(validatedData.squareFeet);
      paramIndex++;
    }

    if (validatedData.propertyType) {
      conditions.push(`p.property_type = $${paramIndex}`);
      params.push(validatedData.propertyType);
      paramIndex++;
    }

    // Features
    if (validatedData.furnished !== undefined) {
      conditions.push(`p.furnished = $${paramIndex}`);
      params.push(validatedData.furnished);
      paramIndex++;
    }

    if (validatedData.petPolicy) {
      conditions.push(`p.pet_policy = $${paramIndex}`);
      params.push(validatedData.petPolicy);
      paramIndex++;
    }

    if (validatedData.parkingSpaces !== undefined) {
      conditions.push(`p.parking_spaces >= $${paramIndex}`);
      params.push(validatedData.parkingSpaces);
      paramIndex++;
    }

    // Utilities
    if (validatedData.utilitiesIncluded && validatedData.utilitiesIncluded.length > 0) {
      const utilityConditions = validatedData.utilitiesIncluded.map((_, index) => 
        `p.utilities_included ILIKE $${paramIndex + index}`
      );
      conditions.push(`(${utilityConditions.join(' OR ')})`);
      validatedData.utilitiesIncluded.forEach(utility => {
        params.push(`%${utility}%`);
      });
      paramIndex += validatedData.utilitiesIncluded.length;
    }

    // Amenities
    if (validatedData.amenities && validatedData.amenities.length > 0) {
      const amenityConditions = validatedData.amenities.map((_, index) => 
        `p.amenities ILIKE $${paramIndex + index}`
      );
      conditions.push(`(${amenityConditions.join(' OR ')})`);
      validatedData.amenities.forEach(amenity => {
        params.push(`%${amenity}%`);
      });
      paramIndex += validatedData.amenities.length;
    }

    // Date availability
    if (validatedData.availableAfter) {
      conditions.push(`p.available_date >= $${paramIndex}`);
      params.push(validatedData.availableAfter);
      paramIndex++;
    }

    if (validatedData.availableBefore) {
      conditions.push(`p.available_date <= $${paramIndex}`);
      params.push(validatedData.availableBefore);
      paramIndex++;
    }

    if (validatedData.leaseTerm) {
      conditions.push(`p.lease_term = $${paramIndex}`);
      params.push(validatedData.leaseTerm);
      paramIndex++;
    }

    // Geographic search
    if (validatedData.latitude && validatedData.longitude && validatedData.radius) {
      conditions.push(`
        (
          6371 * acos(
            cos(radians($${paramIndex})) * 
            cos(radians(p.latitude)) * 
            cos(radians(p.longitude) - radians($${paramIndex + 1})) + 
            sin(radians($${paramIndex})) * 
            sin(radians(p.latitude))
          )
        ) <= $${paramIndex + 2}
      `);
      params.push(validatedData.latitude, validatedData.longitude, validatedData.radius);
      paramIndex += 3;
    }

    // Map bounds search
    if (validatedData.bounds) {
      conditions.push(`
        p.latitude BETWEEN $${paramIndex} AND $${paramIndex + 1} AND
        p.longitude BETWEEN $${paramIndex + 2} AND $${paramIndex + 3}
      `);
      params.push(
        validatedData.bounds.south,
        validatedData.bounds.north,
        validatedData.bounds.west,
        validatedData.bounds.east
      );
      paramIndex += 4;
    }

    // Build ORDER BY clause
    let orderBy = 'ORDER BY ';
    switch (validatedData.sort) {
      case 'price_asc':
        orderBy += 'p.rent_amount ASC';
        break;
      case 'price_desc':
        orderBy += 'p.rent_amount DESC';
        break;
      case 'newest':
        orderBy += 'p.created_at DESC';
        break;
      case 'bedrooms':
        orderBy += 'p.bedrooms DESC, p.created_at DESC';
        break;
      case 'sqft':
        orderBy += 'p.square_feet DESC, p.created_at DESC';
        break;
      case 'relevance':
      default:
        if (validatedData.query) {
          orderBy += `
            CASE 
              WHEN p.title ILIKE $1 THEN 1
              WHEN p.description ILIKE $1 THEN 2
              WHEN p.street ILIKE $1 THEN 3
              ELSE 4
            END ASC,
            p.is_featured DESC,
            p.view_count DESC,
            p.created_at DESC
          `;
        } else {
          orderBy += 'p.is_featured DESC, p.view_count DESC, p.created_at DESC';
        }
        break;
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM properties p WHERE ${conditions.join(' AND ')}`;
    const countResult = await pool!.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total || '0');

    // Get properties with full details
    const propertiesQuery = `
      SELECT 
        p.id,
        p.title,
        p.description,
        p.street,
        p.city,
        p.state,
        p.country,
        p.zip_code,
        p.latitude,
        p.longitude,
        p.bedrooms,
        p.bathrooms,
        p.square_feet,
        p.rent_amount,
        p.rent_currency,
        p.security_deposit,
        p.available_date,
        p.lease_term,
        p.lease_length_months,
        p.images,
        p.amenities,
        p.pet_policy,
        p.furnished,
        p.parking_spaces,
        p.parking_type,
        p.utilities_included,
        p.utility_costs,
        p.virtual_tour_url,
        p.video_tour_url,
        p.nearby_amenities,
        p.transport_links,
        p.walk_score,
        p.transit_score,
        p.agent_id,
        p.status,
        p.is_featured,
        p.is_active,
        p.is_verified,
        p.view_count,
        p.message_count,
        p.save_count,
        p.application_count,
        p.tour_count,
        p.slug,
        p.meta_title,
        p.meta_description,
        p.created_at,
        p.updated_at,
        u.name as agent_name,
        u.email as agent_email,
        u.phone as agent_phone,
        u.avatar_url as agent_avatar,
        -- Distance calculation for geographic search
        ${
          validatedData.latitude && validatedData.longitude 
            ? `(6371 * acos(cos(radians(${validatedData.latitude})) * cos(radians(p.latitude)) * cos(radians(p.longitude) - radians(${validatedData.longitude})) + sin(radians(${validatedData.latitude})) * sin(radians(p.latitude)))) as distance_km` 
            : 'NULL as distance_km'
        },
        -- Relevance score for text search
        ${
          validatedData.query 
            ? `CASE 
                WHEN p.title ILIKE $1 THEN 1.0
                WHEN p.description ILIKE $1 THEN 0.8
                WHEN p.street ILIKE $1 THEN 0.6
                ELSE 0.4
              END as relevance_score` 
            : '1.0 as relevance_score'
        }
      FROM properties p
      LEFT JOIN users u ON p.agent_id = u.id
      WHERE ${conditions.join(' AND ')}
      ${orderBy}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(validatedData.limit.toString(), offset.toString());
    const propertiesResult = await pool!.query(propertiesQuery, params);

    // Transform properties data
    const properties = propertiesResult.rows.map(property => ({
      id: property.id,
      title: property.title,
      description: property.description,
      address: {
        street: property.street,
        city: property.city,
        state: property.state,
        zipCode: property.zip_code,
        country: property.country,
        coordinates: {
          lat: parseFloat(property.latitude),
          lng: parseFloat(property.longitude)
        }
      },
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      squareFeet: property.square_feet,
      rent: parseFloat(property.rent_amount),
      rentCurrency: property.rent_currency,
      securityDeposit: property.security_deposit ? parseFloat(property.security_deposit) : null,
      availableDate: property.available_date,
      leaseTerm: property.lease_term,
      leaseLengthMonths: property.lease_length_months,
      images: property.images || [],
      amenities: property.amenities || [],
      petPolicy: property.pet_policy,
      furnished: property.furnished,
      parking: {
        spaces: property.parking_spaces,
        type: property.parking_type
      },
      utilities: {
        included: property.utilities_included || [],
        costs: property.utility_costs ? parseFloat(property.utility_costs) : 0
      },
      virtualTour: {
        url: property.virtual_tour_url,
        videoUrl: property.video_tour_url
      },
      location: {
        nearbyAmenities: property.nearby_amenities || [],
        transportLinks: property.transport_links || [],
        walkScore: property.walk_score,
        transitScore: property.transitScore
      },
      agent: {
        id: property.agent_id,
        name: property.agent_name,
        email: property.agent_email,
        phone: property.agent_phone,
        avatar: property.agent_avatar
      },
      status: property.status,
      featured: property.is_featured,
      active: property.is_active,
      verified: property.is_verified,
      analytics: {
        views: property.view_count,
        messages: property.message_count,
        saves: property.save_count,
        applications: property.application_count,
        tours: property.tour_count
      },
      seo: {
        slug: property.slug,
        metaTitle: property.meta_title,
        metaDescription: property.meta_description
      },
      search: {
        distance: property.distance_km ? parseFloat(property.distance_km) : null,
        relevance: parseFloat(property.relevance_score)
      },
      createdAt: property.created_at,
      updatedAt: property.updated_at
    }));

    // Get user's saved properties if authenticated
    let savedPropertyIds: number[] = [];
    if (user) {
      const savedResult = await pool!.query(
        'SELECT property_id FROM favorites WHERE user_id = $1',
        [user.userId]
      );
      savedPropertyIds = savedResult.rows.map(row => row.property_id);
    }

    // Mark saved properties
    const propertiesWithSaved = properties.map(property => ({
      ...property,
      isSaved: savedPropertyIds.includes(property.id)
    }));

    return NextResponse.json({
      properties: propertiesWithSaved,
      pagination: {
        page: validatedData.page,
        limit: validatedData.limit,
        total,
        pages: Math.ceil(total / validatedData.limit),
      },
      search: {
        query: validatedData.query,
        filters: {
          city: validatedData.city,
          minRent: validatedData.minRent,
          maxRent: validatedData.maxRent,
          bedrooms: validatedData.bedrooms,
          bathrooms: validatedData.bathrooms,
          propertyType: validatedData.propertyType,
          furnished: validatedData.furnished,
          petPolicy: validatedData.petPolicy,
          amenities: validatedData.amenities
        },
        sort: validatedData.sort,
        geographic: {
          latitude: validatedData.latitude,
          longitude: validatedData.longitude,
          radius: validatedData.radius,
          bounds: validatedData.bounds
        }
      },
      stats: {
        totalResults: total,
        searchTime: Date.now() // Simple timing
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid search parameters', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}


export const runtime = 'nodejs';
