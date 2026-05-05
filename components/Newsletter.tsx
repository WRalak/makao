'use client';

import { useState } from 'react';
import { Mail, CheckCircle, Loader2 } from 'lucide-react';

interface NewsletterProps {
  onSubscribe?: (email: string) => void;
}

const Newsletter: React.FC<NewsletterProps> = ({ onSubscribe }) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      // Call the subscription API
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setEmail('');
        
        // Call the parent callback if provided
        if (onSubscribe) {
          onSubscribe(email.trim());
        }

        // Reset success message after 5 seconds
        setTimeout(() => setIsSubmitted(false), 5000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to subscribe. Please try again.');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  if (isSubmitted) {
    return (
      <section className="py-16 sm:py-24 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="font-headline-lg text-headline-lg mb-4">
            Welcome to the Makao Community!
          </h2>
          <p className="font-body-md text-green-100 mb-8 max-w-2xl mx-auto">
            Thank you for subscribing! Check your inbox for a confirmation email and get ready to receive the latest property listings and market insights.
          </p>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-md mx-auto">
            <h3 className="font-semibold mb-4">What's Next?</h3>
            <ul className="text-left space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Confirm your email address</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Receive weekly property updates</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Get exclusive market insights</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Early access to new listings</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-r from-blue-900 to-blue-800 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center">
        <div className="mb-8">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8" />
          </div>
        </div>
        
        <h2 className="font-headline-lg text-headline-lg mb-4">
          Stay Ahead of the East African Property Market
        </h2>
        <p className="font-body-md text-blue-100 mb-8 max-w-2xl mx-auto">
          Join our newsletter to receive the latest property listings, market trends, and exclusive offers across Nairobi, Kigali, Dar es Salaam, and beyond.
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto mb-6">
          <div className="flex-1 relative">
            <input 
              className="w-full px-6 py-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all" 
              placeholder="Your email address" 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
            {email && !isValidEmail(email) && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <span className="text-red-400 text-sm">Invalid email</span>
              </div>
            )}
          </div>
          
          <button 
            type="submit"
            disabled={isLoading || !isValidEmail(email)}
            className="px-8 py-4 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[120px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Subscribing...
              </>
            ) : (
              'Subscribe'
            )}
          </button>
        </form>
        
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-100 text-sm">
            {error}
          </div>
        )}
        
        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold">🏠</span>
            </div>
            <h4 className="font-semibold mb-2">Latest Listings</h4>
            <p className="text-sm text-blue-100">
              Be the first to know about new properties in your preferred areas
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold">📊</span>
            </div>
            <h4 className="font-semibold mb-2">Market Insights</h4>
            <p className="text-sm text-blue-100">
              Get expert analysis on rental trends and pricing across East Africa
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold">🎯</span>
            </div>
            <h4 className="font-semibold mb-2">Exclusive Offers</h4>
            <p className="text-sm text-blue-100">
              Receive special deals and early access to premium properties
            </p>
          </div>
        </div>
        
        {/* Trust Badge */}
        <div className="flex items-center justify-center gap-6 text-blue-200 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>No spam, unsubscribe anytime</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>100% privacy protected</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
