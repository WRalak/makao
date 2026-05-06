'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, Building, MapPin, Calendar, Eye, Edit, Trash2 } from 'lucide-react';

interface Property {
  id: number;
  title: string;
  type: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  status: 'active' | 'pending' | 'rented' | 'inactive';
  views: number;
  inquiries: number;
  listedDate: string;
  images: string[];
}

export default function AgentPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('listedDate');

  useEffect(() => {
    // Mock data - in real app, this would fetch from API
    const mockProperties: Property[] = [
      {
        id: 1,
        title: 'Modern 3BR Apartment in Kilimani',
        type: 'Apartment',
        price: 45000,
        location: 'Kilimani, Nairobi',
        bedrooms: 3,
        bathrooms: 2,
        area: 120,
        status: 'active',
        views: 245,
        inquiries: 12,
        listedDate: '2024-01-15',
        images: ['/images/property1.jpg', '/images/property2.jpg']
      },
      {
        id: 2,
        title: 'Spacious 2BR House in Kigali',
        type: 'House',
        price: 35000,
        location: 'Kigali, Rwanda',
        bedrooms: 2,
        bathrooms: 1,
        area: 85,
        status: 'rented',
        views: 189,
        inquiries: 8,
        listedDate: '2024-01-10',
        images: ['/images/property3.jpg', '/images/property4.jpg']
      },
      {
        id: 3,
        title: 'Luxury Studio in Dar es Salaam',
        type: 'Studio',
        price: 25000,
        location: 'Dar es Salaam, Tanzania',
        bedrooms: 1,
        bathrooms: 1,
        area: 45,
        status: 'pending',
        views: 156,
        inquiries: 5,
        listedDate: '2024-01-20',
        images: ['/images/property5.jpg']
      }
    ];

    setTimeout(() => {
      setProperties(mockProperties);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || property.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const sortedProperties = [...filteredProperties].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price;
      case 'views':
        return b.views - a.views;
      case 'inquiries':
        return b.inquiries - a.inquiries;
      default:
        return new Date(b.listedDate).getTime() - new Date(a.listedDate).getTime();
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rented': return 'bg-blue-100 text-blue-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-slate-900">My Properties</h1>
            <Link
              href="/agent/properties/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Property
            </Link>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="rented">Rented</option>
                <option value="inactive">Inactive</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="listedDate">Listed Date</option>
                <option value="price">Price</option>
                <option value="views">Views</option>
                <option value="inquiries">Inquiries</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : sortedProperties.length === 0 ? (
          <div className="text-center py-12">
            <Building className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No properties found</h3>
            <p className="text-slate-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProperties.map((property) => (
              <div key={property.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-slate-200 overflow-hidden">
                {/* Property Image */}
                <div className="relative h-48 bg-slate-200">
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-xs font-medium">
                    {property.status}
                  </div>
                </div>

                {/* Property Details */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-slate-900 flex-1">{property.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
                      {property.status}
                    </span>
                  </div>

                  <div className="flex items-center text-slate-600 text-sm mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    {property.location}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-slate-500 text-sm">Bedrooms</span>
                      <p className="font-medium">{property.bedrooms}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-sm">Bathrooms</span>
                      <p className="font-medium">{property.bathrooms}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-sm">Area</span>
                      <p className="font-medium">{property.area}m²</p>
                    </div>
                  </div>

                  <div className="text-2xl font-bold text-blue-600 mb-4">
                    KES {property.price.toLocaleString()}/month
                  </div>

                  {/* Stats */}
                  <div className="flex justify-between text-sm text-slate-600">
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {property.views} views
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Listed {property.listedDate}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition-colors flex items-center justify-center">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </button>
                    <button className="flex-1 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition-colors flex items-center justify-center">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
