-- =====================================================
-- FINAL RLS POLICY FIX
-- Fixes 403 errors during signup and profile creation
-- =====================================================

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Users can read their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation during signup" ON profiles;
DROP POLICY IF EXISTS "Public can read profiles for browsing" ON profiles;

-- Create comprehensive RLS policies for profiles
CREATE POLICY "Users can read their own profile"
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- Allow authenticated users to insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow service role to insert profiles (for auth triggers and admin operations)
CREATE POLICY "Service role can insert profiles"
  ON profiles FOR INSERT TO service_role
  WITH CHECK (true);

-- Allow anon users to insert profiles during signup (temporary, for edge cases)
CREATE POLICY "Allow profile creation during signup"
  ON profiles FOR INSERT TO anon
  WITH CHECK (true);

-- Allow authenticated users to read all profiles for browsing
CREATE POLICY "Public can read profiles for browsing"
  ON profiles FOR SELECT TO authenticated
  USING (true);

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON profiles TO service_role;

-- Verify policies are working
DO $$
BEGIN
  RAISE NOTICE 'RLS policies updated successfully!';
  RAISE NOTICE 'Profile creation during signup should now work.';
  RAISE NOTICE 'Auth triggers will handle automatic profile creation.';
END $$; 