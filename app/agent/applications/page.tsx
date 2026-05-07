'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores';
import { FileText, User, Home, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function AgentApplications() {
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

  const applications = [
    {
      id: 1,
      tenant: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+254 712 345 678'
      },
      property: {
        title: 'Modern 3BR Apartment in Kilimani',
        location: 'Kilimani, Nairobi'
      },
      status: 'pending',
      submittedAt: '2024-01-15T10:30:00Z',
      monthlyIncome: 150000,
      employmentStatus: 'employed'
    },
    {
      id: 2,
      tenant: {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+254 723 456 789'
      },
      property: {
        title: 'Cozy Studio in Westlands',
        location: 'Westlands, Nairobi'
      },
      status: 'approved',
      submittedAt: '2024-01-14T14:20:00Z',
      monthlyIncome: 80000,
      employmentStatus: 'employed'
    },
    {
      id: 3,
      tenant: {
        name: 'Mike Johnson',
        email: 'mike@example.com',
        phone: '+254 734 567 890'
      },
      property: {
        title: 'Luxury 2BR with Garden View',
        location: 'Lavington, Nairobi'
      },
      status: 'rejected',
      submittedAt: '2024-01-13T09:15:00Z',
      monthlyIncome: 120000,
      employmentStatus: 'self-employed'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Rental Applications</h1>
              <p className="text-gray-600">Review and manage tenant applications for your properties</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 rounded-lg p-3">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">1</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-lg p-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-semibold text-gray-900">1</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-red-100 rounded-lg p-3">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-semibold text-gray-900">1</p>
              </div>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Applications</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {applications.map((application) => (
              <div key={application.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {application.tenant.name}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                        {getStatusIcon(application.status)}
                        <span className="ml-1">{application.status.charAt(0).toUpperCase() + application.status.slice(1)}</span>
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        {application.tenant.email}
                      </div>
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-gray-400" />
                        {application.tenant.phone}
                      </div>
                      <div className="flex items-center">
                        <Home className="h-4 w-4 mr-2 text-gray-400" />
                        {application.property.title}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {new Date(application.submittedAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="mt-4 text-sm text-gray-600">
                      <p><strong>Monthly Income:</strong> KES {application.monthlyIncome.toLocaleString()}</p>
                      <p><strong>Employment:</strong> {application.employmentStatus.charAt(0).toUpperCase() + application.employmentStatus.slice(1)}</p>
                    </div>
                  </div>
                  
                  <div className="ml-4 flex flex-col space-y-2">
                    <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                      View Details
                    </button>
                    {application.status === 'pending' && (
                      <>
                        <button className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                          Approve
                        </button>
                        <button className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
