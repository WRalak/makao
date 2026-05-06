import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Agent Hub - Makao',
  description: 'Makao Agent Hub - Resources and tools for real estate agents in East Africa. Access marketing materials, training, and professional support.',
};

export default function AgentHubPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container-responsive text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Agent Hub</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            Everything agents need to succeed on Makao
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container-responsive max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Tools & Resources */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Agent Tools</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Property Management Dashboard</h3>
                  <p>Comprehensive dashboard to manage listings, track views, and communicate with tenants.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Marketing Materials</h3>
                  <p>Professional flyers, brochures, and social media templates to promote your properties.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Analytics & Insights</h3>
                  <p>Detailed analytics on property performance, market trends, and tenant demographics.</p>
                </div>
              </div>
            </div>
            
            {/* Training & Support */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Training & Support</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Video Tutorials</h3>
                  <p>Step-by-step guides on using Makao features, from listing properties to closing deals.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Best Practices</h3>
                  <p>Tips and strategies for successful property listings and tenant management in East African markets.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">24/7 Support</h3>
                  <p>Dedicated support team to help with technical issues and questions.</p>
                </div>
              </div>
            </div>
            
            {/* Community & Networking */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Community & Networking</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Agent Forums</h3>
                  <p>Connect with other agents, share experiences, and discuss market trends across East Africa.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Success Stories</h3>
                  <p>Learn from top-performing agents and their strategies for success on Makao.</p>
                </div>
              </div>
            </div>
            
            {/* Resources */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Additional Resources</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Legal Templates</h3>
                  <p>Downloadable lease agreements and legal documents compliant with East African regulations.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Market Reports</h3>
                  <p>Regular insights on rental market trends across Kenya, Rwanda, and Tanzania.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Get Started */}
          <div className="bg-blue-50 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Ready to Grow Your Business?</h2>
            <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
              Join thousands of successful agents using Makao&apos;s powerful tools and resources
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Start Listing Properties
              </button>
              <button className="bg-white text-blue-600 px-6 py-3 rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors font-medium">
                Explore Agent Resources
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
