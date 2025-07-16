-- =====================================================
-- URGENT FIX FOR SUBSCRIPTION SYSTEM
-- Run this in Supabase SQL Editor to fix all issues
-- =====================================================

-- 1. Fix transactions table - add missing columns
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS order_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_plan TEXT,
ADD COLUMN IF NOT EXISTS coins_added INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS crypto_asset TEXT,
ADD COLUMN IF NOT EXISTS crypto_amount TEXT,
ADD COLUMN IF NOT EXISTS crypto_address TEXT,
ADD COLUMN IF NOT EXISTS transaction_hash TEXT,
ADD COLUMN IF NOT EXISTS subscription_duration INTEGER,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Make sure type column has proper default
ALTER TABLE transactions ALTER COLUMN type SET DEFAULT 'subscription';

-- Make coins column nullable and set default
ALTER TABLE transactions ALTER COLUMN coins SET DEFAULT 0;
ALTER TABLE transactions ALTER COLUMN coins DROP NOT NULL;

-- 2. Fix profiles table - add chat_subscription column if missing
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS chat_subscription JSONB DEFAULT NULL;

-- 3. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_order_id ON transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_transactions_subscription_plan ON transactions(subscription_plan);
CREATE INDEX IF NOT EXISTS idx_profiles_chat_subscription ON profiles USING GIN (chat_subscription);

-- 4. Create function to check if subscription is active (if not exists)
CREATE OR REPLACE FUNCTION is_chat_subscription_active(subscription_data JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  IF subscription_data IS NULL THEN
    RETURN FALSE;
  END IF;
  
  RETURN (subscription_data->>'expiresAt')::timestamp > NOW();
END;
$$ LANGUAGE plpgsql;

-- 5. Update RLS policies to ensure they work properly
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 6. Ensure transactions can be inserted by authenticated users
DROP POLICY IF EXISTS "Users can insert their own transactions" ON transactions;
CREATE POLICY "Users can insert their own transactions"
  ON transactions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 7. Add comments for documentation
COMMENT ON COLUMN profiles.chat_subscription IS 'JSON object containing subscription details: {type, expiresAt, purchasedAt, paymentMethod, transactionId}';
COMMENT ON COLUMN transactions.coins_added IS 'Number of coins added to user account from this transaction';
COMMENT ON COLUMN transactions.subscription_plan IS 'ID of subscription plan purchased';
COMMENT ON COLUMN transactions.crypto_asset IS 'Cryptocurrency used for payment';

-- 8. Test the fix by checking table structures
SELECT 
    'transactions' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'transactions' 
    AND column_name IN ('type', 'coins', 'order_id', 'subscription_plan', 'coins_added', 'crypto_asset')
ORDER BY column_name;

SELECT 
    'profiles' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
    AND column_name IN ('coins', 'chat_subscription')
ORDER BY column_name; 