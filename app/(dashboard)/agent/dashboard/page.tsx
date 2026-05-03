'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Home,
  Users,
  Building,
  MessageSquare,
  TrendingUp,
  Calendar,
  FileText,
  Settings,
  Star,
  Eye,
  Phone,
  Mail,
  Plus,
  Search,
  Filter,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  DollarSign,
  Activity,
  MapPin
} from 'lucide-react';

interface DashboardStats {
  totalProperties: number;
  activeListings: number;
  totalViews: number;
  newMessages: number;
  monthlyViews: number;
  averageResponseTime: string;
  conversionRate: number;
  monthlyRevenue: number;
}

interface RecentProperty {
  _id: string;
  title: string;
  address: {
    city: string;
    state: string;
  };
  rent: number;
  views: number;
  inquiries: number;
  status: string;
  createdAt: string;
}

interface RecentMessage {
  _id: string;
  senderName: string;
  senderEmail: string;
  propertyTitle: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export default function AgentDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    activeListings: 0,
    totalViews: 0,
    newMessages: 0,
    monthlyViews: 0,
    averageResponseTime: '2 hours',
    conversionRate: 0,
    monthlyRevenue: 0,
  });

  const [recentProperties, setRecentProperties] = useState<RecentProperty[]>([]);
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // In a real app, these would be API calls
      // For now, we'll use sample data
      setStats({
        totalProperties: 24,
        activeListings: 18,
        totalViews: 15420,
        newMessages: 7,
        monthlyViews: 2340,
        averageResponseTime: '2 hours',
        conversionRate: 12.5,
        monthlyRevenue: 850000,
      });

      setRecentProperties([
        {
          _id: '1',
          title: 'Modern Westlands Apartment',
          address: { city: 'Nairobi', state: 'Kenya' },
          rent: 85000,
          views: 234,
          inquiries: 12,
          status: 'available',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          _id: '2',
          title: 'Spacious Kileleshwa House',
          address: { city: 'Nairobi', state: 'Kenya' },
          rent: 120000,
          views: 189,
          inquiries: 8,
          status: 'available',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          _id: '3',
          title: 'Cozy Kilimani Studio',
          address: { city: 'Nairobi', state: 'Kenya' },
          rent: 45000,
          views: 156,
          inquiries: 6,
          status: 'rented',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]);

      setRecentMessages([
        {
          _id: '1',
          senderName: 'Amina Mohamed',
          senderEmail: 'amina@example.com',
          propertyTitle: 'Modern Westlands Apartment',
          message: 'Hi, I\'m interested in this property. Is it still available?',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          read: false,
        },
        {
          _id: '2',
          senderName: 'Joseph Nkoy',
          senderEmail: 'joseph@example.com',
          propertyTitle: 'Spacious Kileleshwa House',
          message: 'Can I schedule a viewing for this weekend?',
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          read: false,
        },
        {
          _id: '3',
          senderName: 'Grace Babu',
          senderEmail: 'grace@example.com',
          propertyTitle: 'Cozy Kilimani Studio',
          message: 'What utilities are included in the rent?',
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          read: true,
        },
      ]);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here\'s an overview of your real estate business.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Building className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-sm text-green-600 font-medium">+12%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats.totalProperties}</h3>
          <p className="text-gray-600 text-sm">Total Properties</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Eye className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-sm text-green-600 font-medium">+23%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</h3>
          <p className="text-gray-600 text-sm">Total Views</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <MessageSquare className="h-6 w-6 text-yellow-600" />
            </div>
            <span className="text-sm text-red-600 font-medium">+5</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats.newMessages}</h3>
          <p className="text-gray-600 text-sm">New Messages</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-sm text-green-600 font-medium">+18%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">KES {stats.monthlyRevenue.toLocaleString()}</h3>
          <p className="text-gray-600 text-sm">Monthly Revenue</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Properties */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Properties</h2>
                <Link
                  href="/agent/properties"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentProperties.map((property) => (
                  <div key={property._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{property.title}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          property.status === 'available'
                            ? 'bg-green-100 text-green-800'
                            : property.status === 'rented'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {property.status}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{property.address.city}, {property.address.state}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-blue-600">
                          KES {property.rent.toLocaleString()}/mo
                        </span>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            <span>{property.views}</span>
                          </div>
                          <div className="flex items-center">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            <span>{property.inquiries}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/agent/properties/${property._id}`}
                      className="ml-4 text-blue-600 hover:text-blue-700"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Messages */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Messages</h2>
                <Link
                  href="/agent/messages"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentMessages.map((message) => (
                  <div
                    key={message._id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      message.read ? 'border-gray-200 bg-white' : 'border-blue-200 bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{message.senderName}</h3>
                      <span className="text-xs text-gray-500">
                        {new Date(message.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{message.propertyTitle}</p>
                    <p className="text-sm text-gray-700 line-clamp-2">{message.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/agent/properties/new"
              className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2 text-blue-600" />
              <span className="font-medium">Add Property</span>
            </Link>
            <Link
              href="/agent/schedule"
              className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Calendar className="h-5 w-5 mr-2 text-green-600" />
              <span className="font-medium">View Schedule</span>
            </Link>
            <Link
              href="/agent/analytics"
              className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
              <span className="font-medium">View Analytics</span>
            </Link>
            <Link
              href="/agent/settings"
              className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Settings className="h-5 w-5 mr-2 text-gray-600" />
              <span className="font-medium">Settings</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
