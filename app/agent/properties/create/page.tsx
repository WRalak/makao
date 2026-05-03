'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin,
  Home,
  Bed,
  Bath,
  Square,
  DollarSign,
  Calendar,
  Car,
  Wifi,
  Droplets,
  Wind,
  Dumbbell,
  Trees,
  Camera,
  Video,
  Upload,
  X,
  ChevronLeft,
  ChevronRight,
  Save,
  Eye,
} from 'lucide-react';

interface PropertyFormData {
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
  applicationFee: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  leaseTerm: string;
  availabilityDate: string;
  propertyType: string;
  status: 'available' | 'rented' | 'pending' | 'coming_soon';
  featured: boolean;
  amenities: {
    parking: boolean;
    laundry: boolean;
    petsAllowed: boolean;
    utilitiesIncluded: boolean;
    furnished: boolean;
    airConditioning: boolean;
    heating: boolean;
    internet: boolean;
    balcony: boolean;
    elevator: boolean;
    dishwasher: boolean;
    microwave: boolean;
    refrigerator: boolean;
    washerDryer: boolean;
    pool: boolean;
    gym: boolean;
  };
  petPolicy: 'allowed' | 'not_allowed' | 'case_by_case';
  petRent: number;
  petDeposit: number;
  parking: {
    spots: number;
    type: 'covered' | 'garage' | 'street';
  };
  laundry: 'in_unit' | 'in_building' | 'none';
  virtualTourUrl: string;
  images: File[];
}

