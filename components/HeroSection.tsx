'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Home, DollarSign } from 'lucide-react';

interface HeroSectionProps {
  onSearch?: (searchParams: SearchParams) => void;
  onSignInClick?: () => void;
  onListPropertyClick?: () => void;
}

export interface SearchParams {
  location: string;
  propertyType: string;
  priceRange: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onSearch, onSignInClick, onListPropertyClick }) => {
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSearch = async () => {
    if (!location.trim()) {
      // Show error or focus on location input
      return;
    }

    setIsLoading(true);
    
    try {
      // Build search query parameters
      const searchParams: SearchParams = {
        location: location.trim(),
        propertyType,
        priceRange
      };

      // Navigate to properties page with search parameters
      const queryParams = new URLSearchParams();
      if (searchParams.location) queryParams.set('search', searchParams.location);
      if (searchParams.propertyType) queryParams.set('propertyType', searchParams.propertyType);
      if (searchParams.priceRange) {
        // Convert price range to min/max values
        const priceMap: Record<string, { min: string; max: string }> = {
          '20k-50k': { min: '20000', max: '50000' },
          '50k-100k': { min: '50000', max: '100000' },
          '100k-200k': { min: '100000', max: '200000' },
          '200k+': { min: '200000', max: '' }
        };
        const price = priceMap[searchParams.priceRange];
        if (price) {
          if (price.min) queryParams.set('minRent', price.min);
          if (price.max) queryParams.set('maxRent', price.max);
        }
      }

      router.push(`/properties?${queryParams.toString()}`);
      
      // Also call the onSearch callback if provided
      if (onSearch) {
        onSearch(searchParams);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <section className="relative h-[870px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          className="w-full h-full object-cover brightness-[0.7]" 
          alt="Beautiful modern living room with natural light and comfortable furniture" 
          src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1600&auto=format&fit=crop&q=80"
        />
        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl px-4 sm:px-8 text-center">
        <h1 className="font-display-xl text-display-xl text-white mb-8 text-5xl md:text-6xl">
          Find Your Perfect Home with Makao
        </h1>
        <p className="font-body-lg text-body-lg text-white/90 mb-12 max-w-3xl mx-auto text-lg md:text-xl">
          East Africa's premier rental platform. Discover verified properties in Nairobi, Kigali, Dar es Salaam, and beyond. 
          From studio apartments to luxury villas - your dream rental property awaits on Makao.
        </p>

        {/* Search Bar */}
        <div className="bg-white p-2 rounded-xl shadow-xl max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-2">
          {/* Location Input */}
          <div className="flex-1 flex items-center gap-3 px-4 w-full">
            <MapPin className="w-5 h-5 text-outline" />
            <input 
              className="w-full border-none focus:ring-0 text-on-surface font-body-md placeholder:text-outline outline-none" 
              placeholder="Enter city, neighborhood, or property name..." 
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
          </div>
          
          <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
          
          {/* Property Type Select */}
          <div className="flex-1 flex items-center gap-3 px-4 w-full">
            <Home className="w-5 h-5 text-outline" />
            <select 
              className="w-full border-none focus:ring-0 text-on-surface font-body-md bg-transparent outline-none"
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              disabled={isLoading}
            >
              <option value="">All Property Types</option>
              <option value="apartment">Apartments</option>
              <option value="house">Houses & Bungalows</option>
              <option value="condo">Condominiums</option>
              <option value="villa">Villas & Townhouses</option>
              <option value="studio">Studio Apartments</option>
              <option value="penthouse">Penthouses</option>
            </select>
          </div>
          
          <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
          
          {/* Price Range Select */}
          <div className="flex-1 flex items-center gap-3 px-4 w-full">
            <DollarSign className="w-5 h-5 text-outline" />
            <select 
              className="w-full border-none focus:ring-0 text-on-surface font-body-md bg-transparent outline-none"
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              disabled={isLoading}
            >
              <option value="">Monthly Rent (KES)</option>
              <option value="20k-50k">KES 20K - 50K</option>
              <option value="50k-100k">KES 50K - 100K</option>
              <option value="100k-200k">KES 100K - 200K</option>
              <option value="200k+">KES 200K+</option>
            </select>
          </div>
          
          {/* Search Button */}
          <button 
            onClick={handleSearch}
            disabled={isLoading || !location.trim()}
            className="w-full md:w-auto px-12 py-4 bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-lg font-bold hover:shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Searching Makao...
              </>
            ) : (
              <>
                <Search className="w-6 h-6" />
                Search Properties
              </>
            )}
          </button>
        </div>

        {/* Quick Search Tags */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {['Nairobi Westlands', 'Kigali Kacyiru', 'Dar es Salaam Masaki', 'Mombasa Nyali', 'Luxury Villas', 'Family Homes'].map((tag) => (
            <button
              key={tag}
              onClick={() => setLocation(tag)}
              className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium hover:bg-white/30 transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
