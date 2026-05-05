import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const updateSpaceSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  propertyLimit: z.number().min(1).optional(),
});

// PUT - Update space
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!userRole || userRole !== 'agent') {
      return NextResponse.json({ error: 'Agent access required' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const validatedData = updateSpaceSchema.parse(body);

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

    // Verify space belongs to this agent
    const spaceResult = await pool.query(
      'SELECT agent_id FROM spaces WHERE id = $1',
      [id]
    );

    const space = spaceResult.rows[0];
    if (!space || space.agent_id !== decoded.userId) {
      return NextResponse.json(
        { error: 'Space not found or access denied' },
        { status: 404 }
      );
    }

    // Update space
    const updateQuery = `
      UPDATE spaces SET 
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        property_limit = COALESCE($3, property_limit),
        updated_at = NOW()
      WHERE id = $4
    `;

    const values = [
      validatedData.name,
      validatedData.description,
      validatedData.propertyLimit,
      id
    ];

    await pool.query(updateQuery, values);

    return NextResponse.json({
      message: 'Space updated successfully'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Update space error:', error);
    return NextResponse.json(
      { error: 'Failed to update space' },
      { status: 500 }
    );
  }
}

// GET - Get specific space
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!userRole || userRole !== 'agent') {
      return NextResponse.json({ error: 'Agent access required' }, { status: 403 });
    }

    const { id } = params;

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

    // Verify space belongs to this agent
    const spaceResult = await pool.query(
      'SELECT * FROM spaces WHERE id = $1 AND agent_id = $2',
      [id, decoded.userId]
    );

    const space = spaceResult.rows[0];
    if (!space) {
      return NextResponse.json(
        { error: 'Space not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      space: space
    });

  } catch (error) {
    console.error('Get space error:', error);
    return NextResponse.json(
      { error: 'Failed to get space' },
      { status: 500 }
    );
  }
}


export const runtime = 'nodejs';
