'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  Settings,
  Database,
  Shield,
  AlertTriangle,
  Download,
  RefreshCw,
  LogOut,
  BarChart3,
  Activity,
  Server,
  Globe,
  FileText,
  CreditCard,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface SuperAdminStats {
  totalUsers: {
    super_admin: number;
    admin: number;
    agent: number;
    tenant: number;
  };
  totalRevenue: {
    KES: number;
    UGX: number;
    TZS: number;
    USD: number;
    total: number;
  };
  platformHealth: {
    serverUptime: number;
    apiResponseTime: number;
    databaseConnections: number;
    errorRate: number;
    activeUsers: number;
  };
  systemSettings: {
    platformName: string;
    maintenanceMode: boolean;
    version: string;
    backupEnabled: boolean;
    cacheEnabled: boolean;
  };
  recentActivities: Array<{
    type: string;
    user: string;
    action: string;
    target: string;
    timestamp: string;
    details: string;
  }>;
  systemAlerts: Array<{
    type: 'error' | 'warning' | 'info';
    message: string;
    timestamp: string;
    resolved: boolean;
  }>;
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<SuperAdminStats>({
    totalUsers: { super_admin: 1, admin: 3, agent: 45, tenant: 1250 },
    totalRevenue: { KES: 2500000, UGX: 7500000, TZS: 12000000, USD: 20000, total: 2500000 },
    platformHealth: {
      serverUptime: 99.9,
      apiResponseTime: 145,
      databaseConnections: 3,
      errorRate: 0.1,
      activeUsers: 67
    },
    systemSettings: {
      platformName: 'Makao',
      maintenanceMode: false,
      version: '1.0.0',
      backupEnabled: true,
      cacheEnabled: true
    },
    recentActivities: [],
    systemAlerts: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/super-admin/dashboard');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      } else {
        throw new Error('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      alert('Failed to load dashboard data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout');
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      router.push('/login');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Super Admin Navigation */}
      <nav className="bg-red-600 text-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 mr-3" />
              <h1 className="text-xl font-bold">SUPER ADMIN</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/super-admin/users" className="hover:bg-red-700 px-3 py-2 rounded-md">
                Users
              </Link>
              <Link href="/super-admin/settings" className="hover:bg-red-700 px-3 py-2 rounded-md">
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center hover:bg-red-700 px-3 py-2 rounded-md"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalUsers.super_admin + stats.totalUsers.admin + stats.totalUsers.agent + stats.totalUsers.tenant}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
                <p className="text-2xl font-bold text-gray-900">KES {stats.totalRevenue.KES.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Server className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Server Uptime</h3>
                <p className="text-2xl font-bold text-gray-900">{stats.platformHealth.serverUptime}%</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
                <p className="text-2xl font-bold text-gray-900">{stats.platformHealth.activeUsers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* User Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">User Breakdown</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Super Admins</span>
                  <span className="text-sm font-bold text-gray-900">{stats.totalUsers.super_admin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Admins</span>
                  <span className="text-sm font-bold text-gray-900">{stats.totalUsers.admin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Agents</span>
                  <span className="text-sm font-bold text-gray-900">{stats.totalUsers.agent}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Tenants</span>
                  <span className="text-sm font-bold text-gray-900">{stats.totalUsers.tenant}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Platform Health</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">API Response Time</span>
                  <span className="text-sm font-bold text-gray-900">{stats.platformHealth.apiResponseTime}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Database Connections</span>
                  <span className="text-sm font-bold text-gray-900">{stats.platformHealth.databaseConnections}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Error Rate</span>
                  <span className="text-sm font-bold text-gray-900">{stats.platformHealth.errorRate}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">System Status</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900">All Systems Operational</h4>
                <p className="text-sm text-gray-500">Platform running normally</p>
              </div>
              <div className="text-center">
                <Globe className="h-12 w-12 text-blue-500 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900">Global Reach</h4>
                <p className="text-sm text-gray-500">Serving East Africa</p>
              </div>
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-purple-500 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900">Growing Fast</h4>
                <p className="text-sm text-gray-500">1250+ active users</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
