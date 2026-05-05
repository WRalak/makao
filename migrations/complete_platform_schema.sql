-- Complete Makao Platform Database Schema
-- Supports all four user types: Admin, Agent, Tenant, Super Admin
-- Created: 2026-05-03

-- Drop existing tables if they exist (for fresh deployment)
DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS analytics CASCADE;
DROP TABLE IF EXISTS disputes CASCADE;
DROP TABLE IF EXISTS moderation_logs CASCADE;
DROP TABLE IF EXISTS notification_templates CASCADE;
DROP TABLE IF EXISTS commission_rates CASCADE;
DROP TABLE IF EXISTS admin_logs CASCADE;
DROP TABLE IF EXISTS tours CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS spaces CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ENUM Types
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'agent', 'tenant');
CREATE TYPE user_status AS ENUM ('active', 'banned', 'suspended', 'pending');
CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'past_due', 'suspended', 'cancelled', 'pending');
CREATE TYPE property_status AS ENUM ('available', 'rented', 'maintenance', 'unavailable', 'pending_approval');
CREATE TYPE pet_policy AS ENUM ('allowed', 'not_allowed', 'restricted');
CREATE TYPE payment_status AS ENUM ('completed', 'failed', 'pending', 'refunded', 'processing');
CREATE TYPE payment_method AS ENUM ('mpesa', 'stripe', 'cash', 'bank_transfer');
CREATE TYPE currency_type AS ENUM ('KES', 'UGX', 'TZS', 'USD');
CREATE TYPE message_status AS ENUM ('sent', 'delivered', 'read', 'flagged', 'deleted');
CREATE TYPE application_status AS ENUM ('pending', 'under_review', 'approved', 'rejected', 'signed', 'cancelled');
CREATE TYPE tour_status AS ENUM ('requested', 'confirmed', 'completed', 'cancelled', 'no_show');
CREATE TYPE maintenance_status AS ENUM ('submitted', 'assigned', 'in_progress', 'completed', 'cancelled');
CREATE TYPE dispute_status AS ENUM ('open', 'under_review', 'resolved', 'closed');
CREATE TYPE moderation_action AS ENUM ('warning', 'suspend', 'ban', 'delete_content', 'no_action');

-- Users Table (supports all user types)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'tenant',
    status user_status DEFAULT 'active',
    phone VARCHAR(20),
    mpesa_number VARCHAR(20),
    avatar_url TEXT,
    bio TEXT,
    
    -- Agent specific fields
    company_name VARCHAR(255),
    registration_number VARCHAR(100),
    experience_years INTEGER DEFAULT 0,
    license_number VARCHAR(100),
    id_number VARCHAR(50),
    stripe_customer_id VARCHAR(255),
    
    -- Verification fields
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    otp_code VARCHAR(10),
    otp_expires TIMESTAMP WITH TIME ZONE,
    email_token VARCHAR(255),
    
    -- Social links
    website VARCHAR(500),
    linkedin VARCHAR(500),
    facebook VARCHAR(500),
    twitter VARCHAR(500),
    
    -- Notification preferences
    email_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    
    -- Business hours
    business_hours_start TIME DEFAULT '09:00:00',
    business_hours_end TIME DEFAULT '17:00:00',
    timezone VARCHAR(50) DEFAULT 'Africa/Nairobi',
    
    -- Security
    last_login TIMESTAMP WITH TIME ZONE,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    ip_address INET,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id)
);

-- Spaces Table (Agent subscription management)
CREATE TABLE spaces (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    logo_url TEXT,
    monthly_fee DECIMAL(10,2) NOT NULL,
    currency currency_type DEFAULT 'KES',
    property_limit INTEGER NOT NULL,
    subscription_status subscription_status DEFAULT 'inactive',
    subscription_end_date TIMESTAMP WITH TIME ZONE,
    is_approved BOOLEAN DEFAULT FALSE,
    
    -- Business details
    areas_covered JSONB DEFAULT '[]',
    property_types JSONB DEFAULT '[]',
    years_in_business INTEGER DEFAULT 0,
    active_properties INTEGER DEFAULT 0,
    staff_count INTEGER DEFAULT 0,
    
    -- Documents
    documents JSONB DEFAULT '[]',
    
    -- Performance metrics
    total_views INTEGER DEFAULT 0,
    total_inquiries INTEGER DEFAULT 0,
    total_leases INTEGER DEFAULT 0,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by INTEGER REFERENCES users(id)
);

