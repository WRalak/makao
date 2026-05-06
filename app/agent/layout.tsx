'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { Home, Building, Users, Settings, LogOut, Plus, FileText, Calendar, TrendingUp } from 'lucide-react';

export default function AgentLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Agent Navigation */}
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/agent/dashboard" className="flex items-center space-x-3">
                <Home className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-slate-900">Makao Agent</span>
              </Link>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link 
                href="/agent/dashboard" 
                className="text-slate-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
              <Link 
                href="/agent/properties" 
                className="text-slate-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                <Building className="h-4 w-4 mr-2" />
                Properties
              </Link>
              <Link 
                href="/agent/properties/new" 
                className="text-blue-600 hover:text-blue-700 px-3 py-2 rounded-md text-sm font-medium bg-blue-50 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Link>
              <Link 
                href="/agent/applications" 
                className="text-slate-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                <FileText className="h-4 w-4 mr-2" />
                Applications
              </Link>
              <Link 
                href="/agent/analytics" 
                className="text-slate-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Analytics
              </Link>
              <Link 
                href="/agent/calendar" 
                className="text-slate-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Calendar
              </Link>
              <Link 
                href="/agent/settings" 
                className="text-slate-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="text-slate-600 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
