-- =====================================================
-- SUBSCRIPTIONS TABLE
-- Available subscription plans
-- =====================================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  coin_price INTEGER NOT NULL,
  duration_days INTEGER NOT NULL,
  features JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- No RLS needed for subscriptions (public catalog)

-- Indexes for performance
CREATE INDEX idx_subscriptions_is_active ON subscriptions(is_active);
CREATE INDEX idx_subscriptions_price ON subscriptions(price);
CREATE INDEX idx_subscriptions_coin_price ON subscriptions(coin_price);

-- Comments for documentation
COMMENT ON TABLE subscriptions IS 'Available subscription plans for users';
COMMENT ON COLUMN subscriptions.price IS 'Price in USD for this subscription';
COMMENT ON COLUMN subscriptions.coin_price IS 'Price in coins for this subscription';
COMMENT ON COLUMN subscriptions.duration_days IS 'Duration of subscription in days';
COMMENT ON COLUMN subscriptions.features IS 'JSON array of features included in this subscription'; 