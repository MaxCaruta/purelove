-- =====================================================
-- GIFTS TABLE
-- Available gifts catalog
-- =====================================================

CREATE TABLE IF NOT EXISTS gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- in coins
  image_url TEXT,
  category TEXT, -- 'flowers', 'jewelry', 'chocolates', 'toys', etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- No RLS needed for gifts (public catalog)

-- Indexes for performance
CREATE INDEX idx_gifts_category ON gifts(category);
CREATE INDEX idx_gifts_price ON gifts(price);
CREATE INDEX idx_gifts_is_active ON gifts(is_active);

-- Comments for documentation
COMMENT ON TABLE gifts IS 'Available gifts catalog for users to send';
COMMENT ON COLUMN gifts.price IS 'Price in coins for this gift';
COMMENT ON COLUMN gifts.category IS 'Category of gift: flowers, jewelry, chocolates, toys, etc.';
COMMENT ON COLUMN gifts.is_active IS 'Whether this gift is available for purchase'; 