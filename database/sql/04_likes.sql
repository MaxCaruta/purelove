-- =====================================================
-- LIKES TABLE
-- User likes/interests in other profiles
-- =====================================================

CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  liker_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  liked_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(liker_id, liked_id)
);

-- Enable Row Level Security
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Security Policies
CREATE POLICY "Users can read likes they sent or received"
  ON likes FOR SELECT TO authenticated
  USING (auth.uid() = liker_id OR auth.uid() = liked_id);

CREATE POLICY "Users can insert likes they send"
  ON likes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = liker_id);

CREATE POLICY "Users can delete likes they sent"
  ON likes FOR DELETE TO authenticated
  USING (auth.uid() = liker_id);

-- Indexes for performance
CREATE INDEX idx_likes_liker_id ON likes(liker_id);
CREATE INDEX idx_likes_liked_id ON likes(liked_id);
CREATE INDEX idx_likes_created_at ON likes(created_at);

-- Comments for documentation
COMMENT ON TABLE likes IS 'User likes/interests in other profiles';
COMMENT ON COLUMN likes.liker_id IS 'User who is liking another profile';
COMMENT ON COLUMN likes.liked_id IS 'User whose profile is being liked'; 