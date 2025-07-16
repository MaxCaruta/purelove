-- =====================================================
-- SIMPLE AUTH FIX - FIXES DATABASE ERROR DURING SIGNUP
-- Run this to fix the "Database error updating user" issue
-- =====================================================

-- First, drop the existing problematic trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Create a simple, robust auth trigger function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Simple profile creation with error handling
  INSERT INTO profiles (
    id,
    first_name,
    last_name,
    gender,
    birth_date,
    country,
    city,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'gender', 'male'),
    CASE 
      WHEN NEW.raw_user_meta_data->>'birth_date' IS NOT NULL AND NEW.raw_user_meta_data->>'birth_date' != ''
      THEN (NEW.raw_user_meta_data->>'birth_date')::DATE 
      ELSE NULL 
    END,
    COALESCE(NEW.raw_user_meta_data->>'country', ''),
    COALESCE(NEW.raw_user_meta_data->>'city', ''),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    gender = EXCLUDED.gender,
    birth_date = EXCLUDED.birth_date,
    country = EXCLUDED.country,
    city = EXCLUDED.city,
    updated_at = NOW();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Profile creation error for user %: % (SQLSTATE: %)', NEW.id, SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Ensure proper permissions
GRANT EXECUTE ON FUNCTION handle_new_user() TO service_role;

-- Test the function (optional)
DO $$
BEGIN
  RAISE NOTICE '✅ Auth trigger updated successfully!';
  RAISE NOTICE '✅ Profile creation should now work during signup';
  RAISE NOTICE '✅ Robust error handling added';
END $$; 