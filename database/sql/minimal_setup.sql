-- =====================================================
-- MINIMAL DATABASE SETUP
-- Run this first to get basic signup working
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS profiles CASCADE;

-- Create minimal profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  gender TEXT DEFAULT 'male',
  birth_date DATE,
  country TEXT,
  city TEXT,
  bio TEXT,
  interests TEXT[] DEFAULT '{}',
  profession TEXT,
  languages TEXT[] DEFAULT '{}',
  photos TEXT[] DEFAULT '{}',
  verified BOOLEAN DEFAULT false,
  premium BOOLEAN DEFAULT false,
  coins INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Basic security policies
CREATE POLICY "Users can read their own profile"
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow service role to insert profiles (for auth triggers)
CREATE POLICY "Service role can insert profiles"
  ON profiles FOR INSERT TO service_role
  WITH CHECK (true);

-- Allow authenticated users to read all profiles for browsing
CREATE POLICY "Public can read profiles for browsing"
  ON profiles FOR SELECT TO authenticated
  USING (true);

-- Basic indexes
CREATE INDEX idx_profiles_gender ON profiles(gender);
CREATE INDEX idx_profiles_country ON profiles(country);
CREATE INDEX idx_profiles_created_at ON profiles(created_at);

-- Test the setup
INSERT INTO profiles (id, first_name, last_name) 
VALUES (gen_random_uuid(), 'Test', 'User')
ON CONFLICT (id) DO NOTHING;

-- Success message
SELECT 'Minimal database setup completed successfully!' as status; 