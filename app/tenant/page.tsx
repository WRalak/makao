'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Home,
  Search,
  Heart,
  Calendar,
  MessageSquare,
  User,
  Settings,
  LogOut,
  MapPin,
  Bed,
  Bath,
  Star
} from 'lucide-react';

interface Property {
  id: string;
  title: string;
  address: {
    street: string;
    city: string;
    state: string;
  };
  rent: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  images: string[];
  featured: boolean;
  createdAt: string;
}

interface SavedProperty extends Property {
  savedAt: string;
}

export default function TenantDashboard() {
  const [user, setUser] = useState<any>(null);
  const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'tenant') {
      router.push('/login');
      return;
    }

    setUser(parsedUser);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch saved properties
      const savedResponse = await fetch('/api/user/saved-properties');
      if (savedResponse.ok) {
        const savedData = await savedResponse.json();
        setSavedProperties(savedData.properties || []);
      }

      // Set recent searches (mock data for now)
      setRecentSearches([
        '2 bedroom apartments in Nairobi',
        'Houses with parking in Westlands',
        'Pet-friendly rentals in Kilimani'
      ]);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
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
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <Home className="h-6 w-6 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">Makao</span>
              </Link>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/properties" className="text-gray-700 hover:text-blue-600">
                Browse Properties
              </Link>
              <Link href="/agents" className="text-gray-700 hover:text-blue-600">
                Find Agents
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <p className="text-sm text-gray-900 font-medium">{user?.name}</p>
                <p className="text-sm text-gray-500">Tenant</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
          <p className="text-sm text-gray-600 mt-2">Manage your property search and saved listings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Saved Properties */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Saved Properties</h2>
                <Link href="/properties?saved=true" className="text-blue-600 hover:text-blue-700 text-sm">
                  View all
                </Link>
              </div>
              {savedProperties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedProperties.slice(0, 4).map((property) => (
                    <div key={property.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                      <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                        {property.images[0] && (
                          <img
                            src={property.images[0]}
                            alt={property.title}
                            className="w-full h-48 object-cover"
                          />
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900">{property.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{property.address.city}, {property.address.state}</p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-lg font-bold text-blue-600">KES {property.rent.toLocaleString()}/mo</p>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Bed className="h-4 w-4" />
                            <span>{property.bedrooms}</span>
                            <Bath className="h-4 w-4" />
                            <span>{property.bathrooms}</span>
                          </div>
                        </div>
                        <div className="mt-3">
                          <Link
                            href={`/properties/${property.id}`}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            View Details →
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                  <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No saved properties yet</h3>
                  <p className="text-sm text-gray-600 mb-4">Start browsing and save properties you're interested in</p>
                  <Link
                    href="/properties"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Browse Properties
                  </Link>
                </div>
              )}
            </section>

            {/* Recent Searches */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Searches</h2>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="space-y-3">
                  {recentSearches.map((search, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Search className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-700">{search}</span>
                      </div>
                      <Link
                        href={`/properties?search=${encodeURIComponent(search)}`}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        Search again
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="space-y-3">
                  <Link
                    href="/properties"
                    className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50"
                  >
                    <Search className="h-5 w-5" />
                    <span>Search Properties</span>
                  </Link>
                  <Link
                    href="/agents"
                    className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50"
                  >
                    <User className="h-5 w-5" />
                    <span>Find Agents</span>
                  </Link>
                  <Link
                    href="/tours"
                    className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50"
                  >
                    <Calendar className="h-5 w-5" />
                    <span>My Tours</span>
                  </Link>
                  <Link
                    href="/messages"
                    className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50"
                  >
                    <MessageSquare className="h-5 w-5" />
                    <span>Messages</span>
                  </Link>
                </div>
              </div>
            </section>

            {/* Account Settings */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Account</h2>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="space-y-3">
                  <Link
                    href="/profile"
                    className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50"
                  >
                    <User className="h-5 w-5" />
                    <span>Profile Settings</span>
                  </Link>
                  <Link
                    href="/preferences"
                    className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50"
                  >
                    <Settings className="h-5 w-5" />
                    <span>Preferences</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 w-full text-left"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
