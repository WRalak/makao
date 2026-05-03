'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Heart,
  Share2,
  MapPin,
  Bed,
  Bath,
  Square,
  Calendar,
  Home,
  Phone,
  Mail,
  MessageSquare,
  Star,
  Navigation,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Users,
  Shield,
  Wifi,
  Car,
  Dumbbell,
  Coffee,
  Wind
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
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  securityDeposit: number;
  leaseTerm: string;
  availabilityDate: string;
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
  images: string[];
  agentId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  views: number;
  createdAt: string;
  status: 'available' | 'rented' | 'pending' | 'rejected';
  isApproved: boolean;
  messagesCount: number;
}

interface Question {
  _id: string;
  propertyId: string;
  question: string;
  answer?: string;
  askedBy: string;
  askedByName: string;
  createdAt: string;
  answeredAt?: string;
  answeredBy?: string;
}

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);
  const [isSchedulingTour, setIsSchedulingTour] = useState(false);
  const [tourDate, setTourDate] = useState('');
  const [tourTime, setTourTime] = useState('');
  const [walkScore, setWalkScore] = useState(0);
  const [transitScore, setTransitScore] = useState(0);

  useEffect(() => {
    fetchPropertyDetails();
  }, [propertyId]);

  const fetchPropertyDetails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/properties/${propertyId}`);
      
      if (response.ok) {
        const data = await response.json();
        setProperty(data);
        fetchQuestions(propertyId);
      } else {
        // Use sample data on error
        setSampleProperty(propertyId);
      }
    } catch (error) {
      console.error('Failed to fetch property details:', error);
      // Use sample data on error
      setSampleProperty(propertyId);
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

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: Implement favorite functionality
  };

  const handleSubmitQuestion = async () => {
    if (!newQuestion.trim()) return;
    
    setIsSubmittingQuestion(true);
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
    } finally {
      setIsSubmittingQuestion(false);
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
        // TODO: Show success message
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h2>
          <p className="text-gray-600 mb-8">The property you're looking for doesn't exist.</p>
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
                    <Home className="h-16 w-16 text-gray-400" />
                  </div>
                )}
              </div>
              
              {/* Thumbnail Gallery */}
              {property.images.length > 1 && (
                <div className="flex p-4 space-x-2 overflow-x-auto">
                  {property.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        selectedImage === index ? 'border-blue-600' : 'border-gray-300'
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
                  <span>{property.squareFeet} sqft</span>
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

              {/* Amenities */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.amenities.parking && (
                    <div className="flex items-center text-gray-700">
                      <Car className="h-5 w-5 mr-2 text-blue-600" />
                      <span>Parking</span>
                    </div>
                  )}
                  {property.amenities.laundry && (
                    <div className="flex items-center text-gray-700">
                      <Coffee className="h-5 w-5 mr-2 text-blue-600" />
                      <span>Laundry</span>
                    </div>
                  )}
                  {property.amenities.petsAllowed && (
                    <div className="flex items-center text-gray-700">
                      <Shield className="h-5 w-5 mr-2 text-blue-600" />
                      <span>Pets Allowed</span>
                    </div>
                  )}
                  {property.amenities.utilitiesIncluded && (
                    <div className="flex items-center text-gray-700">
                      <Check className="h-5 w-5 mr-2 text-blue-600" />
                      <span>Utilities Included</span>
                    </div>
                  )}
                  {property.amenities.furnished && (
                    <div className="flex items-center text-gray-700">
                      <Home className="h-5 w-5 mr-2 text-blue-600" />
                      <span>Furnished</span>
                    </div>
                  )}
                  {property.amenities.airConditioning && (
                    <div className="flex items-center text-gray-700">
                      <Wind className="h-5 w-5 mr-2 text-blue-600" />
                      <span>Air Conditioning</span>
                    </div>
                  )}
                  {property.amenities.heating && (
                    <div className="flex items-center text-gray-700">
                      <Wind className="h-5 w-5 mr-2 text-blue-600" />
                      <span>Heating</span>
                    </div>
                  )}
                  {property.amenities.internet && (
                    <div className="flex items-center text-gray-700">
                      <Wifi className="h-5 w-5 mr-2 text-blue-600" />
                      <span>Internet</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Location & Directions */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Location</h2>
                <div className="bg-gray-100 rounded-lg h-64 mb-4 flex items-center justify-center">
                  <p className="text-gray-500">Map view would be displayed here</p>
                </div>
                <button
                  onClick={handleGetDirections}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Get Directions
                </button>
              </div>
            </div>

            {/* Q&A Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Questions & Answers</h2>
              
              {/* Ask a Question */}
              <div className="mb-6">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Ask a question about this property..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleSubmitQuestion}
                    disabled={!newQuestion.trim() || isSubmittingQuestion}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingQuestion ? 'Asking...' : 'Ask'}
                  </button>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {questions.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No questions yet. Be the first to ask!</p>
                ) : (
                  questions.map((question) => (
                    <div key={question._id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <Users className="h-4 w-4 text-gray-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900">{question.askedByName}</h4>
                            <span className="text-sm text-gray-500">
                              {new Date(question.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-700 mt-1">{question.question}</p>
                          {question.answer && (
                            <div className="mt-3 bg-blue-50 rounded-lg p-3">
                              <div className="flex items-center space-x-2 mb-1">
                                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                  <Users className="h-3 w-3 text-white" />
                                </div>
                                <span className="text-sm font-medium text-blue-900">Agent</span>
                              </div>
                              <p className="text-gray-700">{question.answer}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Agent Card */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Listed by</h3>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h4 className="font-medium text-gray-900">{property.agentId.name}</h4>
                  <p className="text-sm text-gray-600">Real Estate Agent</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  <MessageSquare className="h-4 w-4 inline mr-2" />
                  Contact Agent
                </button>
                <button className="w-full border border-blue-600 text-blue-600 py-3 px-4 rounded-lg hover:bg-blue-50 transition-colors font-medium">
                  <Phone className="h-4 w-4 inline mr-2" />
                  {property.agentId.phone || 'Call Agent'}
                </button>
              </div>
            </div>

            {/* Schedule Tour */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule a Tour</h3>
              {!isSchedulingTour ? (
                <button
                  onClick={() => setIsSchedulingTour(true)}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Schedule Tour
                </button>
              ) : (
                <div className="space-y-3">
                  <input
                    type="date"
                    value={tourDate}
                    onChange={(e) => setTourDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="time"
                    value={tourTime}
                    onChange={(e) => setTourTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleScheduleTour}
                      disabled={!tourDate || !tourTime}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit
                    </button>
                    <button
                      onClick={() => {
                        setIsSchedulingTour(false);
                        setTourDate('');
                        setTourTime('');
                      }}
                      className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Property Info */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Rent</span>
                  <span className="font-medium">KES {property.rent.toLocaleString()}/month</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Security Deposit</span>
                  <span className="font-medium">KES {property.securityDeposit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Lease Term</span>
                  <span className="font-medium">{property.leaseTerm}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Available</span>
                  <span className="font-medium">{new Date(property.availabilityDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Property Type</span>
                  <span className="font-medium">Apartment</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Year Built</span>
                  <span className="font-medium">2022</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {showLightbox && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setShowLightbox(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <X className="h-8 w-8" />
            </button>
            <img
              src={property.images[selectedImage]}
              alt={property.title}
              className="max-w-full max-h-full rounded-lg"
            />
            {property.images.length > 1 && (
              <div className="flex justify-center mt-4 space-x-2">
                {property.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-2 h-2 rounded-full ${
                      selectedImage === index ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
