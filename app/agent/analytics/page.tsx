'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores';
import { TrendingUp, TrendingDown, Eye, Users, Home, DollarSign } from 'lucide-react';

export default function AgentAnalytics() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    if (user?.role !== 'agent') {
      router.push('/unauthorized');
      return;
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== 'agent') {
    return <div>Loading...</div>;
  }

  const stats = [
    {
      name: 'Total Views',
      value: '1,234',
      change: '+12.5%',
      changeType: 'positive',
      icon: Eye,
      color: 'bg-blue-500'
    },
    {
      name: 'Total Inquiries',
      value: '89',
      change: '+8.2%',
      changeType: 'positive',
      icon: Users,
      color: 'bg-green-500'
    },
    {
      name: 'Properties Listed',
      value: '12',
      change: '+2',
      changeType: 'positive',
      icon: Home,
      color: 'bg-purple-500'
    },
    {
      name: 'Revenue Generated',
      value: 'KES 450,000',
      change: '+18.7%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'bg-yellow-500'
    }
  ];

  const performanceData = [
    { month: 'Jan', views: 120, inquiries: 15, conversions: 3 },
    { month: 'Feb', views: 145, inquiries: 18, conversions: 4 },
    { month: 'Mar', views: 167, inquiries: 22, conversions: 5 },
    { month: 'Apr', views: 189, inquiries: 25, conversions: 6 },
    { month: 'May', views: 210, inquiries: 28, conversions: 7 },
    { month: 'Jun', views: 234, inquiries: 32, conversions: 8 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600">Track your property performance and business metrics</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`${stat.color} rounded-lg p-3`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  <div className="flex items-center">
                    {stat.changeType === 'positive' ? (
                      <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                    )}
                    <p className={`text-sm ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Performance Chart */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Performance Overview</h2>
            <p className="text-sm text-gray-600">Monthly performance metrics</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {performanceData.map((data) => (
                <div key={data.month} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{data.month}</span>
                      <span className="text-sm text-gray-600">{data.views} views</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(data.views / 234) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="text-sm text-gray-600">{data.inquiries} inquiries</p>
                    <p className="text-sm font-medium text-gray-900">{data.conversions} conversions</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Performing Properties */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Top Performing Properties</h2>
            <p className="text-sm text-gray-600">Properties with the most engagement</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[
                {
                  title: 'Modern 3BR Apartment in Kilimani',
                  views: 234,
                  inquiries: 32,
                  status: 'active'
                },
                {
                  title: 'Cozy Studio in Westlands',
                  views: 189,
                  inquiries: 25,
                  status: 'active'
                },
                {
                  title: 'Luxury 2BR with Garden View',
                  views: 156,
                  inquiries: 18,
                  status: 'rented'
                }
              ].map((property, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{property.title}</h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-gray-600">{property.views} views</span>
                      <span className="text-sm text-gray-600">{property.inquiries} inquiries</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        property.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {property.status}
                      </span>
                    </div>
                  </div>
                  <button className="text-sm text-blue-600 hover:text-blue-800">
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
