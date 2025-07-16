-- =====================================================
-- COIN EXPIRATION SYSTEM
-- Track different types of coins and their expiration
-- =====================================================

-- 1. Create coin_balances table to track different types of coins
CREATE TABLE IF NOT EXISTS coin_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  coin_type TEXT NOT NULL, -- 'subscription', 'pay_per_use', 'bonus', 'gift'
  amount INTEGER NOT NULL,
  source_transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  source_subscription_plan TEXT,
  expires_at TIMESTAMPTZ, -- NULL for permanent coins (pay_per_use)
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  is_expired BOOLEAN DEFAULT false
);

-- 2. Enable Row Level Security
ALTER TABLE coin_balances ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies
CREATE POLICY "Users can read their own coin balances"
  ON coin_balances FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own coin balances"
  ON coin_balances FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own coin balances"
  ON coin_balances FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- 4. Create indexes for performance
CREATE INDEX idx_coin_balances_user_id ON coin_balances(user_id);
CREATE INDEX idx_coin_balances_coin_type ON coin_balances(coin_type);
CREATE INDEX idx_coin_balances_expires_at ON coin_balances(expires_at);
CREATE INDEX idx_coin_balances_is_expired ON coin_balances(is_expired);

-- 5. Create function to calculate user's total available coins
CREATE OR REPLACE FUNCTION get_user_available_coins(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total_coins INTEGER := 0;
BEGIN
  -- Get sum of all non-expired coins
  SELECT COALESCE(SUM(amount), 0) INTO total_coins
  FROM coin_balances 
  WHERE user_id = p_user_id 
    AND is_expired = false
    AND (expires_at IS NULL OR expires_at > NOW());
  
  RETURN total_coins;
END;
$$ LANGUAGE plpgsql;

-- 6. Create function to expire subscription coins when subscription ends
CREATE OR REPLACE FUNCTION expire_subscription_coins(p_user_id UUID, p_subscription_plan TEXT)
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER := 0;
BEGIN
  -- Mark subscription coins as expired for this specific subscription plan
  UPDATE coin_balances 
  SET is_expired = true, updated_at = NOW()
  WHERE user_id = p_user_id 
    AND coin_type = 'subscription'
    AND source_subscription_plan = p_subscription_plan
    AND is_expired = false;
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  
  -- Update the user's total coins in profiles table
  UPDATE profiles 
  SET coins = get_user_available_coins(p_user_id),
      updated_at = NOW()
  WHERE id = p_user_id;
  
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- 7. Create function to add coins with proper tracking
CREATE OR REPLACE FUNCTION add_user_coins(
  p_user_id UUID,
  p_amount INTEGER,
  p_coin_type TEXT,
  p_source_transaction_id UUID DEFAULT NULL,
  p_source_subscription_plan TEXT DEFAULT NULL,
  p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_balance_id UUID;
BEGIN
  -- Insert new coin balance record
  INSERT INTO coin_balances (
    user_id,
    coin_type,
    amount,
    source_transaction_id,
    source_subscription_plan,
    expires_at
  ) VALUES (
    p_user_id,
    p_coin_type,
    p_amount,
    p_source_transaction_id,
    p_source_subscription_plan,
    p_expires_at
  ) RETURNING id INTO new_balance_id;
  
  -- Update the user's total coins in profiles table
  UPDATE profiles 
  SET coins = get_user_available_coins(p_user_id),
      updated_at = NOW()
  WHERE id = p_user_id;
  
  RETURN new_balance_id;
END;
$$ LANGUAGE plpgsql;

-- 8. Create function to spend coins (FIFO - expire soonest first)
CREATE OR REPLACE FUNCTION spend_user_coins(p_user_id UUID, p_amount INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  available_coins INTEGER;
  remaining_to_spend INTEGER := p_amount;
  coin_record RECORD;
BEGIN
  -- Check if user has enough coins
  available_coins := get_user_available_coins(p_user_id);
  
  IF available_coins < p_amount THEN
    RETURN false;
  END IF;
  
  -- Spend coins in FIFO order (expiring soonest first)
  FOR coin_record IN 
    SELECT id, amount 
    FROM coin_balances 
    WHERE user_id = p_user_id 
      AND is_expired = false
      AND amount > 0
      AND (expires_at IS NULL OR expires_at > NOW())
    ORDER BY 
      CASE WHEN expires_at IS NULL THEN 1 ELSE 0 END, -- Permanent coins last
      expires_at ASC, -- Expiring soonest first
      created_at ASC -- Oldest first for same expiry
  LOOP
    IF remaining_to_spend <= 0 THEN
      EXIT;
    END IF;
    
    IF coin_record.amount <= remaining_to_spend THEN
      -- Use all coins from this balance
      UPDATE coin_balances 
      SET amount = 0, updated_at = NOW()
      WHERE id = coin_record.id;
      
      remaining_to_spend := remaining_to_spend - coin_record.amount;
    ELSE
      -- Use partial coins from this balance
      UPDATE coin_balances 
      SET amount = amount - remaining_to_spend, updated_at = NOW()
      WHERE id = coin_record.id;
      
      remaining_to_spend := 0;
    END IF;
  END LOOP;
  
  -- Update the user's total coins in profiles table
  UPDATE profiles 
  SET coins = get_user_available_coins(p_user_id),
      updated_at = NOW()
  WHERE id = p_user_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- 9. Create function to clean up expired coins (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_coins()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER := 0;
BEGIN
  -- Mark expired coins
  UPDATE coin_balances 
  SET is_expired = true, updated_at = NOW()
  WHERE is_expired = false 
    AND expires_at IS NOT NULL 
    AND expires_at <= NOW();
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  
  -- Update all affected users' coin totals
  UPDATE profiles 
  SET coins = get_user_available_coins(id),
      updated_at = NOW()
  WHERE id IN (
    SELECT DISTINCT user_id 
    FROM coin_balances 
    WHERE is_expired = true 
      AND updated_at >= NOW() - INTERVAL '1 hour'
  );
  
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- 10. Create trigger to automatically expire subscription coins when subscription expires
CREATE OR REPLACE FUNCTION check_subscription_expiry()
RETURNS TRIGGER AS $$
DECLARE
  old_subscription JSONB;
  new_subscription JSONB;
  subscription_expired BOOLEAN := false;
BEGIN
  -- Only process updates to chat_subscription
  IF TG_OP = 'UPDATE' THEN
    old_subscription := OLD.chat_subscription;
    new_subscription := NEW.chat_subscription;
    
    -- Check if subscription has expired
    IF old_subscription IS NOT NULL AND 
       (new_subscription IS NULL OR 
        (new_subscription->>'expiresAt')::timestamp <= NOW()) AND
       (old_subscription->>'expiresAt')::timestamp > NOW() THEN
      
      -- Subscription just expired, expire the coins
      PERFORM expire_subscription_coins(NEW.id, old_subscription->>'type');
      
      -- Update the coins field to reflect the change
      NEW.coins := get_user_available_coins(NEW.id);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_subscription_expiry ON profiles;
CREATE TRIGGER trigger_subscription_expiry
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION check_subscription_expiry();

-- 11. Add comments for documentation
COMMENT ON TABLE coin_balances IS 'Tracks different types of coins and their expiration dates';
COMMENT ON COLUMN coin_balances.coin_type IS 'Type of coins: subscription, pay_per_use, bonus, gift';
COMMENT ON COLUMN coin_balances.expires_at IS 'When coins expire (NULL for permanent coins)';
COMMENT ON COLUMN coin_balances.source_subscription_plan IS 'Which subscription plan these coins came from';
COMMENT ON FUNCTION get_user_available_coins(UUID) IS 'Calculate total available coins for a user';
COMMENT ON FUNCTION add_user_coins(UUID, INTEGER, TEXT, UUID, TEXT, TIMESTAMPTZ) IS 'Add coins to user with proper tracking';
COMMENT ON FUNCTION spend_user_coins(UUID, INTEGER) IS 'Spend coins using FIFO logic (expiring soonest first)';
COMMENT ON FUNCTION expire_subscription_coins(UUID, TEXT) IS 'Expire coins when subscription ends';
COMMENT ON FUNCTION cleanup_expired_coins() IS 'Clean up expired coins (run periodically)';

-- 12. Migrate existing coin data (if any)
INSERT INTO coin_balances (user_id, coin_type, amount, expires_at)
SELECT id, 'pay_per_use', coins, NULL
FROM profiles 
WHERE coins > 0
ON CONFLICT DO NOTHING; 