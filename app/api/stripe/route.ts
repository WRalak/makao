import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import connectDB from '@/lib/database';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const paymentSchema = z.object({
  amount: z.number().min(100), // Minimum $1.00 in cents
  currency: z.enum(['KES', 'UGX', 'TZS', 'USD']).default('USD'),
  paymentMethodId: z.string().optional(),
  paymentIntentId: z.string().optional(),
  type: z.enum(['subscription', 'application_fee', 'security_deposit', 'rent', 'featured_listing']),
  spaceId: z.number().optional(),
  propertyId: z.number().optional(),
  description: z.string().min(1),
  metadata: z.object({
    userId: z.string(),
    userType: z.string(),
    plan: z.string().optional(),
    propertyTitle: z.string().optional(),
    spaceName: z.string().optional(),
  }).optional(),
});

// POST - Create payment intent or process payment
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

    // Extract role and userId from decoded token (handle both string and object cases)
    const userRole = typeof decoded === 'string' ? null : (decoded as any).role;
    const userId = typeof decoded === 'string' ? null : (decoded as any).userId;

    const body = await request.json();
    const validatedData = paymentSchema.parse(body);

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

    // Get user details
    const userResult = await pool!.query(
      'SELECT id, email, name, stripe_customer_id FROM users WHERE id = $1',
      [userId]
    );

    const user = userResult.rows[0];
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create or retrieve Stripe customer
    let customerId = user.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user.id.toString(),
          userType: userRole
        }
      });

      customerId = customer.id;

      // Update user with Stripe customer ID
      await pool!.query(
        'UPDATE users SET stripe_customer_id = $1 WHERE id = $2',
        [customerId, user.id]
      );
    }

    let paymentIntent;

    switch (validatedData.type) {
      case 'subscription':
        paymentIntent = await handleSubscriptionPayment(validatedData, customerId, user, pool!);
        break;

      case 'application_fee':
        paymentIntent = await handleApplicationFeePayment(validatedData, customerId, user, pool!);
        break;

      case 'security_deposit':
        paymentIntent = await handleSecurityDepositPayment(validatedData, customerId, user, pool!);
        break;

      case 'rent':
        paymentIntent = await handleRentPayment(validatedData, customerId, user, pool!);
        break;

      case 'featured_listing':
        paymentIntent = await handleFeaturedListingPayment(validatedData, customerId, user, pool!);
        break;

      default:
        return NextResponse.json({ error: 'Invalid payment type' }, { status: 400 });
    }

    // Create payment record in database
    const paymentQuery = `
      INSERT INTO payments (
        user_id, space_id, property_id, amount, currency, payment_method,
        stripe_payment_intent_id, status, description, category,
        commission_rate, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10,
        $11, NOW(), NOW()
      )
      RETURNING id
    `;

    const paymentValues = [
      user.id,
      validatedData.spaceId || null,
      validatedData.propertyId || null,
      validatedData.amount / 100, // Convert from cents to dollars
      validatedData.currency,
      'stripe',
      paymentIntent.id,
      paymentIntent.status,
      validatedData.description,
      validatedData.type,
      20.00 // Default commission rate
    ];

    const paymentResult = await pool!.query(paymentQuery, paymentValues);
    const paymentRecord = paymentResult.rows[0];

    return NextResponse.json({
      paymentIntent,
      paymentId: paymentRecord.id,
      clientSecret: paymentIntent.client_secret
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Payment processing error:', error);
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    );
  }
}

// GET - Retrieve payment intent status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentIntentId = searchParams.get('payment_intent_id');

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'Payment intent ID is required' }, { status: 400 });
    }

    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Extract role and userId from decoded token (handle both string and object cases)
    const userRole = typeof decoded === 'string' ? null : (decoded as any).role;
    const userId = typeof decoded === 'string' ? null : (decoded as any).userId;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return NextResponse.json({
      paymentIntent
    });

  } catch (error) {
    console.error('Payment retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve payment' },
      { status: 500 }
    );
  }
}

// PUT - Update payment (confirm, cancel, etc.)
export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Extract role and userId from decoded token (handle both string and object cases)
    const userRole = typeof decoded === 'string' ? null : (decoded as any).role;
    const userId = typeof decoded === 'string' ? null : (decoded as any).userId;

    const { paymentIntentId, action } = await request.json();

    if (!paymentIntentId || !action) {
      return NextResponse.json({ error: 'Payment intent ID and action are required' }, { status: 400 });
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

    let updatedPaymentIntent;

    switch (action) {
      case 'confirm':
        updatedPaymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);
        break;

      case 'cancel':
        updatedPaymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Update payment record in database
    await pool!.query(
      'UPDATE payments SET status = $1, updated_at = NOW() WHERE stripe_payment_intent_id = $2',
      [updatedPaymentIntent.status, paymentIntentId]
    );

    return NextResponse.json({
      paymentIntent: updatedPaymentIntent
    });

  } catch (error) {
    console.error('Payment update error:', error);
    return NextResponse.json(
      { error: 'Failed to update payment' },
      { status: 500 }
    );
  }
}

