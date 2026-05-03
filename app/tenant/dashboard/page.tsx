'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Home,
  Heart,
  MessageSquare,
  Calendar,
  Search,
  LogOut,
  User,
  MapPin,
  Star,
} from 'lucide-react';

interface TenantStats {
  totalFavorites: number;
  totalMessages: number;
  recentFavorites: any[];
  recentMessages: any[];
  upcomingTours: any[];
}

export default function TenantDashboard() {
  const [stats, setStats] = useState<TenantStats>({
    totalFavorites: 0,
    totalMessages: 0,
    recentFavorites: [],
    recentMessages: [],
    upcomingTours: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/tenant/dashboard');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
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
      {/* Tenant Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Tenant Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/properties" className="text-gray-600 hover:text-gray-900">
                <Search className="h-5 w-5" />
              </Link>
              <Link href="/tenant/favorites" className="text-gray-600 hover:text-gray-900">
                <Heart className="h-5 w-5" />
              </Link>
              <Link href="/tenant/messages" className="text-gray-600 hover:text-gray-900">
                <MessageSquare className="h-5 w-5" />
              </Link>
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <User className="h-5 w-5" />
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
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-8 mb-8 text-white">
          <h2 className="text-3xl font-bold mb-4">Welcome to Your Dashboard</h2>
          <p className="text-lg mb-6">
            Find your perfect rental home and manage your property searches all in one place.
          </p>
          <Link
            href="/properties"
            className="bg-white text-blue-600 px-6 py-3 rounded-md font-semibold hover:bg-gray-100 inline-flex items-center"
          >
            <Search className="h-5 w-5 mr-2" />
            Browse Properties
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-100 rounded-full p-3">
                <Heart className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Saved Properties</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalFavorites}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-full p-3">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Messages</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalMessages}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-full p-3">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Tours Scheduled</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcomingTours.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-full p-3">
                <Search className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Search Activity</p>
                <p className="text-2xl font-bold text-gray-900">Active</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/properties"
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <Search className="h-6 w-6 text-gray-400 mr-2" />
              <span className="text-medium text-gray-600">Find Properties</span>
            </Link>
            <Link
              href="/tenant/favorites"
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <Heart className="h-6 w-6 text-gray-400 mr-2" />
              <span className="text-medium text-gray-600">View Favorites</span>
            </Link>
            <Link
              href="/tenant/messages"
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <MessageSquare className="h-6 w-6 text-gray-400 mr-2" />
              <span className="text-medium text-gray-600">Messages</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Favorites */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Recent Favorites</h2>
              <Link href="/tenant/favorites" className="text-blue-600 hover:text-blue-500 text-sm">
                View All
              </Link>
            </div>
            <div className="p-6">
              {stats.recentFavorites.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No favorite properties yet</p>
                  <Link
                    href="/properties"
                    className="text-blue-600 hover:text-blue-500 text-sm mt-2 inline-block"
                  >
                    Start browsing properties
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.recentFavorites.map((favorite, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg">
                      <img
                        src={favorite.property.images[0] || '/placeholder-property.jpg'}
                        alt={favorite.property.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{favorite.property.title}</h4>
                        <p className="text-sm text-gray-600">
                          ${favorite.property.rent.toLocaleString()}/month
                        </p>
                        <p className="text-xs text-gray-500">
                          {favorite.property.address.city}, {favorite.property.address.state}
                        </p>
                      </div>
                      <Link
                        href={`/properties/${favorite.property._id}`}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        View
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Messages */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Recent Messages</h2>
              <Link href="/tenant/messages" className="text-blue-600 hover:text-blue-500 text-sm">
                View All
              </Link>
            </div>
            <div className="p-6">
              {stats.recentMessages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No messages yet</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Start messaging agents about properties you're interested in
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.recentMessages.map((message, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {message.agentId.name}
                        </h4>
                        <p className="text-sm text-gray-600 truncate">
                          {message.content}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(message.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Link
                        href={`/tenant/messages/${message._id}`}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        Reply
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Tours */}
        {stats.upcomingTours.length > 0 && (
          <div className="bg-white rounded-lg shadow mt-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Tours</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {stats.upcomingTours.map((tour, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <h4 className="font-medium text-gray-900">{tour.property.title}</h4>
                        <p className="text-sm text-gray-600">
                          {new Date(tour.date).toLocaleDateString()} at {tour.time}
                        </p>
                        <p className="text-xs text-gray-500">
                          {tour.property.address.city}, {tour.property.address.state}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-700 text-sm">
                        Reschedule
                      </button>
                      <button className="text-red-600 hover:text-red-700 text-sm">
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
