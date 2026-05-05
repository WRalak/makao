import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const favoriteSchema = z.object({
  propertyId: z.number(),
  notes: z.string().optional(),
  collectionName: z.string().optional()
});

// GET - Get tenant's favorite properties
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'tenant') {
      return NextResponse.json({ error: 'Tenant access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const collection = searchParams.get('collection');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

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

    let query = `
      SELECT 
        f.id,
        f.property_id,
        f.notes,
        f.collection_name,
        f.created_at,
        f.updated_at,
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
        p.images,
        p.amenities,
        p.pet_policy,
        p.furnished,
        p.parking_spaces,
        p.parking_type,
        p.status,
        p.is_featured,
        p.view_count,
        p.message_count,
        p.application_count,
        p.slug,
        p.created_at as property_created_at,
        u.name as agent_name,
        u.email as agent_email,
        u.phone as agent_phone,
        u.avatar_url as agent_avatar
      FROM favorites f
      JOIN properties p ON f.property_id = p.id
      JOIN users u ON p.agent_id = u.id
      WHERE f.user_id = $1 AND p.is_active = true
    `;

    const params = [decoded.userId];

    if (collection) {
      query += ' AND f.collection_name = $2';
      params.push(collection);
    }

    query += ' ORDER BY f.created_at DESC LIMIT $3 OFFSET $4';
    params.push(limit, offset);

    const favoritesResult = await pool!.query(query, params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM favorites f WHERE f.user_id = $1';
    const countParams = [decoded.userId];

    if (collection) {
      countQuery += ' AND f.collection_name = $2';
      countParams.push(collection);
    }

    const countResult = await pool!.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    // Get collections
    const collectionsResult = await pool!.query(
      `SELECT DISTINCT collection_name, COUNT(*) as count 
       FROM favorites 
       WHERE user_id = $1 AND collection_name IS NOT NULL
       GROUP BY collection_name
       ORDER BY count DESC`,
      [decoded.userId]
    );

    // Transform favorites data
    const favorites = favoritesResult.rows.map(favorite => ({
      id: favorite.id,
      propertyId: favorite.property_id,
      notes: favorite.notes,
      collectionName: favorite.collection_name,
      createdAt: favorite.created_at,
      updatedAt: favorite.updated_at,
      property: {
        id: favorite.property_id,
        title: favorite.title,
        description: favorite.description,
        address: {
          street: favorite.street,
          city: favorite.city,
          state: favorite.state,
          country: favorite.country,
          zipCode: favorite.zip_code,
          coordinates: {
            lat: parseFloat(favorite.latitude),
            lng: parseFloat(favorite.longitude)
          }
        },
        bedrooms: favorite.bedrooms,
        bathrooms: favorite.bathrooms,
        squareFeet: favorite.square_feet,
        rent: parseFloat(favorite.rent_amount),
        rentCurrency: favorite.rent_currency,
        securityDeposit: favorite.security_deposit ? parseFloat(favorite.security_deposit) : null,
        availableDate: favorite.available_date,
        images: favorite.images || [],
        amenities: favorite.amenities || [],
        petPolicy: favorite.pet_policy,
        furnished: favorite.furnished,
        parking: {
          spaces: favorite.parking_spaces,
          type: favorite.parking_type
        },
        status: favorite.status,
        featured: favorite.is_featured,
        analytics: {
          views: favorite.view_count,
          messages: favorite.message_count,
          applications: favorite.application_count
        },
        seo: {
          slug: favorite.slug
        },
        agent: {
          name: favorite.agent_name,
          email: favorite.agent_email,
          phone: favorite.agent_phone,
          avatar: favorite.agent_avatar
        },
        createdAt: favorite.property_created_at
      }
    }));

    return NextResponse.json({
      favorites,
      collections: collectionsResult.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Favorites fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}

// POST - Add property to favorites
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'tenant') {
      return NextResponse.json({ error: 'Tenant access required' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = favoriteSchema.parse(body);

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

    // Check if property exists and is active
    const propertyResult = await pool!.query(
      'SELECT id, title FROM properties WHERE id = $1 AND is_active = true',
      [validatedData.propertyId]
    );

    if (propertyResult.rows.length === 0) {
      return NextResponse.json({ error: 'Property not found or not available' }, { status: 404 });
    }

    // Check if already favorited
    const existingResult = await pool!.query(
      'SELECT id FROM favorites WHERE user_id = $1 AND property_id = $2',
      [decoded.userId, validatedData.propertyId]
    );

    if (existingResult.rows.length > 0) {
      return NextResponse.json({ error: 'Property already in favorites' }, { status: 409 });
    }

    // Add to favorites
    const insertQuery = `
      INSERT INTO favorites (user_id, property_id, notes, collection_name, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING id, created_at
    `;

    const values = [
      decoded.userId,
      validatedData.propertyId,
      validatedData.notes || null,
      validatedData.collectionName || null
    ];

    const result = await pool!.query(insertQuery, values);
    const favorite = result.rows[0];

    // Increment property save count
    await pool!.query(
      'UPDATE properties SET save_count = save_count + 1 WHERE id = $1',
      [validatedData.propertyId]
    );

    return NextResponse.json({
      message: 'Property added to favorites',
      favorite: {
        id: favorite.id,
        propertyId: validatedData.propertyId,
        notes: validatedData.notes,
        collectionName: validatedData.collectionName,
        createdAt: favorite.created_at
      }
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Favorite creation error:', error);
    return NextResponse.json(
      { error: 'Failed to add to favorites' },
      { status: 500 }
    );
  }
}

// PUT - Update favorite (notes, collection)
export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'tenant') {
      return NextResponse.json({ error: 'Tenant access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const favoriteId = searchParams.get('id');

    if (!favoriteId) {
      return NextResponse.json({ error: 'Favorite ID is required' }, { status: 400 });
    }

    const { notes, collectionName } = await request.json();

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

    // Verify favorite belongs to user
    const favoriteResult = await pool!.query(
      'SELECT id FROM favorites WHERE id = $1 AND user_id = $2',
      [favoriteId, decoded.userId]
    );

    if (favoriteResult.rows.length === 0) {
      return NextResponse.json({ error: 'Favorite not found' }, { status: 404 });
    }

    // Update favorite
    const updateQuery = `
      UPDATE favorites 
      SET notes = $1, collection_name = $2, updated_at = NOW()
      WHERE id = $3::text
      RETURNING id, notes, collection_name, updated_at
    `;

    const result = await pool!.query(updateQuery, [
      notes || null,
      collectionName || null,
      favoriteId
    ]);

    const updatedFavorite = result.rows[0];

    return NextResponse.json({
      message: 'Favorite updated successfully',
      favorite: {
        id: updatedFavorite.id,
        notes: updatedFavorite.notes,
        collectionName: updatedFavorite.collection_name,
        updatedAt: updatedFavorite.updated_at
      }
    });

  } catch (error) {
    console.error('Favorite update error:', error);
    return NextResponse.json(
      { error: 'Failed to update favorite' },
      { status: 500 }
    );
  }
}

// DELETE - Remove property from favorites
export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'tenant') {
      return NextResponse.json({ error: 'Tenant access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const favoriteId = searchParams.get('id');

    if (!favoriteId) {
      return NextResponse.json({ error: 'Favorite ID is required' }, { status: 400 });
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

    // Get favorite details before deletion
    const favoriteResult = await pool!.query(
      'SELECT property_id FROM favorites WHERE id = $1 AND user_id = $2',
      [favoriteId, decoded.userId]
    );

    if (favoriteResult.rows.length === 0) {
      return NextResponse.json({ error: 'Favorite not found' }, { status: 404 });
    }

    const propertyId = favoriteResult.rows[0].property_id;

    // Delete favorite
    await pool!.query(
      'DELETE FROM favorites WHERE id = $1::text AND user_id = $2',
      [favoriteId, decoded.userId]
    );

    // Decrement property save count
    await pool!.query(
      'UPDATE properties SET save_count = GREATEST(save_count - 1, 0) WHERE id = $1',
      [propertyId]
    );

    return NextResponse.json({
      message: 'Property removed from favorites'
    });

  } catch (error) {
    console.error('Favorite deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to remove from favorites' },
      { status: 500 }
    );
  }
}


export const runtime = 'nodejs';
