'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Home,
  Plus,
  Eye,
  MessageSquare,
  DollarSign,
  TrendingUp,
  Settings,
  LogOut,
  Calendar,
  Users,
  Star,
} from 'lucide-react';

interface AgentStats {
  totalProperties: number;
  activeProperties: number;
  totalViews: number;
  totalMessages: number;
  subscriptionStatus: string;
  subscriptionPlan: string;
  propertyLimit: number;
  recentProperties: any[];
  monthlyViews: any[];
  topProperties: any[];
}

export default function AgentDashboard() {
  const [stats, setStats] = useState<AgentStats>({
    totalProperties: 0,
    activeProperties: 0,
    totalViews: 0,
    totalMessages: 0,
    subscriptionStatus: 'inactive',
    subscriptionPlan: 'basic',
    propertyLimit: 0,
    recentProperties: [],
    monthlyViews: [],
    topProperties: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/agent/dashboard');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else if (response.status === 403) {
        // Redirect to subscription if not active
        router.push('/agent/subscription');
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout');
    router.push('/login');
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
    <div className="min-h-screen bg-gray-50">
      {/* Agent Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Agent Dashboard</h1>
              {stats.subscriptionStatus === 'active' && (
                <span className="ml-3 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  {stats.subscriptionPlan.toUpperCase()} PLAN
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/agent/properties" className="text-gray-600 hover:text-gray-900">
                <Home className="h-5 w-5" />
              </Link>
              <Link href="/agent/messages" className="text-gray-600 hover:text-gray-900">
                <MessageSquare className="h-5 w-5" />
              </Link>
              <Link href="/agent/subscription" className="text-gray-600 hover:text-gray-900">
                <DollarSign className="h-5 w-5" />
              </Link>
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <Settings className="h-5 w-5" />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Subscription Alert */}
        {stats.subscriptionStatus !== 'active' && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <DollarSign className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Your subscription is {stats.subscriptionStatus}. 
                  <Link href="/agent/subscription" className="font-medium underline ml-1">
                    Activate your subscription to start listing properties.
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-full p-3">
                <Home className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Properties</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProperties}</p>
                <p className="text-xs text-gray-500">
                  {stats.propertyLimit - stats.totalProperties} slots available
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-full p-3">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalViews}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-full p-3">
                <MessageSquare className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Messages</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalMessages}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-full p-3">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Listings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeProperties}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/agent/properties/new"
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <Plus className="h-6 w-6 text-gray-400 mr-2" />
              <span className="text-medium text-gray-600">Add New Property</span>
            </Link>
            <Link
              href="/agent/messages"
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <MessageSquare className="h-6 w-6 text-gray-400 mr-2" />
              <span className="text-medium text-gray-600">View Messages</span>
            </Link>
            <Link
              href="/agent/analytics"
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <TrendingUp className="h-6 w-6 text-gray-400 mr-2" />
              <span className="text-medium text-gray-600">View Analytics</span>
            </Link>
          </div>
        </div>

        {/* Recent Properties */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Recent Properties</h2>
            <Link href="/agent/properties" className="text-blue-600 hover:text-blue-500 text-sm">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Messages
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Added
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentProperties.map((property, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={property.images[0] || '/placeholder-property.jpg'}
                            alt=""
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {property.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {property.address.city}, {property.address.state}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        property.status === 'available' 
                          ? 'bg-green-100 text-green-800'
                          : property.status === 'rented'
                          ? 'bg-red-100 text-red-800'
                          : property.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {property.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {property.views}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {property.messagesCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(property.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Performance Overview</h2>
          </div>
          <div className="p-6">
            <div className="h-64 flex items-center justify-center text-gray-500">
              <TrendingUp className="h-12 w-12" />
              <span className="ml-2">Performance chart will be displayed here</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
