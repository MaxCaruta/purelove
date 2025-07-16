-- Simple Coin Expiration System
-- Add coin expiration tracking to existing structure

-- Add coin expiration fields to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_coins INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS subscription_coins_expire_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS permanent_coins INTEGER DEFAULT 0;

-- Function to update coin totals
CREATE OR REPLACE FUNCTION update_user_coin_totals(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Calculate total available coins
  UPDATE profiles 
  SET coins = COALESCE(permanent_coins, 0) + 
              CASE 
                WHEN subscription_coins_expire_at IS NULL OR subscription_coins_expire_at > NOW() 
                THEN COALESCE(subscription_coins, 0)
                ELSE 0 
              END,
      updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to add subscription coins (with expiration)
CREATE OR REPLACE FUNCTION add_subscription_coins(
  p_user_id UUID,
  p_amount INTEGER,
  p_expires_at TIMESTAMPTZ
)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles 
  SET subscription_coins = COALESCE(subscription_coins, 0) + p_amount,
      subscription_coins_expire_at = p_expires_at,
      updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Update total coins
  PERFORM update_user_coin_totals(p_user_id);
END;
$$ LANGUAGE plpgsql;

-- Function to add permanent coins (pay-per-use)
CREATE OR REPLACE FUNCTION add_permanent_coins(
  p_user_id UUID,
  p_amount INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles 
  SET permanent_coins = COALESCE(permanent_coins, 0) + p_amount,
      updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Update total coins
  PERFORM update_user_coin_totals(p_user_id);
END;
$$ LANGUAGE plpgsql;

-- Function to expire subscription coins
CREATE OR REPLACE FUNCTION expire_subscription_coins(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  expired_amount INTEGER;
BEGIN
  SELECT COALESCE(subscription_coins, 0) INTO expired_amount
  FROM profiles 
  WHERE id = p_user_id;
  
  UPDATE profiles 
  SET subscription_coins = 0,
      subscription_coins_expire_at = NULL,
      updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Update total coins
  PERFORM update_user_coin_totals(p_user_id);
  
  RETURN expired_amount;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically expire coins when subscription expires
CREATE OR REPLACE FUNCTION check_coin_expiry()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if subscription expired
  IF NEW.chat_subscription IS NULL OR 
     (NEW.chat_subscription->>'expiresAt')::timestamp <= NOW() THEN
    
    -- Expire subscription coins
    PERFORM expire_subscription_coins(NEW.id);
    
    -- Recalculate total coins
    PERFORM update_user_coin_totals(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_coin_expiry ON profiles;
CREATE TRIGGER trigger_coin_expiry
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION check_coin_expiry();

-- Migrate existing coins to permanent coins
UPDATE profiles 
SET permanent_coins = COALESCE(coins, 0),
    subscription_coins = 0
WHERE coins > 0;

-- Update totals for all users
SELECT update_user_coin_totals(id) FROM profiles;
