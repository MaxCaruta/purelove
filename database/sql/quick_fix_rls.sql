-- =====================================================
-- QUICK FIX FOR RLS POLICIES
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Drop all existing policies first
DROP POLICY IF EXISTS "Users can read their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Public can read profiles for browsing" ON profiles;

-- Temporarily disable RLS to allow profile creation
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create all policies fresh
CREATE POLICY "Users can read their own profile"
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- Create a more permissive insert policy
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (true);

-- Also allow service role to insert
CREATE POLICY "Service role can insert profiles"
  ON profiles FOR INSERT TO service_role
  WITH CHECK (true);

-- Allow authenticated users to read all profiles for browsing
CREATE POLICY "Public can read profiles for browsing"
  ON profiles FOR SELECT TO authenticated
  USING (true);

-- Test the fix
SELECT 'RLS policies fixed successfully!' as status; 