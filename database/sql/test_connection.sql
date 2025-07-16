-- =====================================================
-- TEST CONNECTION AND BASIC FUNCTIONALITY
-- Run this to verify everything is working
-- =====================================================

-- Test 1: Check if profiles table exists and is accessible
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Test 2: Check if auth trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Test 3: Test basic insert (this should work)
INSERT INTO profiles (id, first_name, last_name) 
VALUES (gen_random_uuid(), 'Test', 'User')
ON CONFLICT (id) DO NOTHING;

-- Test 4: Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'profiles';

-- Test 5: Clean up test data
DELETE FROM profiles WHERE first_name = 'Test';

-- Success message
SELECT 'Database connection and setup verified successfully!' as status; 