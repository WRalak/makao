'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import HeroSection, { SearchParams } from '@/components/HeroSection';
import MetricsSection from '@/components/MetricsSection';
import FeaturedProperties from '@/components/FeaturedProperties';
import HowItWorks from '@/components/HowItWorks';
import Newsletter from '@/components/Newsletter';
import { Property } from '@/components/PropertyCard';

// Property interface matching API response
interface ApiProperty {
  id: string;
  title: string;
  description: string;
  street: string;
  city: string;
  state: string;
  country: string;
  rent_amount: number;
  rent_currency: string;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  images: string[];
  status: string;
  is_featured: boolean;
  is_active: boolean;
  is_verified: boolean;
  amenities: string[];
  pet_policy: string;
  furnished: boolean;
  created_at: string;
  updated_at: string;
}

// Convert API property to component Property format
const convertApiProperty = (apiProp: ApiProperty): Property => ({
  id: apiProp.id,
  title: apiProp.title,
  description: apiProp.description,
  rent: apiProp.rent_amount,
  rentCurrency: apiProp.rent_currency,
  bedrooms: apiProp.bedrooms,
  bathrooms: apiProp.bathrooms,
  squareFeet: apiProp.square_feet,
  address: {
    street: apiProp.street,
    city: apiProp.city,
    state: apiProp.state,
    country: apiProp.country
  },
  images: apiProp.images,
  status: apiProp.status,
  featured: apiProp.is_featured,
  active: apiProp.is_active,
  verified: apiProp.is_verified,
  amenities: apiProp.amenities,
  petPolicy: apiProp.pet_policy === 'allowed' ? 'Pets allowed' : 'No pets',
  furnished: apiProp.furnished,
  createdAt: apiProp.created_at,
  updatedAt: apiProp.updated_at
});

// Fallback sample data for East Africa
const sampleProperties: Property[] = [
  {
    id: "1",
    title: "The Pearl Penthouse",
    description: "Luxury penthouse with panoramic city views of Nairobi skyline",
    rent: 185000,
    rentCurrency: "KES",
    bedrooms: 3,
    bathrooms: 3,
    squareFeet: 2400,
    address: {
      street: "Upper Hill Road",
      city: "Nairobi",
      state: "Nairobi County",
      country: "Kenya"
    },
    images: ["https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=800"],
    status: "available",
    featured: false,
    active: true,
    verified: true,
    amenities: ["WiFi", "Parking", "Gym", "Pool"],
    petPolicy: "No pets",
    furnished: true,
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z"
  },
  {
    id: "2",
    title: "Ocean Breeze Villa",
    description: "Modern villa with ocean views in Mombasa",
    rent: 95000,
    rentCurrency: "KES",
    bedrooms: 4,
    bathrooms: 3,
    squareFeet: 2800,
    address: {
      street: "Nyali Beach Road",
      city: "Mombasa",
      state: "Mombasa County",
      country: "Kenya"
    },
    images: ["https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800"],
    status: "available",
    featured: true,
    active: true,
    verified: true,
    amenities: ["WiFi", "Parking", "Garden", "Security"],
    petPolicy: "Pets allowed",
    furnished: false,
    createdAt: "2024-01-20T00:00:00Z",
    updatedAt: "2024-01-20T00:00:00Z"
  },
  {
    id: "3",
    title: "Kigali Heights Apartment",
    description: "Modern apartment in Kigali with city views",
    rent: 55000,
    rentCurrency: "KES",
    bedrooms: 2,
    bathrooms: 2,
    squareFeet: 1200,
    address: {
      street: "Kacyiru Avenue",
      city: "Kigali",
      state: "Kigali City",
      country: "Rwanda"
    },
    images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"],
    status: "available",
    featured: false,
    active: true,
    verified: true,
    amenities: ["WiFi", "Parking", "Gym"],
    petPolicy: "No pets",
    furnished: true,
    createdAt: "2024-01-25T00:00:00Z",
    updatedAt: "2024-01-25T00:00:00Z"
  },
  {
    id: "4",
    title: "Serengeti View Lodge",
    description: "Spacious lodge with Serengeti views",
    rent: 250000,
    rentCurrency: "KES",
    bedrooms: 5,
    bathrooms: 4,
    squareFeet: 3500,
    address: {
      street: "Serengeti Road",
      city: "Arusha",
      state: "Arusha Region",
      country: "Tanzania"
    },
    images: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"],
    status: "available",
    featured: true,
    active: true,
    verified: true,
    amenities: ["WiFi", "Parking", "Pool", "Garden"],
    petPolicy: "Pets allowed",
    furnished: false,
    createdAt: "2024-01-30T00:00:00Z",
    updatedAt: "2024-01-30T00:00:00Z"
  },
  {
    id: "5",
    title: "Garden City Residences",
    description: "Modern apartment complex with garden views",
    rent: 120000,
    rentCurrency: "KES",
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 1800,
    address: {
      street: "Garden City Road",
      city: "Nairobi",
      state: "Nairobi County",
      country: "Kenya"
    },
    images: ["https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800"],
    status: "available",
    featured: false,
    active: true,
    verified: true,
    amenities: ["WiFi", "Parking", "Gym", "Security"],
    petPolicy: "No pets",
    furnished: true,
    createdAt: "2024-02-05T00:00:00Z",
    updatedAt: "2024-02-05T00:00:00Z"
  },
  {
    id: "6",
    title: "Harbor View Apartments",
    description: "Waterfront apartments with harbor views",
    rent: 75000,
    rentCurrency: "KES",
    bedrooms: 2,
    bathrooms: 2,
    squareFeet: 1400,
    address: {
      street: "Harbor View Drive",
      city: "Dar es Salaam",
      state: "Dar es Salaam Region",
      country: "Tanzania"
    },
    images: ["https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800"],
    status: "available",
    featured: false,
    active: true,
    verified: true,
    amenities: ["WiFi", "Parking", "Security"],
    petPolicy: "Pets allowed",
    furnished: false,
    createdAt: "2024-02-10T00:00:00Z",
    updatedAt: "2024-02-10T00:00:00Z"
  }
];

