'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, X, ChevronDown, ChevronUp, MapPin, Star, Phone, Mail, Briefcase, Globe, Award, Clock, Home, TrendingUp } from 'lucide-react';

interface EnhancedAgentFilterProps {
  onFilterChange: (filters: AgentFilters) => void;
  initialFilters?: Partial<AgentFilters>;
  className?: string;
  compact?: boolean;
}

export interface AgentFilters {
  search: string;
  city: string;
  specialty: string;
  languages: string[];
  minRating: number;
  verified: boolean;
  featured: boolean;
  availableNow: boolean;
  sortBy: string;
  experience: string;
  responseTime: string;
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

const specialties = [
  { value: 'all', label: 'All Specialties' },
  { value: 'residential', label: 'Residential', icon: Home },
  { value: 'commercial', label: 'Commercial', icon: Briefcase },
  { value: 'luxury', label: 'Luxury', icon: Award },
  { value: 'property-management', label: 'Property Management', icon: Briefcase },
  { value: 'investment', label: 'Investment', icon: TrendingUp },
  { value: 'relocation', label: 'Relocation', icon: Globe }
];

const languages = [
  'English', 'Swahili', 'French', 'Spanish', 'Arabic', 'Chinese', 'Hindi', 'Portuguese'
];

const experienceLevels = [
  { value: 'all', label: 'All Experience' },
  { value: '0-2', label: '0-2 years' },
  { value: '3-5', label: '3-5 years' },
  { value: '6-10', label: '6-10 years' },
  { value: '10+', label: '10+ years' }
];

const responseTimes = [
  { value: 'all', label: 'Any Response Time' },
  { value: '1-hour', label: 'Within 1 hour' },
  { value: '2-hours', label: 'Within 2 hours' },
  { value: 'same-day', label: 'Same day' },
  { value: '24-hours', label: 'Within 24 hours' }
];

const sortOptions = [
  { value: 'rating', label: 'Highest Rated' },
  { value: 'experience', label: 'Most Experienced' },
  { value: 'listings', label: 'Most Listings' },
  { value: 'response', label: 'Fastest Response' },
  { value: 'newest', label: 'Newest First' }
];

export default function EnhancedAgentFilter({ 
  onFilterChange, 
  initialFilters = {}, 
  className = '',
  compact = false 
}: EnhancedAgentFilterProps) {
  const [filters, setFilters] = useState<AgentFilters>({
    search: '',
    city: '',
    specialty: 'all',
    languages: [],
    minRating: 0,
    verified: false,
    featured: false,
    availableNow: false,
    sortBy: 'rating',
    experience: 'all',
    responseTime: 'all',
    ...initialFilters
  });

  const [expandedSections, setExpandedSections] = useState<string[]>(['basic']);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handleLanguageToggle = (language: string) => {
    setFilters(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      city: '',
      specialty: 'all',
      languages: [],
      minRating: 0,
      verified: false,
      featured: false,
      availableNow: false,
      sortBy: 'rating',
      experience: 'all',
      responseTime: 'all'
    });
  };

  const activeFilterCount = [
    filters.search,
    filters.city,
    filters.specialty !== 'all' ? filters.specialty : '',
    filters.languages.length > 0 ? 'languages' : '',
    filters.minRating > 0 ? 'rating' : '',
    filters.verified ? 'verified' : '',
    filters.featured ? 'featured' : '',
    filters.availableNow ? 'available' : '',
    filters.experience !== 'all' ? 'experience' : '',
    filters.responseTime !== 'all' ? 'response' : ''
  ].filter(Boolean).length;

  return (
    <div className={`bg-white border-b ${className}`}>
      <div className="container-responsive py-4">
        {/* Search Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search agents by name, company, or location..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-colors ${
                showAdvanced 
                  ? 'bg-blue-50 border-blue-200 text-blue-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="h-5 w-5" />
              <span className="hidden sm:inline">
                Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </span>
              <span className="sm:hidden">
                {activeFilterCount > 0 && `(${activeFilterCount})`}
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
            </button>
            
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="px-4 py-3 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-4 border-t pt-4">
            {/* Basic Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <select
                  value={filters.city}
                  onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Cities</option>
                  {cities.map(city => (
                    <option key={city.value} value={city.value}>
                      {city.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specialty</label>
                <select
                  value={filters.specialty}
                  onChange={(e) => setFilters(prev => ({ ...prev, specialty: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {specialties.map(specialty => (
                    <option key={specialty.value} value={specialty.value}>
                      {specialty.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                <select
                  value={filters.experience}
                  onChange={(e) => setFilters(prev => ({ ...prev, experience: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {experienceLevels.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Response Time</label>
                <select
                  value={filters.responseTime}
                  onChange={(e) => setFilters(prev => ({ ...prev, responseTime: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {responseTimes.map(time => (
                    <option key={time.value} value={time.value}>
                      {time.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Rating Slider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Rating: {filters.minRating}+ stars
              </label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={filters.minRating}
                onChange={(e) => setFilters(prev => ({ ...prev, minRating: parseFloat(e.target.value) }))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Any</span>
                <span>5 stars</span>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.verified}
                  onChange={(e) => setFilters(prev => ({ ...prev, verified: e.target.checked }))}
                  className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Verified Only</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.featured}
                  onChange={(e) => setFilters(prev => ({ ...prev, featured: e.target.checked }))}
                  className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Featured Agents</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.availableNow}
                  onChange={(e) => setFilters(prev => ({ ...prev, availableNow: e.target.checked }))}
                  className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Available Now</span>
              </label>
            </div>

            {/* Languages */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
              <div className="flex flex-wrap gap-2">
                {languages.map(language => (
                  <button
                    key={language}
                    onClick={() => handleLanguageToggle(language)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      filters.languages.includes(language)
                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {language}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
