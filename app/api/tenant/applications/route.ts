import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const applicationSchema = z.object({
  propertyId: z.number(),
  personalInfo: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(10),
    dateOfBirth: z.string(),
    ssn: z.string().optional(),
    driverLicense: z.string().optional(),
  }),
  employmentInfo: z.object({
    employerName: z.string().min(1),
    position: z.string().min(1),
    employerAddress: z.string().min(1),
    employerPhone: z.string().min(10),
    monthlyIncome: z.number().min(0),
    employmentDuration: z.string().min(1),
    supervisorName: z.string().min(1),
    supervisorPhone: z.string().min(10),
    supervisorEmail: z.string().email().optional(),
  }),
  rentalHistory: z.array(z.object({
    address: z.string(),
    landlordName: z.string(),
    landlordPhone: z.string(),
    rentAmount: z.number(),
    duration: z.string(),
    reasonForLeaving: z.string().optional(),
  })).optional(),
  references: z.array(z.object({
    name: z.string(),
    relationship: z.string(),
    phone: z.string(),
    email: z.string().email().optional(),
    address: z.string(),
  })).min(1).max(3),
  additionalInfo: z.object({
    moveInDate: z.string(),
    leaseTerm: z.enum(['6', '12', '18', '24']),
    pets: z.boolean(),
    petDetails: z.string().optional(),
    smoking: z.boolean(),
    evictionHistory: z.boolean(),
    evictionDetails: z.string().optional(),
    criminalHistory: z.boolean(),
    criminalDetails: z.string().optional(),
    additionalNotes: z.string().optional(),
  }),
  documents: z.array(z.object({
    type: z.enum(['pay_stub', 'bank_statement', 'id', 'employment_letter', 'landlord_reference']),
    filename: z.string(),
    url: z.string().url(),
    uploadedAt: z.string().optional()
  })).optional(),
});

