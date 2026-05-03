import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import stripe from '@/lib/stripe';
import connectDB from '@/lib/mongoose';
import User from '@/models/User';
import Payment from '@/models/Payment';
import { SUBSCRIPTION_PLANS, COMMISSION_RATE } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get('stripe-signature')!;

  let event: any;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  await connectDB();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const agentId = session.metadata.agentId;
        const plan = session.metadata.plan as 'basic' | 'pro';
        
        const user = await User.findById(agentId);
        if (!user) break;

        // Update user subscription
        const planDetails = SUBSCRIPTION_PLANS[plan];
        user.subscription = {
          plan,
          status: 'active',
          currentPeriodEnd: new Date(session.expires_at * 1000),
          propertyLimit: planDetails.propertyLimit,
          propertyCount: user.subscription?.propertyCount || 0,
        };
        await user.save();

        // Create payment record
        const payment = new Payment({
          agentId: user._id,
          stripePaymentIntentId: session.payment_intent as string,
          amount: session.amount_total / 100,
          currency: session.currency,
          status: 'succeeded',
          subscriptionId: session.subscription as string,
          plan,
          commissionAmount: (session.amount_total / 100) * COMMISSION_RATE,
          commissionRate: COMMISSION_RATE,
        });
        await payment.save();

        console.log(`Subscription activated for agent ${agentId}`);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
        const agentId = subscription.metadata.agentId;
        
        const user = await User.findById(agentId);
        if (!user) break;

        // Update subscription period
        user.subscription!.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
        user.subscription!.status = 'active';
        await user.save();

        // Create payment record for renewal
        const payment = new Payment({
          agentId: user._id,
          stripePaymentIntentId: invoice.payment_intent as string,
          amount: invoice.total / 100,
          currency: invoice.currency,
          status: 'succeeded',
          subscriptionId: invoice.subscription as string,
          plan: user.subscription!.plan,
          commissionAmount: (invoice.total / 100) * COMMISSION_RATE,
          commissionRate: COMMISSION_RATE,
        });
        await payment.save();

        console.log(`Subscription renewed for agent ${agentId}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
        const agentId = subscription.metadata.agentId;
        
        const user = await User.findById(agentId);
        if (!user) break;

        user.subscription!.status = 'past_due';
        await user.save();

        console.log(`Subscription payment failed for agent ${agentId}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const agentId = subscription.metadata.agentId;
        
        const user = await User.findById(agentId);
        if (!user) break;

        user.subscription!.status = 'cancelled';
        await user.save();

        console.log(`Subscription cancelled for agent ${agentId}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
