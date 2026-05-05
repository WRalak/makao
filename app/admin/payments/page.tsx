'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  DollarSign,
  Search,
  Filter,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Calendar,
  CreditCard,
  Smartphone,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Eye,
} from 'lucide-react';

interface Payment {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  spaceId?: number;
  spaceName?: string;
  propertyId?: number;
  propertyTitle?: string;
  amount: number;
  currency: string;
  paymentMethod: 'mpesa' | 'stripe' | 'cash' | 'bank_transfer';
  transactionId?: string;
  referenceNumber?: string;
  mpesaReceiptNumber?: string;
  status: 'completed' | 'failed' | 'pending' | 'refunded' | 'processing';
  category: 'subscription' | 'application_fee' | 'rent' | 'commission' | 'refund';
  description: string;
  commissionRate: number;
  commissionAmount: number;
  commissionPaid: boolean;
  refundAmount?: number;
  refundReason?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
  processedBy?: string;
}

interface RevenueStats {
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  totalRevenue: number;
  commissionEarned: number;
  pendingRefunds: number;
  failedPayments: number;
  byCurrency: {
    KES: number;
    UGX: number;
    TZS: number;
    USD: number;
  };
  byCategory: {
    subscription: number;
    application_fee: number;
    rent: number;
    commission: number;
    refund: number;
  };
  byMethod: {
    mpesa: number;
    stripe: number;
    cash: number;
    bank_transfer: number;
  };
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<RevenueStats>({
    todayRevenue: 0,
    weekRevenue: 0,
    monthRevenue: 0,
    totalRevenue: 0,
    commissionEarned: 0,
    pendingRefunds: 0,
    failedPayments: 0,
    byCurrency: { KES: 0, UGX: 0, TZS: 0, USD: 0 },
    byCategory: { subscription: 0, application_fee: 0, rent: 0, commission: 0, refund: 0 },
    byMethod: { mpesa: 0, stripe: 0, cash: 0, bank_transfer: 0 }
  });
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [currencyFilter, setCurrencyFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('30');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const router = useRouter();

  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, [pagination.page, searchTerm, statusFilter, methodFilter, categoryFilter, currencyFilter, dateRange, sortBy, sortOrder]);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: searchTerm,
        status: statusFilter,
        method: methodFilter,
        category: categoryFilter,
        currency: currencyFilter,
        dateRange,
        sortBy,
        sortOrder
      });

      const response = await fetch(`/api/admin/payments?${params}`);
      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments);
        setPagination(data.pagination);
      } else {
        // Fallback mock data
        const mockPayments: Payment[] = [
          {
            id: 1,
            userId: 1,
            userName: 'John Mwangi',
            userEmail: 'john@nairobirealtors.com',
            spaceId: 1,
            spaceName: 'Nairobi Luxury Rentals',
            amount: 3500,
            currency: 'KES',
            paymentMethod: 'mpesa',
            transactionId: 'MPESA123456',
            mpesaReceiptNumber: 'ABC123XYZ',
            status: 'completed',
            category: 'subscription',
            description: 'Pro plan monthly subscription',
            commissionRate: 0.20,
            commissionAmount: 700,
            commissionPaid: true,
            processedAt: '2026-05-01T10:30:00Z',
            createdAt: '2026-05-01T10:15:00Z',
            updatedAt: '2026-05-01T10:30:00Z',
            processedBy: 'Admin'
          },
          {
            id: 2,
            userId: 2,
            userName: 'Jane Smith',
            userEmail: 'jane@example.com',
            amount: 200,
            currency: 'KES',
            paymentMethod: 'mpesa',
            transactionId: 'MPESA789012',
            mpesaReceiptNumber: 'DEF456UVW',
            status: 'completed',
            category: 'application_fee',
            description: 'Rental application fee',
            commissionRate: 0.20,
            commissionAmount: 40,
            commissionPaid: true,
            propertyId: 1,
            propertyTitle: 'Modern 2BR Apartment in Kilimani',
            processedAt: '2026-05-02T14:20:00Z',
            createdAt: '2026-05-02T14:15:00Z',
            updatedAt: '2026-05-02T14:20:00Z',
            processedBy: 'Admin'
          },
          {
            id: 3,
            userId: 3,
            userName: 'Mike Johnson',
            userEmail: 'mike@kilimaniproperties.com',
            amount: 1500,
            currency: 'KES',
            paymentMethod: 'stripe',
            transactionId: 'STRIPE345678',
            status: 'failed',
            category: 'subscription',
            description: 'Basic plan monthly subscription',
            commissionRate: 0.20,
            commissionAmount: 300,
            commissionPaid: false,
            processedAt: '2026-05-03T09:45:00Z',
            createdAt: '2026-05-03T09:40:00Z',
            updatedAt: '2026-05-03T09:45:00Z',
            processedBy: 'Admin'
          }
        ];
        setPayments(mockPayments);
        setPagination({
          page: 1,
          limit: 20,
          total: 3,
          totalPages: 1
        });
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/payments/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        // Fallback mock stats
        setStats({
          todayRevenue: 12500,
          weekRevenue: 87500,
          monthRevenue: 450000,
          totalRevenue: 2500000,
          commissionEarned: 9000,
          pendingRefunds: 2000,
          failedPayments: 3,
          byCurrency: { KES: 2500000, UGX: 7500000, TZS: 12000000, USD: 20000 },
          byCategory: { subscription: 1800000, application_fee: 45000, rent: 200000, commission: 9000, refund: 2000 },
          byMethod: { mpesa: 2000000, stripe: 450000, cash: 50000, bank_transfer: 50000 }
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleProcessRefund = async (paymentId: number, amount: number, reason: string) => {
    if (!confirm(`Are you sure you want to refund KES ${amount.toLocaleString()}?`)) return;
    
    try {
      const response = await fetch(`/api/admin/payments/${paymentId}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, reason })
      });
      
      if (response.ok) {
        fetchPayments();
        fetchStats();
      }
    } catch (error) {
      console.error('Failed to process refund:', error);
    }
  };

  const handleExportPayments = async () => {
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        method: methodFilter,
        category: categoryFilter,
        currency: currencyFilter,
        dateRange
      });

      const response = await fetch(`/api/admin/payments/export?${params}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'payments_export.csv';
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to export payments:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'refunded': return 'bg-purple-100 text-purple-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'mpesa': return <Smartphone className="h-4 w-4" />;
      case 'stripe': return <CreditCard className="h-4 w-4" />;
      case 'cash': return <DollarSign className="h-4 w-4" />;
      case 'bank_transfer': return <TrendingUp className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'mpesa': return 'bg-green-100 text-green-800';
      case 'stripe': return 'bg-blue-100 text-blue-800';
      case 'cash': return 'bg-gray-100 text-gray-800';
      case 'bank_transfer': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payments...</p>
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
              <Link href="/admin/dashboard" className="flex items-center text-gray-700 hover:text-gray-900">
                <ChevronLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </Link>
              <h1 className="ml-4 text-xl font-bold text-gray-900">Payment & Revenue Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleExportPayments}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </button>
              <button
                onClick={() => { fetchPayments(); fetchStats(); }}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Revenue Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-full p-3">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Today's Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  KES {stats.todayRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-full p-3">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Week Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  KES {stats.weekRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-full p-3">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Month Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  KES {stats.monthRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-full p-3">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Failed Payments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.failedPayments}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Currency</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">KES</span>
                <span className="text-sm font-medium">KES {stats.byCurrency.KES.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">UGX</span>
                <span className="text-sm font-medium">UGX {stats.byCurrency.UGX.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">TZS</span>
                <span className="text-sm font-medium">TZS {stats.byCurrency.TZS.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">USD</span>
                <span className="text-sm font-medium">USD {stats.byCurrency.USD.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Category</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Subscriptions</span>
                <span className="text-sm font-medium">KES {stats.byCategory.subscription.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Application Fees</span>
                <span className="text-sm font-medium">KES {stats.byCategory.application_fee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Rent Collection</span>
                <span className="text-sm font-medium">KES {stats.byCategory.rent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Commission</span>
                <span className="text-sm font-medium">KES {stats.byCategory.commission.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">M-PESA</span>
                <span className="text-sm font-medium">KES {stats.byMethod.mpesa.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Stripe</span>
                <span className="text-sm font-medium">KES {stats.byMethod.stripe.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Cash</span>
                <span className="text-sm font-medium">KES {stats.byMethod.cash.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Bank Transfer</span>
                <span className="text-sm font-medium">KES {stats.byMethod.bank_transfer.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
              <option value="processing">Processing</option>
            </select>

            {/* Method Filter */}
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Methods</option>
              <option value="mpesa">M-PESA</option>
              <option value="stripe">Stripe</option>
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="subscription">Subscription</option>
              <option value="application_fee">Application Fee</option>
              <option value="rent">Rent</option>
              <option value="commission">Commission</option>
              <option value="refund">Refund</option>
            </select>

            {/* Date Range */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
              <option value="all">All time</option>
            </select>

            {/* Sort */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sort, order] = e.target.value.split('-');
                setSortBy(sort);
                setSortOrder(order as 'asc' | 'desc');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{payment.userName}</div>
                        <div className="text-sm text-gray-500">{payment.userEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="font-medium">{payment.description}</div>
                        {payment.spaceName && (
                          <div className="text-xs text-gray-500">Space: {payment.spaceName}</div>
                        )}
                        {payment.propertyTitle && (
                          <div className="text-xs text-gray-500">Property: {payment.propertyTitle}</div>
                        )}
                        <div className="text-xs text-gray-500">
                          {payment.transactionId && `ID: ${payment.transactionId}`}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="font-medium">
                          {payment.currency} {payment.amount.toLocaleString()}
                        </div>
                        {payment.refundAmount && (
                          <div className="text-xs text-red-600">
                            Refund: {payment.currency} {payment.refundAmount.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-6 w-6 mr-2">
                          {getMethodIcon(payment.paymentMethod)}
                        </div>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getMethodColor(payment.paymentMethod)}`}>
                          {payment.paymentMethod.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                        {payment.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>{payment.commissionRate * 100}%</div>
                        <div className="text-xs text-gray-500">
                          {payment.currency} {payment.commissionAmount.toLocaleString()}
                        </div>
                        <div className="text-xs">
                          {payment.commissionPaid ? (
                            <span className="text-green-600">Paid</span>
                          ) : (
                            <span className="text-red-600">Pending</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{new Date(payment.createdAt).toLocaleDateString()}</div>
                      <div className="text-xs">{new Date(payment.createdAt).toLocaleTimeString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="h-4 w-4" />
                        </button>
                        {payment.status === 'completed' && (
                          <button
                            onClick={() => handleProcessRefund(payment.id, payment.amount, 'Customer requested refund')}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrendingDown className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                disabled={pagination.page === pagination.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                  <span className="font-medium">{pagination.total}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <div className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    {pagination.page} of {pagination.totalPages}
                  </div>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                    disabled={pagination.page === pagination.totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
