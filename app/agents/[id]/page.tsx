'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Star,
  Users,
  Building,
  MessageSquare,
  Calendar,
  Globe,
  Award,
  CheckCircle,
  Clock,
  TrendingUp,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Home,
  Filter,
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
  website?: string;
  languages: string[];
  specialties: string[];
  responseTime: string;
  responseRate: number;
  totalListings: number;
  activeListings: number;
  averageRating: number;
  reviewCount: number;
  yearsExperience: number;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  verified: boolean;
  featured: boolean;
  socialMedia?: {
    linkedin?: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
  certifications: string[];
  achievements: string[];
  createdAt: string;
}

interface Property {
  _id: string;
  title: string;
  rent: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  images: string[];
  address: {
    city: string;
    state: string;
  };
  status: 'available' | 'rented' | 'pending';
  views: number;
  createdAt: string;
}

interface Review {
  _id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  propertyTitle?: string;
}

export default function AgentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;

  const [agent, setAgent] = useState<Agent | null>(null);
  const [listings, setListings] = useState<Property[]>([]);
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
        setAgent(agentData.agent);
      }

      if (listingsRes.ok) {
        const listingsData = await listingsRes.json();
        setListings(listingsData.properties);
      }

      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json();
        setReviews(reviewsData.reviews);
      }
    } catch (error) {
      console.error('Failed to fetch agent details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId,
          ...messageForm,
        }),
      });

      if (response.ok) {
        setShowMessageForm(false);
        setMessageForm({ name: '', email: '', phone: '', message: '' });
        alert('Message sent successfully!');
      } else {
        alert('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Agent not found</h2>
          <Link
            href="/agents"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Agents
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/agents" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline ml-1">Back to Agents</span>
              </Link>
              <h1 className="text-sm sm:text-xl font-semibold text-gray-900">Agent Profile</h1>
            </div>
            <div className="flex space-x-2">
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Profile Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="h-24 w-24 sm:h-32 sm:w-32 bg-gray-200 rounded-full flex items-center justify-center">
                  <Users className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400" />
                </div>
                {agent.verified && (
                  <div className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Agent Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{agent.name}</h2>
                  {agent.company && (
                    <p className="text-lg text-gray-600 mb-2">{agent.company}</p>
                  )}
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="font-semibold">{agent.averageRating.toFixed(1)}</span>
                      <span>({agent.reviewCount} reviews)</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{agent.responseTime}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="h-4 w-4" />
                      <span>{agent.responseRate}% response rate</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => setShowMessageForm(true)}
                    className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm sm:text-base"
                  >
                    <MessageSquare className="h-4 w-4 inline mr-2" />
                    Send Message
                  </button>
                  <button className="border border-blue-600 text-blue-600 px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-50 font-medium text-sm sm:text-base">
                    <Heart className="h-4 w-4 inline mr-2" />
                    Save Agent
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{agent.activeListings}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Active Listings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{agent.yearsExperience}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Years Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{agent.totalListings}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Total Listings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{agent.languages.length}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Languages</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 rounded-full p-2">
                <Mail className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Email</div>
                <div className="text-sm font-medium text-gray-900">{agent.email}</div>
              </div>
            </div>
            {agent.phone && (
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 rounded-full p-2">
                  <Phone className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Phone</div>
                  <div className="text-sm font-medium text-gray-900">{agent.phone}</div>
                </div>
              </div>
            )}
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 rounded-full p-2">
                <MapPin className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Location</div>
                <div className="text-sm font-medium text-gray-900">{agent.address.city}, {agent.address.state}</div>
              </div>
            </div>
            {agent.website && (
              <div className="flex items-center space-x-3">
                <div className="bg-orange-100 rounded-full p-2">
                  <Globe className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Website</div>
                  <a href={agent.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:underline">
                    Visit Website
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border-b sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {['about', 'listings', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm sm:text-base capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'about' && 'About'}
                {tab === 'listings' && `Listings (${listings.length})`}
                {tab === 'reviews' && `Reviews (${reviews.length})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'about' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Bio */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
                <p className="text-gray-700 leading-relaxed">{agent.bio}</p>
              </div>

              {/* Specialties */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Areas of Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {agent.specialties.map((specialty, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {agent.languages.map((language, index) => (
                    <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      {language}
                    </span>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              {agent.certifications.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Certifications</h3>
                  <div className="space-y-2">
                    {agent.certifications.map((cert, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Award className="h-4 w-4 text-blue-600" />
                        <span className="text-gray-700">{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Achievements */}
              {agent.achievements.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h3>
                  <div className="space-y-2">
                    {agent.achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-gray-700">{achievement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Response Time</span>
                    <span className="font-medium">{agent.responseTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Response Rate</span>
                    <span className="font-medium">{agent.responseRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Rating</span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="font-medium">{agent.averageRating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* License Info */}
              {agent.license && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">License Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">License #</span>
                      <span className="font-medium">{agent.license}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status</span>
                      <span className="font-medium text-green-600">Active</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'listings' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Listings</h3>
                <p className="text-gray-600">This agent doesn't have any active listings at the moment.</p>
              </div>
            ) : (
              listings.map((property) => (
                <div key={property._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="relative h-48 bg-gray-200">
                    {property.images.length > 0 ? (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Home className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    <span className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${
                      property.status === 'available'
                        ? 'bg-green-100 text-green-800'
                        : property.status === 'rented'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {property.status}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{property.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {property.address.city}, {property.address.state}
                    </p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-bold text-blue-600">
                        ${property.rent.toLocaleString()}/mo
                      </span>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>{property.bedrooms}bd</span>
                        <span>{property.bathrooms}ba</span>
                        <span>{property.squareFeet}sqft</span>
                      </div>
                    </div>
                    <Link
                      href={`/properties/${property._id}`}
                      className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 text-center font-medium"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {reviews.length === 0 ? (
              <div className="text-center py-12">
                <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
                <p className="text-gray-600">Be the first to review this agent.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review._id} className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{review.userName}</h4>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                    {review.propertyTitle && (
                      <div className="mt-2 text-sm text-gray-500">
                        Reviewed: {review.propertyTitle}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Message Modal */}
      {showMessageForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Message to {agent.name}</h3>
              <form onSubmit={handleMessageSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={messageForm.name}
                    onChange={(e) => setMessageForm({ ...messageForm, name: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={messageForm.email}
                    onChange={(e) => setMessageForm({ ...messageForm, email: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
                  <input
                    type="tel"
                    value={messageForm.phone}
                    onChange={(e) => setMessageForm({ ...messageForm, phone: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    required
                    rows={4}
                    value={messageForm.message}
                    onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Hello, I'm interested in your services..."
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowMessageForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
