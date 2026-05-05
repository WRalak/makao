import { pgTable, serial, text, integer, timestamp, boolean, decimal, varchar, jsonb, index, pgEnum } from 'drizzle-orm/pg-core';

// Enums - Updated to match comprehensive requirements
export const userRoleEnum = pgEnum('user_role', ['super_admin', 'admin', 'agent', 'tenant']);
export const userStatusEnum = pgEnum('user_status', ['active', 'banned', 'suspended', 'pending']);
export const currencyEnum = pgEnum('currency', ['KES', 'UGX', 'TZS', 'USD']);
export const paymentStatusEnum = pgEnum('payment_status', ['completed', 'failed', 'pending', 'refunded', 'processing']);
export const paymentMethodEnum = pgEnum('payment_method', ['mpesa', 'stripe', 'cash', 'bank_transfer']);
export const paymentTypeEnum = pgEnum('payment_type', ['subscription', 'commission', 'featured_listing', 'lead_fee', 'application_fee', 'premium_feature', 'rent', 'security_deposit']);
export const propertyStatusEnum = pgEnum('property_status', ['available', 'rented', 'maintenance', 'unavailable', 'pending_approval']);
export const petPolicyEnum = pgEnum('pet_policy', ['allowed', 'not_allowed', 'restricted']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'inactive', 'past_due', 'suspended', 'cancelled', 'pending']);
export const messageStatusEnum = pgEnum('message_status', ['sent', 'delivered', 'read', 'flagged', 'deleted']);
export const applicationStatusEnum = pgEnum('application_status', ['pending', 'under_review', 'approved', 'rejected', 'signed', 'cancelled']);
export const tourStatusEnum = pgEnum('tour_status', ['requested', 'confirmed', 'completed', 'cancelled', 'no_show']);
export const maintenanceStatusEnum = pgEnum('maintenance_status', ['submitted', 'assigned', 'in_progress', 'completed', 'cancelled']);
export const disputeStatusEnum = pgEnum('dispute_status', ['open', 'under_review', 'resolved', 'closed']);
export const moderationActionEnum = pgEnum('moderation_action', ['warning', 'suspend', 'ban', 'delete_content', 'no_action']);

// Users table - Enhanced with comprehensive fields
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: userRoleEnum('role').default('tenant'),
  status: userStatusEnum('status').default('active'),
  phone: text('phone'),
  mpesaNumber: text('mpesa_number'),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  
  // Agent specific fields
  companyName: text('company_name'),
  registrationNumber: text('registration_number'),
  experienceYears: integer('experience_years').default(0),
  licenseNumber: text('license_number'),
  idNumber: text('id_number'),
  stripeCustomerId: text('stripe_customer_id'),
  
  // Verification fields
  emailVerified: boolean('email_verified').default(false),
  phoneVerified: boolean('phone_verified').default(false),
  otpCode: text('otp_code'),
  otpExpires: timestamp('otp_expires'),
  emailToken: text('email_token'),
  
  // Social links
  website: text('website'),
  linkedin: text('linkedin'),
  facebook: text('facebook'),
  twitter: text('twitter'),
  
  // Notification preferences
  emailNotifications: boolean('email_notifications').default(true),
  smsNotifications: boolean('sms_notifications').default(true),
  pushNotifications: boolean('push_notifications').default(true),
  
  // Business hours
  businessHoursStart: text('business_hours_start').default('09:00:00'),
  businessHoursEnd: text('business_hours_end').default('17:00:00'),
  timezone: text('timezone').default('Africa/Nairobi'),
  
  // Security
  lastLogin: timestamp('last_login'),
  loginAttempts: integer('login_attempts').default(0),
  lockedUntil: timestamp('locked_until'),
  ipAddress: text('ip_address'),
  
  // Social login
  provider: text('provider').default('email'),
  providerId: text('provider_id'),
  
  // Audit fields
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  createdBy: integer('created_by'),
  updatedBy: integer('updated_by'),
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
  roleIdx: index('users_role_idx').on(table.role),
  statusIdx: index('users_status_idx').on(table.status),
  phoneIdx: index('users_phone_idx').on(table.phone),
  createdAtIdx: index('users_created_at_idx').on(table.createdAt),
}));

