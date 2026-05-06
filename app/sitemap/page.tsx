import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sitemap - Makao',
  description: 'Complete sitemap of Makao - East Africa\'s premier rental platform. Find all pages and features.',
};

export default function SitemapPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="py-20">
        <div className="container-responsive max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-slate-800 mb-6">Makao Sitemap</h1>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Navigate through all pages and features of East Africa&apos;s premier rental platform
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-8 shadow-lg border border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Main Pages */}
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Main Pages</h2>
                <ul className="space-y-3 text-slate-600">
                  <li><a href="/" className="text-blue-600 hover:text-blue-800 font-medium">Home</a></li>
                  <li><a href="/properties" className="text-blue-600 hover:text-blue-800 font-medium">Browse Properties</a></li>
                  <li><a href="/about" className="text-blue-600 hover:text-blue-800 font-medium">About Makao</a></li>
                  <li><a href="/contact" className="text-blue-600 hover:text-blue-800 font-medium">Contact Us</a></li>
                  <li><a href="/blog" className="text-blue-600 hover:text-blue-800 font-medium">Blog</a></li>
                </ul>
              </div>
              
              {/* User Pages */}
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-6">For Tenants</h2>
                <ul className="space-y-3 text-slate-600">
                  <li><a href="/properties" className="text-blue-600 hover:text-blue-800 font-medium">Search Properties</a></li>
                  <li><a href="/tenant-guide" className="text-blue-600 hover:text-blue-800 font-medium">Tenant Guide</a></li>
                  <li><a href="/faqs" className="text-blue-600 hover:text-blue-800 font-medium">FAQs</a></li>
                </ul>
              </div>
              
              {/* Agent Pages */}
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-6">For Agents</h2>
                <ul className="space-y-3 text-slate-600">
                  <li><a href="/agent/dashboard" className="text-blue-600 hover:text-blue-800 font-medium">Agent Dashboard</a></li>
                  <li><a href="/agent/properties" className="text-blue-600 hover:text-blue-800 font-medium">My Properties</a></li>
                  <li><a href="/agent/properties/new" className="text-blue-600 hover:text-blue-800 font-medium">List Property</a></li>
                  <li><a href="/agent-hub" className="text-blue-600 hover:text-blue-800 font-medium">Agent Resources</a></li>
                </ul>
              </div>
              
              {/* Legal Pages */}
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Legal & Support</h2>
                <ul className="space-y-3 text-slate-600">
                  <li><a href="/privacy" className="text-blue-600 hover:text-blue-800 font-medium">Privacy Policy</a></li>
                  <li><a href="/terms" className="text-blue-600 hover:text-blue-800 font-medium">Terms of Service</a></li>
                  <li><a href="/cookies" className="text-blue-600 hover:text-blue-800 font-medium">Cookie Policy</a></li>
                  <li><a href="/help" className="text-blue-600 hover:text-blue-800 font-medium">Help Center</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
