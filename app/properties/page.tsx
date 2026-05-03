'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Filter,
  Home,
  DollarSign,
  Bed,
  Bath,
  Square,
  Heart,
  Grid,
  List,
  Menu,
  X,
} from 'lucide-react';

interface Property {
  _id: string;
  title: string;
  description: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  rent: number;
  securityDeposit: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  images: string[];
  status: 'available' | 'rented' | 'pending' | 'rejected';
  agentId: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 10000, max: 500000 });
  const [bedrooms, setBedrooms] = useState('any');
  const [bathrooms, setBathrooms] = useState('any');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });
  
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const city = searchParams.get('city');
    if (city) setSearchTerm(city);
    fetchProperties();
  }, [searchParams]);

  const fetchProperties = async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set('city', searchTerm);
      if (priceRange.min > 10000) params.set('minPrice', priceRange.min.toString());
      if (priceRange.max < 500000) params.set('maxPrice', priceRange.max.toString());
      if (bedrooms !== 'any') params.set('bedrooms', bedrooms);
      if (bathrooms !== 'any') params.set('bathrooms', bathrooms);
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

  const handleSearch = () => {
    fetchProperties(1);
  };

  const handlePageChange = (page: number) => {
    fetchProperties(page);
  };

  if (isLoading && properties.length === 0) {
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
    <div>
      {/* Page Title */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
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
                placeholder="Search by city, neighborhood, or address..."
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
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="sm:hidden p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                <Filter className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filters */}
      {showMobileFilters && (
        <div className="sm:hidden bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min (KES)"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max (KES)"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) || 500000 })}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                <select
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="any">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                <select
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="any">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                </select>
              </div>

              <button
                onClick={() => {
                  handleSearch();
                  setShowMobileFilters(false);
                }}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Filters */}
      <div className="bg-white border-b hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min (KES)"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) || 0 })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                <input
                  type="number"
                  placeholder="Max (KES)"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) || 500000 })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
              <select
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="any">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
              <select
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="any">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSearch}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Property Listing */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-48 sm:h-64 animate-pulse"></div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <Home className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No properties found</h3>
            <p className="text-sm sm:text-base text-gray-600">Try adjusting your search criteria</p>
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
                      <Square className="h-3 w-3 sm:h-4 sm:w-4 hidden sm:inline" />
                      <span className="hidden sm:inline">{property.squareFeet}sqft</span>
                    </div>
                  </div>
                  <div className={`flex space-x-2 ${
                    viewMode === 'list' ? 'sm:flex-col sm:space-y-2 sm:space-x-0' : ''
                  }`}>
                    <button
                      onClick={() => router.push(`/properties/${property._id}`)}
                      className="flex-1 bg-blue-600 text-white px-2 sm:px-3 py-2 rounded text-xs sm:text-sm hover:bg-blue-700 transition-colors font-medium"
                    >
                      {viewMode === 'list' ? 'View Details' : 'View'}
                    </button>
                    <button className="flex-1 border border-blue-600 text-blue-600 px-2 sm:px-3 py-2 rounded text-xs sm:text-sm hover:bg-blue-50 transition-colors">
                      {viewMode === 'list' ? 'Contact Agent' : 'Contact'}
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
