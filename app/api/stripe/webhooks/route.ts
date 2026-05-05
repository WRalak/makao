import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import connectDB from '@/lib/database';
import { verifyToken } from '@/lib/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
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

      // Send notification to user
      if (paymentIntent.metadata.userId) {
        // TODO: Implement email notification
        console.log(`Payment succeeded for user ${paymentIntent.metadata.userId}`);
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

      // Send notification to user
      if (failedPaymentIntent.metadata.userId) {
        // TODO: Implement email notification
        console.log(`Payment failed for user ${failedPaymentIntent.metadata.userId}`);
      }

      break;

    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      // Handle subscription events
      const subscription = event.data.object as Stripe.Subscription;
      console.log(`Subscription ${event.type}:`, subscription.id);
      
      // Update subscription records in database
      if (event.type === 'customer.subscription.created') {
        // Create subscription record in database
        // This would require a subscriptions table
        console.log('New subscription created:', subscription.id);
      } else if (event.type === 'customer.subscription.updated') {
        // Update existing subscription
        console.log('Subscription updated:', subscription.id);
      } else if (event.type === 'customer.subscription.deleted') {
        // Cancel subscription and update space status
        if (subscription.metadata?.spaceId) {
          await pool!.query(
            `UPDATE spaces SET 
               subscription_status = 'cancelled', 
               updated_at = NOW() 
             WHERE id = $1`,
            [subscription.metadata.spaceId]
          );
        }
      }
      break;

    case 'invoice.payment_succeeded':
    case 'invoice.payment_failed':
      // Handle invoice events
      const invoice = event.data.object as Stripe.Invoice;
      console.log(`Invoice ${event.type}:`, invoice.id);
      
      // Update payment records related to invoice
      // Note: Invoice object doesn't have payment_intent property in newer Stripe versions
      // We'll handle invoice status updates differently
      console.log('Invoice status updated:', invoice.status);
      // TODO: Handle invoice payment updates based on invoice status
      // This may require fetching the associated payment intent separately
      break;

    case 'account.updated':
      // Handle customer updates
      const account = event.data.object as Stripe.Account;
      console.log('Account updated:', account.id);
      
      // Update account record in database if it has metadata
      if (account.metadata?.userId) {
        await pool!.query(
          `UPDATE users SET 
           stripe_account_id = $1, 
           updated_at = NOW() 
         WHERE id = $2`,
          [account.id, account.metadata.userId]
        );
      }
      break;
    case 'customer.updated':
      // Handle customer updates
      const customer = event.data.object as Stripe.Customer;
      console.log('Customer updated:', customer.id);
      
      // Update customer record in database
      if (customer.metadata?.userId) {
        await pool!.query(
          `UPDATE users SET 
           stripe_customer_id = $1, 
           updated_at = NOW() 
         WHERE id = $2`,
          [customer.id, customer.metadata.userId]
        );
      }
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}


export const runtime = 'nodejs';
