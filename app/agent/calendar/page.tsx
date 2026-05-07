'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores';
import { Calendar as CalendarIcon, Clock, MapPin, Users, Plus } from 'lucide-react';

export default function AgentCalendar() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState(new Date());

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

  const viewings = [
    {
      id: 1,
      property: {
        title: 'Modern 3BR Apartment in Kilimani',
        location: 'Kilimani, Nairobi'
      },
      tenant: {
        name: 'John Doe',
        phone: '+254 712 345 678'
      },
      date: '2024-01-20',
      time: '10:00 AM',
      status: 'confirmed',
      notes: 'Interested in the property, wants to see the master bedroom'
    },
    {
      id: 2,
      property: {
        title: 'Cozy Studio in Westlands',
        location: 'Westlands, Nairobi'
      },
      tenant: {
        name: 'Jane Smith',
        phone: '+254 723 456 789'
      },
      date: '2024-01-20',
      time: '2:00 PM',
      status: 'pending',
      notes: 'First-time renter, needs guidance'
    },
    {
      id: 3,
      property: {
        title: 'Luxury 2BR with Garden View',
        location: 'Lavington, Nairobi'
      },
      tenant: {
        name: 'Mike Johnson',
        phone: '+254 734 567 890'
      },
      date: '2024-01-21',
      time: '11:00 AM',
      status: 'confirmed',
      notes: 'Looking for a long-term lease'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const todayViewings = viewings.filter(v => v.date === selectedDate.toISOString().split('T')[0]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Property Viewings</h1>
              <p className="text-gray-600">Manage and schedule property viewing appointments</p>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Schedule Viewing
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Calendar</h2>
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-gray-100 rounded">
                    ←
                  </button>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <button className="p-2 hover:bg-gray-100 rounded">
                    →
                  </button>
                </div>
              </div>
              
              {/* Simple Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
                
                {/* Calendar Days */}
                {Array.from({ length: 35 }, (_, i) => {
                  const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i - 2);
                  const isCurrentMonth = date.getMonth() === selectedDate.getMonth();
                  const isToday = date.toDateString() === new Date().toDateString();
                  const hasViewings = viewings.some(v => v.date === date.toISOString().split('T')[0]);
                  
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedDate(date)}
                      className={`
                        p-2 text-sm rounded hover:bg-gray-100 relative
                        ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-900'}
                        ${isToday ? 'bg-blue-50 font-bold' : ''}
                        ${selectedDate.toDateString() === date.toDateString() ? 'ring-2 ring-blue-500' : ''}
                      `}
                    >
                      {date.getDate()}
                      {hasViewings && (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Today's Viewings */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h2>
              
              {todayViewings.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No viewings scheduled</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {todayViewings.map((viewing) => (
                    <div key={viewing.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">{viewing.time}</span>
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(viewing.status)}`}>
                          {viewing.status}
                        </span>
                      </div>
                      
                      <h3 className="font-medium text-gray-900 mb-1">{viewing.property.title}</h3>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <MapPin className="h-3 w-3 mr-1" />
                        {viewing.property.location}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <Users className="h-3 w-3 mr-1" />
                        {viewing.tenant.name} • {viewing.tenant.phone}
                      </div>
                      
                      {viewing.notes && (
                        <p className="text-sm text-gray-500 italic">{viewing.notes}</p>
                      )}
                      
                      <div className="mt-3 flex space-x-2">
                        <button className="text-sm text-blue-600 hover:text-blue-800">
                          Edit
                        </button>
                        <button className="text-sm text-red-600 hover:text-red-800">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
