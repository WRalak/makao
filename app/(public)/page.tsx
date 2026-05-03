'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, MapPin, Home, Users, Star, ChevronLeft, ChevronRight, Check, ArrowRight, MessageSquare, Calendar } from 'lucide-react';

export default function HomePage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [currentFeature, setCurrentFeature] = useState(0);
  const [email, setEmail] = useState('');

  const testimonials = [
    {
      name: "Amina Mohamed",
      role: "Tenant, Nairobi",
      content: "Found my perfect apartment in Westlands in just 3 days! The platform is so intuitive and the agents are very responsive.",
      rating: 5
    },
    {
      name: "Joseph Nkoy",
      role: "Property Agent, Dar es Salaam",
      content: "As an agent, Makao has helped me reach more qualified renters. The platform is professional and the support team is amazing.",
      rating: 5
    },
    {
      name: "Grace Babu",
      role: "Tenant, Kampala",
      content: "I love how user-friendly the platform is. The virtual tours saved me so much time and I found my dream home in Kololo without endless visits.",
      rating: 5
    }
  ];

  const features = [
    { icon: Search, title: "Search", description: "Browse thousands of verified rental properties" },
    { icon: MessageSquare, title: "Message", description: "Connect directly with property owners" },
    { icon: Calendar, title: "Tour", description: "Schedule in-person or virtual tours" }
  ];

  const stats = [
    { number: "15,000+", label: "Makao Listed" },
    { number: "8,000+", label: "Happy Tenants" },
    { number: "1,200+", label: "Verified Agents" },
    { number: "25+", label: "East African Cities" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="text-center">
            <div className="animate-fade-in">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-gray-900 mb-4 sm:mb-6">
                Find Your Perfect
                <span className="text-blue-600"> Makao</span>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto">
                Discover amazing rental properties across East Africa. From Nairobi apartments to Dar es Salaam homes, Kampala flats to Kigali houses - find your perfect space today.
              </p>
            </div>
            
            {/* Animated Search Bar */}
            <div className="max-w-2xl mx-auto animate-slide-up px-4">
              <div className="bg-white rounded-xl shadow-2xl p-2 flex flex-col sm:flex-row gap-2">
                <div className="flex items-center flex-1">
                  <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 ml-2 sm:ml-3" />
                  <input
                    type="text"
                    placeholder="Search Nairobi, Dar es Salaam, Kampala, Kigali..."
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-3 outline-none text-sm sm:text-lg"
                  />
                </div>
                <Link href="/properties" className="bg-blue-600 text-white px-4 sm:px-6 lg:px-8 py-2 sm:py-3 rounded-md hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base text-center">
                  Search
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Background Elements */}
        <div className="relative">
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute top-20 right-0 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-0 left-1/2 w-80 h-80 bg-indigo-200 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container-responsive py-8 sm:py-12 lg:py-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Trusted by Thousands</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Join our growing community of property seekers and agents</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center transform hover:scale-105 transition-all duration-300 animate-fade-in" style={{ animationDelay: `${index * 0.2}s` }}>
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">{stat.number}</div>
              <div className="text-xs sm:text-sm md:text-base text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="container-responsive py-8 sm:py-12 lg:py-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How Makao Works</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Find your perfect rental property in just three simple steps</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center transform hover:scale-105 transition-all duration-300 animate-fade-in" style={{ animationDelay: `${index * 0.3}s` }}>
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-4 w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <Icon className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Featured Properties */}
      <div className="container-responsive py-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Properties</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Discover our handpicked selection of premium rental properties</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              id: "nairobi-westlands-apartment",
              title: "Modern Westlands Apartment",
              location: "Westlands, Nairobi",
              price: "KES 85,000/month",
              beds: 2,
              baths: 2,
              sqft: 1200,
              image: "🏙️"
            },
            {
              id: "dar-upanga-house",
              title: "Spacious Upanga House",
              location: "Upanga, Dar es Salaam",
              price: "TZS 2,500,000/month",
              beds: 3,
              baths: 2,
              sqft: 1800,
              image: "🏡"
            },
            {
              id: "kampala-kololo-studio",
              title: "Trendy Kololo Studio",
              location: "Kololo, Kampala",
              price: "UGX 1,800,000/month",
              beds: 1,
              baths: 1,
              sqft: 650,
              image: "🏢"
            }
          ].map((property, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300 animate-fade-in" style={{ animationDelay: `${index * 0.2}s` }}>
              <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-6xl">
                {property.image}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{property.title}</h3>
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{property.location}</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-blue-600">{property.price}</span>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>{property.beds} beds</span>
                    <span>{property.baths} baths</span>
                  </div>
                </div>
                <Link href={`/properties/${property.id}`} className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Our East African Users Say</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Real stories from real people who found their perfect makao through our platform</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Fatuma Ali",
                role: "Tenant, Nairobi",
                content: "Makao made finding my first apartment so easy! The search filters were perfect and I found exactly what I was looking for in just a few days.",
                rating: 5,
                avatar: "👩‍💼"
              },
              {
                name: "David Mwangi",
                role: "Property Agent, Dar es Salaam",
                content: "As an agent, Makao has helped me reach more qualified renters. The platform is professional and the support team is amazing.",
                rating: 5,
                avatar: "👨‍💼"
              },
              {
                name: "Grace Nakato",
                role: "Tenant, Kampala",
                content: "I love how user-friendly the platform is. The virtual tours saved me so much time and I found my dream home without endless in-person visits.",
                rating: 5,
                avatar: "👩‍💻"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="text-3xl mr-3">{testimonial.avatar}</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 italic">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Find Your Perfect Makao?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied East Africans who found their dream rental through Makao. 
            Start your journey today - it's completely free!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors transform hover:scale-105">
              Get Started Free
            </Link>
            <Link href="/properties" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors transform hover:scale-105">
              Browse Properties
            </Link>
          </div>
          <div className="mt-8 flex justify-center space-x-8 text-blue-100">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Cancel Anytime</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        
        .animate-slide-up {
          animation: slide-up 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
