-- =====================================================
-- MESSAGES TABLE
-- Chat messages between users
-- =====================================================

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Message type
  type TEXT DEFAULT 'text', -- 'text', 'gift', 'image', 'voice'
  
  -- For gifts
  gift_name TEXT,
  gift_cost INTEGER
);

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read messages they sent or received" ON messages;
DROP POLICY IF EXISTS "Users can insert messages they send" ON messages;
DROP POLICY IF EXISTS "Users can update messages they received" ON messages;

-- Security Policies
CREATE POLICY "Users can read messages they sent or received"
  ON messages FOR SELECT TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can insert messages they send"
  ON messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update messages they received"
  ON messages FOR UPDATE TO authenticated
  USING (auth.uid() = receiver_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(sender_id, receiver_id, created_at);

-- Comments for documentation
COMMENT ON TABLE messages IS 'Chat messages between users';
COMMENT ON COLUMN messages.type IS 'Type of message: text, gift, image, voice';
COMMENT ON COLUMN messages.gift_name IS 'Name of gift if message type is gift';
COMMENT ON COLUMN messages.gift_cost IS 'Cost in coins of the gift if message type is gift'; 