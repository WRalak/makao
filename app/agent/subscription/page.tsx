'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CreditCard,
  Check,
  X,
  Star,
  Home,
  Users,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';

interface Subscription {
  plan: 'basic' | 'pro';
  status: 'active' | 'cancelled' | 'past_due';
  currentPeriodEnd: string;
  propertyLimit: number;
  propertyCount: number;
}

export default function AgentSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setSubscription(data.user.subscription);
      }
    } catch (error) {
      console.error('Failed to fetch subscription status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async (plan: 'basic' | 'pro') => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();
      if (response.ok) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        alert(data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to process subscription');
    } finally {
      setIsProcessing(false);
    }
  };

  const plans = {
    basic: {
      name: 'Basic Plan',
      price: '$49',
      period: 'month',
      features: [
        '10 Properties',
        'Basic Analytics',
        'Email Support',
        'Property Listings',
        'Tenant Messaging',
      ],
      icon: Home,
      color: 'blue',
    },
    pro: {
      name: 'Pro Plan',
      price: '$99',
      period: 'month',
      features: [
        '50 Properties',
        'Advanced Analytics',
        'Priority Support',
        'Featured Listings',
        'Tenant Messaging',
        'Performance Insights',
        'Bulk Upload Tools',
      ],
      icon: Star,
      color: 'purple',
    },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
              <p className="text-sm text-gray-600 mt-1">
                Choose the perfect plan for your real estate business
              </p>
            </div>
            <Link
              href="/agent/dashboard"
              className="text-gray-600 hover:text-gray-900"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Current Status */}
        {subscription && subscription.status === 'active' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-green-900">
                  Active {subscription.plan.toUpperCase()} Subscription
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>
                    {subscription.propertyCount} of {subscription.propertyLimit} properties used
                  </p>
                  <p>
                    Next billing date: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {Object.entries(plans).map(([planKey, plan]) => {
            const Icon = plan.icon;
            const isActive = subscription?.plan === planKey && subscription?.status === 'active';
            
            return (
              <div
                key={planKey}
                className={`relative rounded-lg shadow-lg overflow-hidden ${
                  isActive ? 'ring-2 ring-green-500' : ''
                }`}
              >
                {isActive && (
                  <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 text-sm font-semibold">
                    ACTIVE
                  </div>
                )}
                
                <div className={`bg-gradient-to-r from-${plan.color}-500 to-${plan.color}-600 p-6 text-white`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold">{plan.name}</h3>
                      <div className="flex items-baseline mt-2">
                        <span className="text-4xl font-bold">{plan.price}</span>
                        <span className="ml-1 text-lg">/{plan.period}</span>
                      </div>
                    </div>
                    <Icon className="h-12 w-12 opacity-80" />
                  </div>
                </div>

                <div className="bg-white p-6">
                  <ul className="space-y-4">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    {isActive ? (
                      <button
                        disabled
                        className="w-full bg-gray-200 text-gray-500 py-3 px-4 rounded-md font-medium cursor-not-allowed"
                      >
                        Current Plan
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSubscribe(planKey as 'basic' | 'pro')}
                        disabled={isProcessing}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {isProcessing ? (
                          'Processing...'
                        ) : (
                          <>
                            Subscribe Now
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Features Comparison */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Why Choose Makao?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Reach More Tenants
              </h3>
              <p className="text-gray-600">
                Connect with thousands of verified tenants looking for rental properties
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Grow Your Business
              </h3>
              <p className="text-gray-600">
                Advanced analytics and insights to help you optimize your rental strategy
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CreditCard className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Secure Payments
              </h3>
              <p className="text-gray-600">
                Industry-leading security and reliable payment processing with Stripe
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I change my plan later?
              </h3>
              <p className="text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                What happens if I exceed my property limit?
              </h3>
              <p className="text-gray-600">
                You'll need to upgrade to a higher plan to add more properties. You can also delete existing properties to make room.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Is there a contract or commitment?
              </h3>
              <p className="text-gray-600">
                No, our subscriptions are month-to-month. You can cancel at any time without any penalties.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards, debit cards, and other payment methods supported by Stripe.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
