import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Help Center - Makao',
  description: 'Get help and support for Makao - East Africa\'s premier rental platform. Find answers to common questions and troubleshooting guides.',
};

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container-responsive text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Help Center</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            Get support and answers for your Makao rental journey
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container-responsive max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Getting Started */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Getting Started</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">How to Search for Properties</h3>
                  <p>Use our advanced search filters to find properties by location, price range, property type, and amenities.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Creating an Account</h3>
                  <p>Sign up for a free account to save searches, bookmark properties, and contact landlords directly.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Contacting Landlords</h3>
                  <p>Use our secure messaging system to ask questions and schedule property viewings.</p>
                </div>
              </div>
            </div>
            
            {/* For Tenants */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">For Tenants</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Rental Application Process</h3>
                  <p>Learn how to apply for properties, what documents you need, and how to track your application status.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Payment Options</h3>
                  <p>Discover available payment methods including M-Pesa, bank transfers, and other local payment options.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Tenant Rights</h3>
                  <p>Understand your legal rights and responsibilities as a tenant in East African countries.</p>
                </div>
              </div>
            </div>
            
            {/* For Landlords */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">For Landlords</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Listing Properties</h3>
                  <p>Step-by-step guide to creating effective property listings with photos, descriptions, and pricing.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Managing Applications</h3>
                  <p>How to review tenant applications, communicate with applicants, and manage your property listings.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Payment Processing</h3>
                  <p>Setting up rent collection and managing security deposits through Makao.</p>
                </div>
              </div>
            </div>
            
            {/* Troubleshooting */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Troubleshooting</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Common Issues</h3>
                  <p>Solutions to frequently encountered problems with property searches, applications, and account management.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Technical Support</h3>
                  <p>How to contact our support team for technical assistance and platform issues.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Contact Support */}
          <div className="bg-blue-50 rounded-xl p-8 mt-8 text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Still Need Help?</h2>
            <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
              Can&apos;t find what you&apos;re looking for? Our support team is here to help you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Browse Help Articles
              </button>
              <button className="bg-white text-blue-600 px-6 py-3 rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors font-medium">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
