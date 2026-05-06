import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/database';
import { verifyAdminAuth } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const source = searchParams.get('source');
    const search = searchParams.get('search');

    const offset = (page - 1) * limit;

    // Build WHERE clause
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (status) {
      conditions.push(`status = $${paramIndex++}`);
      params.push(status);
    }
    if (source) {
      conditions.push(`source = $${paramIndex++}`);
      params.push(source);
    }
    if (search) {
      conditions.push(`(email ILIKE $${paramIndex++} OR name ILIKE $${paramIndex++})`);
      params.push(`%${search}%`, `%${search}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const pool = await getDatabase();

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM newsletter_subscriptions 
      ${whereClause}
    `;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Get subscriptions
    const subscriptionsQuery = `
      SELECT id, email, name, status, source, preferences, 
             created_at, updated_at, unsubscribed_at
      FROM newsletter_subscriptions 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    params.push(limit, offset);

    const subscriptionsResult = await pool.query(subscriptionsQuery, params);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      subscriptions: subscriptionsResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Admin newsletter GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { email, name, source = 'admin' } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const pool = await getDatabase();

    try {
      const result = await pool.query(
        `INSERT INTO newsletter_subscriptions (email, name, source, status)
         VALUES ($1, $2, $3, 'active')
         ON CONFLICT (email) DO UPDATE SET
           updated_at = CURRENT_TIMESTAMP
         RETURNING id, created_at, status`,
        [email, name || null, source]
      );

      const subscription = result.rows[0];

      return NextResponse.json({
        success: true,
        message: 'Newsletter subscription created/updated successfully',
        data: subscription
      });

    } catch (dbError: any) {
      if (dbError.code === '23505') {
        return NextResponse.json({
          success: true,
          message: 'Email already exists in subscription list',
          data: { status: 'already_exists' }
        });
      }
      throw dbError;
    }

  } catch (error) {
    console.error('Admin newsletter POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, status, preferences } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      );
    }

    const pool = await getDatabase();

    // Update subscription
    const updateFields = ['updated_at = CURRENT_TIMESTAMP'];
    const params = [];
    let paramIndex = 1;

    if (status) {
      updateFields.push(`status = $${paramIndex++}`);
      params.push(status);
      
      if (status === 'unsubscribed') {
        updateFields.push(`unsubscribed_at = CURRENT_TIMESTAMP`);
      } else if (status === 'active') {
        updateFields.push(`unsubscribed_at = NULL`);
      }
    }

    if (preferences !== undefined) {
      updateFields.push(`preferences = $${paramIndex++}`);
      params.push(JSON.stringify(preferences));
    }

    params.push(id);

    const updateQuery = `
      UPDATE newsletter_subscriptions 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(updateQuery, params);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Newsletter subscription updated successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Admin newsletter PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      );
    }

    const pool = await getDatabase();
    const result = await pool.query(
      'DELETE FROM newsletter_subscriptions WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Newsletter subscription deleted successfully'
    });

  } catch (error) {
    console.error('Admin newsletter DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