// Spaces table - Enhanced Agent subscription management
export const spaces = pgTable('spaces', {
  id: serial('id').primaryKey(),
  agentId: integer('agent_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  logoUrl: text('logo_url'),
  monthlyFee: decimal('monthly_fee', { precision: 10, scale: 2 }).notNull(),
  currency: currencyEnum('currency').default('KES'),
  propertyLimit: integer('property_limit').notNull(),
  subscriptionStatus: subscriptionStatusEnum('subscription_status').default('inactive'),
  subscriptionEndDate: timestamp('subscription_end_date'),
  isApproved: boolean('is_approved').default(false),
  
  // Business details
  areasCovered: jsonb('areas_covered').$type<string[]>().default([]),
  propertyTypes: jsonb('property_types').$type<string[]>().default([]),
  yearsInBusiness: integer('years_in_business').default(0),
  activeProperties: integer('active_properties').default(0),
  staffCount: integer('staff_count').default(0),
  
  // Documents
  documents: jsonb('documents').$type<any[]>().default([]),
  
  // Performance metrics
  totalViews: integer('total_views').default(0),
  totalInquiries: integer('total_inquiries').default(0),
  totalLeases: integer('total_leases').default(0),
  
  // Audit fields
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  approvedAt: timestamp('approved_at'),
  approvedBy: integer('approved_by').references(() => users.id),
}, (table) => ({
  agentIdIdx: index('spaces_agent_id_idx').on(table.agentId),
  statusIdx: index('spaces_status_idx').on(table.subscriptionStatus),
  approvedIdx: index('spaces_approved_idx').on(table.isApproved),
  createdAtIdx: index('spaces_created_at_idx').on(table.createdAt),
}));

// Properties table - Enhanced with comprehensive features
export const properties = pgTable('properties', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  street: text('street').notNull(),
  city: text('city').notNull(),
  state: text('state').notNull(),
  country: text('country').default('KE'),
  zipCode: text('zip_code'),
  latitude: decimal('latitude', { precision: 10, scale: 8 }).notNull(),
  longitude: decimal('longitude', { precision: 11, scale: 8 }).notNull(),
  
  // Property details
  bedrooms: integer('bedrooms').notNull().default(1),
  bathrooms: integer('bathrooms').notNull().default(1),
  squareFeet: integer('square_feet'),
  rentAmount: decimal('rent_amount', { precision: 10, scale: 2 }).notNull(),
  rentCurrency: currencyEnum('rent_currency').default('KES'),
  securityDeposit: decimal('security_deposit', { precision: 10, scale: 2 }),
  
  // Availability
  availableDate: timestamp('available_date').notNull(),
  leaseTerm: text('lease_term'),
  leaseLengthMonths: integer('lease_length_months'),
  
  // Features
  images: jsonb('images').$type<string[]>().default([]),
  amenities: jsonb('amenities').$type<string[]>().default([]),
  petPolicy: petPolicyEnum('pet_policy').default('not_allowed'),
  furnished: boolean('furnished').default(false),
  parkingSpaces: integer('parking_spaces').default(0),
  parkingType: text('parking_type'),
  
  // Utilities
  utilitiesIncluded: jsonb('utilities_included').$type<string[]>().default([]),
  utilityCosts: decimal('utility_costs', { precision: 10, scale: 2 }).default('0'),
  
  // Virtual tours
  virtualTourUrl: text('virtual_tour_url'),
  videoTourUrl: text('video_tour_url'),
  
  // Location features
  nearbyAmenities: jsonb('nearby_amenities').$type<any[]>().default([]),
  transportLinks: jsonb('transport_links').$type<any[]>().default([]),
  walkScore: integer('walk_score'),
  transitScore: integer('transit_score'),
  
  // Agent information
  agentId: integer('agent_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  spaceId: integer('space_id').references(() => spaces.id, { onDelete: 'set null' }),
  
  // Status and visibility
  status: propertyStatusEnum('status').default('available'),
  isFeatured: boolean('is_featured').default(false),
  isActive: boolean('is_active').default(true),
  isVerified: boolean('is_verified').default(false),
  
  // Analytics
  viewCount: integer('view_count').default(0),
  messageCount: integer('message_count').default(0),
  saveCount: integer('save_count').default(0),
  applicationCount: integer('application_count').default(0),
  tourCount: integer('tour_count').default(0),
  
  // Moderation
  isFlagged: boolean('is_flagged').default(false),
  flagReason: text('flag_reason'),
  moderatedBy: integer('moderated_by').references(() => users.id),
  moderatedAt: timestamp('moderated_at'),
  
  // SEO
  slug: text('slug').unique(),
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  
  // Audit fields
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  createdBy: integer('created_by').references(() => users.id, { onDelete: 'set null' }),
  updatedBy: integer('updated_by').references(() => users.id, { onDelete: 'set null' }),
}, (table) => ({
  agentIdIdx: index('properties_agent_id_idx').on(table.agentId),
  statusIdx: index('properties_status_idx').on(table.status),
  statusActiveIdx: index('properties_status_active_idx').on(table.status, table.isActive),
  cityIdx: index('properties_city_idx').on(table.city),
  priceIdx: index('properties_price_idx').on(table.rentAmount),
  availableDateIdx: index('properties_available_date_idx').on(table.availableDate),
  createdAtIdx: index('properties_created_at_idx').on(table.createdAt),
  featuredIdx: index('properties_featured_idx').on(table.isFeatured),
  slugIdx: index('properties_slug_idx').on(table.slug),
}));

// Messages table - Enhanced real-time messaging
export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  senderId: integer('sender_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  receiverId: integer('receiver_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  propertyId: integer('property_id').references(() => properties.id, { onDelete: 'set null' }),
  content: text('content').notNull(),
  messageType: text('message_type').default('text'),
  
  // Media attachments
  attachments: jsonb('attachments').$type<{
    filename: string;
    url: string;
    size: number;
    type: string;
  }[]>().default([]),
  
  // Status and moderation
  status: messageStatusEnum('status').default('sent'),
  isRead: boolean('is_read').default(false),
  isEdited: boolean('is_edited').default(false),
  isDeleted: boolean('is_deleted').default(false),
  
  // Moderation
  isFlagged: boolean('is_flagged').default(false),
  flagReason: text('flag_reason'),
  moderatedBy: integer('moderated_by').references(() => users.id),
  moderatedAt: timestamp('moderated_at'),
  
  // Quick replies
  isTemplate: boolean('is_template').default(false),
  templateId: integer('template_id'),
  
  // Read receipts
  readAt: timestamp('read_at'),
  deliveredAt: timestamp('delivered_at'),
  
  // Audit fields
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  deletedAt: timestamp('deleted_at'),
}, (table) => ({
  senderReceiverIdx: index('messages_sender_receiver_idx').on(table.senderId, table.receiverId),
  propertyIdIdx: index('messages_property_id_idx').on(table.propertyId),
  statusIdx: index('messages_status_idx').on(table.status),
  createdAtIdx: index('messages_created_at_idx').on(table.createdAt),
  readAtIdx: index('messages_read_at_idx').on(table.readAt),
}));

