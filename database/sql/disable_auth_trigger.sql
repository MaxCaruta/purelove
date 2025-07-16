-- =====================================================
-- DISABLE AUTH TRIGGER - EMERGENCY FIX
-- Run this if signup is still failing with database errors
-- =====================================================

-- Disable the problematic auth trigger temporarily
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Auth trigger disabled successfully!';
  RAISE NOTICE '✅ Signup should now work without database errors';
  RAISE NOTICE '⚠️  Profiles will need to be created manually or on first login';
  RAISE NOTICE '';
  RAISE NOTICE '💡 To re-enable profile creation, run simple_auth_fix.sql';
END $$; 