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
          alt="Aerial view of Nairobi skyline with modern buildings and green spaces" 
          src="https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1600"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl px-4 sm:px-8 text-center">
        <h1 className="font-display-xl text-display-xl text-white mb-6">
          Find Your Next Home Across East Africa
        </h1>
        <p className="font-body-lg text-body-lg text-white/90 mb-12 max-w-2xl mx-auto">
          Discover a seamless rental experience with curated listings in Nairobi, Kigali, Dar es Salaam, and beyond.
        </p>

        {/* Search Bar */}
        <div className="bg-white p-2 rounded-xl shadow-xl max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-2">
          {/* Location Input */}
          <div className="flex-1 flex items-center gap-3 px-4 w-full">
            <MapPin className="w-5 h-5 text-outline" />
            <input 
              className="w-full border-none focus:ring-0 text-on-surface font-body-md placeholder:text-outline outline-none" 
              placeholder="Where would you like to live? (e.g., Nairobi, Kigali, Dar es Salaam)" 
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
              <option value="">Property Type</option>
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="condo">Condo</option>
              <option value="villa">Villa</option>
              <option value="studio">Studio</option>
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
              <option value="">Price Range (KES)</option>
              <option value="20k-50k">KES 20,000 - 50,000</option>
              <option value="50k-100k">KES 50,000 - 100,000</option>
              <option value="100k-200k">KES 100,000 - 200,000</option>
              <option value="200k+">KES 200,000+</option>
            </select>
          </div>
          
          {/* Search Button */}
          <button 
            onClick={handleSearch}
            disabled={isLoading || !location.trim()}
            className="w-full md:w-auto px-10 py-4 bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-lg font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Searching...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Search
              </>
            )}
          </button>
        </div>

        {/* Quick Search Tags */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {['Nairobi', 'Kigali', 'Dar es Salaam', 'Mombasa', 'Apartments', 'Houses'].map((tag) => (
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
