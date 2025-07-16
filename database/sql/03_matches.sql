-- =====================================================
-- MATCHES TABLE
-- User matches when both users like each other
-- =====================================================

CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user1_id, user2_id)
);

-- Enable Row Level Security
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Security Policies
CREATE POLICY "Users can read their own matches"
  ON matches FOR SELECT TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can insert their own matches"
  ON matches FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user1_id);

-- Indexes for performance
CREATE INDEX idx_matches_user1_id ON matches(user1_id);
CREATE INDEX idx_matches_user2_id ON matches(user2_id);
CREATE INDEX idx_matches_created_at ON matches(created_at);

-- Comments for documentation
COMMENT ON TABLE matches IS 'User matches when both users like each other';
COMMENT ON COLUMN matches.user1_id IS 'First user in the match (usually the one who initiated)';
COMMENT ON COLUMN matches.user2_id IS 'Second user in the match'; 