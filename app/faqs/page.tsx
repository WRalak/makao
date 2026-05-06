import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQs - Makao',
  description: 'Frequently asked questions for Makao - East Africa\'s premier rental platform. Find answers to common questions about renting, properties, and using our platform.',
};

export default function FAQsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container-responsive text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Frequently Asked Questions</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            Quick answers to common questions about Makao
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container-responsive max-w-4xl mx-auto">
          <div className="space-y-8">
            {/* General Questions */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">General Questions</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">What is Makao?</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Makao is East Africa&apos;s premier rental platform connecting tenants with verified properties across Kenya, Rwanda, Tanzania, and beyond.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">Is Makao free to use?</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Yes! Makao is free for tenants to search and browse properties. Landlords pay a subscription fee to list properties.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">How do I create an account?</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Click the &quot;Sign Up&quot; button on our homepage and follow the simple registration process. You&apos;ll need to provide basic information and verify your email.
                  </p>
                </div>
              </div>
            </div>
            
            {/* For Tenants */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">For Tenants</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">How do I search for properties?</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Use our advanced search filters to find properties by location, price, property type, and amenities. You can save searches and get notified of new listings.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">How do I contact landlords?</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Use our secure messaging system to ask questions and schedule property viewings. All communications are tracked in your dashboard.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">What payment methods are accepted?</h3>
                  <p className="text-slate-600 leading-relaxed">
                    We accept various payment methods including M-Pesa, bank transfers, and other local payment options depending on the country and landlord preferences.
                  </p>
                </div>
              </div>
            </div>
            
            {/* For Landlords */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">For Landlords</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">How much does it cost to list properties?</h3>
                  <p className="text-slate-600 leading-relaxed">
                    We offer various subscription plans starting from basic to premium. Pricing depends on the number of properties and features you need.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">How do I list a property?</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Log into your dashboard, click &quot;List Property,&quot; and provide detailed information including photos, description, pricing, and amenities.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">How do I manage applications?</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Review tenant applications, communicate with applicants, and manage your property listings all from your agent dashboard.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Technical Questions */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Technical Questions</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">Is my data secure?</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Yes! We use industry-standard SSL encryption and security measures to protect your personal and financial information.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">What browsers are supported?</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Makao works best on modern browsers including Chrome, Firefox, Safari, and Edge. We recommend keeping your browser updated for the best experience.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Contact Support */}
            <div className="bg-blue-50 rounded-xl p-8 text-center">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Still Have Questions?</h2>
              <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
                Can&apos;t find the answer you&apos;re looking for? Our support team is here to help you.
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
        </div>
      </section>
    </div>
  );
}
