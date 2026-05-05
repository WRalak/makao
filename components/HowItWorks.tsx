'use client';

import { useState } from 'react';
import { Search, MessageCircle, Calendar, ArrowRight, CheckCircle } from 'lucide-react';

interface Step {
  icon: React.ElementType;
  title: string;
  description: string;
  features: string[];
}

const HowItWorks: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const steps: Step[] = [
    {
      icon: Search,
      title: "1. Search Properties",
      description: "Browse our massive database of verified rentals across East Africa with advanced filters to find your perfect match.",
      features: [
        "Advanced filtering by location, price, amenities",
        "Real-time availability updates",
        "Virtual tours and high-quality photos",
        "Neighborhood insights and ratings"
      ]
    },
    {
      icon: MessageCircle,
      title: "2. Message Agents",
      description: "Connect directly with certified property managers and real estate agents through our secure platform.",
      features: [
        "In-app messaging with agents",
        "Instant notifications for responses",
        "Share documents securely",
        "Schedule viewings easily"
      ]
    },
    {
      icon: Calendar,
      title: "3. Schedule Your Tour",
      description: "Book in-person or virtual tours at your convenience and finalize your lease digitally with ease.",
      features: [
        "Flexible scheduling options",
        "Virtual tour availability",
        "Digital lease signing",
        "Secure online payments"
      ]
    }
  ];

  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-headline-lg text-headline-lg text-slate-800 mb-4">
            Simple Steps to Your New Home
          </h2>
          <p className="text-slate-500 font-body-md mb-8 max-w-2xl mx-auto">
            We've made the process of finding and renting your dream home straightforward and hassle-free.
          </p>
          
          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium">
              <CheckCircle className="w-4 h-4" />
              <span>No Hidden Fees</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
              <CheckCircle className="w-4 h-4" />
              <span>Verified Listings</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
              <CheckCircle className="w-4 h-4" />
              <span>Secure Payments</span>
            </div>
          </div>
        </div>
        
        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 relative">
          {/* Connector Line (hidden on mobile) */}
          <div className="hidden md:block absolute top-1/3 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200 -translate-y-1/2"></div>
          
          {steps.map((step, index) => (
            <div 
              key={index} 
              className={`flex flex-col items-center relative z-10 cursor-pointer transition-all ${
                activeStep === index ? 'scale-105' : ''
              }`}
              onClick={() => setActiveStep(activeStep === index ? null : index)}
            >
              {/* Step Number and Icon */}
              <div className="relative mb-6">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                  activeStep === index 
                    ? 'bg-blue-900 text-white shadow-lg' 
                    : 'bg-blue-50 text-blue-900 shadow-md'
                }`}>
                  <step.icon className="w-8 h-8" />
                </div>
                
                {/* Step Number Badge */}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-900 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
              </div>
              
              {/* Step Content */}
              <div className="text-center">
                <h3 className="font-headline-md text-slate-800 mb-4">{step.title}</h3>
                <p className="text-slate-500 font-body-md max-w-xs mb-6">
                  {step.description}
                </p>
                
                {/* Expandable Features */}
                <div className={`overflow-hidden transition-all duration-300 ${
                  activeStep === index ? 'max-h-64' : 'max-h-0'
                }`}>
                  <div className="pt-4 border-t border-slate-100">
                    <ul className="space-y-2 text-left">
                      {step.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-2 text-sm text-slate-600">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {/* Click Hint */}
                <div className="mt-4 text-xs text-blue-600 font-medium flex items-center gap-1 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Click to {activeStep === index ? 'collapse' : 'expand'}</span>
                  <ArrowRight className={`w-3 h-3 transition-transform ${
                    activeStep === index ? 'rotate-90' : ''
                  }`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="font-headline-md text-slate-800 mb-4">
              Ready to Find Your Perfect Home?
            </h3>
            <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
              Join thousands of happy tenants who found their dream rental through Makao. 
              Start your journey today with no commitment.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-blue-900 text-white rounded-lg font-bold hover:bg-blue-800 transition-colors">
                Start Searching
              </button>
              <button className="px-8 py-3 bg-white text-blue-900 rounded-lg font-bold border-2 border-blue-900 hover:bg-blue-50 transition-colors">
                List Your Property
              </button>
            </div>
            
            {/* Success Metrics */}
            <div className="mt-8 pt-8 border-t border-slate-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-900">95%</p>
                  <p className="text-xs text-slate-500">Success Rate</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-900">48hrs</p>
                  <p className="text-xs text-slate-500">Avg. Response Time</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-900">100%</p>
                  <p className="text-xs text-slate-500">Verified Listings</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-900">24/7</p>
                  <p className="text-xs text-slate-500">Support Available</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
