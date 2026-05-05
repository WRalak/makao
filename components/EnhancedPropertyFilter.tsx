'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, X, ChevronDown, ChevronUp, MapPin, Home, Bed, Bath, DollarSign, Calendar, Star } from 'lucide-react';

interface EnhancedPropertyFilterProps {
  onFilterChange: (filters: PropertyFilters) => void;
  initialFilters?: Partial<PropertyFilters>;
  className?: string;
  compact?: boolean;
}

export interface PropertyFilters {
  search: string;
  city: string;
  state: string;
  minPrice: number;
  maxPrice: number;
  bedrooms: string;
  bathrooms: string;
  propertyType: string;
  petPolicy: string;
  featured: boolean;
  furnished: boolean;
  availableNow: boolean;
  sortBy: string;
  amenities: string[];
  minSquareFeet: number;
  maxSquareFeet: number;
}

const cities = [
  { value: 'nairobi', label: 'Nairobi', country: 'Kenya' },
  { value: 'dar-es-salaam', label: 'Dar es Salaam', country: 'Tanzania' },
  { value: 'kampala', label: 'Kampala', country: 'Uganda' },
  { value: 'kigali', label: 'Kigali', country: 'Rwanda' },
  { value: 'mombasa', label: 'Mombasa', country: 'Kenya' },
  { value: 'kilimani', label: 'Kilimani', country: 'Kenya' },
  { value: 'westlands', label: 'Westlands', country: 'Kenya' },
  { value: 'kololo', label: 'Kololo', country: 'Uganda' },
  { value: 'masaki', label: 'Masaki', country: 'Tanzania' }
];

const propertyTypes = [
  { value: 'all', label: 'All Types', icon: Home },
  { value: 'apartment', label: 'Apartment', icon: Home },
  { value: 'house', label: 'House', icon: Home },
  { value: 'villa', label: 'Villa', icon: Home },
  { value: 'studio', label: 'Studio', icon: Home },
  { value: 'townhouse', label: 'Townhouse', icon: Home }
];

const bedroomOptions = [
  { value: 'all', label: 'Any Beds' },
  { value: 'studio', label: 'Studio' },
  { value: '1', label: '1 Bed' },
  { value: '2', label: '2 Beds' },
  { value: '3', label: '3 Beds' },
  { value: '4', label: '4 Beds' },
  { value: '5', label: '5+ Beds' }
];

const popularAmenities = [
  { value: 'parking', label: 'Parking', icon: '🚗' },
  { value: 'gym', label: 'Gym', icon: '🏋️' },
  { value: 'pool', label: 'Pool', icon: '🏊' },
  { value: 'security', label: 'Security', icon: '🔒' },
  { value: 'wifi', label: 'WiFi', icon: '📶' },
  { value: 'balcony', label: 'Balcony', icon: '🌅' },
  { value: 'air-conditioning', label: 'AC', icon: '❄️' },
  { value: 'furnished', label: 'Furnished', icon: '🛋️' }
];

const sortOptions = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
  { value: 'bedrooms', label: 'Bedrooms' },
  { value: 'square-feet', label: 'Square Feet' },
  { value: 'popular', label: 'Most Popular' }
];