-- Properties Table (Enhanced with all features)
CREATE TABLE properties (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    street VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(2) DEFAULT 'KE',
    zip_code VARCHAR(20),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    
    -- Property details
    bedrooms INTEGER NOT NULL DEFAULT 1,
    bathrooms INTEGER NOT NULL DEFAULT 1,
    square_feet INTEGER,
    rent_amount DECIMAL(10,2) NOT NULL,
    rent_currency currency_type DEFAULT 'KES',
    security_deposit DECIMAL(10,2),
    
    -- Availability
    available_date DATE NOT NULL,
    lease_term VARCHAR(100),
    lease_length_months INTEGER,
    
    -- Features
    images JSONB DEFAULT '[]',
    amenities JSONB DEFAULT '[]',
    pet_policy pet_policy DEFAULT 'not_allowed',
    furnished BOOLEAN DEFAULT FALSE,
    parking_spaces INTEGER DEFAULT 0,
    parking_type VARCHAR(50),
    
    -- Utilities
    utilities_included JSONB DEFAULT '[]',
    utility_costs DECIMAL(10,2) DEFAULT 0,
    
    -- Virtual tours
    virtual_tour_url TEXT,
    video_tour_url TEXT,
    
    -- Location features
    nearby_amenities JSONB DEFAULT '[]',
    transport_links JSONB DEFAULT '[]',
    walk_score INTEGER,
    transit_score INTEGER,
    
    -- Agent information
    agent_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    space_id INTEGER REFERENCES spaces(id) ON DELETE SET NULL,
    
    -- Status and visibility
    status property_status DEFAULT 'available',
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    
    -- Analytics
    view_count INTEGER DEFAULT 0,
    message_count INTEGER DEFAULT 0,
    save_count INTEGER DEFAULT 0,
    application_count INTEGER DEFAULT 0,
    tour_count INTEGER DEFAULT 0,
    
    -- Moderation
    is_flagged BOOLEAN DEFAULT FALSE,
    flag_reason TEXT,
    moderated_by INTEGER REFERENCES users(id),
    moderated_at TIMESTAMP WITH TIME ZONE,
    
    -- SEO
    slug VARCHAR(255) UNIQUE,
    meta_title VARCHAR(255),
    meta_description TEXT,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id)
);

-- Messages Table (Real-time messaging)
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text',
    
    -- Media attachments
    attachments JSONB DEFAULT '[]',
    
    -- Status and moderation
    status message_status DEFAULT 'sent',
    is_read BOOLEAN DEFAULT FALSE,
    is_edited BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    
    -- Moderation
    is_flagged BOOLEAN DEFAULT FALSE,
    flag_reason TEXT,
    moderated_by INTEGER REFERENCES users(id),
    moderated_at TIMESTAMP WITH TIME ZONE,
    
    -- Quick replies
    is_template BOOLEAN DEFAULT FALSE,
    template_id INTEGER,
    
    -- Read receipts
    read_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Payments Table (Comprehensive payment tracking)
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    space_id INTEGER REFERENCES spaces(id) ON DELETE SET NULL,
    property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL,
    
    -- Payment details
    amount DECIMAL(10,2) NOT NULL,
    currency currency_type NOT NULL,
    payment_method payment_method NOT NULL,
    transaction_id VARCHAR(255),
    reference_number VARCHAR(255),
    
    -- M-PESA specific
    mpesa_receipt_number VARCHAR(50),
    mpesa_phone VARCHAR(20),
    
    -- Stripe specific
    stripe_payment_intent_id VARCHAR(255),
    stripe_charge_id VARCHAR(255),
    
    -- Status and processing
    status payment_status DEFAULT 'pending',
    processed_at TIMESTAMP WITH TIME ZONE,
    failed_reason TEXT,
    refund_amount DECIMAL(10,2),
    refund_reason TEXT,
    
    -- Commission tracking
    commission_rate DECIMAL(5,2) DEFAULT 0.20,
    commission_amount DECIMAL(10,2),
    commission_paid BOOLEAN DEFAULT FALSE,
    commission_paid_at TIMESTAMP WITH TIME ZONE,
    
    -- Description
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'subscription', 'application_fee', 'rent', 'commission', 'refund'
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_by INTEGER REFERENCES users(id)
);

