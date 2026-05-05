'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Navigation } from 'lucide-react';

// @ts-ignore
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

interface Property {
  _id: string;
  title: string;
  rent: number;
  rentCurrency: string;
  bedrooms: number;
  bathrooms: number;
  address: {
    city: string;
    state: string;
  };
  coordinates: {
    lat: number;
    lng: number;
  };
  images: string[];
}

interface PropertyMapProps {
  properties: Property[];
  center?: [number, number];
  zoom?: number;
  onPropertyClick?: (property: Property) => void;
  onBoundsChange?: (bounds: any) => void;
  className?: string;
}

export default function PropertyMap({ 
  properties, 
  center = [36.8219, 1.2921], // Default to Nairobi
  zoom = 11,
  onPropertyClick,
  onBoundsChange,
  className = ''
}: PropertyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // East African neighborhoods
  const neighborhoods = [
    { name: 'Kilimani', coordinates: [-1.2833, 36.8235] },
    { name: 'Westlands', coordinates: [-1.2691, 36.8118] },
    { name: 'Kololo', coordinates: [0.3176, 32.5825] }, // Kampala
    { name: 'Naguru', coordinates: [0.3528, 32.5806] }, // Kampala
    { name: 'Masaki', coordinates: [-6.7793, 39.2085] }, // Dar es Salaam
    { name: 'Oysterbay', coordinates: [-6.7990, 39.2086] }, // Dar es Salaam
  ];

  useEffect(() => {
    if (!mapContainer.current) return;

    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: center,
      zoom: zoom,
    });

    map.current = mapInstance;

    // Add markers for properties
    properties.forEach((property) => {
      const el = document.createElement('div');
      el.className = 'property-marker';
      el.innerHTML = `
        <div class="bg-white rounded-lg shadow-lg p-2 min-w-[120px]">
          <div class="relative">
            ${property.images[0] ? `
              <img src="${property.images[0]}" alt="${property.title}" class="w-full h-20 object-cover rounded-t-lg" />
            ` : `
              <div class="w-full h-20 bg-gray-200 rounded-t-lg flex items-center justify-center">
                <MapPin class="h-6 w-6 text-gray-400" />
              </div>
            `}
            <div class="p-2">
              <div class="font-semibold text-sm text-gray-900 truncate">${property.title}</div>
              <div class="text-xs text-gray-600">${property.address.city}, ${property.address.state}</div>
              <div class="text-sm font-bold text-gray-800">${property.rentCurrency} ${property.rent.toLocaleString()}/mo</div>
            </div>
          </div>
        </div>
      `;

      const marker = new mapboxgl.Marker({
        element: el,
        offset: [0, -10],
      }).setLngLat([property.coordinates.lng, property.coordinates.lat]);

      el.addEventListener('click', () => {
        setSelectedProperty(property);
        onPropertyClick?.(property);
      });

      marker.addTo(mapInstance);
      markers.current.push(marker);
    });

    // Add navigation controls
    mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Handle bounds change
    mapInstance.on('moveend', () => {
      const bounds = mapInstance.getBounds();
      onBoundsChange?.(bounds);
    });

    return () => {
      markers.current.forEach(marker => marker.remove());
      mapInstance.remove();
    };
  }, [properties, center, zoom]);

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} className="w-full h-full min-h-[400px]" />
      
      {/* Selected Property Popup */}
      {selectedProperty && (
        <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-xl p-4 max-w-sm z-10">
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-900">{selectedProperty.title}</h3>
                <p className="text-sm text-gray-600">
                  {selectedProperty.address.city}, {selectedProperty.address.state}
                </p>
              </div>
              <button
                onClick={() => setSelectedProperty(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Rent:</span>
                <span className="font-semibold text-gray-800">
                  {selectedProperty.rentCurrency} {selectedProperty.rent.toLocaleString()}/mo
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bedrooms:</span>
                <span>{selectedProperty.bedrooms}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bathrooms:</span>
                <span>{selectedProperty.bathrooms}</span>
              </div>
            </div>
            
            <button
              onClick={() => {
                // Navigate to property details
                window.location.href = `/properties/${selectedProperty._id}`;
              }}
              className="w-full btn-primary py-2 px-4 rounded-lg transition-colors"
            >
              View Details
            </button>
          </div>
        </div>
      )}
      
      {/* Neighborhood Quick Navigation */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-2 z-10">
        <div className="text-xs font-semibold text-gray-700 mb-2">Quick Navigate</div>
        <div className="space-y-1">
          {neighborhoods.map((hood) => (
            <button
              key={hood.name}
              onClick={() => {
                map.current?.flyTo({
                  center: hood.coordinates as [number, number],
                  zoom: 13,
                  essential: true
                });
              }}
              className="block w-full text-left text-xs text-gray-600 hover:text-gray-800 py-1"
            >
              {hood.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
