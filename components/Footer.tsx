import Link from 'next/link';
import { Home } from 'lucide-react';

export default function Footer() {
  return (
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
  );
}
