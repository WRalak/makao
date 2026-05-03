'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Home, 
  Search, 
  MapPin, 
  Mail, 
  Phone, 
  Star, 
  Users, 
  Building, 
  Filter, 
  ChevronDown, 
  MessageSquare, 
  Calendar, 
  TrendingUp,
  Menu,
  X
} from 'lucide-react';

interface Agent {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio: string;
  company?: string;
  license?: string;
  specialties: string[];
  languages: string[];
  rating: number;
  reviews: number;
  propertiesCount: number;
  responseTime: string;
  verified: boolean;
  featured: boolean;
  createdAt: string;
  address: {
    city: string;
    state: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [showFilters, setShowFilters] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });

  const specialties = [
    'Residential',
    'Commercial',
    'Luxury',
    'Property Management',
    'Investment',
    'Relocation'
  ];

  const cities = [
    'Nairobi',
    'Dar es Salaam',
    'Kampala',
    'Kigali',
    'Mombasa',
    'Arusha',
    'Entebbe',
    'Bujumbura'
  ];

  useEffect(() => {
    fetchAgents();
  }, [searchTerm, cityFilter, specialtyFilter, sortBy]);

  const fetchAgents = async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set('search', searchTerm);
      if (cityFilter) params.set('city', cityFilter);
      if (specialtyFilter !== 'all') params.set('specialty', specialtyFilter);
      params.set('sort', sortBy);
      params.set('page', page.toString());
      params.set('limit', '12');

      const response = await fetch(`/api/agents?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAgents(data.agents);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    fetchAgents(page);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading agents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="container-responsive">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4 sm:space-x-6">
              <Link href="/" className="flex items-center">
                <Home className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                <span className="ml-1 sm:ml-2 text-sm sm:text-lg font-bold text-gray-900 hidden xs:block">Makao</span>
              </Link>
              <h1 className="text-sm sm:text-xl font-semibold text-gray-900">Find Agents</h1>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden sm:block">
              <Link href="/properties" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                Browse Properties
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="sm:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile menu panel */}
          {isMobileMenuOpen && (
            <div className="sm:hidden border-t border-gray-200">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link
                  href="/properties"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Browse Properties
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border-b">
        <div className="container-responsive py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search agents by name, company, or specialty..."
                className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm sm:text-base"
            >
              <Filter className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Filters
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white border-b">
          <div className="container-responsive py-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Cities</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specialty</label>
                <select
                  value={specialtyFilter}
                  onChange={(e) => setSpecialtyFilter(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Specialties</option>
                  {specialties.map((specialty) => (
                    <option key={specialty} value={specialty}>
                      {specialty}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="rating">Highest Rated</option>
                  <option value="properties">Most Properties</option>
                  <option value="reviews">Most Reviews</option>
                  <option value="response">Fastest Response</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Header */}
      <div className="container-responsive py-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {pagination.total} Real Estate Agents
            </h2>
            <p className="text-gray-600">
              Find trusted agents across East Africa
            </p>
          </div>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="container-responsive pb-8">
        {agents.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No agents found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <div
                key={agent._id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {agent.name}
                        </h3>
                        {agent.company && (
                          <p className="text-sm text-gray-600">{agent.company}</p>
                        )}
                      </div>
                    </div>
                    {agent.verified && (
                      <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Verified
                      </div>
                    )}
                  </div>

                  <div className="flex items-center mb-3">
                    <div className="flex items-center">
                      {renderStars(agent.rating)}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      {agent.rating.toFixed(1)} ({agent.reviews} reviews)
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {agent.bio}
                  </p>

                  <div className="space-y-2 mb-4">
                    {agent.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {agent.specialties.slice(0, 3).map((specialty, index) => (
                          <span
                            key={index}
                            className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded"
                          >
                            {specialty}
                          </span>
                        ))}
                        {agent.specialties.length > 3 && (
                          <span className="text-gray-500 text-xs">
                            +{agent.specialties.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-1" />
                      <span>{agent.propertiesCount} properties</span>
                    </div>
                    <div className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      <span>{agent.responseTime}</span>
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{agent.address.city}, {agent.address.state}</span>
                  </div>

                  <div className="flex space-x-2">
                    <Link
                      href={`/agents/${agent._id}`}
                      className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      View Profile
                    </Link>
                    <button className="flex-1 border border-blue-600 text-blue-600 py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium">
                      Contact
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronDown className="h-5 w-5 rotate-90" />
            </button>
            
            {[...Array(pagination.pages)].map((_, index) => (
              <button
                key={index}
                onClick={() => handlePageChange(index + 1)}
                className={`px-3 py-2 rounded-lg ${
                  pagination.page === index + 1
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {index + 1}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronDown className="h-5 w-5 -rotate-90" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
