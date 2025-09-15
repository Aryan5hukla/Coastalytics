/*
# Coastal Hazard Monitoring Platform - Initial Database Schema

## Overview
This migration creates the foundational database structure for a comprehensive coastal hazard monitoring platform that serves analysts and officials with real-time data processing, validation, and alert management capabilities.

## Tables Created

### 1. User Profiles
- `user_profiles` - Extended user information with role-based access control

### 2. Core Data Entities
- `reports` - Citizen-submitted hazard reports with validation status
- `incois_warnings` - Official INCOIS early warning data
- `social_media_posts` - Processed social media mentions
- `predicted_hazards` - AI-generated hazard predictions
- `alerts` - Official alerts created by authorities
- `resources` - Emergency resources (NGOs, shelters, etc.)

### 3. Security & Permissions
- Row Level Security (RLS) enabled on all tables
- Role-based policies for analyst and official access levels
- Secure data validation and processing workflows

## Key Features
- Comprehensive audit trails with timestamps
- Geospatial data support for mapping functionality
- Status tracking for reports and alerts
- Multi-channel alert delivery support
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Update user_role enum type safely (non-destructive migration)
DO $$
BEGIN
    -- Check if the type exists and has old values
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        -- Create new temporary enum type with desired values
        CREATE TYPE user_role_new AS ENUM ('citizen', 'hazard analyst', 'govt official');
        
        -- Drop dependent policies first
        DROP POLICY IF EXISTS "Officials can update reports" ON reports;
        DROP POLICY IF EXISTS "Officials can create alerts" ON alerts;
        DROP POLICY IF EXISTS "Officials can update their alerts" ON alerts;
        
        -- Update any existing columns that use the old enum
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
            -- 1. Drop the default on the column
            ALTER TABLE user_profiles ALTER COLUMN role DROP DEFAULT;
            
            -- 2. Alter the column type, casting old values to new
            ALTER TABLE user_profiles 
            ALTER COLUMN role TYPE user_role_new 
            USING CASE 
                WHEN role::text = 'analyst' THEN 'hazard analyst'::user_role_new
                WHEN role::text = 'official' THEN 'govt official'::user_role_new  
                WHEN role::text = 'admin' THEN 'govt official'::user_role_new
                ELSE 'citizen'::user_role_new
            END;
        END IF;
        
        -- 3. Drop old type and rename new type
        DROP TYPE user_role;
        ALTER TYPE user_role_new RENAME TO user_role;

        -- 4. Re-add the default constraint with the new (renamed) type
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
            ALTER TABLE user_profiles ALTER COLUMN role SET DEFAULT 'citizen';
        END IF;
    ELSE
        -- Type doesn't exist, create it normally
        CREATE TYPE user_role AS ENUM ('citizen', 'hazard analyst', 'govt official');
    END IF;
END$$;

-- Create report_status enum safely
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace 
                   WHERE t.typname='report_status' AND n.nspname='public') THEN
        CREATE TYPE public.report_status AS ENUM ('pending', 'pending_verification', 'verified', 'dismissed', 'unverified_location', 'irrelevant');
    END IF;
END$$;

-- Create alert_status enum safely
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace 
                   WHERE t.typname='alert_status' AND n.nspname='public') THEN
        CREATE TYPE public.alert_status AS ENUM ('draft', 'active', 'resolved', 'cancelled');
    END IF;
END$$;

-- Create alert_priority enum safely
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace 
                   WHERE t.typname='alert_priority' AND n.nspname='public') THEN
        CREATE TYPE public.alert_priority AS ENUM ('low', 'medium', 'high', 'critical');
    END IF;
END$$;

-- Create hazard_type enum safely
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace 
                   WHERE t.typname='hazard_type' AND n.nspname='public') THEN
        CREATE TYPE public.hazard_type AS ENUM ('cyclone', 'tsunami', 'storm_surge', 'coastal_erosion', 'flooding', 'other');
    END IF;
END$$;

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id uuid PRIMARY KEY DEFAULT auth.uid(),
    email text UNIQUE NOT NULL,
    full_name text NOT NULL DEFAULT '',
    role user_role NOT NULL DEFAULT 'citizen',
    organization text DEFAULT '',
    phone text DEFAULT '',
    is_active boolean DEFAULT true,
    last_login timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Reports table for citizen submissions
CREATE TABLE IF NOT EXISTS reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    citizen_id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    location geometry(POINT, 4326) NOT NULL,
    location_name text DEFAULT '',
    hazard_type hazard_type NOT NULL,
    status report_status DEFAULT 'pending',
    urgency_level integer DEFAULT 1 CHECK (urgency_level BETWEEN 1 AND 5),
    media_urls text[] DEFAULT '{}',
    verified_by uuid REFERENCES user_profiles(id),
    verification_notes text DEFAULT '',
    nlp_keywords text[] DEFAULT '{}',
    nlp_sentiment_score float DEFAULT 0,
    is_location_verified boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- INCOIS warnings table
CREATE TABLE IF NOT EXISTS incois_warnings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    warning_id text UNIQUE NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    hazard_type hazard_type NOT NULL,
    severity text NOT NULL,
    affected_areas geometry(MULTIPOLYGON, 4326),
    issue_time timestamptz NOT NULL,
    valid_until timestamptz,
    warning_url text DEFAULT '',
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Social media posts table
CREATE TABLE IF NOT EXISTS social_media_posts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    platform text NOT NULL,
    post_id text NOT NULL,
    content text NOT NULL,
    author_handle text DEFAULT '',
    location geometry(POINT, 4326),
    location_name text DEFAULT '',
    hashtags text[] DEFAULT '{}',
    mentions integer DEFAULT 0,
    likes integer DEFAULT 0,
    shares integer DEFAULT 0,
    nlp_keywords text[] DEFAULT '{}',
    nlp_sentiment_score float DEFAULT 0,
    relevance_score float DEFAULT 0,
    post_timestamp timestamptz NOT NULL,
    processed_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
);

-- Predicted hazards table
CREATE TABLE IF NOT EXISTS predicted_hazards (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    hazard_type hazard_type NOT NULL,
    predicted_area geometry(POLYGON, 4326) NOT NULL,
    confidence_level float NOT NULL CHECK (confidence_level BETWEEN 0 AND 1),
    severity_estimate text NOT NULL,
    prediction_window_hours integer NOT NULL,
    contributing_factors jsonb DEFAULT '{}',
    source_reports uuid[] DEFAULT '{}',
    source_social_posts uuid[] DEFAULT '{}',
    algorithm_version text DEFAULT 'v1.0',
    predicted_at timestamptz DEFAULT now(),
    valid_until timestamptz NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    message text NOT NULL,
    hazard_type hazard_type NOT NULL,
    priority alert_priority DEFAULT 'medium',
    status alert_status DEFAULT 'draft',
    target_area geometry(MULTIPOLYGON, 4326) NOT NULL,
    affected_population_estimate integer DEFAULT 0,
    channels text[] DEFAULT '{"sms", "push", "call"}',
    created_by uuid NOT NULL REFERENCES user_profiles(id),
    approved_by uuid REFERENCES user_profiles(id),
    dispatch_time timestamptz,
    expires_at timestamptz,
    delivery_stats jsonb DEFAULT '{}',
    n8n_workflow_id text DEFAULT '',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Resources table for emergency resources
CREATE TABLE IF NOT EXISTS resources (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    type text NOT NULL,
    description text DEFAULT '',
    location geometry(POINT, 4326) NOT NULL,
    address text NOT NULL,
    contact_phone text DEFAULT '',
    contact_email text DEFAULT '',
    capacity integer DEFAULT 0,
    is_active boolean DEFAULT true,
    operating_hours text DEFAULT '24/7',
    services_offered text[] DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE incois_warnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE predicted_hazards ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can read own profile"
    ON user_profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON user_profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- Simplified INSERT policy - allow any authenticated user to create profiles
CREATE POLICY "Allow profile creation"
    ON user_profiles FOR INSERT
    TO authenticated, anon, service_role
    WITH CHECK (true);

-- RLS Policies for reports
CREATE POLICY "Authenticated users can read reports"
    ON reports FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Citizens can insert reports"
    ON reports FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Recreate the officials policy with updated role references
CREATE POLICY "Officials can update reports"
    ON reports FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('govt official')
        )
    );

-- RLS Policies for INCOIS warnings
CREATE POLICY "All authenticated users can read INCOIS warnings"
    ON incois_warnings FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Only system can insert INCOIS warnings"
    ON incois_warnings FOR INSERT
    TO service_role
    WITH CHECK (true);

-- RLS Policies for social media posts
CREATE POLICY "All authenticated users can read social media posts"
    ON social_media_posts FOR SELECT
    TO authenticated
    USING (true);

-- RLS Policies for predicted hazards
CREATE POLICY "All authenticated users can read predicted hazards"
    ON predicted_hazards FOR SELECT
    TO authenticated
    USING (true);

-- RLS Policies for alerts
CREATE POLICY "All authenticated users can read alerts"
    ON alerts FOR SELECT
    TO authenticated
    USING (true);

-- Recreate the officials alert policies with updated role references
CREATE POLICY "Officials can create alerts"
    ON alerts FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('govt official')
        )
    );

CREATE POLICY "Officials can update their alerts"
    ON alerts FOR UPDATE
    TO authenticated
    USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role = 'govt official'
        )
    );

-- RLS Policies for resources
CREATE POLICY "All authenticated users can read resources"
    ON resources FOR SELECT
    TO authenticated
    USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS reports_location_idx ON reports USING GIST (location);
CREATE INDEX IF NOT EXISTS reports_status_idx ON reports (status);
CREATE INDEX IF NOT EXISTS reports_created_at_idx ON reports (created_at DESC);
CREATE INDEX IF NOT EXISTS reports_hazard_type_idx ON reports (hazard_type);

CREATE INDEX IF NOT EXISTS incois_warnings_affected_areas_idx ON incois_warnings USING GIST (affected_areas);
CREATE INDEX IF NOT EXISTS incois_warnings_is_active_idx ON incois_warnings (is_active);
CREATE INDEX IF NOT EXISTS incois_warnings_hazard_type_idx ON incois_warnings (hazard_type);

CREATE INDEX IF NOT EXISTS social_media_posts_location_idx ON social_media_posts USING GIST (location);
CREATE INDEX IF NOT EXISTS social_media_posts_relevance_idx ON social_media_posts (relevance_score DESC);
CREATE INDEX IF NOT EXISTS social_media_posts_timestamp_idx ON social_media_posts (post_timestamp DESC);

CREATE INDEX IF NOT EXISTS predicted_hazards_area_idx ON predicted_hazards USING GIST (predicted_area);
CREATE INDEX IF NOT EXISTS predicted_hazards_is_active_idx ON predicted_hazards (is_active);
CREATE INDEX IF NOT EXISTS predicted_hazards_confidence_idx ON predicted_hazards (confidence_level DESC);

CREATE INDEX IF NOT EXISTS alerts_target_area_idx ON alerts USING GIST (target_area);
CREATE INDEX IF NOT EXISTS alerts_status_idx ON alerts (status);
CREATE INDEX IF NOT EXISTS alerts_priority_idx ON alerts (priority);
CREATE INDEX IF NOT EXISTS alerts_created_at_idx ON alerts (created_at DESC);

CREATE INDEX IF NOT EXISTS resources_location_idx ON resources USING GIST (location);
CREATE INDEX IF NOT EXISTS resources_type_idx ON resources (type);
CREATE INDEX IF NOT EXISTS resources_is_active_idx ON resources (is_active);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at 
    BEFORE UPDATE ON reports 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_incois_warnings_updated_at 
    BEFORE UPDATE ON incois_warnings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alerts_updated_at 
    BEFORE UPDATE ON alerts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resources_updated_at 
    BEFORE UPDATE ON resources 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create user profile on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role, organization, phone)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'citizen')::user_role,
    COALESCE(new.raw_user_meta_data->>'organization', ''),
    COALESCE(new.raw_user_meta_data->>'phone', '')
  );
  RETURN new;
END;
$$;

-- Trigger to automatically create profile when user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
