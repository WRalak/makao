import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Makao - East Africa\'s Premier Rental Platform',
  description: 'Learn about Makao, East Africa\'s trusted rental platform connecting tenants with quality properties across Kenya, Rwanda, Tanzania, and beyond.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container-responsive text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About Makao</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            East Africa's premier rental platform, built with trust and technology
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20">
        <div className="container-responsive max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Our Mission</h2>
              <p className="text-slate-600 leading-relaxed mb-6">
                To revolutionize the East African rental market by providing a transparent, secure, and user-friendly platform that connects quality tenants with verified properties and trusted landlords.
              </p>
              
              <h3 className="text-xl font-semibold text-slate-800 mb-4">What We Do</h3>
              <ul className="space-y-3 text-slate-600">
                <li>• Verified property listings across East Africa</li>
                <li>• Secure payment processing with local and international methods</li>
                <li>• Direct tenant-landlord communication</li>
                <li>• Professional property management tools</li>
              </ul>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Why Choose Makao</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-2">Trust & Security</h3>
                    <p className="text-slate-600">All properties and users are verified for your safety.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-2">Local Expertise</h3>
                    <p className="text-slate-600">Built specifically for East African markets and needs.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 font-bold">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-2">Modern Technology</h3>
                    <p className="text-slate-600">Cut-edge platform for seamless rental experience.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats Section */}
          <div className="bg-white rounded-xl p-8 shadow-lg border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center">By the Numbers</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">10,000+</div>
                <div className="text-slate-600">Properties Listed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">5,000+</div>
                <div className="text-slate-600">Happy Tenants</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">500+</div>
                <div className="text-slate-600">Verified Landlords</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">4.9/5</div>
                <div className="text-slate-600">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