export default function EnhancedPropertyFilter({ 
  onFilterChange, 
  initialFilters = {},
  className = '',
  compact = false
}: EnhancedPropertyFilterProps) {
  const [filters, setFilters] = useState<PropertyFilters>({
    search: '',
    city: '',
    state: '',
    minPrice: 0,
    maxPrice: 100000,
    bedrooms: 'all',
    bathrooms: 'all',
    propertyType: 'all',
    petPolicy: 'all',
    featured: false,
    furnished: false,
    availableNow: false,
    sortBy: 'relevance',
    amenities: [],
    minSquareFeet: 0,
    maxSquareFeet: 5000,
    ...initialFilters
  });

  const [isExpanded, setIsExpanded] = useState(!compact);
  const [priceRange, setPriceRange] = useState([filters.minPrice, filters.maxPrice]);
  const [squareFeetRange, setSquareFeetRange] = useState([filters.minSquareFeet, filters.maxSquareFeet]);

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleFilterChange = (key: keyof PropertyFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handlePriceRangeChange = (range: [number, number]) => {
    setPriceRange(range);
    setFilters(prev => ({ ...prev, minPrice: range[0], maxPrice: range[1] }));
  };

  const handleSquareFeetRangeChange = (range: [number, number]) => {
    setSquareFeetRange(range);
    setFilters(prev => ({ ...prev, minSquareFeet: range[0], maxSquareFeet: range[1] }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const clearFilters = () => {
    const defaultFilters = {
      search: '',
      city: '',
      state: '',
      minPrice: 0,
      maxPrice: 100000,
      bedrooms: 'all',
      bathrooms: 'all',
      propertyType: 'all',
      petPolicy: 'all',
      featured: false,
      furnished: false,
      availableNow: false,
      sortBy: 'relevance',
      amenities: [],
      minSquareFeet: 0,
      maxSquareFeet: 5000
    };
    setFilters(defaultFilters);
    setPriceRange([0, 100000]);
    setSquareFeetRange([0, 5000]);
  };

  const hasActiveFilters = filters.search || 
    filters.city || 
    filters.minPrice > 0 || 
    filters.maxPrice < 100000 || 
    filters.bedrooms !== 'all' || 
    filters.bathrooms !== 'all' ||
    filters.propertyType !== 'all' || 
    filters.petPolicy !== 'all' ||
    filters.featured ||
    filters.furnished ||
    filters.availableNow ||
    filters.amenities.length > 0 ||
    filters.minSquareFeet > 0 ||
    filters.maxSquareFeet < 5000;

  const activeFilterCount = [
    filters.search,
    filters.city,
    filters.minPrice > 0,
    filters.maxPrice < 100000,
    filters.bedrooms !== 'all',
    filters.bathrooms !== 'all',
    filters.propertyType !== 'all',
    filters.petPolicy !== 'all',
    filters.featured,
    filters.furnished,
    filters.availableNow,
    filters.amenities.length > 0,
    filters.minSquareFeet > 0,
    filters.maxSquareFeet < 5000
  ].filter(Boolean).length;

  if (compact) {
    return (
      <div className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}>
        {/* Compact Header */}
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <span className="font-medium text-gray-900">Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
            >
              {isExpanded ? (
                <>
                  <span className="text-sm">Hide</span>
                  <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  <span className="text-sm">Show</span>
                  <ChevronDown className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t border-gray-200 p-4 space-y-4">
            {/* Quick Filters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <select
                value={filters.propertyType}
                onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              >
                {propertyTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>

              <select
                value={filters.bedrooms}
                onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              >
                {bedroomOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>

              <select
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">All Cities</option>
                {cities.map(city => (
                  <option key={city.value} value={city.value}>{city.label}</option>
                ))}
              </select>

              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* Popular Amenities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Popular Amenities</label>
              <div className="flex flex-wrap gap-2">
                {popularAmenities.slice(0, 6).map(amenity => (
                  <button
                    key={amenity.value}
                    onClick={() => handleAmenityToggle(amenity.value)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      filters.amenities.includes(amenity.value)
                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                        : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                    } border`}
                  >
                    <span className="mr-1">{amenity.icon}</span>
                    {amenity.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Clear All Filters
              </button>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Filter className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Property Filters</h3>
            {activeFilterCount > 0 && (
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                {activeFilterCount} active
              </span>
            )}
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Filter Content */}
      <div className="p-6 space-y-6">
        {/* Search and Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by location, property name..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
            <select
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Cities</option>
              {cities.map(city => (
                <option key={city.value} value={city.value}>
                  {city.label}, {city.country}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price Range: ${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()}
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="100000"
              step="1000"
              value={priceRange[0]}
              onChange={(e) => handlePriceRangeChange([Number(e.target.value), priceRange[1]])}
              className="flex-1"
            />
            <input
              type="range"
              min="0"
              max="100000"
              step="1000"
              value={priceRange[1]}
              onChange={(e) => handlePriceRangeChange([priceRange[0], Number(e.target.value)])}
              className="flex-1"
            />
          </div>
          <div className="flex gap-2 mt-2">
            <input
              type="number"
              placeholder="Min"
              value={priceRange[0]}
              onChange={(e) => handlePriceRangeChange([Number(e.target.value), priceRange[1]])}
              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
            />
            <span className="text-gray-500">-</span>
            <input
              type="number"
              placeholder="Max"
              value={priceRange[1]}
              onChange={(e) => handlePriceRangeChange([priceRange[0], Number(e.target.value)])}
              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
        </div>

        {/* Property Type and Bedrooms */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
            <div className="grid grid-cols-2 gap-2">
              {propertyTypes.map(type => (
                <button
                  key={type.value}
                  onClick={() => handleFilterChange('propertyType', type.value)}
                  className={`p-2 rounded-lg border transition-colors ${
                    filters.propertyType === type.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {type.icon && <type.icon className="h-4 w-4" />}
                    <span className="text-sm">{type.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
            <div className="grid grid-cols-2 gap-2">
              {bedroomOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => handleFilterChange('bedrooms', option.value)}
                  className={`p-2 rounded-lg border transition-colors ${
                    filters.bedrooms === option.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <span className="text-sm">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quick Filters</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.featured}
                  onChange={(e) => handleFilterChange('featured', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">Featured Only</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.furnished}
                  onChange={(e) => handleFilterChange('furnished', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">Furnished</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.availableNow}
                  onChange={(e) => handleFilterChange('availableNow', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">Available Now</span>
              </label>
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
          <div className="flex flex-wrap gap-2">
            {popularAmenities.map(amenity => (
              <button
                key={amenity.value}
                onClick={() => handleAmenityToggle(amenity.value)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  filters.amenities.includes(amenity.value)
                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                } border`}
              >
                <span className="mr-1">{amenity.icon}</span>
                {amenity.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
