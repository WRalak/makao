import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Makao',
  description: 'Makao\'s privacy policy and how we protect your data across East Africa\'s rental platform.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container-responsive text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            Your privacy is important to us
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
                At Makao, we are committed to protecting your privacy and ensuring the security of your personal information. 
                This Privacy Policy explains how we collect, use, and protect your data when you use our rental platform across East Africa.
              </p>

              <h2 className="text-2xl font-bold text-slate-800 mb-6">Information We Collect</h2>
              <div className="space-y-4 text-slate-600">
                <div>
                  <h3 className="font-semibold mb-2">Personal Information</h3>
                  <p>When you create an account, list properties, or contact us, we may collect:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Name and contact information</li>
                    <li>Email address and phone number</li>
                    <li>Property details and photos</li>
                    <li>Payment information for transactions</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Usage Data</h3>
                  <p>We automatically collect information about how you use our platform:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Pages visited and features used</li>
                    <li>Search queries and property preferences</li>
                    <li>Device and browser information</li>
                    <li>IP address and general location</li>
                  </ul>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-6">How We Use Your Information</h2>
            <div className="space-y-4 text-slate-600">
              <div>
                <h3 className="font-semibold mb-2">Service Provision</h3>
                <p>To provide our rental platform services, including property listings, search functionality, and tenant-landlord matching.</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Communication</h3>
                <p>To respond to your inquiries, send property updates, and provide customer support.</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Platform Improvement</h3>
                <p>To analyze usage patterns, improve our services, and develop new features that better serve East African tenants and landlords.</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-6">Data Protection</h2>
            <div className="space-y-4 text-slate-600">
              <div>
                <h3 className="font-semibold mb-2">Security Measures</h3>
                <p>We implement industry-standard security measures including:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>SSL encryption for all data transmissions</li>
                  <li>Secure password storage and authentication</li>
                  <li>Regular security audits and updates</li>
                  <li>Limited access to personal data</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Data Retention</h3>
                <p>We retain your information only as long as necessary to provide our services and comply with applicable laws in Kenya, Rwanda, and Tanzania.</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-6">Your Rights</h2>
            <div className="space-y-4 text-slate-600">
              <div>
                <h3 className="font-semibold mb-2">Access and Control</h3>
                <p>You have the right to access, update, or delete your personal information at any time through your account settings.</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Data Portability</h3>
                <p>You can request a copy of your data or have it transferred to another service.</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Opt-Out</h3>
                <p>You can opt out of marketing communications while still using our core rental platform services.</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-6">Contact Us</h2>
            <p className="text-slate-600 leading-relaxed">
              If you have questions about this Privacy Policy or how we handle your data, please contact us at:
            </p>
            <div className="bg-slate-100 rounded-lg p-6 mt-4">
              <p className="font-semibold">Email:</p>
              <p>privacy@makao.com</p>
            </div>
            <p className="text-slate-600 mt-4">
              This Privacy Policy is effective as of January 1, 2025 and may be updated periodically to reflect changes in our practices.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