export default function HomePage() {
  const [searchResults, setSearchResults] = useState<Property[]>([]);
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch featured properties on component mount
  useEffect(() => {
    fetchFeaturedProperties();
  }, []);

  const fetchFeaturedProperties = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/properties?featured=true&limit=6');
      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }
      
      const data = await response.json();
      const convertedProperties = data.properties.map(convertApiProperty);
      
      setFeaturedProperties(convertedProperties);
      setSearchResults(convertedProperties);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Unable to load properties. Showing featured listings for now.');
      // Use sample data as fallback
      setFeaturedProperties(sampleProperties);
      setSearchResults(sampleProperties);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (params: SearchParams) => {
    console.log('Search params:', params);
    setIsLoading(true);
    setError(null);
    
    try {
      // Build search query parameters
      const searchParams = new URLSearchParams();
      if (params.location) {
        searchParams.append('city', params.location);
      }
      if (params.propertyType) {
        searchParams.append('propertyType', params.propertyType);
      }
      if (params.priceRange) {
        const [minPrice, maxPrice] = params.priceRange;
        if (minPrice) searchParams.append('minRent', minPrice.toString());
        if (maxPrice) searchParams.append('maxRent', maxPrice.toString());
      }
      // Note: bedrooms not available in current SearchParams interface
      searchParams.append('limit', '12');
      
      const response = await fetch(`/api/search?${searchParams.toString()}`);
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      const convertedProperties = data.properties.map(convertApiProperty);
      
      setSearchResults(convertedProperties);
    } catch (err) {
      console.error('Search error:', err);
      setError('Search temporarily unavailable. Showing featured properties.');
      // Fallback to featured properties
      setSearchResults(featuredProperties);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = () => {
    console.log('Sign in clicked');
    // Navigate to sign in page or open modal
  };

  const handleListProperty = () => {
    console.log('List property clicked');
    // Navigate to listing page or open modal
  };

  const handleViewAllListings = () => {
    console.log('View all listings clicked');
    // Navigate to all listings page
  };

  const handlePropertyClick = (id: string) => {
    console.log('Property clicked:', id);
    // Navigate to property detail page
  };

  const handleFavoriteClick = (id: string) => {
    console.log('Favorite toggled for property:', id);
    // Update favorites in state/backend
  };

  const handleNewsletterSubscribe = async (email: string) => {
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 409) {
          throw new Error('You\'re already subscribed to our newsletter!');
        }
        throw new Error(data.error || 'Unable to subscribe. Please try again later.');
      }
      
      console.log('Newsletter subscription successful:', data);
      return data;
    } catch (err) {
      console.error('Newsletter subscription error:', err);
      throw err;
    }
  };

  return (
    <div className="bg-slate-50 text-slate-800 font-body-md min-h-screen">
      <main>
        <HeroSection onSearch={handleSearch} />
        <MetricsSection />
        
        {isLoading ? (
          <div className="py-24 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-900 border-t-transparent"></div>
            <p className="mt-4 text-slate-500">Loading properties...</p>
          </div>
        ) : error ? (
          <div className="py-24 text-center">
            <div className="mb-6">
              <span className="material-symbols-outlined text-amber-500 text-4xl">info</span>
            </div>
            <p className="text-slate-600 mb-4 max-w-md mx-auto">{error}</p>
            <button
              onClick={fetchFeaturedProperties}
              className="px-6 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors font-medium"
            >
              Refresh Properties
            </button>
          </div>
        ) : (
          <FeaturedProperties 
            properties={searchResults}
            onViewAllClick={handleViewAllListings}
            onPropertyClick={handlePropertyClick}
            onFavoriteClick={handleFavoriteClick}
          />
        )}
        
        {/* Call to Action Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
          <div className="container-responsive text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Your East African Rental Journey Starts Here
            </h2>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Discover verified rental properties across Kenya, Rwanda, Tanzania, and beyond. 
              From city apartments to suburban family homes - find your perfect space today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/properties"
                className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
              >
                Browse Properties
              </Link>
              <Link
                href="/agent/properties/new"
                className="px-8 py-4 bg-transparent text-white border-2 border-white rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors"
              >
                List Your Rental
              </Link>
            </div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">10,000+</div>
                <div className="opacity-90">Verified Rental Properties</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">5,000+</div>
                <div className="opacity-90">Happy Tenants</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">500+</div>
                <div className="opacity-90">Trusted Landlords</div>
              </div>
            </div>
          </div>
        </section>
        
        <HowItWorks />
        <Newsletter onSubscribe={handleNewsletterSubscribe} />
      </main>
    </div>
  );
}
