import { create } from 'zustand';

export interface Property {
  id: number;
  title: string;
  type: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  description: string;
  amenities: string[];
  images: string[];
  status: 'available' | 'rented' | 'pending';
  agentId: number;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyFilters {
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  location?: string;
  amenities?: string[];
  status?: string;
}

interface PropertyState {
  properties: Property[];
  currentProperty: Property | null;
  filters: PropertyFilters;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  
  // Actions
  setProperties: (properties: Property[]) => void;
  setCurrentProperty: (property: Property | null) => void;
  addProperty: (property: Property) => void;
  updateProperty: (id: number, updates: Partial<Property>) => void;
  removeProperty: (id: number) => void;
  setFilters: (filters: PropertyFilters) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearFilters: () => void;
  filteredProperties: () => Property[];
}

export const usePropertyStore = create<PropertyState>((set, get) => ({
  properties: [],
  currentProperty: null,
  filters: {},
  isLoading: false,
  error: null,
  searchQuery: '',

  setProperties: (properties) => set({ properties }),

  setCurrentProperty: (property) => set({ currentProperty: property }),

  addProperty: (property) => 
    set((state) => ({ properties: [...state.properties, property] })),

  updateProperty: (id, updates) =>
    set((state) => ({
      properties: state.properties.map((property) =>
        property.id === id ? { ...property, ...updates } : property
      ),
      currentProperty:
        state.currentProperty?.id === id
          ? { ...state.currentProperty, ...updates }
          : state.currentProperty,
    })),

  removeProperty: (id) =>
    set((state) => ({
      properties: state.properties.filter((property) => property.id !== id),
      currentProperty:
        state.currentProperty?.id === id ? null : state.currentProperty,
    })),

  setFilters: (filters) => set({ filters }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  clearFilters: () => set({ filters: {}, searchQuery: '' }),

  filteredProperties: () => {
    const { properties, filters, searchQuery } = get();
    
    return properties.filter((property) => {
      // Apply filters
      if (filters.type && property.type !== filters.type) return false;
      if (filters.minPrice && property.price < filters.minPrice) return false;
      if (filters.maxPrice && property.price > filters.maxPrice) return false;
      if (filters.bedrooms && property.bedrooms < filters.bedrooms) return false;
      if (filters.bathrooms && property.bathrooms < filters.bathrooms) return false;
      if (filters.location && !property.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
      if (filters.status && property.status !== filters.status) return false;
      if (filters.amenities && filters.amenities.length > 0) {
        const hasAllAmenities = filters.amenities.every(amenity =>
          property.amenities.includes(amenity)
        );
        if (!hasAllAmenities) return false;
      }

      // Apply search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchableFields = [
          property.title,
          property.description,
          property.location,
          property.type,
        ].join(' ').toLowerCase();
        
        if (!searchableFields.includes(query)) return false;
      }

      return true;
    });
  },
}));
