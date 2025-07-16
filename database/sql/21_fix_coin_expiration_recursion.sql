-- Fix Coin Expiration Infinite Recursion
-- This fixes the stack overflow error caused by recursive trigger calls

-- First, drop the problematic trigger
DROP TRIGGER IF EXISTS trigger_coin_expiry ON profiles;

-- Drop the problematic function
DROP FUNCTION IF EXISTS check_coin_expiry();

-- Create a safer function that doesn't cause recursion
CREATE OR REPLACE FUNCTION update_user_coin_totals(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Calculate total available coins WITHOUT triggering updates
  UPDATE profiles 
  SET coins = COALESCE(permanent_coins, 0) + 
              CASE 
                WHEN subscription_coins_expire_at IS NULL OR subscription_coins_expire_at > NOW() 
                THEN COALESCE(subscription_coins, 0)
                ELSE 0 
              END
  WHERE id = p_user_id;
  
  -- Note: Removed updated_at update to prevent trigger recursion
END;
$$ LANGUAGE plpgsql;

-- Safer function to add subscription coins
CREATE OR REPLACE FUNCTION add_subscription_coins(
  p_user_id UUID,
  p_amount INTEGER,
  p_expires_at TIMESTAMPTZ
)
RETURNS VOID AS $$
BEGIN
  -- Update subscription coins and total coins in single operation
  UPDATE profiles 
  SET subscription_coins = COALESCE(subscription_coins, 0) + p_amount,
      subscription_coins_expire_at = p_expires_at,
      coins = COALESCE(permanent_coins, 0) + COALESCE(subscription_coins, 0) + p_amount,
      updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Safer function to add permanent coins
CREATE OR REPLACE FUNCTION add_permanent_coins(
  p_user_id UUID,
  p_amount INTEGER
)
RETURNS VOID AS $$
BEGIN
  -- Update permanent coins and total coins in single operation
  UPDATE profiles 
  SET permanent_coins = COALESCE(permanent_coins, 0) + p_amount,
      coins = COALESCE(permanent_coins, 0) + p_amount + 
              CASE 
                WHEN subscription_coins_expire_at IS NULL OR subscription_coins_expire_at > NOW() 
                THEN COALESCE(subscription_coins, 0)
                ELSE 0 
              END,
      updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Safer function to expire subscription coins
CREATE OR REPLACE FUNCTION expire_subscription_coins(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  expired_amount INTEGER;
BEGIN
  SELECT COALESCE(subscription_coins, 0) INTO expired_amount
  FROM profiles 
  WHERE id = p_user_id;
  
  -- Update subscription coins and recalculate total in single operation
  UPDATE profiles 
  SET subscription_coins = 0,
      subscription_coins_expire_at = NULL,
      coins = COALESCE(permanent_coins, 0), -- Only permanent coins remain
      updated_at = NOW()
  WHERE id = p_user_id;
  
  RETURN expired_amount;
END;
$$ LANGUAGE plpgsql;

-- Manual cleanup: expire any currently expired subscription coins
UPDATE profiles 
SET subscription_coins = 0,
    subscription_coins_expire_at = NULL,
    coins = COALESCE(permanent_coins, 0)
WHERE subscription_coins_expire_at IS NOT NULL 
  AND subscription_coins_expire_at <= NOW();

-- Recalculate all coin totals safely (one-time operation)
UPDATE profiles 
SET coins = COALESCE(permanent_coins, 0) + 
            CASE 
              WHEN subscription_coins_expire_at IS NULL OR subscription_coins_expire_at > NOW() 
              THEN COALESCE(subscription_coins, 0)
              ELSE 0 
            END;

-- Create a helper function to manually check and expire coins (for maintenance)
CREATE OR REPLACE FUNCTION expire_all_old_subscription_coins()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE profiles 
  SET subscription_coins = 0,
      subscription_coins_expire_at = NULL,
      coins = COALESCE(permanent_coins, 0)
  WHERE subscription_coins_expire_at IS NOT NULL 
    AND subscription_coins_expire_at <= NOW()
    AND subscription_coins > 0;
    
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql;
