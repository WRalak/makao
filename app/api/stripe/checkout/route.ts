import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import User from '@/models/User';
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

    await connectDB();

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create Stripe customer if doesn't exist
    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await createCustomer(user.email, user.name);
      stripeCustomerId = customer.id;
      user.stripeCustomerId = stripeCustomerId;
      await user.save();
    }

    const session = await createCheckoutSession(stripeCustomerId, plan, user._id.toString());

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
