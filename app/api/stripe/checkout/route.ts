import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { createCheckoutSession, createCustomer } from '@/lib/stripe';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const checkoutSchema = z.object({
  plan: z.enum(['basic', 'pro']),
});

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
    const { plan } = checkoutSchema.parse(body);

    const pool = await connectDB();

    // Query user from PostgreSQL database
    const userResult = await pool.query(
      'SELECT id, name, email, stripe_customer_id FROM users WHERE id = $1',
      [decoded.userId]
    );
    
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const user = userResult.rows[0];

    // Create Stripe customer if doesn't exist
    let stripeCustomerId = user.stripe_customer_id;
    if (!stripeCustomerId) {
      const customer = await createCustomer(user.email, user.name);
      stripeCustomerId = customer.id;
      
      // Update user with Stripe customer ID
      await pool.query(
        'UPDATE users SET stripe_customer_id = $1, updated_at = NOW() WHERE id = $2',
        [stripeCustomerId, decoded.userId]
      );
    }

    const session = await createCheckoutSession(stripeCustomerId, plan, user.id.toString());

    return NextResponse.json({ sessionId: session.id, url: session.url });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}


export const runtime = 'nodejs';
