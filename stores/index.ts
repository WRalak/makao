// Export all stores from a central location
export { useAuthStore } from './auth-store';
export { usePropertyStore } from './property-store';
export { useMessageStore } from './message-store';

// Export types for external use
export type { User } from './auth-store';
export type { Property, PropertyFilters } from './property-store';
export type { Message, Conversation } from './message-store';
