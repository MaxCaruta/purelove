-- =====================================================
-- GIFT_TRANSACTIONS TABLE
-- Gift sending history
-- =====================================================

CREATE TABLE IF NOT EXISTS gift_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  gift_id UUID REFERENCES gifts(id) ON DELETE CASCADE,
  coins_spent INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE gift_transactions ENABLE ROW LEVEL SECURITY;

-- Security Policies
CREATE POLICY "Users can read their own gift transactions"
  ON gift_transactions FOR SELECT TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can insert their own gift transactions"
  ON gift_transactions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- Indexes for performance
CREATE INDEX idx_gift_transactions_sender_id ON gift_transactions(sender_id);
CREATE INDEX idx_gift_transactions_receiver_id ON gift_transactions(receiver_id);
CREATE INDEX idx_gift_transactions_gift_id ON gift_transactions(gift_id);
CREATE INDEX idx_gift_transactions_created_at ON gift_transactions(created_at);

-- Comments for documentation
COMMENT ON TABLE gift_transactions IS 'History of gifts sent between users';
COMMENT ON COLUMN gift_transactions.sender_id IS 'User who sent the gift';
COMMENT ON COLUMN gift_transactions.receiver_id IS 'User who received the gift';
COMMENT ON COLUMN gift_transactions.coins_spent IS 'Number of coins spent on this gift'; 