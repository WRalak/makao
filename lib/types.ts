// User types
export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'super_admin' | 'admin' | 'agent' | 'tenant';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  phone?: string;
  mpesaNumber?: string;
  avatarUrl?: string;
  bio?: string;
  companyName?: string;
  registrationNumber?: string;
  licenseNumber?: string;
  idNumber?: string;
  experienceYears?: number;
  website?: string;
  linkedin?: string;
  facebook?: string;
  twitter?: string;
  isActive: boolean;
  isVerified: boolean;
  isApproved: boolean;
  isBanned: boolean;
  emailVerified: boolean;
  stripeCustomerId?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: number;
  updatedBy?: number;
}

// Space types
export interface Space {
  id: number;
  name: string;
  description: string;
  logoUrl?: string;
  agentId: number;
  monthlyFee: number;
  currency: string;
  propertyLimit: number;
  subscriptionStatus: 'pending' | 'active' | 'cancelled' | 'expired' | 'suspended';
  isApproved: boolean;
  approvedAt?: Date;
  approvedBy?: number;
  subscriptionEndDate?: Date;
  areasCovered: string[];
  propertyTypes: string[];
  yearsInBusiness: number;
  activeProperties: number;
  staffCount: number;
  documents: Array<{
    type: string;
    url: string;
    filename: string;
  }>;
  totalViews: number;
  totalInquiries: number;
  totalLeases: number;
  createdAt: Date;
  updatedAt: Date;
}

// Property types
export interface Property {
  id: number;
  title: string;
  description: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode?: string;
  latitude: number;
  longitude: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  rentAmount: number;
  rentCurrency: string;
  securityDeposit?: number;
  availableDate: string;
  leaseTerm?: string;
  leaseLengthMonths?: number;
  images: string[];
  amenities: string[];
  petPolicy: 'allowed' | 'not_allowed' | 'restricted';
  furnished: boolean;
  parkingSpaces: number;
  parkingType?: string;
  utilitiesIncluded: string[];
  utilityCosts?: number;
  virtualTourUrl?: string;
  videoTourUrl?: string;
  nearbyAmenities: Array<{
    name: string;
    distance: number;
    type: string;
  }>;
  transportLinks: Array<{
    name: string;
    distance: number;
    type: string;
  }>;
  walkScore?: number;
  transitScore?: number;
  agentId: number;
  spaceId: number;
  status: 'available' | 'rented' | 'maintenance' | 'unavailable' | 'pending_approval';
  isFeatured: boolean;
  isActive: boolean;
  isVerified: boolean;
  isFlagged: boolean;
  viewCount: number;
  messageCount: number;
  saveCount: number;
  applicationCount: number;
  tourCount: number;
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Message types
export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  propertyId?: number;
  content: string;
  messageType: 'text' | 'file' | 'image' | 'voice' | 'location';
  attachments: Array<{
    filename: string;
    url: string;
    size: number;
    type: string;
  }>;
  isRead: boolean;
  readAt?: Date;
  isEdited: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  replyTo?: number;
  emoji?: string;
  voiceDuration?: number;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Payment types
export interface Payment {
  id: number;
  userId: number;
  spaceId?: number;
  propertyId?: number;
  amount: number;
  currency: string;
  paymentMethod: 'stripe' | 'mpesa';
  stripePaymentIntentId?: string;
  mpesaReceiptNumber?: string;
  mpesaPhone?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  description: string;
  category: 'subscription' | 'application_fee' | 'security_deposit' | 'rent' | 'featured_listing';
  commissionRate: number;
  processedAt?: Date;
  failedReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Application types
export interface Application {
  id: number;
  tenantId: number;
  propertyId: number;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'signed' | 'cancelled';
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    ssn?: string;
    driverLicense?: string;
  };
  employmentInfo: {
    employerName: string;
    position: string;
    employerAddress: string;
    employerPhone: string;
    monthlyIncome: number;
    employmentDuration: string;
    supervisorName: string;
    supervisorPhone: string;
    supervisorEmail?: string;
  };
  rentalHistory: Array<{
    address: string;
    landlordName: string;
    landlordPhone: string;
    rentAmount: number;
    duration: string;
    reasonForLeaving?: string;
  }>;
  references: Array<{
    name: string;
    relationship: string;
    phone: string;
    email?: string;
    address: string;
  }>;
  additionalInfo: {
    moveInDate: string;
    leaseTerm: string;
    pets: boolean;
    petDetails?: string;
    smoking: boolean;
    evictionHistory: boolean;
    evictionDetails?: string;
    criminalHistory: boolean;
    criminalDetails?: string;
    additionalNotes?: string;
  };
  documents: Array<{
    type: 'pay_stub' | 'bank_statement' | 'id' | 'employment_letter' | 'landlord_reference';
    filename: string;
    url: string;
    uploadedAt?: string;
  }>;
  submittedAt: Date;
  updatedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: number;
  approvedAt?: Date;
  rejectionReason?: string;
  leaseSignedAt?: Date;
  moveInDate?: string;
}

// Favorite types
export interface Favorite {
  id: number;
  userId: number;
  propertyId: number;
  notes?: string;
  collectionName?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Tour types
export interface Tour {
  id: number;
  propertyId: number;
  tenantId: number;
  agentId: number;
  tourDate: Date;
  tourDurationMinutes: number;
  tourType: 'in_person' | 'virtual' | 'hybrid';
  status: 'requested' | 'scheduled' | 'completed' | 'cancelled';
  contactPhone?: string;
  contactEmail?: string;
  notes?: string;
  tenantFeedback?: string;
  agentNotes?: string;
  googleCalendarEventId?: string;
  reminderSent: boolean;
  reminderCount: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

// Admin Log types
export interface AdminLog {
  id: number;
  adminId: number;
  action: string;
  targetId: number;
  targetType: string;
  details: any;
  createdAt: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: any;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Search types
export interface SearchFilters {
  query?: string;
  city?: string;
  state?: string;
  country?: string;
  minRent?: number;
  maxRent?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string;
  furnished?: boolean;
  petPolicy?: string;
  amenities?: string[];
  latitude?: number;
  longitude?: number;
  radius?: number;
  availableAfter?: string;
  availableBefore?: string;
  leaseTerm?: string;
}

export interface SortOptions {
  field: string;
  order: 'ASC' | 'DESC';
}

// Socket.io types
export interface SocketUser {
  userId: string;
  role: string;
  email: string;
  name: string;
}

export interface SocketMessage {
  id: string;
  conversationId: string;
  content: string;
  senderId: string;
  receiverId: string;
  propertyId?: string;
  type: 'text' | 'file' | 'image' | 'voice' | 'location';
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read' | 'failed';
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormErrors {
  [key: string]: string | undefined;
}

// Environment types
export interface EnvironmentConfig {
  database: {
    url: string;
    ssl: boolean;
  };
  auth: {
    jwtSecret: string;
    jwtExpiresIn: string;
  };
  stripe: {
    secretKey: string;
    publishableKey: string;
    webhookSecret: string;
  };
  mpesa: {
    consumerKey: string;
    consumerSecret: string;
    passkey: string;
    shortcode: string;
    callbackUrl: string;
  };
  mapbox: {
    accessToken: string;
  };
  email: {
    sendgridKey: string;
    from: string;
    fromName: string;
  };
}