export default function CreatePropertyPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [properties, setProperties] = useState<PropertyFormData>({
    title: '',
    description: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      coordinates: { lat: 0, lng: 0 }
    },
    rent: 0,
    securityDeposit: 0,
    applicationFee: 0,
    bedrooms: 1,
    bathrooms: 1,
    squareFeet: 0,
    leaseTerm: '12',
    availabilityDate: '',
    propertyType: 'apartment',
    status: 'available',
    featured: false,
    amenities: {
      parking: false,
      laundry: false,
      petsAllowed: false,
      utilitiesIncluded: false,
      furnished: false,
      airConditioning: false,
      heating: false,
      internet: false,
      balcony: false,
      elevator: false,
      dishwasher: false,
      microwave: false,
      refrigerator: false,
      washerDryer: false,
      pool: false,
      gym: false,
    },
    petPolicy: 'not_allowed',
    petRent: 0,
    petDeposit: 0,
    parking: {
      spots: 0,
      type: 'street'
    },
    laundry: 'none',
    virtualTourUrl: '',
    images: []
  });

  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const steps = [
    { id: 1, name: 'Basic Info', icon: Home },
    { id: 2, name: 'Location', icon: MapPin },
    { id: 3, name: 'Details', icon: Square },
    { id: 4, name: 'Amenities', icon: Wifi },
    { id: 5, name: 'Media', icon: Camera },
  ];

  // Rich text editor functions
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  // Address autocomplete with Mapbox
  const handleAddressChange = async (value: string) => {
    setProperties(prev => ({
      ...prev,
      address: { ...prev.address, street: value }
    }));

    if (value.length > 3) {
      try {
        // Mock Mapbox Places API call
        const response = await fetch(`/api/places/autocomplete?q=${encodeURIComponent(value)}`);
        const suggestions = await response.json();
        setAddressSuggestions(suggestions);
      } catch (error) {
        console.error('Failed to fetch address suggestions:', error);
      }
    }
  };

  const handleAddressSelect = async (suggestion: string) => {
    setProperties(prev => ({
      ...prev,
      address: { ...prev.address, street: suggestion }
    }));
    setAddressSuggestions([]);

    // Geocode the address to get coordinates
    try {
      const response = await fetch(`/api/places/geocode?address=${encodeURIComponent(suggestion)}`);
      const coordinates = await response.json();
      
      setProperties(prev => ({
        ...prev,
        address: {
          ...prev.address,
          coordinates: { lat: coordinates.lat, lng: coordinates.lng }
        }
      }));
    } catch (error) {
      console.error('Failed to geocode address:', error);
    }
  };

  // Image upload with drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024 // 10MB limit
    );
    
    handleImageUpload(files);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleImageUpload(files);
    }
  };

  const handleImageUpload = async (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    try {
      const response = await fetch('/api/upload/images', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      if (response.ok) {
        setUploadedImages(prev => [...prev, ...result.urls]);
      }
    } catch (error) {
      console.error('Failed to upload images:', error);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/agent/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...properties,
          images: uploadedImages
        })
      });

      if (response.ok) {
        router.push('/agent/properties');
      } else {
        console.error('Failed to create property');
      }
    } catch (error) {
      console.error('Failed to create property:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/agent/properties" className="mr-4">
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Create Property</h1>
            </div>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Property'}
            </button>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step.id
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-gray-300 text-gray-500'
                  }`}
                >
                  <step.icon className="h-5 w-5" />
                </div>
                <span
                  className={`ml-3 text-sm font-medium ${
                    currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                  }`}
                >
                  {step.name}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`w-full h-0.5 mx-4 ${
                      currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Property Title</label>
                  <input
                    type="text"
                    value={properties.title}
                    onChange={(e) => setProperties(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Modern 2BR Apartment in Downtown"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <div className="border border-gray-300 rounded-lg">
                    <div className="border-b p-2 bg-gray-50">
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => formatText('bold')}
                          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
                        >
                          B
                        </button>
                        <button
                          type="button"
                          onClick={() => formatText('italic')}
                          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 italic"
                        >
                          I
                        </button>
                        <button
                          type="button"
                          onClick={() => formatText('insertUnorderedList')}
                          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
                        >
                          •
                        </button>
                        <button
                          type="button"
                          onClick={() => formatText('createLink', '#')}
                          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
                        >
                          Link
                        </button>
                      </div>
                    </div>
                    <div
                      contentEditable
                      className="min-h-[200px] p-3 focus:outline-none"
                      onInput={(e) => setProperties(prev => ({ ...prev, description: e.currentTarget.innerHTML }))}
                      dangerouslySetInnerHTML={{ __html: properties.description }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                    <select
                      value={properties.propertyType}
                      onChange={(e) => setProperties(prev => ({ ...prev, propertyType: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="apartment">Apartment</option>
                      <option value="house">House</option>
                      <option value="condo">Condo</option>
                      <option value="townhouse">Townhouse</option>
                      <option value="studio">Studio</option>
                      <option value="loft">Loft</option>
                      <option value="duplex">Duplex</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={properties.status}
                      onChange={(e) => setProperties(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="available">Available</option>
                      <option value="rented">Rented</option>
                      <option value="pending">Pending</option>
                      <option value="coming_soon">Coming Soon</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {currentStep === 2 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Location</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={properties.address.street}
                      onChange={(e) => handleAddressChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Start typing address..."
                    />
                    {addressSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 shadow-lg">
                        {addressSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleAddressSelect(suggestion)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b last:border-b-0"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      value={properties.address.city}
                      onChange={(e) => setProperties(prev => ({
                        ...prev,
                        address: { ...prev.address, city: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <input
                      type="text"
                      value={properties.address.state}
                      onChange={(e) => setProperties(prev => ({
                        ...prev,
                        address: { ...prev.address, state: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Zip Code</label>
                    <input
                      type="text"
                      value={properties.address.zipCode}
                      onChange={(e) => setProperties(prev => ({
                        ...prev,
                        address: { ...prev.address, zipCode: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Interactive Map */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Property Location</label>
                  <div
                    ref={mapRef}
                    className="h-64 bg-gray-200 rounded-lg flex items-center justify-center"
                  >
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Interactive map will be displayed here</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Drag pin to adjust exact location
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    Coordinates: {properties.address.coordinates.lat}, {properties.address.coordinates.lng}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Details */}
          {currentStep === 3 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Property Details</h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rent Amount</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        value={properties.rent}
                        onChange={(e) => setProperties(prev => ({ ...prev, rent: parseInt(e.target.value) || 0 }))}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Security Deposit</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        value={properties.securityDeposit}
                        onChange={(e) => setProperties(prev => ({ ...prev, securityDeposit: parseInt(e.target.value) || 0 }))}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Application Fee</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        value={properties.applicationFee}
                        onChange={(e) => setProperties(prev => ({ ...prev, applicationFee: parseInt(e.target.value) || 0 }))}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
                    <input
                      type="number"
                      min="0"
                      value={properties.bedrooms}
                      onChange={(e) => setProperties(prev => ({ ...prev, bedrooms: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={properties.bathrooms}
                      onChange={(e) => setProperties(prev => ({ ...prev, bathrooms: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Square Feet</label>
                    <input
                      type="number"
                      min="0"
                      value={properties.squareFeet}
                      onChange={(e) => setProperties(prev => ({ ...prev, squareFeet: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Lease Term</label>
                    <select
                      value={properties.leaseTerm}
                      onChange={(e) => setProperties(prev => ({ ...prev, leaseTerm: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="6">6 months</option>
                      <option value="12">12 months</option>
                      <option value="18">18 months</option>
                      <option value="24">24 months</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Available Date</label>
                    <input
                      type="date"
                      value={properties.availabilityDate}
                      onChange={(e) => setProperties(prev => ({ ...prev, availabilityDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={properties.featured}
                      onChange={(e) => setProperties(prev => ({ ...prev, featured: e.target.checked }))}
                      className="mr-2"
                    />
                    <label className="text-sm font-medium text-gray-700">Featured Property</label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Amenities */}
          {currentStep === 4 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Amenities</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">Basic Amenities</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries({
                      parking: 'Parking',
                      laundry: 'Laundry',
                      petsAllowed: 'Pet Friendly',
                      utilitiesIncluded: 'Utilities Included',
                      furnished: 'Furnished',
                      airConditioning: 'Air Conditioning',
                      heating: 'Heating',
                      internet: 'Internet',
                      balcony: 'Balcony',
                      elevator: 'Elevator',
                    }).map(([key, label]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={properties.amenities[key as keyof typeof properties.amenities]}
                          onChange={(e) => setProperties(prev => ({
                            ...prev,
                            amenities: {
                              ...prev.amenities,
                              [key]: e.target.checked
                            }
                          }))}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">Appliances</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries({
                      dishwasher: 'Dishwasher',
                      microwave: 'Microwave',
                      refrigerator: 'Refrigerator',
                      washerDryer: 'Washer/Dryer',
                    }).map(([key, label]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={properties.amenities[key as keyof typeof properties.amenities]}
                          onChange={(e) => setProperties(prev => ({
                            ...prev,
                            amenities: {
                              ...prev.amenities,
                              [key]: e.target.checked
                            }
                          }))}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">Community Features</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries({
                      pool: 'Pool',
                      gym: 'Gym/Fitness Center',
                    }).map(([key, label]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={properties.amenities[key as keyof typeof properties.amenities]}
                          onChange={(e) => setProperties(prev => ({
                            ...prev,
                            amenities: {
                              ...prev.amenities,
                              [key]: e.target.checked
                            }
                          }))}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">Pet Policy</h3>
                  <div className="space-y-4">
                    <div className="flex space-x-4">
                      {['allowed', 'not_allowed', 'case_by_case'].map((policy) => (
                        <label key={policy} className="flex items-center">
                          <input
                            type="radio"
                            value={policy}
                            checked={properties.petPolicy === policy}
                            onChange={(e) => setProperties(prev => ({ ...prev, petPolicy: e.target.value as any }))}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700 capitalize">
                            {policy.replace('_', ' ')}
                          </span>
                        </label>
                      ))}
                    </div>

                    {properties.petPolicy === 'allowed' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Pet Rent</label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                              type="number"
                              value={properties.petRent}
                              onChange={(e) => setProperties(prev => ({ ...prev, petRent: parseInt(e.target.value) || 0 }))}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="0"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Pet Deposit</label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                              type="number"
                              value={properties.petDeposit}
                              onChange={(e) => setProperties(prev => ({ ...prev, petDeposit: parseInt(e.target.value) || 0 }))}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="0"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">Parking</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Number of Spots</label>
                      <input
                        type="number"
                        min="0"
                        value={properties.parking.spots}
                        onChange={(e) => setProperties(prev => ({
                          ...prev,
                          parking: { ...prev.parking, spots: parseInt(e.target.value) || 0 }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Parking Type</label>
                      <select
                        value={properties.parking.type}
                        onChange={(e) => setProperties(prev => ({
                          ...prev,
                          parking: { ...prev.parking, type: e.target.value as any }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="street">Street</option>
                        <option value="covered">Covered</option>
                        <option value="garage">Garage</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">Laundry</h3>
                  <select
                    value={properties.laundry}
                    onChange={(e) => setProperties(prev => ({ ...prev, laundry: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="none">None</option>
                    <option value="in_building">In Building</option>
                    <option value="in_unit">In Unit</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Media */}
          {currentStep === 5 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Media</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">Property Images</h3>
                  
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center ${
                      isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Drag and drop images here, or</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Browse Files
                    </button>
                    <p className="text-sm text-gray-500 mt-2">
                      Maximum file size: 10MB. Supported formats: JPG, PNG, GIF
                    </p>
                  </div>

                  {uploadedImages.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-md font-medium text-gray-900 mb-4">Uploaded Images</h4>
                      <div className="grid grid-cols-4 gap-4">
                        {uploadedImages.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`Property image ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </button>
                            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                              {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">Virtual Tour</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Virtual Tour URL</label>
                      <input
                        type="url"
                        value={properties.virtualTourUrl}
                        onChange={(e) => setProperties(prev => ({ ...prev, virtualTourUrl: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="https://matterport.com/show/..."
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      Add a 3D virtual tour from Matterport, YouTube 360° video, or CloudPano
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-8">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>

            {currentStep < steps.length ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create Property'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
