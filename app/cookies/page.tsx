import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy - Makao',
  description: 'Makao\'s cookie policy for East Africa\'s rental platform. Learn how we use cookies and protect your privacy.',
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container-responsive text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Cookie Policy</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            How Makao uses cookies to enhance your experience
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container-responsive max-w-4xl mx-auto">
          <div className="bg-white rounded-xl p-8 shadow-lg border border-slate-200">
            <div className="prose max-w-none">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">What Are Cookies</h2>
              <p className="text-slate-600 leading-relaxed mb-6">
                Cookies are small text files that are stored on your device when you visit Makao. 
                They help us remember your preferences, analyze usage, and provide personalized content.
              </p>

              <h2 className="text-2xl font-bold text-slate-800 mb-6">How We Use Cookies</h2>
              <div className="space-y-4 text-slate-600">
                <div>
                  <h3 className="font-semibold mb-2">Essential Cookies</h3>
                  <p>Required for basic platform functionality including user authentication, security, and session management.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Analytics Cookies</h3>
                  <p>Help us understand how users interact with our platform to improve services and user experience.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Marketing Cookies</h3>
                  <p>Used to deliver relevant advertisements and content based on your interests and browsing behavior.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Functional Cookies</h3>
                  <p>Enhance your experience with features like language preferences, saved searches, and personalized content.</p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-6">Your Choices</h2>
            <div className="space-y-4 text-slate-600">
              <p>You can control and manage cookies through your browser settings:</p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>Accept or reject cookies</li>
                <li>Delete stored cookies</li>
                <li>Opt out of targeted advertising</li>
                <li>Configure cookie preferences</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-6">Third-Party Cookies</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              Makao may use third-party services that place cookies on your device. 
              These include analytics providers, advertising networks, and social media platforms.
              We are not responsible for their privacy practices.
            </p>

            <h2 className="text-2xl font-bold text-slate-800 mb-6">Updates to This Policy</h2>
            <div className="space-y-4 text-slate-600">
              <p>We may update this Cookie Policy periodically to reflect changes in our practices or legal requirements.</p>
              <p>Changes will be posted on this page and effective immediately upon publication.</p>
              <p>Continued use of our services constitutes acceptance of any updated cookie policy.</p>
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-6">Contact Us</h2>
            <p className="text-slate-600 leading-relaxed">
              If you have questions about this Cookie Policy or how we handle your data, please contact us at:
            </p>
            <div className="bg-slate-100 rounded-lg p-6 mt-4">
              <p className="font-semibold">Email:</p>
              <p>privacy@makao.com</p>
            </div>
            <p className="text-slate-600 mt-4">Last updated: January 1, 2025</p>
          </div>
        </div>
      </section>
    </div>
  );
}