// Helper functions for different payment types
async function handleSubscriptionPayment(
  validatedData: any,
  customerId: string,
  user: any,
  pool: any
) {
  // Check if user has an existing space
  const spaceResult = await pool.query(
    'SELECT id, name, monthly_fee, currency FROM spaces WHERE agent_id = $1 AND subscription_status = $2',
    [user.id, 'pending']
  );

  const space = spaceResult.rows[0];
  if (!space) {
    throw new Error('No pending space found for this user');
  }

  // Create payment intent for subscription
  const paymentIntent = await stripe.paymentIntents.create({
    amount: validatedData.amount,
    currency: validatedData.currency.toLowerCase(),
    customer: customerId,
    payment_method: validatedData.paymentMethodId,
    confirm: false,
    metadata: {
      userId: user.id.toString(),
      spaceId: space.id.toString(),
      spaceName: space.name,
      type: 'subscription',
      plan: space.monthly_fee <= 49 ? 'basic' : 'pro'
    },
    description: `Subscription payment for ${space.name}`,
    automatic_payment_methods: {
      enabled: true,
      allow_redirects: 'never'
    }
  });

  return paymentIntent;
}

async function handleApplicationFeePayment(
  validatedData: any,
  customerId: string,
  user: any,
  pool: any
) {
  if (!validatedData.propertyId) {
    throw new Error('Property ID is required for application fee');
  }

  // Get property details
  const propertyResult = await pool.query(
    'SELECT title, agent_id FROM properties WHERE id = $1',
    [validatedData.propertyId]
  );

  const property = propertyResult.rows[0];
  if (!property) {
    throw new Error('Property not found');
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: validatedData.amount,
    currency: validatedData.currency.toLowerCase(),
    customer: customerId,
    payment_method: validatedData.paymentMethodId,
    confirm: false,
    metadata: {
      userId: user.id.toString(),
      propertyId: validatedData.propertyId.toString(),
      propertyTitle: property.title,
      agentId: property.agent_id.toString(),
      type: 'application_fee'
    },
    description: `Application fee for ${property.title}`,
    automatic_payment_methods: {
      enabled: true,
      allow_redirects: 'never'
    }
  });

  return paymentIntent;
}

async function handleSecurityDepositPayment(
  validatedData: any,
  customerId: string,
  user: any,
  pool: any
) {
  if (!validatedData.propertyId) {
    throw new Error('Property ID is required for security deposit');
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: validatedData.amount,
    currency: validatedData.currency.toLowerCase(),
    customer: customerId,
    payment_method: validatedData.paymentMethodId,
    confirm: false,
    metadata: {
      userId: user.id.toString(),
      propertyId: validatedData.propertyId.toString(),
      type: 'security_deposit'
    },
    description: validatedData.description,
    automatic_payment_methods: {
      enabled: true,
      allow_redirects: 'never'
    }
  });

  return paymentIntent;
}

async function handleRentPayment(
  validatedData: any,
  customerId: string,
  user: any,
  pool: any
) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: validatedData.amount,
    currency: validatedData.currency.toLowerCase(),
    customer: customerId,
    payment_method: validatedData.paymentMethodId,
    confirm: false,
    metadata: {
      userId: user.id.toString(),
      type: 'rent'
    },
    description: validatedData.description,
    automatic_payment_methods: {
      enabled: true,
      allow_redirects: 'never'
    }
  });

  return paymentIntent;
}

async function handleFeaturedListingPayment(
  validatedData: any,
  customerId: string,
  user: any,
  pool: any
) {
  if (!validatedData.propertyId) {
    throw new Error('Property ID is required for featured listing');
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: validatedData.amount,
    currency: validatedData.currency.toLowerCase(),
    customer: customerId,
    payment_method: validatedData.paymentMethodId,
    confirm: false,
    metadata: {
      userId: user.id.toString(),
      propertyId: validatedData.propertyId.toString(),
      type: 'featured_listing'
    },
    description: validatedData.description,
    automatic_payment_methods: {
      enabled: true,
      allow_redirects: 'never'
    }
  });

  return paymentIntent;
}

// Webhook handler for Stripe events
export async function POST_webhook(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  let pool;
  try {
    pool = await connectDB();
  } catch (dbError) {
    console.error('Database connection failed:', dbError);
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      // Update payment record
      await pool!.query(
        `UPDATE payments SET 
           status = 'completed', 
           processed_at = NOW(), 
           updated_at = NOW() 
         WHERE stripe_payment_intent_id = $1`,
        [paymentIntent.id]
      );

      // Handle subscription activation
      if (paymentIntent.metadata.type === 'subscription') {
        const spaceId = paymentIntent.metadata.spaceId;
        if (spaceId) {
          await pool!.query(
            `UPDATE spaces SET 
               subscription_status = 'active', 
               is_approved = true, 
               approved_at = NOW(),
               subscription_end_date = NOW() + INTERVAL '1 month',
               updated_at = NOW() 
             WHERE id = $1`,
            [spaceId]
          );
        }
      }

      break;

    case 'payment_intent.payment_failed':
      const failedPaymentIntent = event.data.object as Stripe.PaymentIntent;
      
      await pool!.query(
        `UPDATE payments SET 
           status = 'failed', 
           failed_reason = $1, 
           updated_at = NOW() 
         WHERE stripe_payment_intent_id = $2`,
        [failedPaymentIntent.last_payment_error?.message || 'Payment failed', failedPaymentIntent.id]
      );

      break;

    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      // Handle subscription events
      const subscription = event.data.object as Stripe.Subscription;
      console.log(`Subscription ${event.type}:`, subscription.id);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}


export const runtime = 'nodejs';
