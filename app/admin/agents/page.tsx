'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Eye,
  Download,
  Search,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Phone,
  Mail,
  Building,
  CreditCard,
} from 'lucide-react';

interface AgentRequest {
  id: number;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  registrationNumber?: string;
  experienceYears: number;
  licenseNumber: string;
  idNumber: string;
  spaceName: string;
  spaceDescription: string;
  plan: 'basic' | 'pro' | 'enterprise';
  monthlyFee: number;
  propertyLimit: number;
  status: 'pending' | 'approved' | 'rejected' | 'hold';
  documents: Array<{
    type: string;
    url: string;
    filename: string;
    uploadedAt: string;
  }>;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  adminNotes?: string;
  verificationStatus: {
    businessRegistration: boolean;
    taxCompliance: boolean;
    professionalLicense: boolean;
    bankAccount: boolean;
    idVerification: boolean;
    backgroundCheck: boolean;
    phoneVerification: boolean;
  };
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminAgentsPage() {
  const [requests, setRequests] = useState<AgentRequest[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<AgentRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchRequests();
  }, [pagination.page, searchTerm, statusFilter, planFilter]);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: searchTerm,
        status: statusFilter,
        plan: planFilter
      });

      const response = await fetch(`/api/admin/agents/pending?${params}`);
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests);
        setPagination(data.pagination);
      } else {
        // Fallback mock data
        const mockRequests: AgentRequest[] = [
          {
            id: 1,
            name: 'John Mwangi',
            email: 'john@nairobirealtors.com',
            phone: '+254712345678',
            companyName: 'Nairobi Luxury Rentals',
            registrationNumber: 'BN/REG/2023/1234',
            experienceYears: 5,
            licenseNumber: 'REB/2023/5678',
            idNumber: '12345678',
            spaceName: 'Nairobi Luxury Rentals',
            spaceDescription: 'Premium real estate agency specializing in luxury properties in Nairobi',
            plan: 'pro',
            monthlyFee: 3500,
            propertyLimit: 50,
            status: 'pending',
            documents: [
              { type: 'business_registration', url: '/docs/cert1.pdf', filename: 'business_registration.pdf', uploadedAt: '2026-05-01T10:00:00Z' },
              { type: 'tax_compliance', url: '/docs/cert2.pdf', filename: 'tax_compliance.pdf', uploadedAt: '2026-05-01T10:05:00Z' },
              { type: 'professional_license', url: '/docs/license.pdf', filename: 'professional_license.pdf', uploadedAt: '2026-05-01T10:10:00Z' }
            ],
            submittedAt: '2026-05-01T10:00:00Z',
            verificationStatus: {
              businessRegistration: true,
              taxCompliance: true,
              professionalLicense: true,
              bankAccount: true,
              idVerification: true,
              backgroundCheck: true,
              phoneVerification: true
            }
          },
          {
            id: 2,
            name: 'Sarah Kamau',
            email: 'sarah@kilimaniproperties.com',
            phone: '+254723456789',
            companyName: 'Kilimani Properties',
            registrationNumber: 'BN/REG/2023/5678',
            experienceYears: 3,
            licenseNumber: 'REB/2023/9012',
            idNumber: '87654321',
            spaceName: 'Kilimani Properties',
            spaceDescription: 'Specializing in residential properties in Kilimani and surrounding areas',
            plan: 'basic',
            monthlyFee: 1500,
            propertyLimit: 10,
            status: 'pending',
            documents: [
              { type: 'business_registration', url: '/docs/cert3.pdf', filename: 'business_registration.pdf', uploadedAt: '2026-05-02T14:00:00Z' },
              { type: 'tax_compliance', url: '/docs/cert4.pdf', filename: 'tax_compliance.pdf', uploadedAt: '2026-05-02T14:05:00Z' }
            ],
            submittedAt: '2026-05-02T14:00:00Z',
            verificationStatus: {
              businessRegistration: true,
              taxCompliance: false,
              professionalLicense: true,
              bankAccount: true,
              idVerification: true,
              backgroundCheck: true,
              phoneVerification: true
            }
          }
        ];
        setRequests(mockRequests);
        setPagination({
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1
        });
      }
    } catch (error) {
      console.error('Failed to fetch agent requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveRequest = async (requestId: number, notes?: string) => {
    try {
      const response = await fetch(`/api/admin/agents/${requestId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      });
      
      if (response.ok) {
        fetchRequests();
        setShowDetailModal(false);
      }
    } catch (error) {
      console.error('Failed to approve request:', error);
    }
  };

  const handleRejectRequest = async (requestId: number, reason: string) => {
    try {
      const response = await fetch(`/api/admin/agents/${requestId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      
      if (response.ok) {
        fetchRequests();
        setShowDetailModal(false);
      }
    } catch (error) {
      console.error('Failed to reject request:', error);
    }
  };

  const handleRequestDocuments = async (requestId: number) => {
    try {
      const response = await fetch(`/api/admin/agents/${requestId}/documents`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `agent_documents_${requestId}.zip`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to download documents:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'hold': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanDetails = (plan: string) => {
    switch (plan) {
      case 'basic': return { fee: 1500, limit: 10, color: 'bg-blue-100 text-blue-800' };
      case 'pro': return { fee: 3500, limit: 50, color: 'bg-purple-100 text-purple-800' };
      case 'enterprise': return { fee: 10000, limit: 999, color: 'bg-green-100 text-green-800' };
      default: return { fee: 0, limit: 0, color: 'bg-gray-100 text-gray-800' };
    }
  };

  const getVerificationIcon = (verified: boolean) => {
    return verified ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading agent requests...</p>
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
              <h1 className="ml-4 text-xl font-bold text-gray-900">Agent Request Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchRequests}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search agents..."
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
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="hold">On Hold</option>
              <option value="all">All Status</option>
            </select>

            {/* Plan Filter */}
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Plans</option>
              <option value="basic">Basic</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>

            {/* Quick Stats */}
            <div className="flex items-center justify-center bg-blue-50 rounded-lg p-2">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-900">{requests.length}</div>
                <div className="text-xs text-blue-700">Total Requests</div>
              </div>
            </div>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documents
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verification
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((request) => {
                  const planDetails = getPlanDetails(request.plan);
                  return (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <Users className="h-6 w-6 text-gray-400" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{request.name}</div>
                            <div className="text-sm text-gray-500">{request.email}</div>
                            <div className="text-xs text-gray-500 flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {request.phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="font-medium">{request.companyName}</div>
                          {request.registrationNumber && (
                            <div className="text-xs text-gray-500">Reg: {request.registrationNumber}</div>
                          )}
                          <div className="text-xs text-gray-500">{request.experienceYears} years exp.</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${planDetails.color}`}>
                            {request.plan.toUpperCase()}
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            KES {planDetails.fee.toLocaleString()}/mo
                          </div>
                          <div className="text-xs text-gray-500">
                            {planDetails.limit} properties
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="font-medium">{request.documents.length} files</div>
                          <button
                            onClick={() => handleRequestDocuments(request.id)}
                            className="text-blue-600 hover:text-blue-900 text-xs flex items-center"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="grid grid-cols-2 gap-1">
                          <div className="flex items-center text-xs">
                            {getVerificationIcon(request.verificationStatus.businessRegistration)}
                            <span className="ml-1">Business</span>
                          </div>
                          <div className="flex items-center text-xs">
                            {getVerificationIcon(request.verificationStatus.taxCompliance)}
                            <span className="ml-1">Tax</span>
                          </div>
                          <div className="flex items-center text-xs">
                            {getVerificationIcon(request.verificationStatus.professionalLicense)}
                            <span className="ml-1">License</span>
                          </div>
                          <div className="flex items-center text-xs">
                            {getVerificationIcon(request.verificationStatus.bankAccount)}
                            <span className="ml-1">Bank</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.status)}`}>
                          {request.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{new Date(request.submittedAt).toLocaleDateString()}</div>
                        <div className="text-xs">{new Date(request.submittedAt).toLocaleTimeString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowDetailModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {request.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApproveRequest(request.id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleRejectRequest(request.id, 'Incomplete documentation')}
                                className="text-red-600 hover:text-red-900"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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

        {/* Detail Modal */}
        {showDetailModal && selectedRequest && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Agent Request Details</h2>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                {/* Agent Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Agent Information</h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Users className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="font-medium">{selectedRequest.name}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 text-gray-400 mr-2" />
                        <span>{selectedRequest.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-5 w-5 text-gray-400 mr-2" />
                        <span>{selectedRequest.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <Building className="h-5 w-5 text-gray-400 mr-2" />
                        <span>{selectedRequest.companyName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Professional Details</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-500">Registration Number:</span>
                        <span className="ml-2">{selectedRequest.registrationNumber || 'Not provided'}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Experience:</span>
                        <span className="ml-2">{selectedRequest.experienceYears} years</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">License Number:</span>
                        <span className="ml-2">{selectedRequest.licenseNumber}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">ID Number:</span>
                        <span className="ml-2">{selectedRequest.idNumber}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Space Information */}
                <div className="border-t pt-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Space Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm text-gray-500">Space Name:</span>
                          <span className="ml-2 font-medium">{selectedRequest.spaceName}</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Description:</span>
                          <span className="ml-2">{selectedRequest.spaceDescription}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm text-gray-500">Plan:</span>
                          <span className="ml-2 font-medium">{selectedRequest.plan.toUpperCase()}</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Monthly Fee:</span>
                          <span className="ml-2 font-medium">KES {selectedRequest.monthlyFee.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Property Limit:</span>
                          <span className="ml-2 font-medium">{selectedRequest.propertyLimit}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Verification Status */}
                <div className="border-t pt-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Checklist</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(selectedRequest.verificationStatus).map(([key, verified]) => (
                      <div key={key} className="flex items-center">
                        {getVerificationIcon(verified)}
                        <span className="ml-2 text-sm capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Documents */}
                <div className="border-t pt-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Documents</h3>
                  <div className="space-y-2">
                    {selectedRequest.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium">{doc.filename}</div>
                            <div className="text-xs text-gray-500">{doc.type}</div>
                          </div>
                        </div>
                        <button className="text-blue-600 hover:text-blue-900 text-sm">
                          View
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t pt-6">
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => setShowDetailModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Close
                    </button>
                    {selectedRequest.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleRejectRequest(selectedRequest.id, 'Rejected by admin')}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleApproveRequest(selectedRequest.id, 'Approved by admin')}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                          Approve
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