// Payments table - Comprehensive payment tracking
export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  spaceId: integer('space_id').references(() => spaces.id, { onDelete: 'set null' }),
  propertyId: integer('property_id').references(() => properties.id, { onDelete: 'set null' }),
  
  // Payment details
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: currencyEnum('currency').notNull(),
  paymentMethod: paymentMethodEnum('payment_method').notNull(),
  transactionId: text('transaction_id'),
  referenceNumber: text('reference_number'),
  
  // M-PESA specific
  mpesaReceiptNumber: text('mpesa_receipt_number'),
  mpesaPhone: text('mpesa_phone'),
  
  // Stripe specific
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  stripeChargeId: text('stripe_charge_id'),
  
  // Status and processing
  status: paymentStatusEnum('status').default('pending'),
  processedAt: timestamp('processed_at'),
  failedReason: text('failed_reason'),
  refundAmount: decimal('refund_amount', { precision: 10, scale: 2 }),
  refundReason: text('refund_reason'),
  
  // Commission tracking
  commissionRate: decimal('commission_rate', { precision: 5, scale: 2 }).default('20.00'),
  commissionAmount: decimal('commission_amount', { precision: 10, scale: 2 }),
  commissionPaid: boolean('commission_paid').default(false),
  commissionPaidAt: timestamp('commission_paid_at'),
  
  // Description
  description: text('description').notNull(),
  category: text('category').notNull(), // 'subscription', 'application_fee', 'rent', 'commission', 'refund'
  
  // Audit fields
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  processedBy: integer('processed_by').references(() => users.id),
}, (table) => ({
  userIdIdx: index('payments_user_id_idx').on(table.userId),
  statusIdx: index('payments_status_idx').on(table.status),
  categoryIdx: index('payments_category_idx').on(table.category),
  createdAtIdx: index('payments_created_at_idx').on(table.createdAt),
}));

