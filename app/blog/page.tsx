'use client';

import { useState } from 'react';

export default function BlogPage() {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [subscribeMessage, setSubscribeMessage] = useState('');

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribing(true);
    setSubscribeStatus('idle');
    setSubscribeMessage('');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          source: 'blog'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubscribeStatus('success');
        setSubscribeMessage(data.message);
        setEmail('');
      } else {
        setSubscribeStatus('error');
        setSubscribeMessage(data.error || 'Failed to subscribe. Please try again.');
      }
    } catch (error) {
      setSubscribeStatus('error');
      setSubscribeMessage('Network error. Please try again.');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container-responsive text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Makao Blog</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            Insights and tips for East Africa's rental market
          </p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-20">
        <div className="container-responsive max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Latest Articles</h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Stay updated with the latest trends, tips, and insights from the East African rental market
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Blog Post 1 */}
            <article className="bg-white rounded-xl overflow-hidden shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
              <div className="aspect-video bg-gradient-to-br from-blue-400 to-blue-600"></div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-semibold">Featured</span>
                  <span className="text-xs text-slate-500">5 min read</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">How to Find the Perfect Rental in Nairobi</h3>
                <p className="text-slate-600 mb-4 leading-relaxed">
                  Discover expert tips for navigating Nairobi's competitive rental market and finding your ideal home in prime locations like Westlands, Kileleshwa, and Karen.
                </p>
                <div className="flex items-center text-blue-600 font-medium">
                  Read More
                  <span className="material-symbols-outlined">arrow_forward</span>
                </div>
              </div>
            </article>
              
              {/* Blog Post 2 */}
              <article className="bg-white rounded-xl overflow-hidden shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
                <div className="aspect-video bg-gradient-to-br from-green-400 to-green-600"></div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-semibold">Guide</span>
                    <span className="text-xs text-slate-500">8 min read</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">Tenant Rights in Kenya: What You Need to Know</h3>
                  <p className="text-slate-600 mb-4 leading-relaxed">
                  Understanding your legal rights as a tenant in Kenya is crucial. Learn about lease agreements, security deposits, and dispute resolution to protect yourself.
                </p>
                  <div className="flex items-center text-blue-600 font-medium">
                    Read More
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </div>
                </div>
            </article>
              
              {/* Blog Post 3 */}
              <article className="bg-white rounded-xl overflow-hidden shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
                <div className="aspect-video bg-gradient-to-br from-purple-400 to-purple-600"></div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-semibold">Tips</span>
                    <span className="text-xs text-slate-500">6 min read</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">5 Red Flags to Watch When Renting in East Africa</h3>
                  <p className="text-slate-600 mb-4 leading-relaxed">
                  Learn to identify common rental scams and warning signs when searching for properties in Kenya, Rwanda, and Tanzania. Stay safe and find legitimate listings.
                  </p>
                  <div className="flex items-center text-blue-600 font-medium">
                    Read More
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </div>
                </div>
            </article>
              
              {/* Blog Post 4 */}
              <article className="bg-white rounded-xl overflow-hidden shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
                <div className="aspect-video bg-gradient-to-br from-orange-400 to-orange-600"></div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-semibold">Market</span>
                    <span className="text-xs text-slate-500">10 min read</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">Kigali Rental Market Report 2025</h3>
                  <p className="text-slate-600 mb-4 leading-relaxed">
                    An in-depth analysis of Kigali's growing rental market, including price trends, popular neighborhoods, and investment opportunities for landlords and tenants.
                  </p>
                  <div className="flex items-center text-blue-600 font-medium">
                    Read More
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </div>
                </div>
            </article>
              
              {/* Blog Post 5 */}
              <article className="bg-white rounded-xl overflow-hidden shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
                <div className="aspect-video bg-gradient-to-br from-red-400 to-red-600"></div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-semibold">News</span>
                    <span className="text-xs text-slate-500">3 min read</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">Makao Launches in Dar es Salaam</h3>
                  <p className="text-slate-600 mb-4 leading-relaxed">
                    Exciting news! Makao is now available in Dar es Salaam, bringing our trusted rental platform to Tanzania's largest city with verified properties and local expertise.
                  </p>
                  <div className="flex items-center text-blue-600 font-medium">
                    Read More
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </div>
                </div>
            </article>
              
              {/* Blog Post 6 */}
              <article className="bg-white rounded-xl overflow-hidden shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
                <div className="aspect-video bg-gradient-to-br from-teal-400 to-teal-600"></div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full font-semibold">Technology</span>
                    <span className="text-xs text-slate-500">12 min read</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">How Makao Uses AI to Match Tenants with Properties</h3>
                  <p className="text-slate-600 mb-4 leading-relaxed">
                    Discover the innovative technology behind Makao's smart matching algorithm that helps tenants find their perfect home based on preferences, budget, and lifestyle needs.
                  </p>
                  <div className="flex items-center text-blue-600 font-medium">
                    Read More
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </div>
                </div>
            </article>
          </div>
          
          {/* Newsletter Signup */}
          <div className="bg-blue-50 rounded-xl p-8 mt-16 text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Stay Updated</h2>
            <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
              Get the latest rental insights, market trends, and exclusive tips delivered to your inbox
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 max-w-md"
                required
              />
              <button 
                type="submit"
                disabled={isSubscribing}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubscribing ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
            
            {/* Subscription Status Messages */}
            {subscribeStatus === 'success' && (
              <div className="mt-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                {subscribeMessage}
              </div>
            )}
            
            {subscribeStatus === 'error' && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                {subscribeMessage}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
