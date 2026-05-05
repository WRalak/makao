-- Complete Makao Platform Database Schema
-- Created: 2026-05-03

-- Drop existing tables if they exist (for fresh deployment)
DROP TABLE IF EXISTS admin_logs CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS spaces CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ENUM Types
CREATE TYPE user_role AS ENUM ('admin', 'agent', 'tenant');
CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'past_due', 'suspended');
CREATE TYPE property_status AS ENUM ('available', 'rented', 'maintenance', 'unavailable');
CREATE TYPE pet_policy AS ENUM ('allowed', 'not_allowed', 'restricted');
CREATE TYPE payment_status AS ENUM ('completed', 'failed', 'pending', 'refunded');
CREATE TYPE payment_method AS ENUM ('mpesa', 'stripe', 'cash');
CREATE TYPE currency_type AS ENUM ('KES', 'UGX', 'TZS', 'USD');

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'tenant',
    phone VARCHAR(20),
    mpesa_number VARCHAR(20),
    stripe_customer_id VARCHAR(255),
    is_banned BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spaces Table (Agent Subscriptions)
CREATE TABLE spaces (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    agent_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    monthly_fee DECIMAL(10,2) NOT NULL,
    currency currency_type DEFAULT 'KES',
    property_limit INTEGER NOT NULL DEFAULT 5,
    subscription_status subscription_status DEFAULT 'inactive',
    subscription_end_date TIMESTAMP WITH TIME ZONE,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Properties Table
CREATE TABLE properties (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    street VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(2) DEFAULT 'KE', -- KE, UG, TZ for East Africa
    zip_code VARCHAR(20),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    bedrooms INTEGER NOT NULL DEFAULT 1,
    bathrooms INTEGER NOT NULL DEFAULT 1,
    square_feet INTEGER,
    rent_amount DECIMAL(10,2) NOT NULL,
    rent_currency currency_type DEFAULT 'KES',
    security_deposit DECIMAL(10,2),
    images JSONB DEFAULT '[]',
    available_date DATE NOT NULL,
    amenities JSONB DEFAULT '[]',
    pet_policy pet_policy DEFAULT 'not_allowed',
    status property_status DEFAULT 'available',
    agent_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_featured BOOLEAN DEFAULT FALSE,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages Table
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    is_typing BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments Table
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    space_id INTEGER REFERENCES spaces(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency currency_type DEFAULT 'KES',
    payment_method payment_method NOT NULL,
    mpesa_receipt_number VARCHAR(50),
    stripe_payment_id VARCHAR(255),
    status payment_status DEFAULT 'pending',
    payment_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin Logs Table
CREATE TABLE admin_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    target_id INTEGER,
    target_type VARCHAR(50),
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Favorites Table (for saved properties)
CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, property_id)
);

-- Tours Table (for property viewings)
CREATE TABLE tours (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    tenant_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    agent_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tour_date TIMESTAMP WITH TIME ZONE NOT NULL,
    tour_type VARCHAR(20) DEFAULT 'in_person', -- 'in_person', 'virtual'
    status VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_spaces_agent_id ON spaces(agent_id);
CREATE INDEX idx_spaces_status ON spaces(subscription_status);
CREATE INDEX idx_properties_agent_id ON properties(agent_id);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_location ON properties(city, state);
CREATE INDEX idx_properties_price ON properties(rent_amount);
CREATE INDEX idx_properties_available ON properties(available_date);
CREATE INDEX idx_messages_sender_receiver ON messages(sender_id, receiver_id);
CREATE INDEX idx_messages_property ON messages(property_id);
CREATE INDEX idx_payments_agent_id ON payments(agent_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_tours_property_id ON tours(property_id);
CREATE INDEX idx_tours_date ON tours(tour_date);

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

CREATE TRIGGER update_tours_updated_at BEFORE UPDATE ON tours
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user
INSERT INTO users (name, email, password, role, is_active, is_banned, email_verified)
VALUES (
    'Admin User',
    'wallaceralak@gmail.com',
    '$2b$10$wv8JBtC8ldtSzKu8vAcFqOaDjNWJBBcHaEvKqfLRdh809JEo8DEqi', -- bcrypt hash for '12345'
    'admin',
    true,
    false,
    true
) ON CONFLICT (email) DO NOTHING;

-- Insert sample subscription plans data
INSERT INTO spaces (name, description, agent_id, monthly_fee, currency, property_limit, subscription_status, is_approved)
SELECT 
    'Basic Plan',
    'Basic subscription with 5 property listings',
    u.id,
    2500.00,
    'KES',
    5,
    'active',
    true
FROM users u 
WHERE u.role = 'agent' 
LIMIT 3;

COMMIT;
