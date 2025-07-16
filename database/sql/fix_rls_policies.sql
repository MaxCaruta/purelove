-- =====================================================
-- FIX RLS POLICIES FOR PROFILES TABLE
-- Run this to fix the RLS policy issues
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Public can read profiles for browsing" ON profiles;

-- Create improved policies
CREATE POLICY "Users can read their own profile"
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- Allow authenticated users to insert their own profile
-- This will work after they sign in
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow service role to insert profiles (for auth triggers and admin operations)
CREATE POLICY "Service role can insert profiles"
  ON profiles FOR INSERT TO service_role
  WITH CHECK (true);

-- Allow authenticated users to read all profiles for browsing
CREATE POLICY "Public can read profiles for browsing"
  ON profiles FOR SELECT TO authenticated
  USING (true);

-- Test the policies
SELECT 'RLS policies updated successfully!' as status; 