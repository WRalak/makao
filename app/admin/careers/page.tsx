'use client';

import { useState, useEffect } from 'react';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import { getAuthHeaders } from '@/hooks/useAdminAuth';

interface JobApplication {
  id: number;
  job_title: string;
  job_type: string;
  location: string;
  applicant_name: string;
  email: string;
  phone?: string;
  resume_url?: string;
  cover_letter?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  experience_years?: number;
  current_company?: string;
  current_position?: string;
  salary_expectations?: string;
  availability?: string;
  status: string;
  created_at: string;
  updated_at: string;
  reviewed_at?: string;
  reviewed_by?: number;
  notes?: string;
}

export default function AdminCareersPage() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    jobTitle: '',
    location: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...filters
      });

      const response = await fetch(`/api/admin/careers?${params}`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }

      const data = await response.json();
      setApplications(data.applications);
      setPagination(prev => ({ ...prev, ...data.pagination }));
    } catch (err) {
      setError('Failed to load job applications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (id: number, status: string, notes?: string) => {
    try {
      const response = await fetch('/api/admin/careers', {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ id, status, notes })
      });

      if (!response.ok) {
        throw new Error('Failed to update application');
      }

      await fetchApplications();
      setSelectedApplication(null);
    } catch (err) {
      setError('Failed to update application status');
      console.error(err);
    }
  };

  const deleteApplication = async (id: number) => {
    if (!confirm('Are you sure you want to delete this application?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/careers?id=${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to delete application');
      }

      await fetchApplications();
      setSelectedApplication(null);
    } catch (err) {
      setError('Failed to delete application');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [pagination.page, filters]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received': return 'bg-blue-100 text-blue-800';
      case 'reviewing': return 'bg-yellow-100 text-yellow-800';
      case 'shortlisted': return 'bg-purple-100 text-purple-800';
      case 'interviewed': return 'bg-orange-100 text-orange-800';
      case 'offered': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'withdrawn': return 'bg-gray-100 text-gray-800';
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
              <h1 className="text-2xl font-bold text-slate-900">Job Applications</h1>
              <button
                onClick={fetchApplications}
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
              <option value="received">Received</option>
              <option value="reviewing">Reviewing</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="interviewed">Interviewed</option>
              <option value="offered">Offered</option>
              <option value="rejected">Rejected</option>
              <option value="withdrawn">Withdrawn</option>
            </select>

            <input
              type="text"
              placeholder="Search by job title..."
              value={filters.jobTitle}
              onChange={(e) => setFilters(prev => ({ ...prev, jobTitle: e.target.value }))}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="text"
              placeholder="Search by location..."
              value={filters.location}
              onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-slate-600">Loading applications...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {error}
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-8 text-slate-600">
            No job applications found matching the current filters.
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <div
                key={application.id}
                className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-slate-900">{application.job_title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                        {application.status}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600">
                      <p><strong>Applicant:</strong> {application.applicant_name} ({application.email})</p>
                      {application.phone && <p><strong>Phone:</strong> {application.phone}</p>}
                      <p><strong>Type:</strong> {application.job_type} | <strong>Location:</strong> {application.location}</p>
                      <p><strong>Applied:</strong> {new Date(application.created_at).toLocaleDateString()}</p>
                      {application.current_company && (
                        <p><strong>Current:</strong> {application.current_position} at {application.current_company}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => setSelectedApplication(application)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <span className="material-symbols-outlined">visibility</span>
                    </button>
                    <button
                      onClick={() => deleteApplication(application.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
                {application.cover_letter && (
                  <p className="text-slate-700 line-clamp-2">{application.cover_letter}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && applications.length > 0 && (
          <div className="flex items-center justify-between mt-8">
            <div className="text-sm text-slate-600">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} applications
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

      {/* Application Detail Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">
                  {selectedApplication.job_title} Application
                </h2>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-4">Applicant Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-slate-700">Name</p>
                      <p className="text-slate-900">{selectedApplication.applicant_name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">Email</p>
                      <p className="text-slate-900">{selectedApplication.email}</p>
                    </div>
                    {selectedApplication.phone && (
                      <div>
                        <p className="text-sm font-medium text-slate-700">Phone</p>
                        <p className="text-slate-900">{selectedApplication.phone}</p>
                      </div>
                    )}
                    {selectedApplication.experience_years && (
                      <div>
                        <p className="text-sm font-medium text-slate-700">Experience</p>
                        <p className="text-slate-900">{selectedApplication.experience_years} years</p>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-4">Job Details</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-slate-700">Position</p>
                      <p className="text-slate-900">{selectedApplication.job_title}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">Type</p>
                      <p className="text-slate-900">{selectedApplication.job_type}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">Location</p>
                      <p className="text-slate-900">{selectedApplication.location}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">Status</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedApplication.status)}`}>
                        {selectedApplication.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-4">Current Position</h3>
                  <div className="space-y-3">
                    {selectedApplication.current_company && (
                      <div>
                        <p className="text-sm font-medium text-slate-700">Company</p>
                        <p className="text-slate-900">{selectedApplication.current_company}</p>
                      </div>
                    )}
                    {selectedApplication.current_position && (
                      <div>
                        <p className="text-sm font-medium text-slate-700">Position</p>
                        <p className="text-slate-900">{selectedApplication.current_position}</p>
                      </div>
                    )}
                    {selectedApplication.salary_expectations && (
                      <div>
                        <p className="text-sm font-medium text-slate-700">Salary Expectations</p>
                        <p className="text-slate-900">{selectedApplication.salary_expectations}</p>
                      </div>
                    )}
                    {selectedApplication.availability && (
                      <div>
                        <p className="text-sm font-medium text-slate-700">Availability</p>
                        <p className="text-slate-900">{selectedApplication.availability}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-4">Links</h3>
                  <div className="space-y-3">
                    {selectedApplication.resume_url && (
                      <div>
                        <p className="text-sm font-medium text-slate-700">Resume</p>
                        <a 
                          href={selectedApplication.resume_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View Resume
                        </a>
                      </div>
                    )}
                    {selectedApplication.linkedin_url && (
                      <div>
                        <p className="text-sm font-medium text-slate-700">LinkedIn</p>
                        <a 
                          href={selectedApplication.linkedin_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View Profile
                        </a>
                      </div>
                    )}
                    {selectedApplication.portfolio_url && (
                      <div>
                        <p className="text-sm font-medium text-slate-700">Portfolio</p>
                        <a 
                          href={selectedApplication.portfolio_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View Portfolio
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedApplication.cover_letter && (
                <div className="mb-6">
                  <h3 className="font-semibold text-slate-900 mb-2">Cover Letter</h3>
                  <div className="bg-slate-50 rounded-lg p-4 text-slate-900 whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {selectedApplication.cover_letter}
                  </div>
                </div>
              )}

              {selectedApplication.notes && (
                <div className="mb-6">
                  <h3 className="font-semibold text-slate-900 mb-2">Notes</h3>
                  <div className="bg-slate-50 rounded-lg p-4 text-slate-900 whitespace-pre-wrap">
                    {selectedApplication.notes}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">Add Notes</label>
                <textarea
                  id="notes"
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Add notes about this application..."
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <select
                  id="status"
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  defaultValue={selectedApplication.status}
                >
                  <option value="received">Received</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="interviewed">Interviewed</option>
                  <option value="offered">Offered</option>
                  <option value="rejected">Rejected</option>
                  <option value="withdrawn">Withdrawn</option>
                </select>
                <button
                  onClick={() => {
                    const statusSelect = document.getElementById('status') as HTMLSelectElement;
                    const notesText = document.getElementById('notes') as HTMLTextAreaElement;
                    updateApplicationStatus(selectedApplication.id, statusSelect.value, notesText.value);
                  }}
                  className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update Status
                </button>
                <button
                  onClick={() => deleteApplication(selectedApplication.id)}
                  className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Application
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
