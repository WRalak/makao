import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { verifyToken } from '@/lib/auth';
import { MpesaService } from '@/lib/mpesa';
import { z } from 'zod';

const spaceSchema = z.object({
  name: z.string().min(2, 'Space name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  logoUrl: z.string().url().optional(),
  monthlyFee: z.number().min(49, 'Minimum monthly fee is $49'),
  currency: z.enum(['KES', 'UGX', 'TZS', 'USD']).default('KES'),
  propertyLimit: z.number().min(10, 'Minimum property limit is 10'),
  paymentMethod: z.enum(['mpesa', 'stripe']),
  mpesaPhone: z.string().optional(),
  stripeToken: z.string().optional(),
  
  // Business details
  areasCovered: z.array(z.string()).default([]),
  propertyTypes: z.array(z.string()).default([]),
  yearsInBusiness: z.number().min(0).default(0),
  staffCount: z.number().min(1).default(1),
  
  // Documents
  documents: z.array(z.object({
    type: z.string(),
    url: z.string().url(),
    filename: z.string()
  })).default([]),
  
  // Agent details
  companyName: z.string().optional(),
  registrationNumber: z.string().optional(),
  licenseNumber: z.string().optional(),
  website: z.string().url().optional(),
  phone: z.string().optional(),
  
  // Trial selection
  freeTrial: z.boolean().default(false),
});

const subscriptionPlans = {
  basic: { 
    name: 'Basic Plan', 
    fee: 49, 
    limit: 10, 
    currency: 'USD',
    description: 'Perfect for individual agents starting out',
    features: ['Up to 10 properties', 'Basic analytics', 'Standard support', 'Property listings']
  },
  pro: { 
    name: 'Pro Plan', 
    fee: 99, 
    limit: 50, 
    currency: 'USD',
    description: 'Ideal for growing agencies with multiple properties',
    features: ['Up to 50 properties', 'Advanced analytics', 'Priority support', 'Featured listings', 'Virtual tour tools', 'Custom branding']
  }
};

// POST - Create new space with payment
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'agent') {
      return NextResponse.json({ error: 'Agent access required' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = spaceSchema.parse(body);

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

    // Check if user exists and is an agent
    const userResult = await pool!.query(
      'SELECT id, name, email FROM users WHERE id = $1 AND role = $2',
      [decoded.userId, 'agent']
    );

    const user = userResult.rows[0];
    if (!user) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Check if user already has a pending or active space
    const existingSpaceResult = await pool!.query(
      'SELECT id, subscription_status, is_approved FROM spaces WHERE agent_id = $1 AND subscription_status IN ($2, $3)',
      [user.id, 'pending', 'active']
    );

    if (existingSpaceResult.rows.length > 0) {
      const existingSpace = existingSpaceResult.rows[0];
      if (existingSpace.subscription_status === 'pending' && !existingSpace.is_approved) {
        return NextResponse.json(
          { error: 'You already have a space pending approval' },
          { status: 400 }
        );
      } else if (existingSpace.subscription_status === 'active') {
        return NextResponse.json(
          { error: 'Agent already has an active subscription' },
          { status: 400 }
        );
      }
    }

    const accountReference = `SPACE_${user.id}_${Date.now()}`;

    if (validatedData.paymentMethod === 'mpesa') {
      // Process M-PESA payment
      const mpesaService = new MpesaService();
      
      if (!validatedData.mpesaPhone) {
        return NextResponse.json(
          { error: 'M-PESA phone number is required' },
          { status: 400 }
        );
      }

      const mpesaRequest = {
        phoneNumber: mpesaService.formatPhoneNumber(validatedData.mpesaPhone),
        amount: validatedData.monthlyFee,
        accountReference,
        transactionDesc: `${validatedData.name} - Makao Space Subscription`,
        callbackUrl: `${process.env.NEXTAUTH_URL}/api/payments/mpesa/callback`
      };

      try {
        const mpesaResponse = await mpesaService.initiateStkPush(mpesaRequest);
        
        // Create pending space record with enhanced fields
        const spaceQuery = `
          INSERT INTO spaces (
            name, description, logo_url, agent_id, monthly_fee, currency, property_limit,
            subscription_status, is_approved, areas_covered, property_types, years_in_business,
            staff_count, documents, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7,
            $8, false, $9, $10, $11,
            $12, $13, NOW(), NOW()
          )
          RETURNING id
        `;

        const spaceValues = [
          validatedData.name,
          validatedData.description,
          validatedData.logoUrl,
          user.id,
          validatedData.monthlyFee,
          validatedData.currency,
          validatedData.propertyLimit,
          validatedData.freeTrial ? 'pending' : 'pending', // Free trial goes to pending approval
          JSON.stringify(validatedData.areasCovered),
          JSON.stringify(validatedData.propertyTypes),
          validatedData.yearsInBusiness,
          validatedData.staffCount,
          JSON.stringify(validatedData.documents)
        ];

        const spaceResult = await pool!.query(spaceQuery, spaceValues);
        const space = spaceResult.rows[0];

        // Create payment record with enhanced fields
        const paymentQuery = `
          INSERT INTO payments (
            user_id, space_id, amount, currency, payment_method, 
            mpesa_receipt_number, mpesa_phone, status, description, category,
            commission_rate, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5,
            $6, $7, $8, $9, $10,
            $11, NOW(), NOW()
          )
          RETURNING id
        `;

        const paymentValues = [
          user.id,
          space.id,
          validatedData.monthlyFee,
          validatedData.currency,
          'mpesa',
          mpesaResponse.CheckoutRequestID,
          validatedData.mpesaPhone,
          'pending',
          `${validatedData.name} - Space Subscription`,
          'subscription',
          20.00 // Default commission rate
        ];

        await pool!.query(paymentQuery, paymentValues);

        return NextResponse.json({
          message: 'M-PESA payment initiated. Please complete payment on your phone.',
          checkoutRequestID: mpesaResponse.CheckoutRequestID,
          merchantRequestID: mpesaResponse.MerchantRequestID,
          spaceId: space.id
        });

      } catch (mpesaError) {
        console.error('M-PESA payment error:', mpesaError);
        return NextResponse.json(
          { error: 'Failed to initiate M-PESA payment' },
          { status: 500 }
        );
      }

    } else if (validatedData.paymentMethod === 'stripe') {
      // Process Stripe payment (simplified for now)
      return NextResponse.json({
        message: 'Stripe payment integration coming soon',
        plan: validatedData
      });
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Space creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create space' },
      { status: 500 }
    );
  }
}

// GET - Get user's spaces
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'agent') {
      return NextResponse.json({ error: 'Agent access required' }, { status: 403 });
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

    const spacesResult = await pool!.query(
      `SELECT s.*, 
              COUNT(p.id) as active_properties,
              COALESCE(SUM(p.view_count), 0) as total_views,
              COALESCE(SUM(p.message_count), 0) as total_messages
       FROM spaces s
       LEFT JOIN properties p ON s.id = p.space_id AND p.status = 'available'
       WHERE s.agent_id = $1 
       GROUP BY s.id
       ORDER BY s.created_at DESC`,
      [decoded.userId]
    );

    return NextResponse.json({
      spaces: spacesResult.rows,
      plans: subscriptionPlans,
      stats: {
        totalSpaces: spacesResult.rows.length,
        activeSpaces: spacesResult.rows.filter(s => s.subscription_status === 'active').length,
        pendingSpaces: spacesResult.rows.filter(s => s.subscription_status === 'pending' && !s.is_approved).length
      }
    });

  } catch (error) {
    console.error('Get spaces error:', error);
    return NextResponse.json(
      { error: 'Failed to get spaces' },
      { status: 500 }
    );
  }
}


export const runtime = 'nodejs';
