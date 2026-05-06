'use client';

import { useState } from 'react';

interface JobApplicationForm {
  jobTitle: string;
  jobType: string;
  location: string;
  applicantName: string;
  email: string;
  phone: string;
  coverLetter: string;
  linkedinUrl: string;
  portfolioUrl: string;
  experienceYears: string;
  currentCompany: string;
  currentPosition: string;
  salaryExpectations: string;
  availability: string;
}

export default function CareersPage() {
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [formData, setFormData] = useState<JobApplicationForm>({
    jobTitle: '',
    jobType: '',
    location: '',
    applicantName: '',
    email: '',
    phone: '',
    coverLetter: '',
    linkedinUrl: '',
    portfolioUrl: '',
    experienceYears: '',
    currentCompany: '',
    currentPosition: '',
    salaryExpectations: '',
    availability: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const openApplicationForm = (job: any) => {
    setSelectedJob(job);
    setFormData(prev => ({
      ...prev,
      jobTitle: job.title,
      jobType: job.type,
      location: job.location
    }));
    setShowApplicationForm(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/careers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          jobTitle: '',
          jobType: '',
          location: '',
          applicantName: '',
          email: '',
          phone: '',
          coverLetter: '',
          linkedinUrl: '',
          portfolioUrl: '',
          experienceYears: '',
          currentCompany: '',
          currentPosition: '',
          salaryExpectations: '',
          availability: ''
        });
        setTimeout(() => {
          setShowApplicationForm(false);
          setSelectedJob(null);
        }, 2000);
      } else {
        setSubmitStatus('error');
        setErrorMessage(data.error || 'Failed to submit application. Please try again.');
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container-responsive text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Careers at Makao</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            Join us in revolutionizing East Africa's rental market
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20">
        <div className="container-responsive max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Why Work With Us?</h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
              At Makao, we're building the future of real estate in East Africa. 
              We're looking for passionate individuals who want to make a difference in millions of lives.
            </p>
          </div>
          
          {/* Open Positions */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center">Open Positions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Position 1 */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-semibold">Full-time</span>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-semibold">Remote</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Senior Frontend Developer</h3>
                <p className="text-slate-600 mb-4">Build amazing user experiences for our rental platform</p>
                <div className="space-y-2 text-sm text-slate-600">
                  <p>• 5+ years experience with React/Next.js</p>
                  <p>• Strong portfolio of web applications</p>
                  <p>• Experience with real estate platforms preferred</p>
                </div>
                <button 
                  onClick={() => openApplicationForm({
                    title: 'Senior Frontend Developer',
                    type: 'full-time',
                    location: 'remote'
                  })}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Apply Now
                </button>
              </div>
              
              {/* Position 2 */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-semibold">Full-time</span>
                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-semibold">Nairobi</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Product Manager</h3>
                <p className="text-slate-600 mb-4">Lead product development and strategy for our platform</p>
                <div className="space-y-2 text-sm text-slate-600">
                  <p>• 3+ years product management experience</p>
                  <p>• Background in real estate or marketplace platforms</p>
                  <p>• Strong analytical and communication skills</p>
                </div>
                <button 
                  onClick={() => openApplicationForm({
                    title: 'Product Manager',
                    type: 'full-time',
                    location: 'nairobi'
                  })}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Apply Now
                </button>
              </div>
              
              {/* Position 3 */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-semibold">Full-time</span>
                  <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-semibold">Nairobi</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Customer Success Manager</h3>
                <p className="text-slate-600 mb-4">Help tenants and landlords have amazing experiences on Makao</p>
                <div className="space-y-2 text-sm text-slate-600">
                  <p>• 2+ years customer service experience</p>
                  <p>• Excellent communication skills</p>
                  <p>• Passion for helping people find homes</p>
                </div>
                <button 
                  onClick={() => openApplicationForm({
                    title: 'Customer Success Manager',
                    type: 'full-time',
                    location: 'nairobi'
                  })}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Apply Now
                </button>
              </div>
              
              {/* Position 4 */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-semibold">Internship</span>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-semibold">Remote</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Marketing Intern</h3>
                <p className="text-slate-600 mb-4">Support our marketing team and learn about real estate tech</p>
                <div className="space-y-2 text-sm text-slate-600">
                  <p>• Currently pursuing degree in marketing/communications</p>
                  <p>• Creative mindset and social media savvy</p>
                  <p>• Eager to learn and grow with us</p>
                </div>
                <button 
                  onClick={() => openApplicationForm({
                    title: 'Marketing Intern',
                    type: 'internship',
                    location: 'remote'
                  })}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Apply Now
                </button>
              </div>
            </div>
          </div>
          
          {/* Benefits Section */}
          <div className="bg-white rounded-xl p-8 shadow-lg border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center">Why Join Makao?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-blue-600 text-2xl">trending_up</span>
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">Growth</h3>
                <p className="text-slate-600 text-sm">Fastest growing platform in East Africa</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-green-600 text-2xl">diversity_3</span>
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">Impact</h3>
                <p className="text-slate-600 text-sm">Make a difference in millions of lives</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-purple-600 text-2xl">school</span>
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">Learning</h3>
                <p className="text-slate-600 text-sm">Work with industry experts</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-orange-600 text-2xl">workspace_premium</span>
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">Flexibility</h3>
                <p className="text-slate-600 text-sm">Remote and hybrid work options</p>
              </div>
            </div>
          </div>
          
          {/* Culture Section */}
          <div className="bg-slate-100 rounded-xl p-8 mt-16">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Our Culture</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <h3 className="font-semibold text-slate-800 mb-3">Innovation</h3>
                <p className="text-slate-600 text-sm">Always building, always improving</p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-3">Integrity</h3>
                <p className="text-slate-600 text-sm">Trust and transparency in everything we do</p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-3">Community</h3>
                <p className="text-slate-600 text-sm">Supporting each other to succeed together</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Application Form Modal */}
      {showApplicationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800">
                  Apply for {selectedJob?.title}
                </h2>
                <button
                  onClick={() => setShowApplicationForm(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="applicantName"
                    value={formData.applicantName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Years of Experience</label>
                  <input
                    type="number"
                    name="experienceYears"
                    value={formData.experienceYears}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Current Company</label>
                  <input
                    type="text"
                    name="currentCompany"
                    value={formData.currentCompany}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Current Position</label>
                  <input
                    type="text"
                    name="currentPosition"
                    value={formData.currentPosition}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">LinkedIn Profile</label>
                  <input
                    type="url"
                    name="linkedinUrl"
                    value={formData.linkedinUrl}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Portfolio URL</label>
                  <input
                    type="url"
                    name="portfolioUrl"
                    value={formData.portfolioUrl}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://yourportfolio.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Salary Expectations</label>
                  <input
                    type="text"
                    name="salaryExpectations"
                    value={formData.salaryExpectations}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 80,000 - 100,000 KES"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Availability</label>
                  <input
                    type="text"
                    name="availability"
                    value={formData.availability}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Immediate, 2 weeks notice"
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">Cover Letter</label>
                <textarea
                  name="coverLetter"
                  value={formData.coverLetter}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tell us why you're interested in this position and why you'd be a great fit for Makao..."
                ></textarea>
              </div>
              
              {/* Success/Error Messages */}
              {submitStatus === 'success' && (
                <div className="mt-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                  Your application has been submitted successfully! We'll review it and get back to you soon.
                </div>
              )}
              
              {submitStatus === 'error' && (
                <div className="mt-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                  {errorMessage}
                </div>
              )}
              
              <div className="mt-6 flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowApplicationForm(false)}
                  className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
