-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'tenant',
    phone VARCHAR(20),
    mpesa_number VARCHAR(20),
    provider VARCHAR(50) DEFAULT 'email',
    provider_id VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    is_banned BOOLEAN DEFAULT false,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- Insert demo users for testing
INSERT INTO users (name, email, password, role, phone, email_verified) VALUES 
('Admin User', 'admin@makao.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', '+254700000000', true),
('Agent User', 'agent@makao.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'agent', '+254700000001', true),
('Tenant User', 'tenant@makao.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'tenant', '+254700000002', true)
ON CONFLICT (email) DO NOTHING;

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    street VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    country VARCHAR(10) DEFAULT 'KE',
    bedrooms INTEGER DEFAULT 1,
    bathrooms INTEGER DEFAULT 1,
    square_feet INTEGER,
    rent DECIMAL(10,2),
    rent_currency VARCHAR(10) DEFAULT 'KES',
    security_deposit DECIMAL(10,2),
    available_date DATE,
    lease_term VARCHAR(100),
    lease_length_months INTEGER DEFAULT 12,
    images JSONB DEFAULT '[]',
    amenities JSONB DEFAULT '[]',
    pet_policy VARCHAR(50) DEFAULT 'not_allowed',
    furnished BOOLEAN DEFAULT false,
    agent_id INTEGER REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'available',
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    slug VARCHAR(255),
    meta_title VARCHAR(255),
    meta_description TEXT,
    view_count INTEGER DEFAULT 0,
    message_count INTEGER DEFAULT 0,
    save_count INTEGER DEFAULT 0,
    application_count INTEGER DEFAULT 0,
    tour_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for properties
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_agent ON properties(agent_id);
CREATE INDEX IF NOT EXISTS idx_properties_active ON properties(is_active);
CREATE INDEX IF NOT EXISTS idx_properties_featured ON properties(is_featured);

-- Insert sample properties
INSERT INTO properties (title, description, street, city, state, zip_code, country, bedrooms, bathrooms, square_feet, rent, rent_currency, agent_id, status, is_active, is_verified, is_featured) VALUES 
('Modern 2-Bedroom Apartment in Kilimani', 'Beautiful modern apartment with stunning city views, located in the heart of Kilimani. Close to shopping centers, restaurants, and public transport.', 'Argwings Kodhek Road', 'Nairobi', 'Nairobi County', '00100', 'KE', 2, 2, 1200, 45000.00, 'KES', 2, 'available', true, true, true),
('Spacious 3-Bedroom House in Dar es Salaam', 'Lovely family home with garden, perfect for families. Located in a quiet neighborhood with easy access to schools and shopping.', 'Kinondoni Road', 'Dar es Salaam', 'Dar es Salaam Region', '14110', 'TZ', 3, 2, 1800, 2500000.00, 'TZS', 2, 'available', true, true, false),
('Luxury Studio in Kampala', 'Modern studio apartment with premium finishes and great city views. Perfect for young professionals.', 'Kampala Road', 'Kampala', 'Central Region', '256', 'UG', 1, 1, 600, 1500000.00, 'UGX', 2, 'available', true, true, true)
ON CONFLICT DO NOTHING;

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
