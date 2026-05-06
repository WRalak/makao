'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { dashboardApi } from '@/lib/api-client';
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
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<string>('');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('7d');

  useEffect(() => {
    fetchDashboardData();
    
    // Set up periodic refresh for real-time updates
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      
      // Fetch dashboard data using API client
      const dashboardResponse = await dashboardApi.getDashboardData(selectedTimeRange);
      
      if (dashboardResponse.error) {
        throw new Error(dashboardResponse.error);
      }

      const data = dashboardResponse.data as any;

      // Set stats from API - using the correct field names from backend
      setStats({
        totalProperties: data.totalProperties || 0,
        activeListings: data.activeProperties || 0,
        totalViews: data.totalViews || 0,
        newMessages: data.totalMessages || 0,
        monthlyViews: data.totalViews || 0, // Using totalViews as monthlyViews for now
        averageResponseTime: '2 hours', // Not provided by backend yet
        conversionRate: 12.5, // Not provided by backend yet
        monthlyRevenue: 850000, // Not provided by backend yet
      });

      // Transform API properties to component format
      const transformedProperties = (data.recentProperties || []).map((prop: any) => ({
        _id: prop._id,
        title: prop.title,
        address: { 
          city: prop.address?.city || 'Unknown', 
          state: prop.address?.state || 'Unknown' 
        },
        rent: 0, // Not provided by backend yet
        views: prop.views || 0,
        inquiries: prop.messagesCount || 0,
        status: prop.status,
        createdAt: prop.createdAt,
      }));

      setRecentProperties(transformedProperties);

      // Fetch recent messages separately using API client
      try {
        const { messageApi } = await import('@/lib/api-client');
        const messagesResponse = await messageApi.getConversations();
        
        if (messagesResponse.data && Array.isArray(messagesResponse.data)) {
          const transformedMessages = messagesResponse.data.slice(0, 5).map((msg: any) => ({
            _id: msg._id || msg.conversationId,
            senderName: 'Unknown Sender', // Not provided in conversations endpoint
            senderEmail: '',
            propertyTitle: 'Unknown Property',
            message: msg.lastMessage || '',
            createdAt: msg.lastMessageDate,
            read: msg.unreadCount === 0
          }));
          setRecentMessages(transformedMessages);
        }
      } catch (messageError) {
        console.error('Failed to fetch messages:', messageError);
        setRecentMessages([]);
      }

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      
      // Check if it's an authentication error
      if (error instanceof Error && error.message.includes('Authentication')) {
        setError('Authentication required. Please log in again.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
        return;
      }
      
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
      
      // Fallback to sample data if API fails
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
          title: 'Luxury Karen Villa',
          address: { city: 'Nairobi', state: 'Kenya' },
          rent: 250000,
          views: 412,
          inquiries: 15,
          status: 'available',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        }
      ]);
      setRecentMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const upcomingTours = useMemo(() => [
    { date: '25', month: 'Oct', title: 'Grandview - Penthouse Tour', time: '10:30 AM', name: 'Alice Thompson' },
    { date: '25', month: 'Oct', title: 'Metro Suites - Studio Walkthrough', time: '2:15 PM', name: 'Kevin Zhao' },
    { date: '26', month: 'Oct', title: 'Urban Palms - 2BR Viewing', time: '11:00 AM', name: 'Maria Garcia' }
  ], []);

  // Set current date on mount
  useEffect(() => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    setCurrentDate(today.toLocaleDateString('en-US', options));
  }, []);

  // Memoized chart heights for performance
  const chartHeights = useMemo(() => ['h-3/4', 'h-2/3', 'h-5/6', 'h-2/5', 'h-1/2'], []);

  const handleTimeRangeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTimeRange(e.target.value);
    // Refetch data when time range changes
    fetchDashboardData();
  }, []);

  return (
    <div className="bg-[#f9f9ff] font-['Plus_Jakarta_Sans'] text-[#151c27] min-h-screen flex">
      {/* Material Symbols Styles */}
      <style jsx global>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          vertical-align: middle;
        }
        .chart-bar { transition: height 0.3s ease; }
        .glass-effect { backdrop-filter: blur(8px); background: rgba(255, 255, 255, 0.8); }
      `}</style>

      {/* SideNavBar Component */}
      <aside className="flex flex-col h-screen sticky top-0 p-4 gap-2 w-64 border-r bg-slate-50 border-slate-200">
        <div className="mb-8 px-2">
          <span className="text-2xl font-bold text-[#00236f]">Makao</span>
          <p className="text-xs text-[#757682] mt-1">East Africa's Premier Rental Platform</p>
        </div>
        <div className="flex items-center gap-3 p-3 mb-6 bg-white rounded-xl shadow-sm border border-slate-100">
          <img 
            alt="Sarah Jenkins" 
            className="w-10 h-10 rounded-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAj0BjLRnRIYlhX1FC9NzM9PrsdSx0oXmtUv4EDXFADBdwqLV5ZBpNVwN13VFkDUbv7kc7hZATeKdi_RtO76JguSpWy3Emimrmk1iPhreoPjlZitPpMakrgptpJlaNTUqCxrnZx4E7OWr6R0liwWErOdTW3RbHJnKVNrcp7k_tgVuHLkQECfQQ-YapO4sp0MQ7Sy1s9OtdjdQB52KffpGDeSAfSoU2l-IuwWOou89-Le-Dp3k0L_0zeMJfAZsqpj-YSuvghzaAJUHA" 
          />
          <div className="flex flex-col">
            <span className="text-[14px] leading-[1.2] font-semibold text-[#00236f]">Sarah Jenkins</span>
            <span className="text-[12px] leading-[1.2] font-medium text-[#757682]">Real Estate Agent</span>
          </div>
        </div>
        <nav className="flex-1 space-y-1">
          <Link href="#" className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-[#00236f] font-bold rounded-lg transition-all duration-200 ease-in-out">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-sm">Dashboard</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 transition-all duration-200 ease-in-out">
            <span className="material-symbols-outlined">home</span>
            <span className="text-sm">My Properties</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 transition-all duration-200 ease-in-out">
            <span className="material-symbols-outlined">people</span>
            <span className="text-sm">Tenant Inquiries</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 transition-all duration-200 ease-in-out">
            <span className="material-symbols-outlined">analytics</span>
            <span className="text-sm">Property Analytics</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 transition-all duration-200 ease-in-out">
            <span className="material-symbols-outlined">payments</span>
            <span className="text-sm">Subscription</span>
          </Link>
        </nav>
        <div className="mt-auto space-y-1 pt-4 border-t border-slate-200">
          <div className="p-4 bg-[#1e3a8a] text-[#90a8ff] rounded-xl mb-4">
            <p className="text-[12px] leading-[1.2] font-medium mb-2 opacity-80">Property Listings</p>
            <div className="flex items-end justify-between mb-1">
              <span className="text-[14px] leading-[1.2] font-semibold text-white">42/50 Properties</span>
              <span className="text-[12px] leading-[1.2] font-medium text-blue-200">84%</span>
            </div>
            <div className="w-full bg-blue-900/40 rounded-full h-1.5">
              <div className="bg-[#6ffbbe] h-1.5 rounded-full" style={{ width: '84%' }}></div>
            </div>
            <button className="w-full mt-4 bg-white text-[#00236f] text-[14px] leading-[1.2] font-semibold py-2 rounded-lg hover:bg-blue-50 transition-colors">Upgrade Plan</button>
          </div>
          <Link href="#" className="flex items-center gap-3 px-4 py-2 text-slate-600 hover:bg-slate-100 transition-all">
            <span className="material-symbols-outlined">settings</span>
            <span className="text-sm">Settings</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-2 text-slate-600 hover:bg-slate-100 transition-all">
            <span className="material-symbols-outlined">help</span>
            <span className="text-sm">Support</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-amber-600 material-symbols-outlined">info</span>
              <div>
                <p className="text-amber-800 font-medium">Connection temporarily unavailable</p>
                <p className="text-amber-600 text-sm mt-1">Showing sample data. Your dashboard will update automatically when connection is restored.</p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-[40px] leading-[1.2] font-bold text-[#00236f]">Welcome to Makao, Sarah</h1>
            <p className="text-[18px] leading-[1.6] font-normal text-[#757682]">Manage your East African rental properties and grow your business • {currentDate}</p>
          </div>
          <div className="flex gap-4">
            <select 
              value={selectedTimeRange}
              onChange={handleTimeRangeChange}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-[#c5c5d3] rounded-lg text-[14px] leading-[1.2] font-semibold text-[#151c27] hover:shadow-md transition-all"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 3 months</option>
              <option value="365d">Last year</option>
            </select>
            <button className="flex items-center gap-2 px-6 py-2 bg-white border border-[#c5c5d3] rounded-lg text-[14px] leading-[1.2] font-semibold text-[#151c27] hover:shadow-md transition-all">
              <span className="material-symbols-outlined">filter_list</span>
              Filter View
            </button>
            <button className="flex items-center gap-2 px-6 py-2 bg-[#00236f] text-white rounded-lg text-[14px] leading-[1.2] font-semibold shadow-lg hover:opacity-90 transition-all">
              <span className="material-symbols-outlined">add</span>
              List Property
            </button>
          </div>
        </header>

        {/* Metrics Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Views */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-[0px_4px_20px_rgba(30,58,138,0.08)] transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-50 text-[#00236f] rounded-lg">
                <Eye className="h-5 w-5" />
              </div>
              <span className="text-xs text-slate-500">+12.5%</span>
            </div>
            <h3 className="text-3xl font-bold text-[#151c27] mb-1">
              {isLoading ? (
                <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
              ) : (
                stats.totalViews.toLocaleString()
              )}
            </h3>
            <p className="text-base text-slate-500 font-medium">Total Property Views</p>
          </div>

          {/* Active Listings */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-[0px_4px_20px_rgba(30,58,138,0.08)] transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                <Building className="h-5 w-5" />
              </div>
              <span className="text-xs text-slate-500">+8.2%</span>
            </div>
            <h3 className="text-3xl font-bold text-[#151c27] mb-1">
              {isLoading ? (
                <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
              ) : (
                stats.activeListings
              )}
            </h3>
            <p className="text-base text-slate-500 font-medium">Active Properties</p>
          </div>

          {/* New Messages */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-[0px_4px_20px_rgba(30,58,138,0.08)] transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <MessageSquare className="h-5 w-5" />
              </div>
              <span className="text-xs text-slate-500">+24.1%</span>
            </div>
            <h3 className="text-3xl font-bold text-[#151c27] mb-1">
              {isLoading ? (
                <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
              ) : (
                stats.newMessages
              )}
            </h3>
            <p className="text-base text-slate-500 font-medium">Tenant Inquiries</p>
          </div>

          {/* Monthly Revenue */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-[0px_4px_20px_rgba(30,58,138,0.08)] transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
                <DollarSign className="h-5 w-5" />
              </div>
              <span className="text-xs text-slate-500">+18.7%</span>
            </div>
            <h3 className="text-3xl font-bold text-[#151c27] mb-1">
              {isLoading ? (
                <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
              ) : (
                `KES ${stats.monthlyRevenue.toLocaleString()}`
              )}
            </h3>
            <p className="text-base text-slate-500 font-medium">Monthly Rental Income</p>
          </div>
        </section>

      {/* Quick Actions */}
      <div className="mt-8">
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-xl font-bold text-[#00236f] mb-6">Makao Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link
              href="/agent/properties/new"
              className="flex items-center justify-center p-6 border-2 border-blue-200 rounded-xl hover:bg-blue-50 hover:border-blue-400 transition-all group"
            >
              <Plus className="h-6 w-6 mr-3 text-blue-600 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-base">List Property</span>
            </Link>
            <Link
              href="/agent/schedule"
              className="flex items-center justify-center p-6 border-2 border-green-200 rounded-xl hover:bg-green-50 hover:border-green-400 transition-all group"
            >
              <Calendar className="h-6 w-6 mr-3 text-green-600 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-base">Viewings</span>
            </Link>
            <Link
              href="/agent/analytics"
              className="flex items-center justify-center p-6 border-2 border-purple-200 rounded-xl hover:bg-purple-50 hover:border-purple-400 transition-all group"
            >
              <TrendingUp className="h-6 w-6 mr-3 text-purple-600 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-base">Analytics</span>
            </Link>
            <Link
              href="/agent/settings"
              className="flex items-center justify-center p-6 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all group"
            >
              <Settings className="h-6 w-6 mr-3 text-gray-600 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-base">Settings</span>
            </Link>
          </div>
        </div>
      </div>
      </main>
    </div>
  );
}
