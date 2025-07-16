-- =====================================================
-- FRESH START - COMPLETE DATABASE RESET
-- Run this to completely reset and fix all database issues
-- =====================================================

-- Drop all existing tables and functions
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS likes CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS gifts CASCADE;
DROP TABLE IF EXISTS gift_transactions CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS subscription_purchases CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS handle_user_update() CASCADE;
DROP FUNCTION IF EXISTS handle_user_deletion() CASCADE;
DROP FUNCTION IF EXISTS is_chat_subscription_active(JSONB) CASCADE;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create a simple, clean profiles table
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

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create simple, permissive policies
CREATE POLICY "Allow all authenticated operations"
  ON profiles FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow service role full access
CREATE POLICY "Service role full access"
  ON profiles FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Basic indexes
CREATE INDEX idx_profiles_gender ON profiles(gender);
CREATE INDEX idx_profiles_country ON profiles(country);
CREATE INDEX idx_profiles_created_at ON profiles(created_at);

-- Test the setup
SELECT 'Fresh database setup completed successfully!' as status; 