// Admin logs table
export const adminLogs = pgTable('admin_logs', {
  id: serial('id').primaryKey(),
  adminId: integer('admin_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  action: text('action').notNull(),
  targetId: integer('target_id'),
  targetType: text('target_type'), // user, property, space, payment
  details: jsonb('details'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  adminIdIdx: index('admin_logs_admin_id_idx').on(table.adminId),
  actionIdx: index('admin_logs_action_idx').on(table.action),
  createdAtIdx: index('admin_logs_created_at_idx').on(table.createdAt),
}));

// Favorites table (for saved properties)
export const favorites = pgTable('favorites', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  propertyId: integer('property_id').references(() => properties.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('favorites_user_id_idx').on(table.userId),
  propertyIdIdx: index('favorites_property_id_idx').on(table.propertyId),
  uniqueIdx: index('favorites_unique_idx').on(table.userId, table.propertyId),
}));

// Tours table - Enhanced property viewing appointments
export const tours = pgTable('tours', {
  id: serial('id').primaryKey(),
  propertyId: integer('property_id').references(() => properties.id, { onDelete: 'cascade' }).notNull(),
  tenantId: integer('tenant_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  agentId: integer('agent_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  // Tour details
  tourDate: timestamp('tour_date').notNull(),
  tourDurationMinutes: integer('tour_duration_minutes').default(30),
  tourType: text('tour_type').default('in_person'), // 'in_person', 'virtual', 'hybrid'
  status: tourStatusEnum('status').default('requested'),
  
  // Contact information
  contactPhone: text('contact_phone'),
  contactEmail: text('contact_email'),
  
  // Notes and feedback
  notes: text('notes'),
  tenantFeedback: text('tenant_feedback'),
  agentNotes: text('agent_notes'),
  
  // Calendar integration
  googleCalendarEventId: text('google_calendar_event_id'),
  
  // Reminders
  reminderSent: boolean('reminder_sent').default(false),
  reminderCount: integer('reminder_count').default(0),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  completedAt: timestamp('completed_at'),
}, (table) => ({
  propertyIdIdx: index('tours_property_id_idx').on(table.propertyId),
  tenantIdIdx: index('tours_tenant_id_idx').on(table.tenantId),
  agentIdIdx: index('tours_agent_id_idx').on(table.agentId),
  statusIdx: index('tours_status_idx').on(table.status),
  dateIdx: index('tours_date_idx').on(table.tourDate),
}));

// Additional comprehensive tables

// Notification Templates Table
export const notificationTemplates = pgTable('notification_templates', {
  id: serial('id').primaryKey(),
  name: text('name').unique().notNull(),
  type: text('type').notNull(), // 'email', 'sms', 'push'
  category: text('category').notNull(),
  subject: text('subject'),
  
  // Template content
  content: text('content').notNull(),
  htmlContent: text('html_content'),
  
  // Variables
  variables: jsonb('variables').$type<string[]>().default([]),
  
  // Settings
  isActive: boolean('is_active').default(true),
  isDefault: boolean('is_default').default(false),
  
  // Usage tracking
  usageCount: integer('usage_count').default(0),
  lastUsed: timestamp('last_used'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Commission Rates Table
export const commissionRates = pgTable('commission_rates', {
  id: serial('id').primaryKey(),
  category: text('category').notNull(),
  rateType: text('rate_type').notNull(), // 'percentage', 'fixed'
  rate: decimal('rate', { precision: 10, scale: 2 }).notNull(),
  currency: currencyEnum('currency'),
  
  // Conditions
  minAmount: decimal('min_amount', { precision: 10, scale: 2 }),
  maxAmount: decimal('max_amount', { precision: 10, scale: 2 }),
  
  // Time-based rates
  effectiveFrom: timestamp('effective_from'),
  effectiveTo: timestamp('effective_to'),
  
  // User type specific
  userRole: userRoleEnum('user_role'),
  userTier: text('user_tier'),
  
  // Settings
  isActive: boolean('is_active').default(true),
  createdBy: integer('created_by').references(() => users.id),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// System Settings Table
export const systemSettings = pgTable('system_settings', {
  id: serial('id').primaryKey(),
  key: text('key').unique().notNull(),
  value: text('value'),
  type: text('type').notNull(), // 'string', 'number', 'boolean', 'json'
  description: text('description'),
  
  // Category
  category: text('category').notNull(),
  isPublic: boolean('is_public').default(false),
  
  // Validation
  validationRules: jsonb('validation_rules'),
  
  // Audit
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  updatedBy: integer('updated_by').references(() => users.id),
});

// Analytics Data Table
export const analytics = pgTable('analytics', {
  id: serial('id').primaryKey(),
  metricName: text('metric_name').notNull(),
  metricType: text('metric_type').notNull(), // 'count', 'revenue', 'rate', 'trend'
  metricValue: decimal('metric_value', { precision: 15, scale: 2 }),
  metricUnit: text('metric_unit'),
  
  // Dimensions
  dateTrunc: text('date_trunc').notNull(), // 'day', 'week', 'month', 'year'
  dateValue: timestamp('date_value').notNull(),
  
  // Segments
  segment: text('segment'),
  country: text('country'),
  city: text('city'),
  userRole: userRoleEnum('user_role'),
  currency: currencyEnum('currency'),
  
  // Metadata
  metadata: jsonb('metadata'),
  
  createdAt: timestamp('created_at').defaultNow(),
});

// Export all tables for use in queries
export const schema = {
  users,
  spaces,
  properties,
  messages,
  payments,
  adminLogs,
  favorites,
  tours,
  notificationTemplates,
  commissionRates,
  systemSettings,
  analytics,
};

// Export types for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Space = typeof spaces.$inferSelect;
export type NewSpace = typeof spaces.$inferInsert;
export type Property = typeof properties.$inferSelect;
export type NewProperty = typeof properties.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type AdminLog = typeof adminLogs.$inferSelect;
export type NewAdminLog = typeof adminLogs.$inferInsert;
export type Favorite = typeof favorites.$inferSelect;
export type NewFavorite = typeof favorites.$inferInsert;
export type Tour = typeof tours.$inferSelect;
export type NewTour = typeof tours.$inferInsert;
export type NotificationTemplate = typeof notificationTemplates.$inferSelect;
export type NewNotificationTemplate = typeof notificationTemplates.$inferInsert;
export type CommissionRate = typeof commissionRates.$inferSelect;
export type NewCommissionRate = typeof commissionRates.$inferInsert;
export type SystemSetting = typeof systemSettings.$inferSelect;
export type NewSystemSetting = typeof systemSettings.$inferInsert;
export type Analytics = typeof analytics.$inferSelect;
export type NewAnalytics = typeof analytics.$inferInsert;
