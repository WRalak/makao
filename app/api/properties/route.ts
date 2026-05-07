import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, paginate, validateRequired, handleDatabaseError } from '@/lib/database-helpers';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

// GET - Fetch all approved properties for public browsing
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const bedrooms = searchParams.get('bedrooms');
    const bathrooms = searchParams.get('bathrooms');
    const petsAllowed = searchParams.get('petsAllowed');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    // Build base query
    let baseQuery = `
      SELECT 
        p.id, p.title, p.description, p.street, p.city, p.state, p.country,
        p.zip_code, p.latitude, p.longitude, p.bedrooms, p.bathrooms, p.square_feet,
        p.rent, p.rent_currency, p.security_deposit, p.available_date,
        p.images, p.amenities, p.pet_policy, p.status, p.featured, p.is_approved, 
        p.views, p.messages_count, p.created_at, p.updated_at,
        u.name as agent_name, u.email as agent_email, u.phone as agent_phone
      FROM properties p
      LEFT JOIN users u ON p.agent_id = u.id
      WHERE p.status = 'available' AND p.is_approved = true
    `;

    let countQuery = `
      SELECT COUNT(*) as total 
      FROM properties p 
      WHERE p.status = 'available' AND p.is_approved = true
    `;

    const params: any[] = [];
    let paramIndex = 1;

    // Add filters
    if (city) {
      baseQuery += ` AND p.city ILIKE $${paramIndex}`;
      countQuery += ` AND city ILIKE $${paramIndex}`;
      params.push(`%${city}%`);
      paramIndex++;
    }

    if (minPrice) {
      baseQuery += ` AND p.rent >= $${paramIndex}`;
      countQuery += ` AND rent >= $${paramIndex}`;
      params.push(minPrice);
      paramIndex++;
    }

    if (maxPrice) {
      baseQuery += ` AND p.rent <= $${paramIndex}`;
      countQuery += ` AND rent <= $${paramIndex}`;
      params.push(maxPrice);
      paramIndex++;
    }

    if (bedrooms && bedrooms !== 'any') {
      baseQuery += ` AND p.bedrooms = $${paramIndex}`;
      countQuery += ` AND bedrooms = $${paramIndex}`;
      params.push(bedrooms);
      paramIndex++;
    }

    if (bathrooms && bathrooms !== 'any') {
      baseQuery += ` AND p.bathrooms = $${paramIndex}`;
      countQuery += ` AND bathrooms = $${paramIndex}`;
      params.push(bathrooms);
      paramIndex++;
    }

    if (petsAllowed === 'true') {
      baseQuery += ` AND p.pet_policy = 'allowed'`;
      countQuery += ` AND pet_policy = 'allowed'`;
    }

    // Add ordering and pagination
    baseQuery += ` ORDER BY p.created_at DESC LIMIT ${limit} OFFSET ${(page - 1) * limit}`;

    // Execute queries
    const [properties, countResult] = await Promise.all([
      query(baseQuery, params),
      queryOne<{ total: number }>(countQuery, params.slice(0, -2)) // Remove pagination params for count
    ]);

    const total = countResult?.total || 0;

    // Transform data to match expected format
    const transformedProperties = properties.map((prop: any) => ({
      id: prop.id.toString(),
      title: prop.title,
      description: prop.description,
      address: {
        street: prop.street,
        city: prop.city,
        state: prop.state,
        country: prop.country,
        zipCode: prop.zip_code,
        coordinates: {
          lat: parseFloat(prop.latitude),
          lng: parseFloat(prop.longitude)
        }
      },
      rent: parseFloat(prop.rent),
      rentCurrency: prop.rent_currency,
      securityDeposit: prop.security_deposit ? parseFloat(prop.security_deposit) : null,
      bedrooms: prop.bedrooms,
      bathrooms: prop.bathrooms,
      squareFeet: prop.square_feet,
      availableDate: prop.available_date,
      images: prop.images || [],
      amenities: prop.amenities || [],
      petPolicy: prop.pet_policy,
      agent: {
        id: prop.agent_id?.toString(),
        name: prop.agent_name,
        email: prop.agent_email,
        phone: prop.agent_phone
      },
      status: prop.status,
      featured: prop.featured,
      approved: prop.is_approved,
      views: prop.views,
      messageCount: prop.messages_count,
      createdAt: prop.created_at,
      updatedAt: prop.updated_at
    }));

    return NextResponse.json({
      properties: transformedProperties,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Failed to fetch properties:', error);
    const dbError = handleDatabaseError(error);
    return NextResponse.json(
      { error: dbError.message },
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
    country: z.string().optional(),
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

    // Get user from database
    const user = await queryOne(
      'SELECT id, role, subscription FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (!user || user.role !== 'agent') {
      return NextResponse.json({ error: 'Only agents can create properties' }, { status: 403 });
    }

    // Check agent subscription limits
    const agentProperties = await queryOne(
      'SELECT COUNT(*) as count FROM properties WHERE agent_id = $1',
      [user.id]
    );

    if (user.subscription && agentProperties.count >= user.subscription.propertyLimit) {
      return NextResponse.json(
        { error: `You've reached your property limit of ${user.subscription.propertyLimit}` },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createPropertySchema.parse(body);

    // Insert property
    const insertQuery = `
      INSERT INTO properties (
        title, description, street, city, state, country, zip_code,
        latitude, longitude, bedrooms, bathrooms, square_feet,
        rent_amount, rent_currency, security_deposit, available_date,
        lease_term, images, amenities, pet_policy, furnished,
        parking_spaces, parking_type, utilities_included, utility_costs,
        agent_id, status, is_featured, is_active, is_verified,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12,
        $13, $14, $15, $16,
        $17, $18, $19, $20, $21,
        $22, $23, $24, $25,
        $26, $27, $28, $29, $30,
        NOW(), NOW()
      ) RETURNING id
    `;

    const params = [
      validatedData.title,
      validatedData.description,
      validatedData.address.street,
      validatedData.address.city,
      validatedData.address.state,
      validatedData.address.country || 'KE',
      validatedData.address.zipCode,
      validatedData.address.coordinates.lat,
      validatedData.address.coordinates.lng,
      validatedData.bedrooms,
      validatedData.bathrooms,
      validatedData.squareFeet,
      validatedData.rent,
      'KES', // Default currency
      validatedData.securityDeposit,
      validatedData.availabilityDate,
      validatedData.leaseTerm,
      JSON.stringify(validatedData.images),
      JSON.stringify(Object.keys(validatedData.amenities).filter(key => validatedData.amenities[key as keyof typeof validatedData.amenities])),
      validatedData.amenities.petsAllowed ? 'allowed' : 'not_allowed',
      validatedData.amenities.furnished,
      validatedData.amenities.parking ? 1 : 0,
      'street', // Default parking type
      JSON.stringify(Object.keys(validatedData.amenities).filter(key => validatedData.amenities[key as keyof typeof validatedData.amenities] && ['utilitiesIncluded'].includes(key))),
      0, // Default utility costs
      user.id,
      'available',
      false, // featured
      true, // active
      false // verified
    ];

    const result = await queryOne<{ id: number }>(insertQuery, params);

    if (!result) {
      throw new Error('Failed to create property');
    }

    // Get the created property
    const createdProperty = await queryOne(
      'SELECT * FROM properties WHERE id = $1',
      [result.id]
    );

    return NextResponse.json({
      message: 'Property created successfully',
      property: createdProperty,
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Failed to create property:', error);
    const dbError = handleDatabaseError(error);
    return NextResponse.json(
      { error: dbError.message },
      { status: 500 }
    );
  }
}


export const runtime = 'nodejs';
