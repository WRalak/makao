'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin,
  DollarSign,
  Bed,
  Bath,
  Square,
  Calendar,
  Home,
  Heart,
  MessageSquare,
  Phone,
  Mail,
  Star,
  ChevronLeft,
  ChevronRight,
  Share2,
  User,
  Car,
  Wifi,
  Droplets,
  Wind,
  Dumbbell,
  Trees,
  Navigation,
  Clock,
  Check,
  X,
  Send,
  Camera,
  Video,
} from 'lucide-react';

interface Property {
  _id: string;
  title: string;
  description: string;
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
  rent: number;
  securityDeposit: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  images: string[];
  availabilityDate: string;
  leaseTerm: string;
  amenities: {
    parking: boolean;
    laundry: boolean;
    petsAllowed: boolean;
    utilitiesIncluded: boolean;
    furnished: boolean;
    airConditioning: boolean;
    heating: boolean;
    internet: boolean;
  };
  status: 'available' | 'rented' | 'pending' | 'rejected';
  isApproved: boolean;
  views: number;
  messagesCount: number;
  agentId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  createdAt: string;
}

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [walkScore, setWalkScore] = useState(85);
  const [transitScore, setTransitScore] = useState(78);
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);
  const [nearbyPlaces, setNearbyPlaces] = useState<any[]>([]);
  const [isSchedulingTour, setIsSchedulingTour] = useState(false);
  const [tourDate, setTourDate] = useState('');
  const [tourTime, setTourTime] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchProperty(params.id as string);
    }
  }, [params.id]);

  const fetchProperty = async (id: string) => {
    try {
      const response = await fetch(`/api/properties/${id}`);
      if (response.ok) {
        const data = await response.json();
        setProperty(data);
        
        // Fetch additional data
        await Promise.all([
          fetchQuestions(id),
          fetchSimilarProperties(id),
          fetchNearbyPlaces(data.address.coordinates),
          fetchWalkScores(data.address.coordinates)
        ]);
      } else {
        // If API fails, use sample data
        setSampleProperty(id);
      }
    } catch (error) {
      console.error('Failed to fetch property:', error);
      // Use sample data on error
      setSampleProperty(id);
    } finally {
      setIsLoading(false);
    }
  };

  const setSampleProperty = (id: string) => {
    const sampleProperty = {
      _id: id,
      title: "Modern Westlands Apartment",
      description: "Experience luxury living in this stunning Westlands apartment with breathtaking Nairobi skyline views. This modern residence features high-end finishes, spacious rooms, and world-class amenities. Perfect for professionals who demand the best in urban living.",
      address: {
        street: "Muthaiga Road",
        city: "Nairobi",
        state: "Kenya",
        zipCode: "00100",
        coordinates: { lat: -1.2921, lng: 36.8219 }
      },
      rent: 85000,
      bedrooms: 2,
      bathrooms: 2,
      squareFeet: 1200,
      securityDeposit: 170000,
      leaseTerm: "12 months",
      availabilityDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      messagesCount: 0,
      amenities: {
        parking: true,
        laundry: true,
        petsAllowed: true,
        utilitiesIncluded: false,
        furnished: false,
        airConditioning: true,
        heating: true,
        internet: true
      },
      images: [
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
        "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=800",
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800"
      ],
      agentId: {
        _id: "agent1",
        name: "Michael Chen",
        email: "michael@proprent.com",
        phone: "(555) 123-4567"
      },
      views: 1234,
      createdAt: new Date().toISOString(),
      status: "available" as const,
      isApproved: true
    };
    
    setProperty(sampleProperty);
    
    // Set sample additional data
    setWalkScore(92);
    setTransitScore(88);
    setSimilarProperties([]); // Will be populated via API
  };

  const fetchQuestions = async (propertyId: string) => {
    try {
      const response = await fetch(`/api/properties/${propertyId}/questions`);
      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    }
  };

  const fetchSimilarProperties = async (propertyId: string) => {
    try {
      const response = await fetch(`/api/properties/${propertyId}/similar`);
      if (response.ok) {
        const data = await response.json();
        setSimilarProperties(data);
      }
    } catch (error) {
      console.error('Failed to fetch similar properties:', error);
    }
  };

  const fetchNearbyPlaces = async (coordinates: { lat: number; lng: number }) => {
    try {
      const response = await fetch(`/api/places/nearby`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coordinates })
      });
      if (response.ok) {
        const data = await response.json();
        setNearbyPlaces(data);
      }
    } catch (error) {
      console.error('Failed to fetch nearby places:', error);
    }
  };

  const fetchWalkScores = async (coordinates: { lat: number; lng: number }) => {
    try {
      const response = await fetch(`/api/walk-scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coordinates })
      });
      if (response.ok) {
        const data = await response.json();
        setWalkScore(data.walkScore);
        setTransitScore(data.transitScore);
      }
    } catch (error) {
      console.error('Failed to fetch walk scores:', error);
    }
  };

  const handleToggleFavorite = async () => {
    // Toggle favorite logic would go here
    setIsFavorite(!isFavorite);
  };

  const handleMessageAgent = () => {
    // Check if user is logged in
    const token = document.cookie.split(';').find(cookie => cookie.trim().startsWith('auth_token='));
    if (!token) {
      router.push('/login');
      return;
    }
    setShowContactModal(true);
  };

  const handleSubmitQuestion = async () => {
    if (!newQuestion.trim()) return;
    
    try {
      const response = await fetch(`/api/properties/${property?._id}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: newQuestion })
      });
      
      if (response.ok) {
        setNewQuestion('');
        fetchQuestions(property?._id!);
      }
    } catch (error) {
      console.error('Failed to submit question:', error);
    }
  };

  const handleScheduleTour = async () => {
    if (!tourDate || !tourTime) return;
    
    try {
      const response = await fetch(`/api/properties/${property?._id}/tour`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: tourDate, time: tourTime })
      });
      
      if (response.ok) {
        setIsSchedulingTour(false);
        setTourDate('');
        setTourTime('');
        // Show success message
      }
    } catch (error) {
      console.error('Failed to schedule tour:', error);
    }
  };

  const handleGetDirections = () => {
    if (property) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${property.address.coordinates.lat},${property.address.coordinates.lng}`;
      window.open(url, '_blank');
    }
  };

  const getWalkScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    if (score >= 50) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading property...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Property not found</h2>
          <Link
            href="/properties"
            className="text-blue-600 hover:text-blue-700"
          >
            Back to Properties
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
            <Link
              href="/properties"
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Back to Properties
            </Link>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleToggleFavorite}
                className={`p-2 rounded-full ${isFavorite ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'} hover:bg-red-100 hover:text-red-600`}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              <button className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200">
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery with Lightbox */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
              <div className="relative h-96 bg-gray-200">
                {property.images.length > 0 ? (
                  <div>
                    <img
                      src={property.images[selectedImage]}
                      alt={property.title}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => setShowLightbox(true)}
                    />
                    <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                      {selectedImage + 1} / {property.images.length}
                    </div>
                    {property.images.length > 1 && (
                      <>
                        <button
                          onClick={() => setSelectedImage((prev) => (prev - 1 + property.images.length) % property.images.length)}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setSelectedImage((prev) => (prev + 1) % property.images.length)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Home className="h-24 w-24 text-gray-400" />
                  </div>
                )}
              </div>
              
              {property.images.length > 1 && (
                <div className="flex p-4 space-x-2 overflow-x-auto">
                  {property.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${property.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span className="text-lg">
                      {property.address.street}, {property.address.city}, {property.address.state} {property.address.zipCode}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">
                    KES {property.rent.toLocaleString()}/month
                  </div>
                  <div className="text-sm text-gray-500">
                    Security Deposit: KES {property.securityDeposit.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Property Stats */}
              <div className="flex items-center space-x-6 mb-6 pb-6 border-b">
                <div className="flex items-center text-gray-700">
                  <Bed className="h-5 w-5 mr-1" />
                  <span>{property.bedrooms} Bedrooms</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Bath className="h-5 w-5 mr-1" />
                  <span>{property.bathrooms} Bathrooms</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Square className="h-5 w-5 mr-1" />
                  <span>{property.squareFeet} sq ft</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Calendar className="h-5 w-5 mr-1" />
                  <span>Available {new Date(property.availabilityDate).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Walk Scores */}
              <div className="flex items-center space-x-4 mb-6 pb-6 border-b">
                <div className={`px-3 py-2 rounded-full ${getWalkScoreColor(walkScore)}`}>
                  <div className="flex items-center">
                    <Navigation className="h-4 w-4 mr-1" />
                    <span className="font-semibold">Walk Score: {walkScore}</span>
                  </div>
                </div>
                <div className={`px-3 py-2 rounded-full ${getWalkScoreColor(transitScore)}`}>
                  <div className="flex items-center">
                    <Navigation className="h-4 w-4 mr-1" />
                    <span className="font-semibold">Transit Score: {transitScore}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
                <p className="text-gray-700 leading-relaxed">{property.description}</p>
              </div>

              {/* Amenities with Icons */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className={`flex items-center p-3 rounded-lg ${property.amenities.parking ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                    <Car className="h-5 w-5 mr-2" />
                    <span>Parking</span>
                  </div>
                  <div className={`flex items-center p-3 rounded-lg ${property.amenities.laundry ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                    <Droplets className="h-5 w-5 mr-2" />
                    <span>Laundry</span>
                  </div>
                  <div className={`flex items-center p-3 rounded-lg ${property.amenities.petsAllowed ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                    <Trees className="h-5 w-5 mr-2" />
                    <span>Pet Friendly</span>
                  </div>
                  <div className={`flex items-center p-3 rounded-lg ${property.amenities.utilitiesIncluded ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                    <DollarSign className="h-5 w-5 mr-2" />
                    <span>Utilities Included</span>
                  </div>
                  <div className={`flex items-center p-3 rounded-lg ${property.amenities.furnished ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                    <Home className="h-5 w-5 mr-2" />
                    <span>Furnished</span>
                  </div>
                  <div className={`flex items-center p-3 rounded-lg ${property.amenities.airConditioning ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                    <Wind className="h-5 w-5 mr-2" />
                    <span>Air Conditioning</span>
                  </div>
                  <div className={`flex items-center p-3 rounded-lg ${property.amenities.heating ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                    <Wind className="h-5 w-5 mr-2" />
                    <span>Heating</span>
                  </div>
                  <div className={`flex items-center p-3 rounded-lg ${property.amenities.internet ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                    <Wifi className="h-5 w-5 mr-2" />
                    <span>Internet</span>
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Availability</h2>
                <div className="flex items-center space-x-6 text-gray-700">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span>Available: {new Date(property.availabilityDate).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span>Lease Term: {property.leaseTerm}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Map with Nearby Places */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Location</h2>
                <button
                  onClick={handleGetDirections}
                  className="flex items-center text-blue-600 hover:text-blue-700"
                >
                  <Navigation className="h-4 w-4 mr-1" />
                  Get Directions
                </button>
              </div>
              
              {/* Map Container */}
              <div className="h-64 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                <MapPin className="h-12 w-12 text-gray-400" />
                <span className="ml-2 text-gray-500">Interactive map will be displayed here</span>
              </div>

              {/* Nearby Places */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Nearby Places</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {nearbyPlaces.slice(0, 8).map((place, index) => (
                    <div key={index} className="flex items-center p-2 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                        {place.type === 'grocery' && <DollarSign className="h-4 w-4 text-blue-600" />}
                        {place.type === 'park' && <Trees className="h-4 w-4 text-green-600" />}
                        {place.type === 'transit' && <Navigation className="h-4 w-4 text-purple-600" />}
                        {place.type === 'school' && <Home className="h-4 w-4 text-orange-600" />}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{place.name}</div>
                        <div className="text-xs text-gray-500">{place.distance} mi</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Similar Properties Carousel */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Similar Properties</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {similarProperties.slice(0, 4).map((similar) => (
                  <div key={similar._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex space-x-4">
                      <img
                        src={similar.images[0] || '/placeholder-property.jpg'}
                        alt={similar.title}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{similar.title}</h4>
                        <p className="text-sm text-gray-600">
                          ${similar.rent.toLocaleString()}/month
                        </p>
                        <p className="text-xs text-gray-500">
                          {similar.address.city}, {similar.address.state}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/properties/${similar._id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm mt-2 inline-block"
                    >
                      View Details
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Agent Info */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Listed by</h2>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h3 className="font-semibold text-gray-900">{property.agentId.name}</h3>
                  <p className="text-sm text-gray-600">Real Estate Agent</p>
                  <div className="flex items-center mt-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 ml-1">(4.8)</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <Clock className="h-3 w-3 text-gray-400 mr-1" />
                    <span className="text-xs text-gray-500">Response: ~1 hour</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                {property.agentId.phone && (
                  <div className="flex items-center text-gray-700">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>{property.agentId.phone}</span>
                  </div>
                )}
                <div className="flex items-center text-gray-700">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>{property.agentId.email}</span>
                </div>
              </div>

              <button
                onClick={handleMessageAgent}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 flex items-center justify-center"
              >
                <MessageSquare className="h-5 w-5 mr-2" />
                Message Agent
              </button>
            </div>

            {/* Property Stats */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Stats</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Views</span>
                  <span className="font-semibold">{property.views}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Messages</span>
                  <span className="font-semibold">{property.messagesCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Listed</span>
                  <span className="font-semibold">{new Date(property.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={handleToggleFavorite}
                  className={`w-full py-3 px-4 rounded-md font-medium flex items-center justify-center ${
                    isFavorite
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Heart className={`h-5 w-5 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                  {isFavorite ? 'Remove from Favorites' : 'Save to Favorites'}
                </button>
                <button 
                  onClick={() => setIsSchedulingTour(true)}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-md font-medium hover:bg-gray-200 flex items-center justify-center"
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  Schedule Tour
                </button>
                <button className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-md font-medium hover:bg-gray-200 flex items-center justify-center">
                  <Share2 className="h-5 w-5 mr-2" />
                  Share Property
                </button>
              </div>
            </div>

            {/* Questions & Answers */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Questions & Answers</h2>
              <div className="space-y-4 mb-4">
                {questions.length === 0 ? (
                  <p className="text-gray-500 text-sm">No questions yet. Be the first to ask!</p>
                ) : (
                  questions.map((qa, index) => (
                    <div key={index} className="border-b pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 font-medium">{qa.question}</p>
                          <p className="text-sm text-gray-600 mt-1">{qa.answer}</p>
                        </div>
                        <span className="text-xs text-gray-500 ml-2">{qa.date}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Ask a question about this property..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <button
                  onClick={handleSubmitQuestion}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tour Scheduling Modal */}
      {isSchedulingTour && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Schedule a Tour</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
                <input
                  type="date"
                  value={tourDate}
                  onChange={(e) => setTourDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
                <select
                  value={tourTime}
                  onChange={(e) => setTourTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select a time</option>
                  <option value="9:00 AM">9:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="2:00 PM">2:00 PM</option>
                  <option value="3:00 PM">3:00 PM</option>
                  <option value="4:00 PM">4:00 PM</option>
                  <option value="5:00 PM">5:00 PM</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setIsSchedulingTour(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md font-medium hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleTour}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700"
              >
                Schedule Tour
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {showLightbox && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="relative max-w-4xl w-full h-3/4">
            <button
              onClick={() => setShowLightbox(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300"
            >
              <X className="h-8 w-8" />
            </button>
            <img
              src={property.images[selectedImage]}
              alt={property.title}
              className="w-full h-full object-contain"
            />
            {property.images.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImage((prev) => (prev - 1 + property.images.length) % property.images.length)}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 p-3 rounded-full hover:bg-white/30 text-white"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={() => setSelectedImage((prev) => (prev + 1) % property.images.length)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 p-3 rounded-full hover:bg-white/30 text-white"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white">
                  {selectedImage + 1} / {property.images.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Message Agent</h3>
            <p className="text-gray-600 mb-4">
              Send a message to {property.agentId.name} about {property.title}
            </p>
            <textarea
              placeholder="Type your message here..."
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
            />
            <div className="flex space-x-3 mt-4">
              <button
                onClick={() => setShowContactModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md font-medium hover:bg-gray-300"
              >
                Cancel
              </button>
              <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700">
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
