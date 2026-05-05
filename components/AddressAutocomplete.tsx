'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, Loader2 } from 'lucide-react';

interface AddressSuggestion {
  id: string;
  place_name: string;
  center: [number, number];
  context: string[];
  text: string;
}

interface AddressAutocompleteProps {
  onAddressSelect: (address: AddressSuggestion) => void;
  placeholder?: string;
  className?: string;
  initialValue?: string;
  disabled?: boolean;
}

export default function AddressAutocomplete({ 
  onAddressSelect, 
  placeholder = "Enter address or location...",
  className = "",
  initialValue = "",
  disabled = false
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<AddressSuggestion | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // East African cities for local suggestions
  const eastAfricanLocations: AddressSuggestion[] = [
    { id: "nairobi", place_name: "Nairobi, Kenya", center: [36.8219, -1.2921], context: ["city", "Kenya"], text: "Nairobi, Kenya" },
    { id: "kilimani", place_name: "Kilimani, Nairobi", center: [36.8235, -1.2833], context: ["neighborhood", "Nairobi", "Kenya"], text: "Kilimani, Nairobi" },
    { id: "westlands", place_name: "Westlands, Nairobi", center: [36.8118, -1.2691], context: ["neighborhood", "Nairobi", "Kenya"], text: "Westlands, Nairobi" },
    { id: "mombasa", place_name: "Mombasa, Kenya", center: [39.6682, -4.0435], context: ["city", "Kenya"], text: "Mombasa, Kenya" },
    { id: "kampala", place_name: "Kampala, Uganda", center: [32.5825, 0.3176], context: ["city", "Uganda"], text: "Kampala, Uganda" },
    { id: "kololo", place_name: "Kololo, Kampala", center: [32.5806, 0.3528], context: ["neighborhood", "Kampala", "Uganda"], text: "Kololo, Kampala" },
    { id: "naguru", place_name: "Naguru, Kampala", center: [32.5806, 0.3528], context: ["neighborhood", "Kampala", "Uganda"], text: "Naguru, Kampala" },
    { id: "dar-es-salaam", place_name: "Dar es Salaam, Tanzania", center: [39.2085, -6.7793], context: ["city", "Tanzania"], text: "Dar es Salaam, Tanzania" },
    { id: "masaki", place_name: "Masaki, Dar es Salaam", center: [39.2086, -6.7990], context: ["neighborhood", "Dar es Salaam", "Tanzania"], text: "Masaki, Dar es Salaam" },
    { id: "oysterbay", place_name: "Oysterbay, Dar es Salaam", center: [39.2086, -6.7990], context: ["neighborhood", "Dar es Salaam", "Tanzania"], text: "Oysterbay, Dar es Salaam" },
    { id: "kigali", place_name: "Kigali, Rwanda", center: [30.0585, -1.9536], context: ["city", "Rwanda"], text: "Kigali, Rwanda" },
  ];

  // Fetch suggestions from Mapbox or use local data
  const fetchSuggestions = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    try {
      // First try local East African suggestions
      const localMatches: AddressSuggestion[] = eastAfricanLocations
        .filter(loc => 
          loc.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
          loc.context.some(ctx => ctx.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .map((loc, index) => ({
          id: `local-${index}`,
          place_name: loc.text,
          center: loc.center,
          context: loc.context,
          text: loc.text
        }));

      // If we have local matches, use them
      if (localMatches.length > 0) {
        setSuggestions(localMatches);
      } else if (process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
        // Fall back to Mapbox API
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?` +
          `access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&` +
          `country=KE,UG,TZ,RW&` +
          `types=place,locality,neighborhood,address&` +
          `limit=8`
        );

        if (response.ok) {
          const data = await response.json();
          const mapboxSuggestions = data.features.map((feature: any) => ({
            id: feature.id,
            place_name: feature.place_name,
            center: [feature.center[0], feature.center[1]] as [number, number],
            context: feature.context?.map((ctx: any) => ctx.text) || [],
            text: feature.text
          }));
          setSuggestions(mapboxSuggestions);
        } else {
          throw new Error('Mapbox API failed');
        }
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      // Fall back to local suggestions only
      const fallbackSuggestions = eastAfricanLocations
        .filter(loc => 
          loc.text.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .map((loc, index) => ({
          id: `fallback-${index}`,
          place_name: loc.text,
          center: loc.center,
          context: loc.context,
          text: loc.text
        }));
      setSuggestions(fallbackSuggestions);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change with debouncing
  const handleInputChange = (value: string) => {
    setQuery(value);
    setSelectedSuggestion(null);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Don't search for very short queries
    if (value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(() => {
      fetchSuggestions(value);
      setShowSuggestions(true);
    }, 300);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: AddressSuggestion) => {
    setQuery(suggestion.place_name);
    setSelectedSuggestion(suggestion);
    setShowSuggestions(false);
    onAddressSelect(suggestion);
  };

  // Handle clear
  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedSuggestion(null);
    inputRef.current?.focus();
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => query.length >= 2 && setShowSuggestions(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        
        {/* Clear button */}
        {query && !disabled && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
          </div>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto"
        >
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              onClick={() => handleSuggestionSelect(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {suggestion.text}
                  </div>
                  <div className="text-sm text-gray-600 truncate">
                    {suggestion.place_name}
                  </div>
                  {suggestion.context.length > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      {suggestion.context.slice(0, 3).join(', ')}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results */}
      {showSuggestions && !isLoading && suggestions.length === 0 && query.length >= 2 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg"
        >
          <div className="px-4 py-6 text-center text-gray-500">
            <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No locations found</p>
            <p className="text-sm mt-1">Try searching for cities or neighborhoods in East Africa</p>
          </div>
        </div>
      )}

      {/* Selected address info */}
      {selectedSuggestion && (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">
                {selectedSuggestion.place_name}
              </span>
            </div>
            <button
              onClick={() => {
                setSelectedSuggestion(null);
                setQuery('');
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
