'use client';

import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/register" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Register
          </Link>
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
          </div>
          <p className="text-sm text-gray-600 mt-2">Last updated: May 3, 2026</p>
        </div>

        {/* Terms Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="prose prose-gray max-w-none">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-sm text-gray-700 mb-6">
              By accessing and using Makao, you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our platform.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-sm text-gray-700 mb-6">
              Makao is a real estate rental platform that connects tenants with property owners and agents 
              across East Africa. Our services include property listings, agent directories, and communication tools.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
            <div className="text-gray-700 mb-6">
              <ul className="list-disc pl-6 space-y-2">
                <li>You must create an account to access certain features</li>
                <li>You are responsible for maintaining the confidentiality of your account</li>
                <li>You must provide accurate and complete information</li>
                <li>You must be at least 18 years old to create an account</li>
                <li>You may not share your account credentials with others</li>
              </ul>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Property Listings</h2>
            <div className="text-gray-700 mb-6">
              <ul className="list-disc pl-6 space-y-2">
                <li>Property owners and agents are responsible for the accuracy of their listings</li>
                <li>Makao does not guarantee the availability or condition of listed properties</li>
                <li>Users should verify all property information independently</li>
                <li>Makao reserves the right to remove any listing that violates our policies</li>
              </ul>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. User Conduct</h2>
            <p className="text-sm text-gray-700 mb-6">
              Users agree not to use the platform for any unlawful purposes or to:
            </p>
            <div className="text-gray-700 mb-6">
              <ul className="list-disc pl-6 space-y-2">
                <li>Post false, misleading, or fraudulent information</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Use the platform for spam or unsolicited communications</li>
              </ul>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Fees and Payments</h2>
            <div className="text-gray-700 mb-6">
              <ul className="list-disc pl-6 space-y-2">
                <li>Basic browsing and account creation are free</li>
                <li>Premium features may require subscription fees</li>
                <li>Property listings may incur fees for agents and owners</li>
                <li>All fees are non-refundable unless specified otherwise</li>
              </ul>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Privacy</h2>
            <p className="text-sm text-gray-700 mb-6">
              Your privacy is important to us. Please review our Privacy Policy to understand how we 
              collect, use, and protect your information.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Intellectual Property</h2>
            <p className="text-sm text-gray-700 mb-6">
              All content on Makao, including text, graphics, logos, and software, is owned by 
              Makao or its licensors and is protected by intellectual property laws.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Disclaimers</h2>
            <div className="text-gray-700 mb-6">
              <ul className="list-disc pl-6 space-y-2">
                <li>Makao is provided "as is" without warranties of any kind</li>
                <li>We do not guarantee the accuracy or completeness of property information</li>
                <li>We are not responsible for interactions between users</li>
                <li>We do not provide legal or financial advice</li>
              </ul>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Limitation of Liability</h2>
            <p className="text-sm text-gray-700 mb-6">
              Makao shall not be liable for any indirect, incidental, special, or consequential damages 
              arising from your use of the platform.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Termination</h2>
            <p className="text-sm text-gray-700 mb-6">
              We may terminate or suspend your account at any time, with or without cause, without notice.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Changes to Terms</h2>
            <p className="text-sm text-gray-700 mb-6">
              We reserve the right to modify these terms at any time. Changes will be effective 
              immediately upon posting on the platform.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Contact Information</h2>
            <p className="text-sm text-gray-700 mb-6">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div className="text-gray-700">
              <p>Email: support@makao.com</p>
              <p>Phone: +254 700 123 456</p>
              <p>Address: Nairobi, Kenya</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
