import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { verifyToken } from '@/lib/auth';
import { MpesaService } from '@/lib/mpesa';
import { z } from 'zod';

const subscriptionSchema = z.object({
  plan: z.enum(['basic', 'premium', 'enterprise']),
  paymentMethod: z.enum(['mpesa', 'stripe']),
  mpesaPhone: z.string().optional(),
  stripeToken: z.string().optional(),
});

const subscriptionPlans = {
  basic: { name: 'Basic Plan', price: 2500, limit: 5, currency: 'KES' },
  premium: { name: 'Premium Plan', price: 5000, limit: 20, currency: 'KES' },
  enterprise: { name: 'Enterprise Plan', price: 10000, limit: 100, currency: 'KES' }
};

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
    const validatedData = subscriptionSchema.parse(body);

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
    const userResult = await pool.query(
      'SELECT id, name, email FROM users WHERE id = $1 AND role = $2',
      [decoded.userId, 'agent']
    );

    const user = userResult.rows[0];
    if (!user) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    const plan = subscriptionPlans[validatedData.plan];
    const accountReference = `SUB_${user.id}_${Date.now()}`;

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
        amount: plan.price,
        accountReference,
        transactionDesc: `${plan.name} - Makao Subscription`,
        callbackUrl: `${process.env.NEXTAUTH_URL}/api/subscriptions/callback`
      };

      try {
        const mpesaResponse = await mpesaService.initiateStkPush(mpesaRequest);

        // Create pending subscription record
        const subscriptionQuery = `
          INSERT INTO payments (
            agent_id, amount, currency, payment_method, transaction_id,
            payment_date, status, description, type, subscription_status,
            created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5,
            NOW(), $6, $7, $8, $9,
            NOW(), NOW()
          )
          RETURNING id
        `;

        const subscriptionValues = [
          user.id,
          plan.price,
          plan.currency,
          'mpesa',
          mpesaResponse.CheckoutRequestID,
          'pending',
          `${plan.name} - ${plan.price} ${plan.currency}/month`,
          'subscription',
          'pending'
        ];

        const subscriptionResult = await pool.query(subscriptionQuery, subscriptionValues);
        const subscription = subscriptionResult.rows[0];

        return NextResponse.json({
          message: 'M-PESA payment initiated. Please complete payment on your phone.',
          checkoutRequestID: mpesaResponse.CheckoutRequestID,
          merchantRequestID: mpesaResponse.MerchantRequestID,
          subscriptionId: subscription.id,
          plan: plan
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
        plan: plan
      });
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Subscription payment error:', error);
    return NextResponse.json(
      { error: 'Failed to process subscription payment' },
      { status: 500 }
    );
  }
}


export const runtime = 'nodejs';
