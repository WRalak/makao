-- Create enums (PostgreSQL doesn't support IF NOT EXISTS for enums)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'agent', 'tenant');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE currency AS ENUM ('KES', 'UGX', 'TZS');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('completed', 'failed', 'pending');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('mpesa', 'stripe', 'card');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_type AS ENUM ('subscription', 'commission', 'featured_listing', 'lead_fee', 'application_fee', 'premium_feature');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE property_status AS ENUM ('available', 'rented', 'pending');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE pet_policy AS ENUM ('allowed', 'not-allowed', 'restricted');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'past_due');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create users table
CREATE TABLE IF NOT EXISTS "users" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "role" user_role DEFAULT 'tenant',
    "avatar" TEXT,
    "phone" TEXT,
    "is_active" BOOLEAN DEFAULT true,
    "is_banned" BOOLEAN DEFAULT false,
    "email_verified" BOOLEAN DEFAULT false,
    "email_verification_token" TEXT,
    "email_verification_expires" TIMESTAMP,
    "password_reset_token" TEXT,
    "password_reset_expires" TIMESTAMP,
    "last_login_at" TIMESTAMP,
    "login_attempts" INTEGER DEFAULT 0,
    "lock_until" TIMESTAMP,
    "provider" TEXT DEFAULT 'email',
    "provider_id" TEXT,
    "remember_me_token" TEXT,
    "two_factor_secret" TEXT,
    "two_factor_enabled" BOOLEAN DEFAULT false,
    "stripe_customer_id" TEXT,
    "mpesa_number" TEXT,
    "created_at" TIMESTAMP DEFAULT NOW(),
    "updated_at" TIMESTAMP DEFAULT NOW()
);

-- Create indexes for users
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users" ("email");
CREATE INDEX IF NOT EXISTS "users_role_idx" ON "users" ("role");

-- Create spaces table
CREATE TABLE IF NOT EXISTS "spaces" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "agent_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "monthly_fee" DECIMAL(10,2) NOT NULL,
    "property_limit" INTEGER NOT NULL,
    "subscription_status" subscription_status DEFAULT 'inactive',
    "subscription_end_date" TIMESTAMP,
    "is_approved" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP DEFAULT NOW(),
    "updated_at" TIMESTAMP DEFAULT NOW()
);

-- Create indexes for spaces
CREATE INDEX IF NOT EXISTS "spaces_agent_id_idx" ON "spaces" ("agent_id");
CREATE INDEX IF NOT EXISTS "spaces_status_idx" ON "spaces" ("subscription_status");

-- Create properties table
CREATE TABLE IF NOT EXISTS "properties" (
    "id" SERIAL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "agent_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip_code" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "latitude" DECIMAL(10,8) NOT NULL,
    "longitude" DECIMAL(11,8) NOT NULL,
    "rent" DECIMAL(12,2) NOT NULL,
    "rent_currency" currency DEFAULT 'KES',
    "security_deposit" DECIMAL(12,2) NOT NULL,
    "bedrooms" INTEGER NOT NULL,
    "bathrooms" INTEGER NOT NULL,
    "square_feet" INTEGER NOT NULL,
    "images" JSONB DEFAULT '[]',
    "amenities" JSONB DEFAULT '[]',
    "pet_policy" pet_policy NOT NULL,
    "available_date" TIMESTAMP NOT NULL,
    "status" property_status DEFAULT 'available',
    "featured" BOOLEAN DEFAULT false,
    "is_approved" BOOLEAN DEFAULT true,
    "views" INTEGER DEFAULT 0,
    "messages_count" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP DEFAULT NOW(),
    "updated_at" TIMESTAMP DEFAULT NOW()
);

-- Create indexes for properties
CREATE INDEX IF NOT EXISTS "properties_agent_id_idx" ON "properties" ("agent_id");
CREATE INDEX IF NOT EXISTS "properties_status_idx" ON "properties" ("status");
CREATE INDEX IF NOT EXISTS "properties_location_idx" ON "properties" ("city", "state");
CREATE INDEX IF NOT EXISTS "properties_rent_idx" ON "properties" ("rent");

-- Create messages table
CREATE TABLE IF NOT EXISTS "messages" (
    "id" SERIAL PRIMARY KEY,
    "sender_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "receiver_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "property_id" INTEGER REFERENCES "properties"("id") ON DELETE SET NULL,
    "content" TEXT NOT NULL,
    "is_read" BOOLEAN DEFAULT false,
    "attachments" JSONB DEFAULT '[]',
    "read_at" TIMESTAMP,
    "created_at" TIMESTAMP DEFAULT NOW(),
    "updated_at" TIMESTAMP DEFAULT NOW()
);

