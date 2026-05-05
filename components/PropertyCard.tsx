'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Bed, Bath, MapPin, Home, Star } from 'lucide-react';

// Updated to match your API response structure
export interface Property {
  id: string;
  title: string;
  description: string;
  rent: number;
  rentCurrency: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  images: string[];
  status: string;
  featured: boolean;
  active: boolean;
  verified: boolean;
  amenities: string[];
  petPolicy: string;
  furnished: boolean;
  agent?: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  analytics?: {
    views: number;
    messages: number;
    saves: number;
    applications: number;
    tours: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface PropertyCardProps {
  property: Property;
  onFavoriteClick?: (id: string) => void;
  onCardClick?: (id: string) => void;
  showAgent?: boolean;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ 
  property, 
  onFavoriteClick, 
  onCardClick,
  showAgent = true 
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    if (onFavoriteClick) {
      onFavoriteClick(property.id);
    }
  };

  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick(property.id);
    }
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: currency === 'KES' ? 'KES' : currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = () => {
    if (property.featured) return { text: 'Featured', className: 'bg-emerald-500' };
    if (property.verified) return { text: 'Verified', className: 'bg-blue-500' };
    if (property.status === 'available') return { text: 'Available', className: 'bg-green-500' };
    return { text: property.status, className: 'bg-slate-500' };
  };

  const statusBadge = getStatusBadge();

  return (
    <div 
      className="bg-white rounded-xl overflow-hidden border border-slate-200 hover:shadow-[0px_4px_20px_rgba(30,58,138,0.08)] transition-all group cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Image Container */}
      <div className="relative h-64 overflow-hidden">
        {!imageError && property.images?.length > 0 ? (
          <img 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            alt={property.title} 
            src={property.images[0]}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
            <Home className="w-12 h-12 text-slate-400" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className={`absolute top-4 left-4 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${statusBadge.className}`}>
          {statusBadge.text}
        </div>
        
        {/* Favorite Button */}
        <button 
          onClick={handleFavoriteClick}
          className="absolute top-4 right-4 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-slate-600'}`} />
        </button>

        {/* Agent Badge */}
        {showAgent && property.agent && (
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-2">
            {property.agent.avatar ? (
              <img 
                src={property.agent.avatar} 
                alt={property.agent.name}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-blue-600">
                  {property.agent.name.charAt(0)}
                </span>
              </div>
            )}
            <span className="text-xs font-medium text-slate-700">
              {property.agent.name}
            </span>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-6">
        {/* Price and Rating */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-headline-md text-blue-900">
            {formatPrice(property.rent, property.rentCurrency)}/mo
          </h3>
          {property.analytics && (
            <div className="flex items-center gap-1 text-sm text-slate-400">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>4.8</span>
            </div>
          )}
        </div>
        
        {/* Title */}
        <Link href={`/properties/${property.id}`}>
          <h4 className="font-label-bold text-slate-800 mb-2 hover:text-blue-900 transition-colors line-clamp-2">
            {property.title}
          </h4>
        </Link>
        
        {/* Description */}
        <p className="text-sm text-slate-600 mb-4 line-clamp-2">
          {property.description}
        </p>
        
        {/* Property Features */}
        <div className="flex items-center gap-4 text-slate-600 mb-4">
          <div className="flex items-center gap-1">
            <Bed className="w-4 h-4" />
            <span className="text-sm">{property.bedrooms} Beds</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="w-4 h-4" />
            <span className="text-sm">{property.bathrooms} Baths</span>
          </div>
          <div className="flex items-center gap-1">
            <Home className="w-4 h-4" />
            <span className="text-sm">{property.squareFeet} sqft</span>
          </div>
        </div>
        
        {/* Location */}
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <MapPin className="w-4 h-4" />
          <span>{property.address.city}, {property.address.state}</span>
        </div>

        {/* Key Amenities */}
        {property.amenities?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {property.amenities.slice(0, 3).map((amenity, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs"
              >
                {amenity}
              </span>
            ))}
            {property.amenities.length > 3 && (
              <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                +{property.amenities.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Analytics */}
        {property.analytics && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-3">
              <span>{property.analytics.views} views</span>
              <span>{property.analytics.saves} saves</span>
            </div>
            <span>Listed {new Date(property.createdAt).toLocaleDateString()}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyCard;
