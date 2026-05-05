'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Star,
  Calendar,
  MessageSquare,
  Home,
  Users,
  TrendingUp,
  Check,
  Heart,
  Share2
} from 'lucide-react';

interface Agent {
  id: string;
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
  responseRate: number;
  averageRating: number;
  reviewCount: number;
  yearsExperience: number;
  verified: boolean;
  featured: boolean;
  address: {
    city: string;
    state: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  createdAt: string;
}

interface Property {
  id: string;
  title: string;
  address: {
    street: string;
    city: string;
    state: string;
  };
  rent: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  images: string[];
  featured: boolean;
  createdAt: string;
}

export default function AgentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchAgentData(params.id as string);
    }
  }, [params.id]);

  const fetchAgentData = async (agentId: string) => {
    try {
      // Fetch agent details
      const agentResponse = await fetch(`/api/agents/${agentId}`);
      if (agentResponse.ok) {
        const agentData = await agentResponse.json();
        setAgent(agentData.agent);
      } else {
        throw new Error('Agent not found');
      }

      // Fetch agent's properties
      const propertiesResponse = await fetch(`/api/agents/${agentId}/properties`);
      if (propertiesResponse.ok) {
        const propertiesData = await propertiesResponse.json();
        setProperties(propertiesData.properties || []);
      }
    } catch (error) {
      setError('Failed to load agent information');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    // Redirect to login or open message modal
    router.push('/login');
  };

  const handleSaveAgent = () => {
    // Save agent to favorites
    console.log('Save agent:', agent?.id);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${agent?.name} - Makao Agent`,
        text: `Check out ${agent?.name}'s profile on Makao`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
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

  if (error || !agent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Agent Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/agents"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
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
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/agents" className="inline-flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Agents
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleShare}
                className="text-gray-600 hover:text-gray-900"
              >
                <Share2 className="h-5 w-5" />
              </button>
              <button
                onClick={handleSaveAgent}
                className="text-gray-600 hover:text-red-600"
              >
                <Heart className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Profile */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {agent.avatar ? (
                  <img
                    src={agent.avatar}
                    alt={agent.name}
                    className="h-24 w-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                    <Users className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Agent Info */}
              <div className="flex-1">
                <div className="flex items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{agent.name}</h1>
                    <p className="text-sm text-gray-600">{agent.company || 'Independent Agent'}</p>
                  </div>
                  {agent.verified && (
                    <div className="flex items-center space-x-1 text-green-600">
                      <Check className="h-5 w-5" />
                      <span className="text-sm font-medium">Verified</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-3">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="ml-1 font-medium">{(agent.averageRating || 0).toFixed(1)}</span>
                    <span className="text-gray-500">({agent.reviewCount || 0} reviews)</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{agent.yearsExperience || 0} years experience</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Home className="h-4 w-4 mr-1" />
                    <span>{agent.propertiesCount} properties</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    <span>{agent.responseTime} response time</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {agent.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contact Actions */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={handleSendMessage}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <MessageSquare className="h-4 w-4 inline mr-2" />
                  Send Message
                </button>
                {agent.phone && (
                  <a
                    href={`tel:${agent.phone}`}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    <Phone className="h-4 w-4 inline mr-2" />
                    {agent.phone}
                  </a>
                )}
                <a
                  href={`mailto:${agent.email}`}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  <Mail className="h-4 w-4 inline mr-2" />
                  Email
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bio and Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed">{agent.bio}</p>
            </section>

            {/* Properties */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Properties ({properties.length})
              </h2>
              {properties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {properties.map((property) => (
                    <div
                      key={property.id}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                    >
                      <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                        {property.images[0] && (
                          <img
                            src={property.images[0]}
                            alt={property.title}
                            className="w-full h-48 object-cover"
                          />
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900">{property.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {property.address.city}, {property.address.state}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-lg font-bold text-blue-600">
                            KES {property.rent.toLocaleString()}/mo
                          </p>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span>{property.bedrooms} bed</span>
                            <span>{property.bathrooms} bath</span>
                          </div>
                        </div>
                        <div className="mt-3">
                          <Link
                            href={`/properties/${property.id}`}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            View Details →
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                  <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No properties listed</h3>
                  <p className="text-sm text-gray-600">This agent hasn't listed any properties yet</p>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Location */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{agent.address.city}, {agent.address.state}</span>
                </div>
              </div>
            </section>

            {/* Languages */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Languages</h2>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="space-y-2">
                  {agent.languages.map((language, index) => (
                    <div key={index} className="text-gray-700">{language}</div>
                  ))}
                </div>
              </div>
            </section>

            {/* Stats */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance</h2>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Response Rate</span>
                    <span className="font-medium">{agent.responseRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Response Time</span>
                    <span className="font-medium">{agent.responseTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Member Since</span>
                    <span className="font-medium">
                      {new Date(agent.createdAt).getFullYear()}
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
