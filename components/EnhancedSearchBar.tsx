'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, Clock, TrendingUp, Filter, ChevronDown } from 'lucide-react';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'location' | 'property' | 'agent';
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
}

interface EnhancedSearchBarProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  placeholder?: string;
  className?: string;
  showFilters?: boolean;
  variant?: 'home' | 'properties' | 'agents';
}

interface SearchFilters {
  priceRange: [number, number];
  bedrooms: string;
  bathrooms: string;
  propertyType: string;
  city: string;
  sortBy: string;
}

const popularSearches = [
  'Nairobi apartments', 'Dar es Salaam houses', 'Kampala studios', 'Mombasa villas', 'Kigali rentals'
];

const recentSearches = [
  'Westlands 2 bedroom', 'Kilimani apartments', 'Dar es Salaam furnished'
];

const mockSuggestions: SearchSuggestion[] = [
  { id: '1', text: 'Nairobi', type: 'location', icon: MapPin, description: 'Kenya' },
  { id: '2', text: 'Dar es Salaam', type: 'location', icon: MapPin, description: 'Tanzania' },
  { id: '3', text: 'Kampala', type: 'location', icon: MapPin, description: 'Uganda' },
  { id: '4', text: 'Kigali', type: 'location', icon: MapPin, description: 'Rwanda' },
  { id: '5', text: '2 bedroom apartments', type: 'property', description: 'Popular search' },
  { id: '6', text: 'Furnished houses', type: 'property', description: 'Trending' },
];

export default function EnhancedSearchBar({ 
  onSearch, 
  placeholder = "Search locations, properties, agents...",
  className = "",
  showFilters = true,
  variant = 'home'
}: EnhancedSearchBarProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    priceRange: [0, 100000],
    bedrooms: 'all',
    bathrooms: 'all',
    propertyType: 'all',
    city: '',
    sortBy: 'relevance'
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.length > 0) {
      const filtered = mockSuggestions.filter(s => 
        s.text.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery: string = query) => {
    if (searchQuery.trim()) {
      onSearch(searchQuery, filters);
      setShowSuggestions(false);
      setShowDropdown(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    handleSearch(suggestion.text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setShowDropdown(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'home':
        return 'bg-white rounded-2xl shadow-2xl p-2 flex flex-col lg:flex-row gap-2';
      case 'properties':
        return 'bg-white rounded-xl shadow-lg border border-gray-200 p-1';
      case 'agents':
        return 'bg-white rounded-lg shadow border border-gray-200';
      default:
        return 'bg-white rounded-xl shadow-lg';
    }
  };

  const getInputStyles = () => {
    switch (variant) {
      case 'home':
        return 'flex-1 px-4 py-3 text-lg outline-none bg-transparent';
      case 'properties':
        return 'flex-1 px-3 py-2 outline-none bg-transparent';
      case 'agents':
        return 'flex-1 px-3 py-2 outline-none bg-transparent';
      default:
        return 'flex-1 px-3 py-2 outline-none bg-transparent';
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className={getVariantStyles()}>
        {/* Search Input */}
        <div className="flex items-center flex-1">
          <Search className={`text-gray-400 ${variant === 'home' ? 'h-6 w-6' : 'h-5 w-5'} mx-3`} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => query.length === 0 && setShowDropdown(true)}
            placeholder={placeholder}
            className={getInputStyles()}
          />
          {query && (
            <button
              onClick={clearSearch}
              className="p-1 mr-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {showFilters && (
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                variant === 'home' 
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' 
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
              {variant === 'home' && <ChevronDown className="h-4 w-4" />}
            </button>
          )}
          
          <button
            onClick={() => handleSearch()}
            className="px-6 py-2 rounded-lg font-medium transition-all transform hover:scale-105 btn-primary"
          >
            Search
          </button>
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-80 overflow-y-auto">
          <div className="p-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                {suggestion.icon && <suggestion.icon className="h-4 w-4 text-gray-400" />}
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{suggestion.text}</div>
                  {suggestion.description && (
                    <div className="text-sm text-gray-500">{suggestion.description}</div>
                  )}
                </div>
                <div className="text-xs text-gray-400 capitalize">{suggestion.type}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Dropdown with Popular/Recent Searches */}
      {showDropdown && !showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-50">
          <div className="p-4">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Recent Searches</span>
                </div>
                <div className="space-y-1">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick({ id: `recent-${index}`, text: search, type: 'property' })}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-sm text-gray-700">{search}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Searches */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Popular Searches</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick({ id: `popular-${index}`, text: search, type: 'property' })}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-40 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Advanced Filters</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.priceRange[0]}
                  onChange={(e) => setFilters({...filters, priceRange: [Number(e.target.value), filters.priceRange[1]]})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.priceRange[1]}
                  onChange={(e) => setFilters({...filters, priceRange: [filters.priceRange[0], Number(e.target.value)]})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Bedrooms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
              <select
                value={filters.bedrooms}
                onChange={(e) => setFilters({...filters, bedrooms: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Any</option>
                <option value="1">1 Bed</option>
                <option value="2">2 Beds</option>
                <option value="3">3 Beds</option>
                <option value="4">4+ Beds</option>
              </select>
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
              <select
                value={filters.propertyType}
                onChange={(e) => setFilters({...filters, propertyType: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="villa">Villa</option>
                <option value="studio">Studio</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={() => setFilters({
                priceRange: [0, 100000],
                bedrooms: 'all',
                bathrooms: 'all',
                propertyType: 'all',
                city: '',
                sortBy: 'relevance'
              })}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Clear Filters
            </button>
            <button
              onClick={() => setShowAdvancedFilters(false)}
              className="px-4 py-2 btn-primary rounded-lg"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
