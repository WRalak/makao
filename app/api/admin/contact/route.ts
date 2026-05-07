import { NextRequest, NextResponse } from 'next/server';
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
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');

    const offset = (page - 1) * limit;

    // Build WHERE clause
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (status) {
      conditions.push(`status = $${paramIndex++}`);
      params.push(status);
    }
    if (category) {
      conditions.push(`category = $${paramIndex++}`);
      params.push(category);
    }
    if (priority) {
      conditions.push(`priority = $${paramIndex++}`);
      params.push(priority);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const pool = await getDatabase();

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM contact_messages 
      ${whereClause}
    `;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Get messages
    const messagesQuery = `
      SELECT id, name, email, phone, subject, message, category, priority, status, 
             created_at, updated_at, responded_at, responded_by
      FROM contact_messages 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    params.push(limit, offset);

    const messagesResult = await pool.query(messagesQuery, params);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      messages: messagesResult.rows,
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
    console.error('Admin contact messages GET error:', error);
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
    const { id, status, responded_by } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }

    const pool = await getDatabase();

    // Update message status
    const updateFields = ['updated_at = CURRENT_TIMESTAMP'];
    const params = [];
    let paramIndex = 1;

    if (status) {
      updateFields.push(`status = $${paramIndex++}`);
      params.push(status);
      
      if (status === 'responded') {
        updateFields.push(`responded_at = CURRENT_TIMESTAMP`);
      }
    }

    if (responded_by) {
      updateFields.push(`responded_by = $${paramIndex++}`);
      params.push(responded_by);
    }

    params.push(id);

    const updateQuery = `
      UPDATE contact_messages 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(updateQuery, params);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Contact message updated successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Admin contact messages PATCH error:', error);
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
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }

    const pool = await getDatabase();
    const result = await pool.query(
      'DELETE FROM contact_messages WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Contact message deleted successfully'
    });

  } catch (error) {
    console.error('Admin contact messages DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
