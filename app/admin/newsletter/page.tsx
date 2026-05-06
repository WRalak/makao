'use client';

import { useState, useEffect } from 'react';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import { getAuthHeaders } from '@/hooks/useAdminAuth';

interface NewsletterSubscription {
  id: number;
  email: string;
  name?: string;
  status: string;
  source: string;
  preferences: any;
  created_at: string;
  updated_at: string;
  unsubscribed_at?: string;
}

export default function AdminNewsletterPage() {
  const [subscriptions, setSubscriptions] = useState<NewsletterSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSubscription, setSelectedSubscription] = useState<NewsletterSubscription | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSubscription, setNewSubscription] = useState({ email: '', name: '' });
  const [filters, setFilters] = useState({
    status: '',
    source: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...filters
      });

      const response = await fetch(`/api/admin/newsletter?${params}`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subscriptions');
      }

      const data = await response.json();
      setSubscriptions(data.subscriptions);
      setPagination(prev => ({ ...prev, ...data.pagination }));
    } catch (err) {
      setError('Failed to load newsletter subscriptions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addSubscription = async () => {
    try {
      const response = await fetch('/api/admin/newsletter', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newSubscription)
      });

      if (!response.ok) {
        throw new Error('Failed to add subscription');
      }

      setNewSubscription({ email: '', name: '' });
      setShowAddForm(false);
      await fetchSubscriptions();
    } catch (err) {
      setError('Failed to add subscription');
      console.error(err);
    }
  };

  const updateSubscription = async (id: number, status: string) => {
    try {
      const response = await fetch('/api/admin/newsletter', {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ id, status })
      });

      if (!response.ok) {
        throw new Error('Failed to update subscription');
      }

      await fetchSubscriptions();
      setSelectedSubscription(null);
    } catch (err) {
      setError('Failed to update subscription');
      console.error(err);
    }
  };

  const deleteSubscription = async (id: number) => {
    if (!confirm('Are you sure you want to delete this subscription?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/newsletter?id=${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to delete subscription');
      }

      await fetchSubscriptions();
      setSelectedSubscription(null);
    } catch (err) {
      setError('Failed to delete subscription');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [pagination.page, filters]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'unsubscribed': return 'bg-red-100 text-red-800';
      case 'bounced': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'footer': return 'bg-blue-100 text-blue-800';
      case 'blog': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-slate-900">Newsletter Subscriptions</h1>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add Subscription
                </button>
                <button
                  onClick={fetchSubscriptions}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

      {/* Filters */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-4">
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="unsubscribed">Unsubscribed</option>
              <option value="bounced">Bounced</option>
            </select>

            <select
              value={filters.source}
              onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value }))}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Sources</option>
              <option value="footer">Footer</option>
              <option value="blog">Blog</option>
              <option value="admin">Admin</option>
              <option value="popup">Popup</option>
              <option value="manual">Manual</option>
            </select>

            <input
              type="text"
              placeholder="Search by email or name..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Subscriptions List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-slate-600">Loading subscriptions...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {error}
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="text-center py-8 text-slate-600">
            No newsletter subscriptions found matching the current filters.
          </div>
        ) : (
          <div className="space-y-4">
            {subscriptions.map((subscription) => (
              <div
                key={subscription.id}
                className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-slate-900">{subscription.email}</h3>
                      {subscription.name && (
                        <span className="text-slate-600">({subscription.name})</span>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
                        {subscription.status}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSourceColor(subscription.source)}`}>
                        {subscription.source}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600">
                      <p><strong>Subscribed:</strong> {new Date(subscription.created_at).toLocaleDateString()}</p>
                      {subscription.unsubscribed_at && (
                        <p><strong>Unsubscribed:</strong> {new Date(subscription.unsubscribed_at).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => setSelectedSubscription(subscription)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <span className="material-symbols-outlined">visibility</span>
                    </button>
                    {subscription.status === 'active' ? (
                      <button
                        onClick={() => updateSubscription(subscription.id, 'unsubscribed')}
                        className="text-orange-600 hover:text-orange-800"
                        title="Unsubscribe"
                      >
                        <span className="material-symbols-outlined">unsubscribe</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => updateSubscription(subscription.id, 'active')}
                        className="text-green-600 hover:text-green-800"
                        title="Resubscribe"
                      >
                        <span className="material-symbols-outlined">subscribe</span>
                      </button>
                    )}
                    <button
                      onClick={() => deleteSubscription(subscription.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && subscriptions.length > 0 && (
          <div className="flex items-center justify-between mt-8">
            <div className="text-sm text-slate-600">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} subscriptions
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={!pagination.hasPrev}
                className="px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-2 text-slate-600">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={!pagination.hasNext}
                className="px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Subscription Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Add Subscription</h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={newSubscription.email}
                    onChange={(e) => setNewSubscription(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="email@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={newSubscription.name}
                    onChange={(e) => setNewSubscription(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="John Doe"
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addSubscription}
                  disabled={!newSubscription.email}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Subscription
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Detail Modal */}
      {selectedSubscription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Subscription Details</h2>
                <button
                  onClick={() => setSelectedSubscription(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm font-medium text-slate-700">Email</p>
                  <p className="text-slate-900">{selectedSubscription.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Name</p>
                  <p className="text-slate-900">{selectedSubscription.name || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Status</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedSubscription.status)}`}>
                    {selectedSubscription.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Source</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getSourceColor(selectedSubscription.source)}`}>
                    {selectedSubscription.source}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Subscribed</p>
                  <p className="text-slate-900">{new Date(selectedSubscription.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Unsubscribed</p>
                  <p className="text-slate-900">
                    {selectedSubscription.unsubscribed_at 
                      ? new Date(selectedSubscription.unsubscribed_at).toLocaleDateString() 
                      : 'Never'}
                  </p>
                </div>
              </div>
              {selectedSubscription.preferences && Object.keys(selectedSubscription.preferences).length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-slate-700 mb-2">Preferences</p>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <pre className="text-sm text-slate-900">
                      {JSON.stringify(selectedSubscription.preferences, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
              <div className="flex gap-4">
                {selectedSubscription.status === 'active' ? (
                  <button
                    onClick={() => updateSubscription(selectedSubscription.id, 'unsubscribed')}
                    className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Unsubscribe
                  </button>
                ) : (
                  <button
                    onClick={() => updateSubscription(selectedSubscription.id, 'active')}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Resubscribe
                  </button>
                )}
                <button
                  onClick={() => deleteSubscription(selectedSubscription.id)}
                  className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      </div>
    </AdminProtectedRoute>
  );
}
