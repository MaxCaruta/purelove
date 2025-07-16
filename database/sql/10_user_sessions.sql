-- =====================================================
-- USER_SESSIONS TABLE
-- Online status tracking
-- =====================================================

CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL,
  last_activity TIMESTAMPTZ DEFAULT now(),
  is_online BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Security Policies
CREATE POLICY "Users can manage their own sessions"
  ON user_sessions FOR ALL TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_last_activity ON user_sessions(last_activity);
CREATE INDEX idx_user_sessions_is_online ON user_sessions(is_online);
CREATE INDEX idx_user_sessions_session_token ON user_sessions(session_token);

-- Comments for documentation
COMMENT ON TABLE user_sessions IS 'User session tracking for online status';
COMMENT ON COLUMN user_sessions.session_token IS 'Unique session token for this user session';
COMMENT ON COLUMN user_sessions.last_activity IS 'Last activity timestamp for this session';
COMMENT ON COLUMN user_sessions.is_online IS 'Whether this session is currently active'; 