'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores';
import { Building, TrendingUp, Users, FileText, Calendar, Plus } from 'lucide-react';
import Link from 'next/link';

export default function AgentDashboard() {
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
      name: 'Total Properties',
      value: '12',
      icon: Building,
      color: 'bg-blue-500',
      change: '+2 from last month',
      changeType: 'positive',
    },
    {
      name: 'Active Listings',
      value: '8',
      icon: TrendingUp,
      color: 'bg-green-500',
      change: '+1 from last month',
      changeType: 'positive',
    },
    {
      name: 'Total Inquiries',
      value: '45',
      icon: Users,
      color: 'bg-purple-500',
      change: '+12 from last month',
      changeType: 'positive',
    },
    {
      name: 'Pending Applications',
      value: '7',
      icon: FileText,
      color: 'bg-yellow-500',
      change: '-3 from last month',
      changeType: 'negative',
    },
  ];

  const quickActions = [
    {
      name: 'Add New Property',
      description: 'List a new property for rent',
      icon: Plus,
      href: '/agent/properties/new',
      color: 'bg-blue-600',
    },
    {
      name: 'View Properties',
      description: 'Manage your property listings',
      icon: Building,
      href: '/agent/properties',
      color: 'bg-green-600',
    },
    {
      name: 'View Applications',
      description: 'Review tenant applications',
      icon: FileText,
      href: '/agent/applications',
      color: 'bg-purple-600',
    },
    {
      name: 'Schedule Viewings',
      description: 'Manage property viewings',
      icon: Calendar,
      href: '/agent/calendar',
      color: 'bg-orange-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-gray-600">Here's what's happening with your properties today.</p>
            </div>
            <Link
              href="/agent/properties/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Link>
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
                  <p className={`text-sm ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <Link
                  key={action.name}
                  href={action.href}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className={`${action.color} rounded-lg p-2`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{action.name}</p>
                    <p className="text-xs text-gray-500">{action.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center">
                  <div className="bg-blue-100 rounded-full p-2">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">New inquiry for Modern Apartment</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">View</span>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center">
                  <div className="bg-green-100 rounded-full p-2">
                    <FileText className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">New application received</p>
                    <p className="text-xs text-gray-500">5 hours ago</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">Review</span>
              </div>
              
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center">
                  <div className="bg-purple-100 rounded-full p-2">
                    <Calendar className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Property viewing scheduled</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">View</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
