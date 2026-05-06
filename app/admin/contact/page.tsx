'use client';

import { useState, useEffect } from 'react';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import { getAuthHeaders } from '@/hooks/useAdminAuth';

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
  responded_at?: string;
  responded_by?: number;
}

export default function AdminContactPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...filters
      });

      const response = await fetch(`/api/admin/contact?${params}`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      setMessages(data.messages);
      setPagination(prev => ({ ...prev, ...data.pagination }));
    } catch (err) {
      setError('Failed to load contact messages');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateMessageStatus = async (id: number, status: string) => {
    try {
      const response = await fetch('/api/admin/contact', {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ id, status })
      });

      if (!response.ok) {
        throw new Error('Failed to update message');
      }

      await fetchMessages();
    } catch (err) {
      setError('Failed to update message status');
      console.error(err);
    }
  };

  const deleteMessage = async (id: number) => {
    if (!confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/contact?id=${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to delete message');
      }

      await fetchMessages();
      setSelectedMessage(null);
    } catch (err) {
      setError('Failed to delete message');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [pagination.page, filters]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-green-100 text-green-800';
      case 'read': return 'bg-blue-100 text-blue-800';
      case 'responded': return 'bg-purple-100 text-purple-800';
      case 'resolved': return 'bg-gray-100 text-gray-800';
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
              <h1 className="text-2xl font-bold text-slate-900">Contact Messages</h1>
              <button
                onClick={fetchMessages}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh
              </button>
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
              <option value="new">New</option>
              <option value="read">Read</option>
              <option value="responded">Responded</option>
              <option value="resolved">Resolved</option>
            </select>

            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              <option value="general">General</option>
              <option value="support">Support</option>
              <option value="partnership">Partnership</option>
              <option value="feedback">Feedback</option>
            </select>

            <select
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-slate-600">Loading messages...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {error}
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-slate-600">
            No contact messages found matching the current filters.
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-slate-900">{message.subject}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(message.priority)}`}>
                        {message.priority}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
                        {message.status}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600">
                      <p><strong>From:</strong> {message.name} ({message.email})</p>
                      {message.phone && <p><strong>Phone:</strong> {message.phone}</p>}
                      <p><strong>Category:</strong> {message.category}</p>
                      <p><strong>Date:</strong> {new Date(message.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => setSelectedMessage(message)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <span className="material-symbols-outlined">visibility</span>
                    </button>
                    {message.status !== 'responded' && (
                      <button
                        onClick={() => updateMessageStatus(message.id, 'responded')}
                        className="text-green-600 hover:text-green-800"
                      >
                        <span className="material-symbols-outlined">check</span>
                      </button>
                    )}
                    <button
                      onClick={() => deleteMessage(message.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
                <p className="text-slate-700 line-clamp-2">{message.message}</p>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && messages.length > 0 && (
          <div className="flex items-center justify-between mt-8">
            <div className="text-sm text-slate-600">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} messages
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

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">{selectedMessage.subject}</h2>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm font-medium text-slate-700">Name</p>
                  <p className="text-slate-900">{selectedMessage.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Email</p>
                  <p className="text-slate-900">{selectedMessage.email}</p>
                </div>
                {selectedMessage.phone && (
                  <div>
                    <p className="text-sm font-medium text-slate-700">Phone</p>
                    <p className="text-slate-900">{selectedMessage.phone}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-slate-700">Category</p>
                  <p className="text-slate-900">{selectedMessage.category}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Priority</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedMessage.priority)}`}>
                    {selectedMessage.priority}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Status</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedMessage.status)}`}>
                    {selectedMessage.status}
                  </span>
                </div>
              </div>
              <div className="mb-6">
                <p className="text-sm font-medium text-slate-700 mb-2">Message</p>
                <div className="bg-slate-50 rounded-lg p-4 text-slate-900 whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>
              <div className="flex gap-4">
                {selectedMessage.status !== 'responded' && (
                  <button
                    onClick={() => {
                      updateMessageStatus(selectedMessage.id, 'responded');
                      setSelectedMessage(null);
                    }}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Mark as Responded
                  </button>
                )}
                <button
                  onClick={() => {
                    deleteMessage(selectedMessage.id);
                  }}
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