-- Create indexes for messages
CREATE INDEX IF NOT EXISTS "messages_sender_receiver_idx" ON "messages" ("sender_id", "receiver_id");
CREATE INDEX IF NOT EXISTS "messages_property_id_idx" ON "messages" ("property_id");
CREATE INDEX IF NOT EXISTS "messages_receiver_read_idx" ON "messages" ("receiver_id", "is_read");

-- Create payments table
CREATE TABLE IF NOT EXISTS "payments" (
    "id" SERIAL PRIMARY KEY,
    "agent_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "space_id" INTEGER REFERENCES "spaces"("id") ON DELETE SET NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" currency DEFAULT 'KES',
    "mpesa_receipt_number" TEXT,
    "status" payment_status DEFAULT 'pending',
    "payment_date" TIMESTAMP DEFAULT NOW(),
    "payment_method" payment_method NOT NULL,
    "transaction_id" TEXT,
    "description" TEXT NOT NULL,
    "type" payment_type NOT NULL,
    "stripe_payment_intent_id" TEXT,
    "subscription_id" TEXT,
    "plan" TEXT,
    "commission_amount" DECIMAL(12,2),
    "commission_rate" DECIMAL(5,4),
    "created_at" TIMESTAMP DEFAULT NOW(),
    "updated_at" TIMESTAMP DEFAULT NOW()
);

-- Create indexes for payments
CREATE INDEX IF NOT EXISTS "payments_agent_id_idx" ON "payments" ("agent_id");
CREATE INDEX IF NOT EXISTS "payments_status_idx" ON "payments" ("status");
CREATE INDEX IF NOT EXISTS "payments_payment_date_idx" ON "payments" ("payment_date");
CREATE INDEX IF NOT EXISTS "payments_mpesa_receipt_idx" ON "payments" ("mpesa_receipt_number");

-- Create admin_logs table
CREATE TABLE IF NOT EXISTS "admin_logs" (
    "id" SERIAL PRIMARY KEY,
    "admin_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "action" TEXT NOT NULL,
    "target_id" INTEGER,
    "target_type" TEXT,
    "details" JSONB,
    "created_at" TIMESTAMP DEFAULT NOW()
);

-- Create indexes for admin_logs
CREATE INDEX IF NOT EXISTS "admin_logs_admin_id_idx" ON "admin_logs" ("admin_id");
CREATE INDEX IF NOT EXISTS "admin_logs_action_idx" ON "admin_logs" ("action");
CREATE INDEX IF NOT EXISTS "admin_logs_created_at_idx" ON "admin_logs" ("created_at");

-- Create favorites table
CREATE TABLE IF NOT EXISTS "favorites" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "property_id" INTEGER NOT NULL REFERENCES "properties"("id") ON DELETE CASCADE,
    "created_at" TIMESTAMP DEFAULT NOW()
);

-- Create indexes for favorites
CREATE INDEX IF NOT EXISTS "favorites_user_id_idx" ON "favorites" ("user_id");
CREATE INDEX IF NOT EXISTS "favorites_property_id_idx" ON "favorites" ("property_id");
CREATE INDEX IF NOT EXISTS "favorites_unique_idx" ON "favorites" ("user_id", "property_id");

-- Create tours table
CREATE TABLE IF NOT EXISTS "tours" (
    "id" SERIAL PRIMARY KEY,
    "property_id" INTEGER NOT NULL REFERENCES "properties"("id") ON DELETE CASCADE,
    "tenant_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "agent_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "date" TIMESTAMP NOT NULL,
    "time" TEXT NOT NULL,
    "status" TEXT DEFAULT 'scheduled',
    "notes" TEXT,
    "created_at" TIMESTAMP DEFAULT NOW(),
    "updated_at" TIMESTAMP DEFAULT NOW()
);

-- Create indexes for tours
CREATE INDEX IF NOT EXISTS "tours_property_id_idx" ON "tours" ("property_id");
CREATE INDEX IF NOT EXISTS "tours_tenant_id_idx" ON "tours" ("tenant_id");
CREATE INDEX IF NOT EXISTS "tours_agent_id_idx" ON "tours" ("agent_id");
CREATE INDEX IF NOT EXISTS "tours_date_idx" ON "tours" ("date");
