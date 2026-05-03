'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  DollarSign,
  Home,
  TrendingUp,
  UserCheck,
  AlertCircle,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';

interface DashboardStats {
  totalRevenue: number;
  activeAgents: number;
  totalTenants: number;
  pendingProperties: number;
  totalProperties: number;
  recentPayments: any[];
  userGrowth: any[];
  popularCities: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    activeAgents: 0,
    totalTenants: 0,
    pendingProperties: 0,
    totalProperties: 0,
    recentPayments: [],
    userGrowth: [],
    popularCities: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard');
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
      {/* Admin Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
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
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-full p-3">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.totalRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-full p-3">
                <UserCheck className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Agents</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeAgents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-full p-3">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Tenants</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTenants}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-full p-3">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Properties</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingProperties}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trends</h2>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <BarChart3 className="h-12 w-12" />
              <span className="ml-2">Revenue chart will be displayed here</span>
            </div>
          </div>

          {/* User Growth */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h2>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <TrendingUp className="h-12 w-12" />
              <span className="ml-2">User growth chart will be displayed here</span>
            </div>
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Payments</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentPayments.map((payment, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.agentName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {payment.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${payment.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${payment.commissionAmount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Popular Cities */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Popular Cities</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.popularCities.map((city, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Home className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">{city.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">{city.propertyCount} properties</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
