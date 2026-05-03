'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Star,
  MapPin,
  Mail,
  Phone,
  MessageSquare,
  Calendar,
  Building,
  Users,
  Check,
  Shield,
  Languages,
  Clock,
  Award,
  TrendingUp,
  FileText,
  Heart,
  X
} from 'lucide-react';

interface Agent {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio: string;
  company?: string;
  license?: string;
  specialties: string[];
  languages: string[];
  rating: number;
  reviews: number;
  propertiesCount: number;
  responseTime: string;
  verified: boolean;
  featured: boolean;
  createdAt: string;
  address: {
    city: string;
    state: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
}

interface Property {
  _id: string;
  title: string;
  address: {
    city: string;
    state: string;
  };
  rent: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  images: string[];
  status: string;
}

interface Review {
  _id: string;
  agentId: string;
  rating: number;
  comment: string;
  reviewerName: string;
  reviewerType: string;
  createdAt: string;
}

export default function AgentDetailPage() {
  const params = useParams();
  const agentId = params.id as string;

  const [agent, setAgent] = useState<Agent | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');
  const [messageForm, setMessageForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [showMessageForm, setShowMessageForm] = useState(false);

  useEffect(() => {
    fetchAgentDetails();
  }, [agentId]);

  const fetchAgentDetails = async () => {
    setIsLoading(true);
    try {
      const [agentRes, listingsRes, reviewsRes] = await Promise.all([
        fetch(`/api/agents/${agentId}`),
        fetch(`/api/agents/${agentId}/listings`),
        fetch(`/api/agents/${agentId}/reviews`)
      ]);

      if (agentRes.ok) {
        const agentData = await agentRes.json();
        setAgent(agentData);
      }

      if (listingsRes.ok) {
        const listingsData = await listingsRes.json();
        setProperties(listingsData);
      }

      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json();
        setReviews(reviewsData);
      }
    } catch (error) {
      console.error('Failed to fetch agent details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const handleMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/agents/${agentId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageForm),
      });

      if (response.ok) {
        setShowMessageForm(false);
        setMessageForm({ name: '', email: '', phone: '', message: '' });
        // TODO: Show success message
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading agent profile...</p>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Agent Not Found</h2>
          <p className="text-gray-600 mb-8">The agent you're looking for doesn't exist.</p>
          <Link href="/agents" className="text-blue-600 hover:text-blue-700">
            Back to Agents
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/agents" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline ml-1">Back to Agents</span>
              </Link>
              <h1 className="text-sm sm:text-xl font-semibold text-gray-900">Agent Profile</h1>
            </div>
            <div className="flex space-x-2">
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Agent Profile Header */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Profile Image */}
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-12 w-12 sm:h-16 sm:w-16 text-blue-600" />
                  </div>
                </div>

                {/* Profile Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{agent.name}</h2>
                        {agent.verified && (
                          <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
                            <Shield className="h-3 w-3 mr-1" />
                            Verified
                          </div>
                        )}
                      </div>
                      
                      {agent.company && (
                        <p className="text-lg text-gray-600 mb-2">{agent.company}</p>
                      )}
                      
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="flex items-center">
                          {renderStars(agent.rating)}
                          <span className="ml-2 text-sm text-gray-600">
                            {agent.rating.toFixed(1)} ({agent.reviews} reviews)
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{agent.address.city}, {agent.address.state}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>Response: {agent.responseTime}</span>
                        </div>
                        <div className="flex items-center">
                          <Building className="h-4 w-4 mr-1" />
                          <span>{agent.propertiesCount} properties</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-700 mt-4 leading-relaxed">{agent.bio}</p>

                  {/* Contact Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <button
                      onClick={() => setShowMessageForm(true)}
                      className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      <MessageSquare className="h-4 w-4 inline mr-2" />
                      Send Message
                    </button>
                    {agent.phone && (
                      <a
                        href={`tel:${agent.phone}`}
                        className="flex-1 border border-blue-600 text-blue-600 py-3 px-4 rounded-lg hover:bg-blue-50 transition-colors font-medium text-center"
                      >
                        <Phone className="h-4 w-4 inline mr-2" />
                        {agent.phone}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-lg">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {['about', 'properties', 'reviews'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                        activeTab === tab
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'about' && (
                  <div className="space-y-6">
                    {/* Specialties */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Specialties</h3>
                      <div className="flex flex-wrap gap-2">
                        {agent.specialties.map((specialty, index) => (
                          <span
                            key={index}
                            className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Languages */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Languages</h3>
                      <div className="flex flex-wrap gap-2">
                        {agent.languages.map((language, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center"
                          >
                            <Languages className="h-3 w-3 mr-1" />
                            {language}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* License */}
                    {agent.license && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">License</h3>
                        <p className="text-gray-600">{agent.license}</p>
                      </div>
                    )}

                    {/* Stats */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Performance</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{agent.propertiesCount}</div>
                          <div className="text-sm text-gray-600">Properties</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{agent.reviews}</div>
                          <div className="text-sm text-gray-600">Reviews</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-600">{agent.rating.toFixed(1)}</div>
                          <div className="text-sm text-gray-600">Rating</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">{agent.responseTime}</div>
                          <div className="text-sm text-gray-600">Response</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'properties' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Listings ({properties.length})</h3>
                    {properties.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No active listings</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {properties.map((property) => (
                          <div key={property._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="h-32 bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                              <Building className="h-8 w-8 text-gray-400" />
                            </div>
                            <h4 className="font-medium text-gray-900 mb-1">{property.title}</h4>
                            <p className="text-sm text-gray-600 mb-2">
                              {property.address.city}, {property.address.state}
                            </p>
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-bold text-blue-600">
                                KES {property.rent.toLocaleString()}/mo
                              </span>
                              <div className="flex items-center text-sm text-gray-600">
                                <span>{property.bedrooms}bd</span>
                                <span className="mx-1">•</span>
                                <span>{property.bathrooms}ba</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Reviews ({reviews.length})</h3>
                    {reviews.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No reviews yet</p>
                    ) : (
                      <div className="space-y-4">
                        {reviews.map((review) => (
                          <div key={review._id} className="border-b border-gray-200 pb-4 last:border-b-0">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-medium text-gray-900">{review.reviewerName}</h4>
                                <p className="text-sm text-gray-600">{review.reviewerType}</p>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center">
                                  {renderStars(review.rating)}
                                </div>
                                <p className="text-xs text-gray-500">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <p className="text-gray-700">{review.comment}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Experience</span>
                  <span className="font-medium">5+ Years</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Response Rate</span>
                  <span className="font-medium">98%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Recent Sales</span>
                  <span className="font-medium">47</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Avg. Time on Market</span>
                  <span className="font-medium">21 days</span>
                </div>
              </div>
            </div>

            {/* Awards */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Award className="h-5 w-5 text-yellow-500 mr-3" />
                  <span className="text-sm text-gray-700">Top Agent 2023</span>
                </div>
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-sm text-gray-700">Best Customer Service</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-blue-500 mr-3" />
                  <span className="text-sm text-gray-700">5-Star Rating</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message Modal */}
      {showMessageForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Send Message</h3>
              <button
                onClick={() => setShowMessageForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleMessageSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={messageForm.name}
                  onChange={(e) => setMessageForm({ ...messageForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={messageForm.email}
                  onChange={(e) => setMessageForm({ ...messageForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
                <input
                  type="tel"
                  value={messageForm.phone}
                  onChange={(e) => setMessageForm({ ...messageForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  required
                  rows={4}
                  value={messageForm.message}
                  onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Send Message
                </button>
                <button
                  type="button"
                  onClick={() => setShowMessageForm(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
