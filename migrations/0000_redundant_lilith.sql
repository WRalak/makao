DO $$ BEGIN
 CREATE TYPE "currency" AS ENUM('KES', 'UGX', 'TZS');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "payment_method" AS ENUM('mpesa', 'stripe', 'card');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "payment_status" AS ENUM('completed', 'failed', 'pending');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "payment_type" AS ENUM('subscription', 'commission', 'featured_listing', 'lead_fee', 'application_fee', 'premium_feature');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "pet_policy" AS ENUM('allowed', 'not-allowed', 'restricted');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "property_status" AS ENUM('available', 'rented', 'pending');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "subscription_status" AS ENUM('active', 'inactive', 'past_due');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "user_role" AS ENUM('admin', 'agent', 'tenant');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "admin_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"admin_id" integer NOT NULL,
	"action" text NOT NULL,
	"target_id" integer,
	"target_type" text,
	"details" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "favorites" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"property_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"sender_id" integer NOT NULL,
	"receiver_id" integer NOT NULL,
	"property_id" integer,
	"content" text NOT NULL,
	"is_read" boolean DEFAULT false,
	"attachments" jsonb DEFAULT '[]'::jsonb,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_id" integer NOT NULL,
	"space_id" integer,
	"amount" numeric(12, 2) NOT NULL,
	"currency" "currency" DEFAULT 'KES',
	"mpesa_receipt_number" text,
	"status" "payment_status" DEFAULT 'pending',
	"payment_date" timestamp DEFAULT now(),
	"payment_method" "payment_method" NOT NULL,
	"transaction_id" text,
	"description" text NOT NULL,
	"type" "payment_type" NOT NULL,
	"stripe_payment_intent_id" text,
	"subscription_id" text,
	"plan" text,
	"commission_amount" numeric(12, 2),
	"commission_rate" numeric(5, 4),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "properties" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"agent_id" integer NOT NULL,
	"street" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"zip_code" text NOT NULL,
	"country" text NOT NULL,
	"latitude" numeric(10, 8) NOT NULL,
	"longitude" numeric(11, 8) NOT NULL,
	"rent" numeric(12, 2) NOT NULL,
	"rent_currency" "currency" DEFAULT 'KES',
	"security_deposit" numeric(12, 2) NOT NULL,
	"bedrooms" integer NOT NULL,
	"bathrooms" integer NOT NULL,
	"square_feet" integer NOT NULL,
	"images" jsonb DEFAULT '[]'::jsonb,
	"amenities" jsonb DEFAULT '[]'::jsonb,
	"pet_policy" "pet_policy" NOT NULL,
	"available_date" timestamp NOT NULL,
	"status" "property_status" DEFAULT 'available',
	"featured" boolean DEFAULT false,
	"is_approved" boolean DEFAULT true,
	"views" integer DEFAULT 0,
	"messages_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "spaces" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"agent_id" integer NOT NULL,
	"monthly_fee" numeric(10, 2) NOT NULL,
	"property_limit" integer NOT NULL,
	"subscription_status" "subscription_status" DEFAULT 'inactive',
	"subscription_end_date" timestamp,
	"is_approved" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tours" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" integer NOT NULL,
	"tenant_id" integer NOT NULL,
	"agent_id" integer NOT NULL,
	"date" timestamp NOT NULL,
	"time" text NOT NULL,
	"status" text DEFAULT 'scheduled',
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"role" "user_role" DEFAULT 'tenant',
	"avatar" text,
	"phone" text,
	"is_active" boolean DEFAULT true,
	"is_banned" boolean DEFAULT false,
	"email_verified" boolean DEFAULT false,
	"email_verification_token" text,
	"email_verification_expires" timestamp,
	"password_reset_token" text,
	"password_reset_expires" timestamp,
	"last_login_at" timestamp,
	"login_attempts" integer DEFAULT 0,
	"lock_until" timestamp,
	"provider" text DEFAULT 'email',
	"provider_id" text,
	"remember_me_token" text,
	"two_factor_secret" text,
	"two_factor_enabled" boolean DEFAULT false,
	"stripe_customer_id" text,
	"mpesa_number" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "admin_logs_admin_id_idx" ON "admin_logs" ("admin_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "admin_logs_action_idx" ON "admin_logs" ("action");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "admin_logs_created_at_idx" ON "admin_logs" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "favorites_user_id_idx" ON "favorites" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "favorites_property_id_idx" ON "favorites" ("property_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "favorites_unique_idx" ON "favorites" ("user_id","property_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "messages_sender_receiver_idx" ON "messages" ("sender_id","receiver_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "messages_property_id_idx" ON "messages" ("property_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "messages_receiver_read_idx" ON "messages" ("receiver_id","is_read");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payments_agent_id_idx" ON "payments" ("agent_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payments_status_idx" ON "payments" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payments_payment_date_idx" ON "payments" ("payment_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payments_mpesa_receipt_idx" ON "payments" ("mpesa_receipt_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "properties_agent_id_idx" ON "properties" ("agent_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "properties_status_idx" ON "properties" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "properties_location_idx" ON "properties" ("city","state");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "properties_rent_idx" ON "properties" ("rent");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "spaces_agent_id_idx" ON "spaces" ("agent_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "spaces_status_idx" ON "spaces" ("subscription_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tours_property_id_idx" ON "tours" ("property_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tours_tenant_id_idx" ON "tours" ("tenant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tours_agent_id_idx" ON "tours" ("agent_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tours_date_idx" ON "tours" ("date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users" ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_role_idx" ON "users" ("role");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "admin_logs" ADD CONSTRAINT "admin_logs_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "favorites" ADD CONSTRAINT "favorites_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "messages" ADD CONSTRAINT "messages_receiver_id_users_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "messages" ADD CONSTRAINT "messages_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payments" ADD CONSTRAINT "payments_agent_id_users_id_fk" FOREIGN KEY ("agent_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payments" ADD CONSTRAINT "payments_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "properties" ADD CONSTRAINT "properties_agent_id_users_id_fk" FOREIGN KEY ("agent_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "spaces" ADD CONSTRAINT "spaces_agent_id_users_id_fk" FOREIGN KEY ("agent_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tours" ADD CONSTRAINT "tours_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tours" ADD CONSTRAINT "tours_tenant_id_users_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tours" ADD CONSTRAINT "tours_agent_id_users_id_fk" FOREIGN KEY ("agent_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
