-- =====================================================
-- TRANSACTIONS TABLE
-- Payment transactions and coin purchases
-- =====================================================

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Order and subscription info
  order_id TEXT,
  subscription_plan TEXT,
  
  -- Payment amounts
  amount DECIMAL(10, 2) NOT NULL,
  coins INTEGER DEFAULT 0,
  coins_added INTEGER DEFAULT 0,
  
  -- Crypto payment fields
  crypto_asset TEXT,
  crypto_amount TEXT,
  crypto_address TEXT,
  transaction_hash TEXT,
  
  -- Transaction details
  type TEXT NOT NULL DEFAULT 'subscription', -- 'coin_purchase', 'subscription', 'gift', 'message'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
  
  -- Subscription details
  subscription_duration INTEGER, -- days
  expires_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Legacy fields for compatibility
  payment_method TEXT,
  payment_provider TEXT,
  transaction_id TEXT, -- External payment provider ID
  description TEXT
);

-- Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON transactions;

-- Security Policies
CREATE POLICY "Users can read their own transactions"
  ON transactions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
  ON transactions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
DROP INDEX IF EXISTS idx_transactions_user_id;
DROP INDEX IF EXISTS idx_transactions_type;
DROP INDEX IF EXISTS idx_transactions_status;
DROP INDEX IF EXISTS idx_transactions_created_at;

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transactions_order_id ON transactions(order_id);
CREATE INDEX idx_transactions_subscription_plan ON transactions(subscription_plan);

-- Comments for documentation
COMMENT ON TABLE transactions IS 'Payment transactions and coin purchases';
COMMENT ON COLUMN transactions.type IS 'Type of transaction: coin_purchase, subscription, gift, message';
COMMENT ON COLUMN transactions.status IS 'Status of transaction: pending, completed, failed, refunded';
COMMENT ON COLUMN transactions.payment_method IS 'Payment method used: credit_card, paypal, crypto, etc.';
COMMENT ON COLUMN transactions.payment_provider IS 'Payment provider: stripe, paypal, nowpayments, etc.';
COMMENT ON COLUMN transactions.transaction_id IS 'External payment provider transaction ID';
COMMENT ON COLUMN transactions.order_id IS 'Internal order ID for tracking';
COMMENT ON COLUMN transactions.subscription_plan IS 'Subscription plan ID purchased';
COMMENT ON COLUMN transactions.crypto_asset IS 'Cryptocurrency used for payment';
COMMENT ON COLUMN transactions.crypto_amount IS 'Amount paid in cryptocurrency';
COMMENT ON COLUMN transactions.crypto_address IS 'Crypto wallet address used';
COMMENT ON COLUMN transactions.transaction_hash IS 'Blockchain transaction hash';
COMMENT ON COLUMN transactions.coins_added IS 'Number of coins added to user account';
COMMENT ON COLUMN transactions.subscription_duration IS 'Duration of subscription in days'; 