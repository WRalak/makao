'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Loader2 } from 'lucide-react';
import PropertyCard, { Property } from './PropertyCard';

interface FeaturedPropertiesProps {
  properties?: Property[];
  title?: string;
  subtitle?: string;
  onViewAllClick?: () => void;
  onPropertyClick?: (id: string) => void;
  onFavoriteClick?: (id: string) => void;
  limit?: number;
}

const FeaturedProperties: React.FC<FeaturedPropertiesProps> = ({
  properties: initialProperties,
  title = "Featured Homes Across East Africa",
  subtitle = "Handpicked premium rentals in Nairobi, Kigali, Dar es Salaam, and Mombasa.",
  onViewAllClick,
  onPropertyClick,
  onFavoriteClick,
  limit = 6
}) => {
  const [properties, setProperties] = useState<Property[]>(initialProperties || []);
  const [isLoading, setIsLoading] = useState(!initialProperties);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch if no initial properties provided
    if (!initialProperties) {
      fetchFeaturedProperties();
    }
  }, [initialProperties]);

  const fetchFeaturedProperties = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/properties?featured=true&limit=6');
      
      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }

      const data = await response.json();
      setProperties(data.properties || []);
    } catch (error) {
      console.error('Error fetching featured properties:', error);
      setError('Unable to connect to property listings. Please check your internet connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePropertyClick = (id: string) => {
    if (onPropertyClick) {
      onPropertyClick(id);
    } else {
      // Default navigation
      window.location.href = `/properties/${id}`;
    }
  };

  const handleFavoriteClick = async (id: string) => {
    try {
      const token = document.cookie.split('auth_token=')[1]?.split(';')[0];
      if (!token) {
        // Redirect to login or show login modal
        window.location.href = '/login';
        return;
      }

      const response = await fetch('/api/tenant/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ propertyId: id })
      });

      if (response.ok) {
        // Optimistically update UI
        setProperties(prev => 
          prev.map(p => 
            p.id === id 
              ? { 
                  ...p, 
                  analytics: { 
                    ...p.analytics, 
                    views: p.analytics?.views || 0,
                    messages: p.analytics?.messages || 0,
                    saves: (p.analytics?.saves || 0) + 1,
                    applications: p.analytics?.applications || 0,
                    tours: p.analytics?.tours || 0
                  } 
                }
              : p
          )
        );
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }

    if (onFavoriteClick) {
      onFavoriteClick(id);
    }
  };

  if (isLoading) {
    return (
      <section className="py-16 sm:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-slate-800 mb-2">{title}</h2>
              <p className="text-slate-500 font-body-md">{subtitle}</p>
            </div>
          </div>
          
          {/* Loading State */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl overflow-hidden border border-slate-200 animate-pulse">
                <div className="h-64 bg-slate-200"></div>
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-3 bg-slate-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 sm:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 text-center">
          <h2 className="font-headline-lg text-headline-lg text-slate-800 mb-4">{title}</h2>
          <p className="text-slate-500 mb-8">{error}</p>
          <button 
            onClick={fetchFeaturedProperties}
            className="px-6 py-3 bg-blue-900 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  if (properties.length === 0) {
    return (
      <section className="py-16 sm:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 text-center">
          <h2 className="font-headline-lg text-headline-lg text-slate-800 mb-4">{title}</h2>
          <p className="text-slate-500 mb-8">No featured properties available right now. Check back soon for new listings!</p>
          <Link 
            href="/properties"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-900 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors"
          >
            Browse All Properties
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-slate-800 mb-2">{title}</h2>
            <p className="text-slate-500 font-body-md">{subtitle}</p>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/properties"
              className="text-blue-900 font-label-bold flex items-center gap-2 hover:gap-3 transition-all"
            >
              View All Listings 
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        
        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {properties.slice(0, limit).map(property => (
            <PropertyCard 
              key={property.id} 
              property={property}
              onCardClick={handlePropertyClick}
              onFavoriteClick={handleFavoriteClick}
              showAgent={true}
            />
          ))}
        </div>

        {/* View More Button */}
        {properties.length > limit && (
          <div className="mt-12 text-center">
            <Link 
              href="/properties"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-blue-900 text-blue-900 rounded-lg font-bold hover:bg-blue-900 hover:text-white transition-all"
            >
              View All Properties ({properties.length} total)
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProperties;
