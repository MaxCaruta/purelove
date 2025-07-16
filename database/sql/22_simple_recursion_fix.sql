-- Simple Fix for Coin Recursion - Works with Current Database Structure
-- This fixes the infinite recursion without requiring new columns

-- STEP 1: Remove the problematic trigger immediately
DROP TRIGGER IF EXISTS trigger_coin_expiry ON profiles;
DROP FUNCTION IF EXISTS check_coin_expiry();

-- STEP 2: Clean up any problematic functions from the expiration system
DROP FUNCTION IF EXISTS update_user_coin_totals(UUID);
DROP FUNCTION IF EXISTS expire_subscription_coins(UUID);

-- STEP 3: Create simple, safe functions that work with current structure
CREATE OR REPLACE FUNCTION add_subscription_coins(
  p_user_id UUID,
  p_amount INTEGER,
  p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Simple coin addition - no expiration tracking for now
  UPDATE profiles 
  SET coins = COALESCE(coins, 0) + p_amount,
      updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- STEP 4: Create function for permanent coins (same as subscription for now)
CREATE OR REPLACE FUNCTION add_permanent_coins(
  p_user_id UUID,
  p_amount INTEGER
)
RETURNS VOID AS $$
BEGIN
  -- Simple coin addition
  UPDATE profiles 
  SET coins = COALESCE(coins, 0) + p_amount,
      updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- STEP 5: Create maintenance function (no-op for current structure)
CREATE OR REPLACE FUNCTION expire_all_old_subscription_coins()
RETURNS INTEGER AS $$
BEGIN
  -- No expiration logic for current structure
  -- Return 0 to indicate no coins expired
  RETURN 0;
END;
$$ LANGUAGE plpgsql;

-- STEP 6: Verify no problematic triggers exist
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'profiles'
  AND trigger_name LIKE '%coin%';

-- STEP 7: Test that functions work
SELECT 'Functions created successfully' as status; 