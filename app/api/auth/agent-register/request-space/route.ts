import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const spaceRequestSchema = z.object({
  // Basic Information
  spaceName: z.string().min(2, 'Space name is required'),
  description: z.string().min(10, 'Description is required'),
  spaceLogo: z.string().url().optional(),
  
  // Plan Selection
  plan: z.enum(['basic', 'pro', 'enterprise']),
  
  // Additional Information
  areasCovered: z.array(z.string()).default([]),
  propertyTypes: z.array(z.enum(['apartments', 'houses', 'commercial', 'land'])).default([]),
  yearsInBusiness: z.number().min(0),
  activeProperties: z.number().min(0),
  staffCount: z.number().min(0),
  
  // Documents
  documents: z.array(z.object({
    type: z.enum(['business_registration', 'tax_compliance', 'professional_license', 'bank_statement', 'sample_contract', 'id_passport', 'profile_photo', 'space_logo']),
    url: z.string().url(),
    filename: z.string(),
    uploadedAt: z.string().default(new Date().toISOString())
  })).min(5, 'All required documents must be uploaded')
});

// STEP 4: Submit Space Request for Admin Approval
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!userRole || userRole !== 'agent') {
      return NextResponse.json({ error: 'Agent access required' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = spaceRequestSchema.parse(body);

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

    // Verify agent is fully verified
    const agentResult = await pool.query(
      'SELECT id FROM users WHERE id = $1 AND email_verified = true AND phone_verified = true',
      [decoded.userId]
    );

    if (agentResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Please complete email and phone verification first' },
        { status: 400 }
      );
    }

    // Get plan details
    const planDetails = {
      basic: { name: 'Basic', fee: 1500, limit: 10 },
      pro: { name: 'Pro', fee: 3500, limit: 50 },
      enterprise: { name: 'Enterprise', fee: 10000, limit: 999 }
    };

    const plan = planDetails[validatedData.plan];

    // Create space request (pending admin approval)
    const insertQuery = `
      INSERT INTO spaces (
        name, description, agent_id, monthly_fee, currency, property_limit,
        subscription_status, is_approved, areas_covered, property_types,
        years_in_business, active_properties, staff_count, documents,
        space_logo, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        'pending', false, $7, $8, $9,
        $10, $11, $12,
        $13, NOW(), NOW()
      )
      RETURNING id
    `;

    const values = [
      validatedData.spaceName,
      validatedData.description,
      decoded.userId,
      plan.fee,
      'KES',
      plan.limit,
      JSON.stringify(validatedData.areasCovered),
      JSON.stringify(validatedData.propertyTypes),
      validatedData.yearsInBusiness,
      validatedData.activeProperties,
      validatedData.staffCount,
      JSON.stringify(validatedData.documents),
      validatedData.spaceLogo || null
    ];

    const result = await pool.query(insertQuery, values);
    const space = result.rows[0];

    // Create admin log
    await pool.query(
      'INSERT INTO admin_logs (admin_id, action, target_id, target_type, details, created_at) VALUES ($1, $2, $3, $4, $5, NOW())',
      [1, 'space_request_submitted', space.id, 'space', JSON.stringify({
        agentId: decoded.userId,
        plan: validatedData.plan,
        spaceName: validatedData.spaceName,
        documentsCount: validatedData.documents.length
      })]
    );

    return NextResponse.json({
      message: 'Space request submitted for admin approval',
      spaceId: space.id,
      plan: plan,
      status: 'pending'
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Space request error:', error);
    return NextResponse.json(
      { error: 'Failed to submit space request' },
      { status: 500 }
    );
  }
}


export const runtime = 'nodejs';
