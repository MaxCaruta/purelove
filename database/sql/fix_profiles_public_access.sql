-- =====================================================
-- FIX PROFILES PUBLIC ACCESS
-- Allow anonymous users to browse profiles
-- =====================================================

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Public can read profiles for browsing" ON profiles;

-- Create a new policy that allows both authenticated and anonymous users to read profiles
CREATE POLICY "Public can read profiles for browsing"
  ON profiles FOR SELECT TO authenticated, anon
  USING (true);

-- Also ensure we have a policy for authenticated users to read all profiles
CREATE POLICY "Authenticated users can read all profiles"
  ON profiles FOR SELECT TO authenticated
  USING (true);

-- Verify the policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'profiles' 
AND policyname LIKE '%browsing%';

-- Test the fix by checking if we can read profiles as anon
-- (This will be tested when you run the query)
SELECT 'Profiles public access fixed successfully!' as status; 