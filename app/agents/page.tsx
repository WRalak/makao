'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  MapPin,
  Mail,
  Phone,
  Star,
  Users,
  Home,
  Building,
  Filter,
  ChevronDown,
  MessageSquare,
  Calendar,
  TrendingUp,
  Menu,
  X,
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
  languages: string[];
  specialties: string[];
  responseTime: string;
  responseRate: number;
  totalListings: number;
  activeListings: number;
  averageRating: number;
  reviewCount: number;
  yearsExperience: number;
  address: {
    city: string;
    state: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  verified: boolean;
  featured: boolean;
  createdAt: string;
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
    'Apartments',
    'Houses',
    'Condos',
    'Townhouses',
    'Property Management',
  ];

  const cities = [
    'New York',
    'Los Angeles',
    'Chicago',
    'Houston',
    'Phoenix',
    'Philadelphia',
    'San Antonio',
    'San Diego',
  ];

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set('search', searchTerm);
      if (cityFilter) params.set('city', cityFilter);
      if (specialtyFilter !== 'all') params.set('specialty', specialtyFilter);
      params.set('sort', sortBy);
      params.set('page', page.toString());
      params.set('limit', pagination.limit.toString());

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

  const handleSearch = () => {
    fetchAgents(1);
  };

  const handlePageChange = (page: number) => {
    fetchAgents(page);
  };

  if (isLoading && agents.length === 0) {
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
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
            <div className="flex space-x-2">
              <button
                onClick={handleSearch}
                className="flex-1 sm:flex-none bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 text-sm sm:text-base font-medium"
              >
                Search
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="hidden sm:flex bg-gray-100 text-gray-700 px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-200"
              >
                <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">All Cities</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
              <select
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Specialties</option>
                {specialties.map(specialty => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="rating">Highest Rated</option>
                <option value="listings">Most Listings</option>
                <option value="response">Fastest Response</option>
                <option value="experience">Most Experience</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-blue-50 border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-center">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-sm sm:text-base font-medium text-gray-700">
                <span className="text-blue-600 font-bold">{pagination.total}</span> Verified Agents
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-blue-600" />
              <span className="text-sm sm:text-base font-medium text-gray-700">
                4.8 Average Rating
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <span className="text-sm sm:text-base font-medium text-gray-700">
                &lt; 2hr Avg Response
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Agents Listing */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : agents.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <Users className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No agents found</h3>
            <p className="text-sm sm:text-base text-gray-600">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {agents.map((agent) => (
              <div key={agent._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="p-4 sm:p-6">
                  {/* Agent Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="h-12 w-12 sm:h-16 sm:w-16 bg-gray-200 rounded-full flex items-center justify-center">
                          <Users className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                        </div>
                        {agent.verified && (
                          <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-1">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{agent.name}</h3>
                        {agent.company && (
                          <p className="text-xs sm:text-sm text-gray-600">{agent.company}</p>
                        )}
                        {agent.license && (
                          <p className="text-xs text-gray-500">License: {agent.license}</p>
                        )}
                      </div>
                    </div>
                    {agent.featured && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Rating and Stats */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="font-semibold text-sm">{agent.averageRating.toFixed(1)}</span>
                      <span className="text-xs text-gray-500">({agent.reviewCount})</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {agent.responseTime}
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">{agent.bio}</p>

                  {/* Specialties */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {agent.specialties.slice(0, 2).map((specialty, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {specialty}
                      </span>
                    ))}
                    {agent.specialties.length > 2 && (
                      <span className="text-xs text-gray-500">+{agent.specialties.length - 2} more</span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{agent.activeListings}</div>
                      <div className="text-xs text-gray-500">Active</div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{agent.yearsExperience}</div>
                      <div className="text-xs text-gray-500">Years</div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{agent.responseRate}%</div>
                      <div className="text-xs text-gray-500">Response</div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center text-xs sm:text-sm text-gray-600 mb-4">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    {agent.address.city}, {agent.address.state}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Link
                      href={`/agents/${agent._id}`}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-xs sm:text-sm hover:bg-blue-700 text-center font-medium"
                    >
                      View Profile
                    </Link>
                    <button className="flex-1 border border-blue-600 text-blue-600 px-3 py-2 rounded text-xs sm:text-sm hover:bg-blue-50 font-medium">
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
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-2 mt-6 sm:mt-8">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-sm sm:text-base"
            >
              ← Previous
            </button>
            <span className="text-sm sm:text-base text-gray-600 font-medium">
              {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-sm sm:text-base"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
