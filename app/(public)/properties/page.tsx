'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, 
  Search, 
  MapPin, 
  Bed, 
  Bath, 
  Heart, 
  Filter, 
  Grid, 
  List, 
  ChevronLeft, 
  ChevronRight,
  Users,
  Building
} from 'lucide-react';
import EnhancedPropertyFilter, { PropertyFilters } from '@/components/EnhancedPropertyFilter';

interface Property {
  _id: string;
  title: string;
  description: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  rent: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  securityDeposit: number;
  leaseTerm: string;
  availabilityDate: string;
  amenities: {
    parking: boolean;
    laundry: boolean;
    petsAllowed: boolean;
    utilitiesIncluded: boolean;
    furnished: boolean;
    airConditioning: boolean;
    heating: boolean;
    internet: boolean;
  };
  images: string[];
  agentId: {
    _id: string;
    name: string;
    email: string;
  };
  views: number;
  createdAt: string;
  status: 'available' | 'rented' | 'pending' | 'rejected';
  isApproved: boolean;
}

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
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<PropertyFilters>({
    search: '',
    city: '',
    state: '',
    minPrice: 10000,
    maxPrice: 500000,
    bedrooms: 'any',
    bathrooms: 'any',
    propertyType: 'all',
    petPolicy: 'any',
    featured: false,
    furnished: false,
    availableNow: false,
    sortBy: 'newest',
    amenities: [],
    minSquareFeet: 0,
    maxSquareFeet: 10000,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });

  const searchParams = useSearchParams();

  useEffect(() => {
    const city = searchParams?.get('city');
    if (city) {
      setFilters(prev => ({ ...prev, city }));
    }
    fetchProperties();
  }, [searchParams]);

  const fetchProperties = async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.city) params.set('city', filters.city);
      if (filters.state) params.set('state', filters.state);
      if (filters.minPrice > 10000) params.set('minPrice', filters.minPrice.toString());
      if (filters.maxPrice < 500000) params.set('maxPrice', filters.maxPrice.toString());
      if (filters.bedrooms !== 'any') params.set('bedrooms', filters.bedrooms);
      if (filters.bathrooms !== 'any') params.set('bathrooms', filters.bathrooms);
      if (filters.propertyType !== 'all') params.set('propertyType', filters.propertyType);
      if (filters.petPolicy !== 'any') params.set('petPolicy', filters.petPolicy);
      if (filters.featured) params.set('featured', 'true');
      if (filters.furnished) params.set('furnished', 'true');
      if (filters.availableNow) params.set('availableNow', 'true');
      if (filters.sortBy !== 'newest') params.set('sort', filters.sortBy);
      if (filters.minSquareFeet > 0) params.set('minSquareFeet', filters.minSquareFeet.toString());
      if (filters.maxSquareFeet < 10000) params.set('maxSquareFeet', filters.maxSquareFeet.toString());
      if (filters.amenities.length > 0) params.set('amenities', filters.amenities.join(','));
      params.set('page', page.toString());

      const response = await fetch(`/api/properties?${params}`);
      if (response.ok) {
        const data = await response.json();
        setProperties(data.properties);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (newFilters: PropertyFilters) => {
    setFilters(newFilters);
    fetchProperties(1);
  };

  const handlePageChange = (page: number) => {
    fetchProperties(page);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container-responsive">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4 sm:space-x-6">
              <Link href="/" className="flex items-center">
                <Home className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                <span className="ml-1 sm:ml-2 text-sm sm:text-lg font-bold text-gray-900 hidden xs:block">Makao</span>
              </Link>
              <h1 className="text-sm sm:text-xl font-semibold text-gray-900">Properties</h1>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center space-x-2">
              <Link href="/agents" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                Find Agents
              </Link>
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                {viewMode === 'grid' ? <List className="h-5 w-5" /> : <Grid className="h-5 w-5" />}
              </button>
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="sm:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <Filter className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="sm:hidden">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              >
                <Filter className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Mobile Filters */}
          {showMobileFilters && (
            <div className="sm:hidden border-t border-gray-200">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link
                  href="/agents"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  Find Agents
                </Link>
                <button
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 w-full text-left"
                >
                  {viewMode === 'grid' ? 'List View' : 'Grid View'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Search and Filters */}
      <EnhancedPropertyFilter
        onFilterChange={handleFilterChange}
        initialFilters={filters}
        compact={false}
      />

      {/* Results Header */}
      <div className="container-responsive py-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {pagination.total} Properties Found
            </h2>
            <p className="text-gray-600">
              {filters.search && `Searching for "${filters.search}"`}
              {filters.city && ` in ${filters.city}`}
            </p>
          </div>
          <div className="hidden sm:flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="container-responsive pb-8">
        {properties.length === 0 ? (
          <div className="text-center py-12">
            <Building className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className={`grid gap-4 sm:gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {properties.map((property) => (
              <div 
                key={property._id} 
                className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer ${
                  viewMode === 'list' ? 'sm:flex' : ''
                }`}
              >
                <div className={`relative ${viewMode === 'list' ? 'sm:w-48 sm:h-48 h-32' : 'h-40 sm:h-48'} bg-gray-200`}>
                  {property.images.length > 0 ? (
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-full object-cover rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Home className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                    </div>
                  )}
                  <button className="absolute top-2 right-2 p-1.5 sm:p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors">
                    <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                  </button>
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base line-clamp-1">{property.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-2">
                    {property.address.city}, {property.address.state}
                  </p>
                  <div className={`flex items-center justify-between mb-2 ${
                    viewMode === 'list' ? 'sm:flex-col sm:items-start sm:space-y-1' : ''
                  }`}>
                    <span className="text-base sm:text-lg font-bold text-blue-600">
                      KES {property.rent.toLocaleString()}/mo
                    </span>
                    <div className={`flex items-center space-x-2 text-xs sm:text-sm text-gray-600 ${
                      viewMode === 'list' ? 'sm:space-x-1' : ''
                    }`}>
                      <Bed className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">{property.bedrooms}</span>
                      <span className="sm:hidden">{property.bedrooms}bd</span>
                      <Bath className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">{property.bathrooms}</span>
                      <span className="sm:hidden">{property.bathrooms}ba</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs sm:text-sm text-gray-500">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <span>{property.squareFeet} sqft</span>
                    </div>
                    <Link 
                      href={`/properties/${property._id}`}
                      className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium"
                    >
                      View Details →
                    </Link>
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
              <ChevronLeft className="h-5 w-5" />
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
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
