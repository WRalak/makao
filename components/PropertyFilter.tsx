'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, X, ChevronDown, MapPin, Home, Bed, Bath, DollarSign } from 'lucide-react';

interface PropertyFilterProps {
  onFilterChange: (filters: PropertyFilters) => void;
  className?: string;
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
  sortBy: string;
  page: number;
  limit: number;
}

const cities = [
  'Nairobi', 'Kampala', 'Dar es Salaam', 'Mombasa', 'Kigali',
  'Kilimani', 'Westlands', 'Kololo', 'Naguru', 'Masaki', 'Oysterbay'
];

const propertyTypes = [
  { value: 'all', label: 'All Types' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'villa', label: 'Villa' },
  { value: 'studio', label: 'Studio' },
  { value: 'townhouse', label: 'Townhouse' }
];

const bedroomOptions = [
  { value: 'all', label: 'Any' },
  { value: '1', label: '1 Bed' },
  { value: '2', label: '2 Beds' },
  { value: '3', label: '3 Beds' },
  { value: '4', label: '4+ Beds' }
];

const bathroomOptions = [
  { value: 'all', label: 'Any' },
  { value: '1', label: '1 Bath' },
  { value: '2', label: '2 Baths' },
  { value: '3', label: '3+ Baths' }
];

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'bedrooms', label: 'Bedrooms' },
  { value: 'size', label: 'Square Feet' },
  { value: 'popular', label: 'Most Popular' }
];

export default function PropertyFilter({ onFilterChange, className = '' }: PropertyFilterProps) {
  const [filters, setFilters] = useState<PropertyFilters>({
    search: '',
    city: '',
    state: '',
    minPrice: 0,
    maxPrice: 1000000,
    bedrooms: 'all',
    bathrooms: 'all',
    propertyType: 'all',
    petPolicy: 'all',
    featured: false,
    sortBy: 'newest',
    page: 1,
    limit: 12
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000000]);

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleFilterChange = (key: keyof PropertyFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePriceRangeChange = (type: 'min' | 'max', value: string) => {
    const numValue = parseInt(value) || 0;
    const newRange = type === 'min' 
      ? [numValue, priceRange[1]]
      : [priceRange[0], numValue];
    
    setPriceRange(newRange);
    handleFilterChange('minPrice', newRange[0]);
    handleFilterChange('maxPrice', newRange[1]);
  };

  const clearFilters = () => {
    const defaultFilters = {
      search: '',
      city: '',
      state: '',
      minPrice: 0,
      maxPrice: 1000000,
      bedrooms: 'all',
      bathrooms: 'all',
      propertyType: 'all',
      petPolicy: 'all',
      featured: false,
      sortBy: 'newest',
      page: 1,
      limit: 12
    };
    setFilters(defaultFilters);
    setPriceRange([0, 1000000]);
  };

  const hasActiveFilters = filters.search || filters.city || filters.state || 
    filters.minPrice > 0 || filters.maxPrice < 1000000 || 
    filters.bedrooms !== 'all' || filters.bathrooms !== 'all' ||
    filters.propertyType !== 'all' || filters.petPolicy !== 'all' ||
    filters.featured;

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by location, property name..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          />
        </div>
        
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Filter className="h-5 w-5 mr-2" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 btn-primary text-white text-xs px-2 py-1 rounded-full">
              Active
            </span>
          )}
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border-t pt-4 space-y-4">
          {/* Location Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="h-4 w-4 inline mr-1" />
                City
              </label>
              <select
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <option value="">All Cities</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Type
              </label>
              <select
                value={filters.propertyType}
                onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                {propertyTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="h-4 w-4 inline mr-1" />
              Price Range (KES/month)
            </label>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange[0] || ''}
                  onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
              </div>
              <span className="text-gray-500">to</span>
              <div className="flex-1">
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange[1] === 1000000 ? '' : priceRange[1]}
                  onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Property Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Bed className="h-4 w-4 inline mr-1" />
                Bedrooms
              </label>
              <select
                value={filters.bedrooms}
                onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                {bedroomOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Bath className="h-4 w-4 inline mr-1" />
                Bathrooms
              </label>
              <select
                value={filters.bathrooms}
                onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                {bathroomOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Additional Options */}
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.featured}
                onChange={(e) => handleFilterChange('featured', e.target.checked)}
                className="mr-2 h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Featured Properties Only</span>
            </label>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pet Policy
              </label>
              <select
                value={filters.petPolicy}
                onChange={(e) => handleFilterChange('petPolicy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <option value="all">All</option>
                <option value="allowed">Pets Allowed</option>
                <option value="not-allowed">No Pets</option>
                <option value="restricted">Restricted</option>
              </select>
            </div>
          </div>

          {/* Clear Filters Button */}
          <div className="flex justify-end">
            <button
              onClick={clearFilters}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <X className="h-4 w-4 mr-2" />
              Clear All Filters
            </button>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="border-t pt-4">
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
                Search: {filters.search}
                <button
                  onClick={() => handleFilterChange('search', '')}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </span>
            )}
            {filters.city && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
                {filters.city}
                <button
                  onClick={() => handleFilterChange('city', '')}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </span>
            )}
            {filters.minPrice > 0 && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
                Min: KES {filters.minPrice.toLocaleString()}
                <button
                  onClick={() => {
                    setPriceRange([0, priceRange[1]]);
                    handleFilterChange('minPrice', 0);
                  }}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </span>
            )}
            {filters.maxPrice < 1000000 && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
                Max: KES {filters.maxPrice.toLocaleString()}
                <button
                  onClick={() => {
                    setPriceRange([priceRange[0], 1000000]);
                    handleFilterChange('maxPrice', 1000000);
                  }}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </span>
            )}
            {filters.bedrooms !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
                {bedroomOptions.find(o => o.value === filters.bedrooms)?.label}
                <button
                  onClick={() => handleFilterChange('bedrooms', 'all')}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </span>
            )}
            {filters.featured && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
                Featured Only
                <button
                  onClick={() => handleFilterChange('featured', false)}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
