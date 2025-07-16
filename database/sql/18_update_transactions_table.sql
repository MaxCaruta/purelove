-- =====================================================
-- UPDATE TRANSACTIONS TABLE
-- Add missing fields for subscription payments
-- =====================================================

-- Add new columns to transactions table
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

-- Update existing columns to have proper defaults
ALTER TABLE transactions ALTER COLUMN coins SET DEFAULT 0;
ALTER TABLE transactions ALTER COLUMN type SET DEFAULT 'subscription';
ALTER TABLE transactions ALTER COLUMN status SET DEFAULT 'pending';

-- Make coins column nullable for subscription purchases
ALTER TABLE transactions ALTER COLUMN coins DROP NOT NULL;

-- Add new indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_order_id ON transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_transactions_subscription_plan ON transactions(subscription_plan);

-- Update comments
COMMENT ON COLUMN transactions.order_id IS 'Internal order ID for tracking';
COMMENT ON COLUMN transactions.subscription_plan IS 'Subscription plan ID purchased';
COMMENT ON COLUMN transactions.crypto_asset IS 'Cryptocurrency used for payment';
COMMENT ON COLUMN transactions.crypto_amount IS 'Amount paid in cryptocurrency';
COMMENT ON COLUMN transactions.crypto_address IS 'Crypto wallet address used';
COMMENT ON COLUMN transactions.transaction_hash IS 'Blockchain transaction hash';
COMMENT ON COLUMN transactions.coins_added IS 'Number of coins added to user account';
COMMENT ON COLUMN transactions.subscription_duration IS 'Duration of subscription in days';

-- Log the update
INSERT INTO system_logs (message, level, created_at) 
VALUES ('Updated transactions table with subscription payment fields', 'INFO', now())
ON CONFLICT DO NOTHING; 