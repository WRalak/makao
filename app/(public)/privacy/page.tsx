'use client';

import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPage() {
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
            <Shield className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          </div>
          <p className="text-gray-600 mt-2">Last updated: May 3, 2026</p>
        </div>

        {/* Privacy Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="prose prose-gray max-w-none">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
            <p className="text-sm text-gray-700 mb-6">
              We collect information you provide directly to us, such as when you create an account, 
              list a property, or contact other users.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">Personal Information</h3>
            <div className="text-gray-700 mb-6">
              <ul className="list-disc pl-6 space-y-2">
                <li>Name, email address, and phone number</li>
                <li>Physical address and location data</li>
                <li>Profile information and photos</li>
                <li>Payment information for premium services</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">Property Information</h3>
            <div className="text-gray-700 mb-6">
              <ul className="list-disc pl-6 space-y-2">
                <li>Property details, photos, and descriptions</li>
                <li>Rental prices and availability dates</li>
                <li>Property location and coordinates</li>
                <li>Agent and owner contact information</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">Usage Information</h3>
            <div className="text-gray-700 mb-6">
              <ul className="list-disc pl-6 space-y-2">
                <li>Pages visited and time spent on our platform</li>
                <li>Search queries and filters used</li>
                <li>Properties viewed and saved</li>
                <li>Communication with other users</li>
              </ul>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
            <div className="text-gray-700 mb-6">
              <ul className="list-disc pl-6 space-y-2">
                <li>To provide and maintain our service</li>
                <li>To process transactions and send related information</li>
                <li>To personalize your experience and show relevant properties</li>
                <li>To communicate with you about your account and transactions</li>
                <li>To improve our platform and develop new features</li>
                <li>To ensure platform security and prevent fraud</li>
                <li>To comply with legal obligations</li>
              </ul>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Information Sharing</h2>
            <p className="text-sm text-gray-700 mb-6">
              We do not sell, trade, or otherwise transfer your personal information to third parties, 
              except in the following circumstances:
            </p>

            <div className="text-gray-700 mb-6">
              <ul className="list-disc pl-6 space-y-2">
                <li>With other users when you list properties or communicate on our platform</li>
                <li>With service providers who perform services on our behalf</li>
                <li>When required by law or to protect our rights</li>
                <li>In connection with a business transfer or acquisition</li>
                <li>With your explicit consent</li>
              </ul>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Security</h2>
            <p className="text-sm text-gray-700 mb-6">
              We implement appropriate technical and organizational measures to protect your personal 
              information against unauthorized access, alteration, disclosure, or destruction.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Cookies and Tracking</h2>
            <p className="text-sm text-gray-700 mb-6">
              We use cookies and similar tracking technologies to enhance your experience, analyze 
              platform usage, and provide personalized content. You can control cookies through your 
              browser settings.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Rights</h2>
            <div className="text-gray-700 mb-6">
              <ul className="list-disc pl-6 space-y-2">
                <li>Access and update your personal information</li>
                <li>Delete your account and personal data</li>
                <li>Opt out of marketing communications</li>
                <li>Request a copy of your data</li>
                <li>Object to processing of your data</li>
              </ul>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Retention</h2>
            <p className="text-sm text-gray-700 mb-6">
              We retain your personal information only as long as necessary to provide our services 
              and comply with legal obligations. You can request deletion of your data at any time.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Children's Privacy</h2>
            <p className="text-sm text-gray-700 mb-6">
              Our service is not intended for children under 18. We do not knowingly collect personal 
              information from children under 18.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. International Data Transfers</h2>
            <p className="text-sm text-gray-700 mb-6">
              Your information may be transferred to and processed in countries other than your own. 
              We ensure appropriate safeguards are in place for such transfers.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to This Policy</h2>
            <p className="text-sm text-gray-700 mb-6">
              We may update this privacy policy from time to time. We will notify you of any changes 
              by posting the new policy on this page.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Us</h2>
            <p className="text-sm text-gray-700 mb-6">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <div className="text-gray-700">
              <p>Email: privacy@makao.com</p>
              <p>Phone: +254 700 123 456</p>
              <p>Address: Nairobi, Kenya</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
