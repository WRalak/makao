'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  MessageSquare,
  Home,
  MapPin,
  DollarSign,
  Calendar,
  Filter,
  Search,
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
  isApproved: boolean;
  views: number;
  messagesCount: number;
  createdAt: string;
}

export default function AgentProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const router = useRouter();

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    filterProperties();
  }, [properties, searchTerm, statusFilter]);

  const fetchProperties = async () => {
    try {
      const response = await fetch('/api/agent/properties');
      if (response.ok) {
        const data = await response.json();
        setProperties(data);
      }
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterProperties = () => {
    let filtered = properties;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(property =>
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address.street.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(property => property.status === statusFilter);
    }

    setFilteredProperties(filtered);
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (!confirm('Are you sure you want to delete this property?')) {
      return;
    }

    try {
      const response = await fetch(`/api/agent/properties/${propertyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProperties(properties.filter(p => p._id !== propertyId));
      } else {
        alert('Failed to delete property');
      }
    } catch (error) {
      console.error('Failed to delete property:', error);
      alert('Failed to delete property');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'rented':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Properties</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage your rental properties
              </p>
            </div>
            <Link
              href="/agent/properties/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="rented">Rented</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        {filteredProperties.length === 0 ? (
          <div className="text-center py-12">
            <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {properties.length === 0 ? 'No properties yet' : 'No matching properties'}
            </h3>
            <p className="text-gray-600 mb-4">
              {properties.length === 0 
                ? 'Get started by adding your first property'
                : 'Try adjusting your search or filters'
              }
            </p>
            {properties.length === 0 && (
              <Link
                href="/agent/properties/new"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 inline-flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Property
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <div key={property._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Property Image */}
                <div className="relative h-48 bg-gray-200">
                  {property.images.length > 0 ? (
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Home className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(property.status)}`}>
                      {property.status}
                    </span>
                  </div>
                  {!property.isApproved && property.status === 'pending' && (
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Awaiting Approval
                      </span>
                    </div>
                  )}
                </div>

                {/* Property Details */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {property.title}
                  </h3>
                  <div className="flex items-center text-gray-600 text-sm mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    {property.address.city}, {property.address.state}
                  </div>
                  <div className="flex items-center text-gray-600 text-sm mb-3">
                    <DollarSign className="h-4 w-4 mr-1" />
                    ${property.rent.toLocaleString()}/month
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-3">
                      <span>{property.bedrooms} beds</span>
                      <span>{property.bathrooms} baths</span>
                      <span>{property.squareFeet} sqft</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {property.views}
                      </div>
                      <div className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        {property.messagesCount}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(property.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex space-x-2">
                      <Link
                        href={`/agent/properties/${property._id}/edit`}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteProperty(property._id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <Link
                      href={`/properties/${property._id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View
                    </Link>
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
