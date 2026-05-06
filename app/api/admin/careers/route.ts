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
    const jobTitle = searchParams.get('jobTitle');
    const location = searchParams.get('location');

    const offset = (page - 1) * limit;

    // Build WHERE clause
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (status) {
      conditions.push(`status = $${paramIndex++}`);
      params.push(status);
    }
    if (jobTitle) {
      conditions.push(`job_title ILIKE $${paramIndex++}`);
      params.push(`%${jobTitle}%`);
    }
    if (location) {
      conditions.push(`location ILIKE $${paramIndex++}`);
      params.push(`%${location}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const pool = await getDatabase();

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM job_applications 
      ${whereClause}
    `;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Get applications
    const applicationsQuery = `
      SELECT id, job_title, job_type, location, applicant_name, email, phone, 
             resume_url, cover_letter, linkedin_url, portfolio_url, experience_years,
             current_company, current_position, salary_expectations, availability,
             status, created_at, updated_at, reviewed_at, reviewed_by, notes
      FROM job_applications 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    params.push(limit, offset);

    const applicationsResult = await pool.query(applicationsQuery, params);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      applications: applicationsResult.rows,
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
    console.error('Admin job applications GET error:', error);
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
    const { id, status, reviewed_by, notes } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      );
    }

    const pool = await getDatabase();

    // Update application status
    const updateFields = ['updated_at = CURRENT_TIMESTAMP'];
    const params = [];
    let paramIndex = 1;

    if (status) {
      updateFields.push(`status = $${paramIndex++}`);
      params.push(status);
      
      if (['reviewing', 'shortlisted', 'interviewed', 'offered', 'rejected'].includes(status)) {
        updateFields.push(`reviewed_at = CURRENT_TIMESTAMP`);
      }
    }

    if (reviewed_by) {
      updateFields.push(`reviewed_by = $${paramIndex++}`);
      params.push(reviewed_by);
    }

    if (notes !== undefined) {
      updateFields.push(`notes = $${paramIndex++}`);
      params.push(notes);
    }

    params.push(id);

    const updateQuery = `
      UPDATE job_applications 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(updateQuery, params);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Job application updated successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Admin job applications PATCH error:', error);
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
        { error: 'Application ID is required' },
        { status: 400 }
      );
    }

    const pool = await getDatabase();
    const result = await pool.query(
      'DELETE FROM job_applications WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Job application deleted successfully'
    });

  } catch (error) {
    console.error('Admin job applications DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