-- Favorites Table (Tenant saved properties)
CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    notes TEXT,
    collection_name VARCHAR(100),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, property_id)
);

-- Tours Table (Property viewing appointments)
CREATE TABLE tours (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    tenant_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    agent_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Tour details
    tour_date TIMESTAMP WITH TIME ZONE NOT NULL,
    tour_duration_minutes INTEGER DEFAULT 30,
    tour_type VARCHAR(20) DEFAULT 'in_person', -- 'in_person', 'virtual', 'hybrid'
    status tour_status DEFAULT 'requested',
    
    -- Contact information
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    
    -- Notes and feedback
    notes TEXT,
    tenant_feedback TEXT,
    agent_notes TEXT,
    
    -- Calendar integration
    google_calendar_event_id VARCHAR(255),
    
    -- Reminders
    reminder_sent BOOLEAN DEFAULT FALSE,
    reminder_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Admin Logs Table (Comprehensive audit trail)
CREATE TABLE admin_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    target_id INTEGER,
    target_type VARCHAR(50),
    target_user_id INTEGER REFERENCES users(id),
    
    -- Details
    details JSONB,
    reason TEXT,
    ip_address INET,
    user_agent TEXT,
    
    -- Impact
    impact_level VARCHAR(20) DEFAULT 'low', -- 'low', 'medium', 'high', 'critical'
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Moderation Logs Table (Content moderation tracking)
CREATE TABLE moderation_logs (
    id SERIAL PRIMARY KEY,
    moderator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type VARCHAR(50) NOT NULL, -- 'message', 'property', 'user', 'review'
    target_id INTEGER NOT NULL,
    
    -- Action taken
    action moderation_action NOT NULL,
    reason TEXT NOT NULL,
    
    -- Content details
    content TEXT,
    original_content TEXT,
    
    -- Appeal information
    appeal_requested BOOLEAN DEFAULT FALSE,
    appeal_reason TEXT,
    appeal_status VARCHAR(20) DEFAULT 'none', -- 'none', 'pending', 'approved', 'rejected'
    
    -- Automated vs Manual
    is_automated BOOLEAN DEFAULT FALSE,
    ai_confidence DECIMAL(3,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification Templates Table
CREATE TABLE notification_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'email', 'sms', 'push'
    category VARCHAR(50) NOT NULL,
    subject VARCHAR(255),
    
    -- Template content
    content TEXT NOT NULL,
    html_content TEXT,
    
    -- Variables
    variables JSONB DEFAULT '[]',
    
    -- Settings
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    
    -- Usage tracking
    usage_count INTEGER DEFAULT 0,
    last_used TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Commission Rates Table (Dynamic commission configuration)
CREATE TABLE commission_rates (
    id SERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    rate_type VARCHAR(20) NOT NULL, -- 'percentage', 'fixed'
    rate DECIMAL(10,2) NOT NULL,
    currency currency_type,
    
    -- Conditions
    min_amount DECIMAL(10,2),
    max_amount DECIMAL(10,2),
    
    -- Time-based rates
    effective_from TIMESTAMP WITH TIME ZONE,
    effective_to TIMESTAMP WITH TIME ZONE,
    
    -- User type specific
    user_role user_role,
    user_tier VARCHAR(50),
    
    -- Settings
    is_active BOOLEAN DEFAULT TRUE,
    created_by INTEGER REFERENCES users(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disputes Table (Conflict resolution)
CREATE TABLE disputes (
    id SERIAL PRIMARY KEY,
    case_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- Parties involved
    complainant_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    respondent_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
    message_id INTEGER REFERENCES messages(id) ON DELETE CASCADE,
    
    -- Dispute details
    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    desired_resolution TEXT,
    
    -- Status and resolution
    status dispute_status DEFAULT 'open',
    resolution TEXT,
    resolution_date TIMESTAMP WITH TIME ZONE,
    
    -- Financial
    refund_amount DECIMAL(10,2),
    refund_status VARCHAR(20) DEFAULT 'none', -- 'none', 'requested', 'approved', 'rejected', 'processed'
    
    -- Evidence
    evidence_files JSONB DEFAULT '[]',
    
    -- Timeline
    opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    closed_at TIMESTAMP WITH TIME ZONE,
    
    -- Assignment
    assigned_to INTEGER REFERENCES users(id),
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System Settings Table (Platform configuration)
CREATE TABLE system_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    type VARCHAR(50) NOT NULL, -- 'string', 'number', 'boolean', 'json'
    description TEXT,
    
    -- Category
    category VARCHAR(50) NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    
    -- Validation
    validation_rules JSONB,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by INTEGER REFERENCES users(id)
);

-- Analytics Data Tables
CREATE TABLE analytics (
    id SERIAL PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_type VARCHAR(50) NOT NULL, -- 'count', 'revenue', 'rate', 'trend'
    metric_value DECIMAL(15,2),
    metric_unit VARCHAR(20),
    
    -- Dimensions
    date_trunc VARCHAR(20) NOT NULL, -- 'day', 'week', 'month', 'year'
    date_value DATE NOT NULL,
    
    -- Segments
    segment VARCHAR(50),
    country VARCHAR(2),
    city VARCHAR(100),
    user_role user_role,
    currency currency_type,
    
    -- Metadata
    metadata JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_created_at ON users(created_at);

CREATE INDEX idx_spaces_agent_id ON spaces(agent_id);
CREATE INDEX idx_spaces_status ON spaces(subscription_status);
CREATE INDEX idx_spaces_approved ON spaces(is_approved);
CREATE INDEX idx_spaces_created_at ON spaces(created_at);

CREATE INDEX idx_properties_agent_id ON properties(agent_id);
CREATE INDEX idx_properties_status ON properties(status);
CREATE ON properties(status, is_active);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_price ON properties(rent_amount);
CREATE INDEX idx_properties_available_date ON properties(available_date);
CREATE INDEX idx_properties_created_at ON properties(created_at);
CREATE INDEX idx_properties_featured ON properties(is_featured);
CREATE INDEX idx_properties_slug ON properties(slug);

CREATE INDEX idx_messages_sender_receiver ON messages(sender_id, receiver_id);
CREATE INDEX idx_messages_property ON messages(property_id);
CREATE INDEX idx_messages_status ON messages(status);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_read_at ON messages(read_at);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_category ON payments(category);
CREATE INDEX idx_payments_created_at ON payments(created_at);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_property_id ON favorites(property_id);

CREATE INDEX idx_tours_property_id ON tours(property_id);
CREATE INDEX idx_tours_tenant_id ON tours(tenant_id);
CREATE INDEX idx_tours_agent_id ON tours(agent_id);
CREATE INDEX idx_tours_status ON tours(status);
CREATE INDEX idx_tours_date ON tours(tour_date);

CREATE INDEX idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX idx_admin_logs_action ON admin_logs(action);
CREATE INDEX idx_admin_logs_created_at ON(admin_logs(created_at);

CREATE INDEX idx_analytics_date_value ON analytics(date_value);
CREATE INDEX idx_analytics_metric_name ON analytics(metric_name);
CREATE INDEX idx_analytics_date_trunc ON analytics(date_trunc);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_spaces_updated_at BEFORE UPDATE ON spaces
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_favorites_updated_at BEFORE UPDATE ON favorites
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tours_updated_at BEFORE UPDATE ON tours
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_logs_updated_at BEFORE UPDATE ON admin_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default system settings
INSERT INTO system_settings (key, value, type, description, category, is_public) VALUES
('platform_name', 'Makao', 'string', 'Platform name', 'general', true),
('platform_version', '1.0.0', 'string', 'Current platform version', 'general', true),
('support_email', 'support@makao.com', 'string', 'Customer support email', 'general', true),
('support_phone', '+254 700 123 456', 'string', 'Customer support phone', 'general', true),
('currency_default', 'KES', 'string', 'Default currency', 'general', true),
('timezone_default', 'Africa/Nairobi', 'string', 'Default timezone', 'general', true),
('max_properties_per_agent', '50', 'number', 'Maximum properties per agent', 'limits', false),
('max_images_per_property', '10', 'number', 'Maximum images per property', 'limits', false),
('application_fee', '200', 'number', 'Application fee in KES', 'pricing', true),
('commission_default', '20', 'number', 'Default commission rate in percentage', 'pricing', false),
('maintenance_mode', 'false', 'boolean', 'Platform maintenance mode', 'system', false),
('enable_chat', 'true', 'boolean', 'Enable real-time chat', 'features', true),
('enable_mpesa', 'true', 'boolean', 'Enable M-PESA payments', 'features', true),
('enable_stripe', 'true', 'boolean', 'enable Stripe payments', 'features', true),
('enable_map_view', 'true', 'boolean', 'Enable map view', 'features', true),
('enable_applications', 'true', 'boolean', 'Enable rental applications', 'features', true),
('enable_rent_collection', 'false', 'boolean', 'Enable rent collection', 'features', false),
('enable_virtual_tours', 'true', 'boolean', 'Enable virtual tours', 'features', true);

-- Insert default commission rates
INSERT INTO commission_rates (category, rate_type, rate, currency, user_role, is_active) VALUES
('agent_subscription', 'percentage', 20, 'KES', 'agent', true),
('rent_collection', 'percentage', 5, 'KES', 'agent', false),
('application_fee', 'fixed', 200, 'KES', 'platform', true),
('agent_commission', 'percentage', 20, 'KES', 'agent', true);

-- Insert default notification templates
INSERT INTO notification_templates (name, type, category, subject, content, variables, is_active, is_default) VALUES
('welcome_agent', 'email', 'onboarding', 'Welcome to Makao!', 
    'Welcome {{name}} to Makao! Your agent account has been created successfully. Please complete your profile and submit your space request for approval.',
    ['name'], true, true);

INSERT INTO notification_templates (name, type, category, subject, content, variables, is_active, is_default) VALUES
('space_approved', 'email', 'agent', 'Your Space Has Been Approved!',
    'Congratulations {{name}}! Your space "{{space_name}}" has been approved. You can now activate your subscription and start listing properties.',
    ['name', 'space_name'], true, true);

INSERT INTO notification_templates (name, type, category, subject, content, variables, is_active, is_default) VALUES
('new_message', 'email', 'messaging', 'New Message Received',
    'You have a new message from {{sender_name}} about {{property_title}}.',
    ['sender_name', 'property_title'], true, true);

INSERT INTO notification_templates (name, type, category, subject, content, variables, is_active, is_default) VALUES
('payment_confirmation', 'email', 'payments', 'Payment Received',
    'Your payment of {{amount}} {{currency}} has been received successfully. Transaction ID: {{transaction_id}}',
    ['amount', 'currency', 'transaction_id'], true, true);

-- Insert default super admin user
INSERT INTO users (name, email, password, role, status, email_verified, phone_verified, is_active, created_at, updated_at) VALUES
(
    'Super Admin',
    'admin@makao.com',
    '$2b$10$wv8JBtC8ldtSzKu8vAcFqOaDjNWJBBcHaEvKqfLRdh809JEo8DEqi', -- bcrypt hash for 'admin123'
    'super_admin',
    'active',
    true,
    true,
    true,
    NOW(),
    NOW()
);

COMMIT;
