import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - Makao',
  description: 'Makao\'s terms of service for East Africa\'s premier rental platform. Read our legal terms and conditions.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container-responsive text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Terms of Service</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            Legal terms for using Makao across East Africa
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20">
        <div className="container-responsive max-w-4xl mx-auto">
          <div className="bg-white rounded-xl p-8 shadow-lg border border-slate-200">
            <div className="prose max-w-none">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Introduction</h2>
              <p className="text-slate-600 leading-relaxed mb-6">
                Welcome to Makao, East Africa&apos;s premier rental platform. 
                By accessing and using our services, you agree to be bound by these Terms of Service.
              </p>

              <h2 className="text-2xl font-bold text-slate-800 mb-6">Services</h2>
              <div className="space-y-4 text-slate-600">
                <div>
                  <h3 className="font-semibold mb-2">Property Listings</h3>
                  <p>Makao provides a platform for landlords to list rental properties and for tenants to find and rent properties across East Africa.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Search and Discovery</h3>
                  <p>Our platform includes advanced search filters, property details, photos, virtual tours, and neighborhood information.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Communication</h3>
                  <p>Secure messaging system between tenants and landlords, with notification features and message history.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Payment Processing</h3>
                  <p>Integration with local payment methods including M-Pesa, bank transfers, and other payment options available in East African markets.</p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-6">User Responsibilities</h2>
            <div className="space-y-4 text-slate-600">
              <div>
                <h3 className="font-semibold mb-2">Accurate Information</h3>
                <p>Users must provide accurate, current, and complete information when creating accounts, listing properties, or communicating with other users.</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Property Verification</h3>
                <p>Landlords must ensure all property information is accurate and verify their identity before listing properties.</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Legal Compliance</h3>
                <p>Users must comply with all applicable local laws and regulations regarding rental agreements and property transactions.</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-6">Prohibited Activities</h2>
            <div className="space-y-4 text-slate-600">
              <div>
                <h3 className="font-semibold mb-2">Illegal Content</h3>
                <p>Users may not post fraudulent listings, misleading information, or content that violates local laws.</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Spam and Harassment</h3>
                <p>Users may not use the platform for spam, harassment, or inappropriate communication with other users.</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Security Violations</h3>
                <p>Any attempt to compromise platform security, access other users&apos; accounts, or exploit vulnerabilities is strictly prohibited.</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-6">Intellectual Property</h2>
            <div className="space-y-4 text-slate-600">
              <div>
                <h3 className="font-semibold mb-2">Platform Content</h3>
                <p>All Makao content, including text, graphics, logos, and functionality, is owned by Makao and protected by intellectual property laws.</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">User Content</h3>
                <p>Users retain ownership of their content but grant Makao license to use, display, and distribute it as needed for platform operation.</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-6">Limitation of Liability</h2>
            <div className="space-y-4 text-slate-600">
              <p>Makao is provided &quot;as is&quot; without warranties of any kind, either express or implied.</p>
              <p>Makao shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our services.</p>
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-6">Changes to Terms</h2>
            <div className="space-y-4 text-slate-600">
              <p>Makao reserves the right to modify these terms at any time. Changes will be effective immediately upon posting to the platform.</p>
              <p>Continued use of the service constitutes acceptance of any modified terms.</p>
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-6">Contact Information</h2>
            <div className="space-y-4 text-slate-600">
              <p>For questions about these Terms of Service, please contact us:</p>
              <div className="bg-slate-100 rounded-lg p-6 mt-4">
                <p className="font-semibold">Email:</p>
                <p>legal@makao.com</p>
              </div>
              <p className="mt-4">Last updated: January 1, 2025</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
