import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tenant Guide - Makao',
  description: 'Complete tenant guide for Makao - East Africa\'s premier rental platform. Learn about renting, tenant rights, and finding your perfect home.',
};

export default function TenantGuidePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container-responsive text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Tenant Guide</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            Everything you need to know about renting in East Africa
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container-responsive max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Before You Rent */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Before You Rent</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Determine Your Budget</h3>
                  <p>Calculate your monthly income and expenses to determine how much you can afford for rent.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Research Neighborhoods</h3>
                  <p>Investigate different areas for safety, amenities, and proximity to work or school.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Check Your Credit</h3>
                  <p>Review your credit report and address any issues before applying for rentals.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Gather Required Documents</h3>
                  <p>Prepare ID, proof of income, references, and bank statements for applications.</p>
                </div>
              </div>
            </div>
            
            {/* During Your Search */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">During Your Search</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">View Multiple Properties</h3>
                  <p>Don&apos;t settle for the first option - compare several properties to find the best fit.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Ask Questions</h3>
                  <p>Inquire about utilities, parking, security, and neighborhood details.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Visit the Property</h3>
                  <p>Schedule a viewing to see the property in person before making a decision.</p>
                </div>
              </div>
            </div>
            
            {/* Rental Application */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Rental Applications</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Complete Applications Thoroughly</h3>
                  <p>Provide all requested information accurately and honestly to increase your chances of approval.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Understand the Lease Agreement</h3>
                  <p>Read all terms carefully before signing and ask questions about anything unclear.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Know Your Rights</h3>
                  <p>Familiarize yourself with tenant protection laws in your specific East African country.</p>
                </div>
              </div>
            </div>
            
            {/* After You Move In */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">After You Move In</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Document Everything</h3>
                  <p>Take photos and videos of the property condition when you move in and out.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Notify Landlord</h3>
                  <p>Inform your landlord immediately of any issues or maintenance needs.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Pay Rent on Time</h3>
                  <p>Understand the payment schedule and methods accepted by your landlord.</p>
                </div>
              </div>
            </div>
            
            {/* Living in Your Rental */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Living in Your Rental</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Maintain the Property</h3>
                  <p>Keep the property clean and report maintenance issues promptly.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Be a Good Neighbor</h3>
                  <p>Respect quiet hours and follow community rules.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Communicate Clearly</h3>
                  <p>Maintain open communication with your landlord about any concerns.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