// GET - Get tenant's applications
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
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
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
        a.id,
        a.status,
        a.personal_info,
        a.employment_info,
        a.rental_history,
        a.references,
        a.additional_info,
        a.documents,
        a.submitted_at,
        a.updated_at,
        a.reviewed_at,
        a.reviewed_by,
        a.approved_at,
        a.rejection_reason,
        a.lease_signed_at,
        a.move_in_date,
        p.title as property_title,
        p.rent_amount as property_rent,
        p.rent_currency as property_currency,
        p.address as property_address,
        p.bedrooms as property_bedrooms,
        p.bathrooms as property_bathrooms,
        p.square_feet as property_square_feet,
        p.available_date as property_available_date,
        p.images as property_images,
        u.name as agent_name,
        u.email as agent_email,
        u.phone as agent_phone
      FROM applications a
      JOIN properties p ON a.property_id = p.id
      JOIN users u ON p.agent_id = u.id
      WHERE a.tenant_id = $1
    `;

    const params = [decoded.userId];

    if (status) {
      query += ' AND a.status = $2';
      params.push(status);
    }

    query += ' ORDER BY a.submitted_at DESC LIMIT $3 OFFSET $4';
    params.push(limit, offset);

    const applicationsResult = await pool!.query(query, params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM applications WHERE tenant_id = $1';
    const countParams = [decoded.userId];

    if (status) {
      countQuery += ' AND status = $2';
      countParams.push(status);
    }

    const countResult = await pool!.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    // Transform applications data
    const applications = applicationsResult.rows.map(app => ({
      id: app.id,
      status: app.status,
      personalInfo: app.personal_info ? JSON.parse(app.personal_info) : null,
      employmentInfo: app.employment_info ? JSON.parse(app.employment_info) : null,
      rentalHistory: app.rental_history ? JSON.parse(app.rental_history) : [],
      references: app.references ? JSON.parse(app.references) : [],
      additionalInfo: app.additional_info ? JSON.parse(app.additional_info) : null,
      documents: app.documents ? JSON.parse(app.documents) : [],
      submittedAt: app.submitted_at,
      updatedAt: app.updated_at,
      reviewedAt: app.reviewed_at,
      reviewedBy: app.reviewed_by,
      approvedAt: app.approved_at,
      rejectionReason: app.rejection_reason,
      leaseSignedAt: app.lease_signed_at,
      moveInDate: app.move_in_date,
      property: {
        id: app.property_id,
        title: app.property_title,
        rent: parseFloat(app.property_rent),
        currency: app.property_currency,
        address: app.property_address,
        bedrooms: app.property_bedrooms,
        bathrooms: app.property_bathrooms,
        squareFeet: app.property_square_feet,
        availableDate: app.property_available_date,
        images: app.property_images || []
      },
      agent: {
        name: app.agent_name,
        email: app.agent_email,
        phone: app.agent_phone
      }
    }));

    return NextResponse.json({
      applications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Applications fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

// POST - Submit rental application
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
    const validatedData = applicationSchema.parse(body);

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

    // Check if property exists and is available
    const propertyResult = await pool!.query(
      'SELECT id, title, status, agent_id FROM properties WHERE id = $1 AND is_active = true',
      [validatedData.propertyId]
    );

    if (propertyResult.rows.length === 0) {
      return NextResponse.json({ error: 'Property not found or not available' }, { status: 404 });
    }

    const property = propertyResult.rows[0];

    // Check if tenant already has a pending application for this property
    const existingResult = await pool!.query(
      'SELECT id FROM applications WHERE tenant_id = $1 AND property_id = $2 AND status IN ($3, $4)',
      [decoded.userId, validatedData.propertyId, 'pending', 'under_review']
    );

    if (existingResult.rows.length > 0) {
      return NextResponse.json({ error: 'You already have a pending application for this property' }, { status: 409 });
    }

    // Create application
    const insertQuery = `
      INSERT INTO applications (
        tenant_id, property_id, status, personal_info, employment_info,
        rental_history, references, additional_info, documents,
        submitted_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9,
        NOW(), NOW()
      )
      RETURNING id, submitted_at
    `;

    const values = [
      decoded.userId,
      validatedData.propertyId,
      'pending',
      JSON.stringify(validatedData.personalInfo),
      JSON.stringify(validatedData.employmentInfo),
      JSON.stringify(validatedData.rentalHistory || []),
      JSON.stringify(validatedData.references),
      JSON.stringify(validatedData.additionalInfo),
      JSON.stringify(validatedData.documents || [])
    ];

    const result = await pool!.query(insertQuery, values);
    const application = result.rows[0];

    // Increment property application count
    await pool!.query(
      'UPDATE properties SET application_count = application_count + 1 WHERE id = $1',
      [validatedData.propertyId]
    );

    // Create message to agent about new application
    const messageQuery = `
      INSERT INTO messages (
        sender_id, receiver_id, property_id, content, message_type,
        is_read, status, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5,
        false, 'sent', NOW(), NOW()
      )
      RETURNING id, created_at
    `;

    const messageValues = [
      decoded.userId,
      property.agent_id,
      validatedData.propertyId,
      `New rental application submitted for ${property.title}`,
      'system_notification'
    ];

    await pool!.query(messageQuery, messageValues);

    // TODO: Send email notification to agent

    return NextResponse.json({
      message: 'Application submitted successfully',
      application: {
        id: application.id,
        propertyId: validatedData.propertyId,
        status: 'pending',
        submittedAt: application.submitted_at
      }
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Application submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    );
  }
}

// PUT - Update application status (admin only)
export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !['admin', 'super_admin'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('id');

    if (!applicationId) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
    }

    const { status, rejectionReason, reviewedNotes } = await request.json();

    if (!['pending', 'under_review', 'approved', 'rejected', 'signed', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    if (status === 'rejected' && !rejectionReason) {
      return NextResponse.json({ error: 'Rejection reason is required when rejecting' }, { status: 400 });
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

    // Get application details
    const applicationResult = await pool!.query(
      'SELECT * FROM applications WHERE id = $1',
      [applicationId]
    );

    if (applicationResult.rows.length === 0) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const application = applicationResult.rows[0];

    // Update application status
    let updateQuery = `
      UPDATE applications 
      SET status = $1, updated_at = NOW()
    `;

    const updateValues = [status];

    if (status === 'under_review') {
      updateQuery += ', reviewed_at = NOW(), reviewed_by = $2';
      updateValues.push(decoded.userId);
    } else if (status === 'approved') {
      updateQuery += ', approved_at = NOW()';
    } else if (status === 'rejected') {
      updateQuery += ', rejection_reason = $2';
      updateValues.push(rejectionReason);
    }

    updateQuery += ' WHERE id = $3';
    updateValues.push(applicationId);

    await pool!.query(updateQuery, updateValues);

    // Add reviewed notes if provided
    if (reviewedNotes) {
      await pool!.query(
        'UPDATE applications SET additional_info = jsonb_set(additional_info, $1, $2) WHERE id = $3',
        ['reviewedNotes', JSON.stringify(reviewedNotes), applicationId]
      );
    }

    // Create admin log
    await pool!.query(
      'INSERT INTO admin_logs (admin_id, action, target_type, target_id, details, created_at) VALUES ($1, $2, $3, $4, $5, NOW())',
      [
        decoded.userId,
        `application_${status}`,
        'application',
        applicationId,
        JSON.stringify({
          applicationId,
          propertyId: application.property_id,
          tenantId: application.tenant_id,
          previousStatus: application.status,
          newStatus: status,
          rejectionReason: rejectionReason || null
        })
      ]
    );

    // TODO: Send email notification to tenant about status change

    return NextResponse.json({
      message: `Application ${status} successfully`,
      application: {
        id: applicationId,
        status,
        updatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Application update error:', error);
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    );
  }
}

// GET - Get application details
export async function GET_details(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('id');

    if (!applicationId) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
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

    // Get application with full details
    const query = `
      SELECT 
        a.*,
        p.title as property_title,
        p.rent_amount as property_rent,
        p.rent_currency as property_currency,
        p.address as property_address,
        p.bedrooms as property_bedrooms,
        p.bathroom as property_bathrooms,
        p.square_feet as property_square_feet,
        p.images as property_images,
        p.description as property_description,
        u.name as agent_name,
        u.email as agent_email,
        u.phone as agent_phone,
        u.avatar_url as agent_avatar
      FROM applications a
      JOIN properties p ON a.property_id = p.id
      JOIN users u ON p.agent_id = u.id
      WHERE a.id = $1
    `;

    const result = await pool!.query(query, [applicationId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const application = result.rows[0];

    // Verify user can access this application
    if (decoded.role === 'tenant' && application.tenant_id !== decoded.userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Transform data
    const transformedApplication = {
      id: application.id,
      tenantId: application.tenant_id,
      propertyId: application.property_id,
      status: application.status,
      personalInfo: application.personal_info ? JSON.parse(application.personal_info) : null,
      employmentInfo: application.employment_info ? JSON.parse(application.employment_info) : null,
      rentalHistory: application.rental_history ? JSON.parse(application.rental_history) : [],
      references: application.references ? JSON.parse(application.references) : [],
      additionalInfo: application.additional_info ? JSON.parse(application.additional_info) : null,
      documents: application.documents ? JSON.parse(application.documents) : [],
      submittedAt: application.submitted_at,
      updatedAt: application.updated_at,
      reviewedAt: application.reviewed_at,
      reviewedBy: application.reviewed_by,
      approvedAt: application.approved_at,
      rejectionReason: application.rejection_reason,
      leaseSignedAt: application.lease_signed_at,
      moveInDate: application.move_in_date,
      property: {
        title: application.property_title,
        rent: parseFloat(application.property_rent),
        currency: application.property_currency,
        address: application.property_address,
        bedrooms: application.property_bedrooms,
        bathrooms: application.property_bathrooms,
        squareFeet: application.property_square_feet,
        images: application.property_images || [],
        description: application.property_description
      },
      agent: {
        name: application.agent_name,
        email: application.agent_email,
        phone: application.agent_phone,
        avatar: application.agent_avatar
      }
    };

    return NextResponse.json(transformedApplication);

  } catch (error) {
    console.error('Application details fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application details' },
      { status: 500 }
    );
  }
}


export const runtime = 'nodejs';
