import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const SUBSCRIPTION_PLANS = {
  basic: {
    name: 'Basic Plan',
    price: 4900, // $49 in cents
    currency: 'usd',
    interval: 'month' as const,
    propertyLimit: 10,
    features: ['10 Properties', 'Basic Analytics', 'Email Support'],
  },
  pro: {
    name: 'Pro Plan',
    price: 9900, // $99 in cents
    currency: 'usd',
    interval: 'month' as const,
    propertyLimit: 50,
    features: ['50 Properties', 'Advanced Analytics', 'Priority Support', 'Featured Listings'],
  },
};

export const COMMISSION_RATE = 0.2; // 20%

export async function createCheckoutSession(
  customerId: string,
  plan: 'basic' | 'pro',
  agentId: string
) {
  const planDetails = SUBSCRIPTION_PLANS[plan];
  
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: planDetails.currency,
          product_data: {
            name: planDetails.name,
            description: planDetails.features.join(', '),
            metadata: {
              agentId,
              plan,
            },
          },
          unit_amount: planDetails.price,
          recurring: {
            interval: planDetails.interval,
          },
        },
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXTAUTH_URL}/agent/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXTAUTH_URL}/agent/subscription/cancel`,
    metadata: {
      agentId,
      plan,
    },
  });

  return session;
}

export async function createCustomer(email: string, name: string) {
  return await stripe.customers.create({
    email,
    name,
  });
}

export async function retrieveCheckoutSession(sessionId: string) {
  return await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['customer', 'subscription'],
  });
}

export async function cancelSubscription(subscriptionId: string) {
  return await stripe.subscriptions.cancel(subscriptionId);
}

export default stripe;
