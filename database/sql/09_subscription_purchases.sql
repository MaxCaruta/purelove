-- =====================================================
-- SUBSCRIPTION_PURCHASES TABLE
-- Subscription purchase history
-- =====================================================

CREATE TABLE IF NOT EXISTS subscription_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  payment_method TEXT, -- 'coins' or 'usd'
  amount_paid DECIMAL(10, 2),
  coins_spent INTEGER,
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE subscription_purchases ENABLE ROW LEVEL SECURITY;

-- Security Policies
CREATE POLICY "Users can read their own subscription purchases"
  ON subscription_purchases FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription purchases"
  ON subscription_purchases FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_subscription_purchases_user_id ON subscription_purchases(user_id);
CREATE INDEX idx_subscription_purchases_expires_at ON subscription_purchases(expires_at);
CREATE INDEX idx_subscription_purchases_is_active ON subscription_purchases(is_active);
CREATE INDEX idx_subscription_purchases_subscription_id ON subscription_purchases(subscription_id);

-- Comments for documentation
COMMENT ON TABLE subscription_purchases IS 'History of subscription purchases by users';
COMMENT ON COLUMN subscription_purchases.payment_method IS 'Payment method used: coins or usd';
COMMENT ON COLUMN subscription_purchases.amount_paid IS 'Amount paid in USD (if paid with USD)';
COMMENT ON COLUMN subscription_purchases.coins_spent IS 'Number of coins spent (if paid with coins)';
COMMENT ON COLUMN subscription_purchases.expires_at IS 'When the subscription expires';
COMMENT ON COLUMN subscription_purchases.is_active IS 'Whether this subscription is currently active'; 