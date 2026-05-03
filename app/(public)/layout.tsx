import { ReactNode } from 'react';
import { Home, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function PublicLayout({ children }: { children: ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <Home className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                <span className="ml-2 text-lg sm:text-xl font-bold text-gray-900">Makao</span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center space-x-6">
              <Link href="/properties" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                Browse Properties
              </Link>
              <Link href="/agents" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                Find Agents
              </Link>
              <Link href="/login" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                Sign In
              </Link>
              <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium">
                Sign Up
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="sm:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile menu panel */}
          {isMobileMenuOpen && (
            <div className="sm:hidden border-t border-gray-200">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link
                  href="/properties"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Browse Properties
                </Link>
                <Link
                  href="/agents"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Find Agents
                </Link>
                <Link
                  href="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Home className="h-6 w-6 text-blue-400" />
                <span className="ml-2 text-lg font-bold">Makao</span>
              </div>
              <p className="text-gray-400">
                Your trusted East African platform for finding the perfect rental home.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">For Tenants</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/properties" className="hover:text-white">Browse Properties</Link></li>
                <li><Link href="/favorites" className="hover:text-white">Saved Properties</Link></li>
                <li><Link href="/messages" className="hover:text-white">Messages</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">For Agents</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/agent/dashboard" className="hover:text-white">Dashboard</Link></li>
                <li><Link href="/agent/listings" className="hover:text-white">My Listings</Link></li>
                <li><Link href="/agent/profile" className="hover:text-white">Profile</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Makao. All rights reserved. Serving Kenya, Tanzania, Uganda, Rwanda & Burundi.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
