import { ReactNode } from 'react';
import { Home, Heart, MessageSquare, FileText, Settings, LogOut, Menu, X, Search, Calendar, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function TenantLayout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/tenant/dashboard', icon: Home },
    { name: 'Search Properties', href: '/tenant/search', icon: Search },
    { name: 'Saved Properties', href: '/tenant/favorites', icon: Heart },
    { name: 'Messages', href: '/tenant/messages', icon: MessageSquare },
    { name: 'My Rentals', href: '/tenant/rentals', icon: FileText },
    { name: 'Schedule Tours', href: '/tenant/schedule', icon: Calendar },
    { name: 'Payments', href: '/tenant/payments', icon: CreditCard },
    { name: 'Settings', href: '/tenant/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header */}
      <div className="lg:hidden bg-white shadow-sm border-b">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center">
            <Link href="/tenant/dashboard" className="flex items-center">
              <Home className="h-6 w-6 text-blue-600" />
              <span className="ml-2 text-lg font-bold text-gray-900">Makao</span>
            </Link>
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            
            {/* Mobile sidebar content */}
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <Home className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">Makao</span>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <Icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            
            {/* Mobile logout */}
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <Link
                href="/logout"
                className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-red-600 hover:text-red-900 hover:bg-red-50 w-full"
              >
                <LogOut className="mr-3 h-5 w-5 text-red-400 group-hover:text-red-500" />
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <Home className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">Makao</span>
          </div>
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                >
                  <Icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <Link
              href="/logout"
              className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-red-600 hover:text-red-900 hover:bg-red-50 w-full"
            >
              <LogOut className="mr-3 h-5 w-5 text-red-400 group-hover:text-red-500" />
              Sign Out
            </Link>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
