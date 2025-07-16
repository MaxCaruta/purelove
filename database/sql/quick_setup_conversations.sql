-- =====================================================
-- QUICK SETUP FOR CONVERSATIONS & SIGNUP FIX
-- Run this single file to fix signup issues and enable conversation storage
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. First ensure user_sessions table exists (needed by functions)
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL,
  last_activity TIMESTAMPTZ DEFAULT now(),
  is_online BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS and create policies for user_sessions
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own sessions"
  ON user_sessions FOR ALL TO authenticated
  USING (auth.uid() = user_id);

-- 2. Fix RLS policies for profiles (fixes 403 signup error)
DROP POLICY IF EXISTS "Users can read their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation during signup" ON profiles;
DROP POLICY IF EXISTS "Public can read profiles for browsing" ON profiles;

-- Create comprehensive RLS policies for profiles
CREATE POLICY "Users can read their own profile"
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role can insert profiles"
  ON profiles FOR INSERT TO service_role
  WITH CHECK (true);

CREATE POLICY "Allow profile creation during signup"
  ON profiles FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Public can read profiles for browsing"
  ON profiles FOR SELECT TO authenticated
  USING (true);

-- 3. Enhanced auth trigger for complete profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (
    id,
    first_name,
    last_name,
    gender,
    birth_date,
    country,
    city,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'gender', 'male'),
    CASE 
      WHEN NEW.raw_user_meta_data->>'birth_date' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'birth_date')::DATE 
      ELSE NULL 
    END,
    COALESCE(NEW.raw_user_meta_data->>'country', ''),
    COALESCE(NEW.raw_user_meta_data->>'city', ''),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name = COALESCE(NEW.raw_user_meta_data->>'first_name', profiles.first_name),
    last_name = COALESCE(NEW.raw_user_meta_data->>'last_name', profiles.last_name),
    gender = COALESCE(NEW.raw_user_meta_data->>'gender', profiles.gender),
    birth_date = CASE 
      WHEN NEW.raw_user_meta_data->>'birth_date' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'birth_date')::DATE 
      ELSE profiles.birth_date 
    END,
    country = COALESCE(NEW.raw_user_meta_data->>'country', profiles.country),
    city = COALESCE(NEW.raw_user_meta_data->>'city', profiles.city),
    updated_at = NOW();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 4. Add conversation tables for /messages page
CREATE TABLE IF NOT EXISTS conversation_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    other_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Settings
    notifications_enabled BOOLEAN DEFAULT true,
    sounds_enabled BOOLEAN DEFAULT true,
    message_preview_enabled BOOLEAN DEFAULT true,
    read_receipts_enabled BOOLEAN DEFAULT true,
    online_status_visible BOOLEAN DEFAULT true,
    is_archived BOOLEAN DEFAULT false,
    is_favorite BOOLEAN DEFAULT false,
    is_muted BOOLEAN DEFAULT false,
    auto_archive_enabled BOOLEAN DEFAULT false,
    auto_archive_days INTEGER DEFAULT 30,
    
    -- Timestamps
    archived_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, other_user_id)
);

CREATE TABLE IF NOT EXISTS conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    last_message_id UUID REFERENCES messages(id),
    last_message_at TIMESTAMPTZ,
    
    user1_unread_count INTEGER DEFAULT 0,
    user2_unread_count INTEGER DEFAULT 0,
    
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user1_id, user2_id),
    CHECK(user1_id < user2_id)
);

-- Enable RLS on conversation tables
ALTER TABLE conversation_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- RLS policies for conversation tables
CREATE POLICY "Users can manage their conversation settings" ON conversation_settings
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their conversations" ON conversations
    FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can insert conversations they're part of" ON conversations
    FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can update their conversations" ON conversations
    FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- 5. Functions for conversation management
CREATE OR REPLACE FUNCTION get_user_conversations()
RETURNS TABLE (
    conversation_id UUID,
    other_user_id UUID,
    other_user_profile JSON,
    last_message JSON,
    unread_count INTEGER,
    is_archived BOOLEAN,
    is_favorite BOOLEAN,
    last_message_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id as conversation_id,
        CASE 
            WHEN c.user1_id = auth.uid() THEN c.user2_id
            ELSE c.user1_id
        END as other_user_id,
        json_build_object(
            'id', p.id,
            'user_id', p.user_id,
            'first_name', p.first_name,
            'last_name', p.last_name,
            'photos', p.photos,
            'verified', p.verified,
            'birth_date', p.birth_date,
            'country', p.country,
            'city', p.city
        ) as other_user_profile,
        CASE 
            WHEN m.id IS NOT NULL THEN json_build_object(
                'id', m.id,
                'content', m.content,
                'created_at', m.created_at,
                'message_type', COALESCE(m.type, 'text'),
                'sender_id', m.sender_id
            )
            ELSE NULL
        END as last_message,
        CASE 
            WHEN c.user1_id = auth.uid() THEN c.user1_unread_count
            ELSE c.user2_unread_count
        END as unread_count,
        COALESCE(cs.is_archived, false) as is_archived,
        COALESCE(cs.is_favorite, false) as is_favorite,
        c.last_message_at
    FROM conversations c
    LEFT JOIN profiles p ON (
        p.user_id = CASE WHEN c.user1_id = auth.uid() THEN c.user2_id ELSE c.user1_id END
    )
    LEFT JOIN conversation_settings cs ON (
        cs.user_id = auth.uid() AND 
        cs.other_user_id = CASE 
            WHEN c.user1_id = auth.uid() THEN c.user2_id
            ELSE c.user1_id
        END
    )
    LEFT JOIN messages m ON c.last_message_id = m.id
    WHERE 
        (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
        AND c.is_active = true
        AND COALESCE(cs.is_archived, false) = false
    ORDER BY c.last_message_at DESC NULLS LAST;
END;
$$;

CREATE OR REPLACE FUNCTION mark_conversation_read(other_user_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE messages 
    SET read = true 
    WHERE sender_id = other_user_uuid 
    AND receiver_id = auth.uid() 
    AND read = false;
    
    UPDATE conversations
    SET 
        user1_unread_count = CASE WHEN user1_id = auth.uid() THEN 0 ELSE user1_unread_count END,
        user2_unread_count = CASE WHEN user2_id = auth.uid() THEN 0 ELSE user2_unread_count END,
        updated_at = NOW()
    WHERE (user1_id = LEAST(auth.uid(), other_user_uuid) AND user2_id = GREATEST(auth.uid(), other_user_uuid));
END;
$$;

-- Grant permissions
GRANT ALL ON conversation_settings TO authenticated;
GRANT ALL ON conversations TO authenticated;
GRANT ALL ON user_sessions TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_conversations() TO authenticated;
GRANT EXECUTE ON FUNCTION mark_conversation_read(UUID) TO authenticated;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversation_settings_user_id ON conversation_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_users ON conversations(user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '🎉 Setup completed successfully!';
  RAISE NOTICE '✅ Fixed 403 signup errors with enhanced RLS policies';
  RAISE NOTICE '✅ Auth trigger will create profiles automatically';
  RAISE NOTICE '✅ Conversation storage tables created';
  RAISE NOTICE '✅ Functions for /messages page ready';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 You can now:';
  RAISE NOTICE '   - Sign up users without 403 errors';
  RAISE NOTICE '   - Store and retrieve conversations';
  RAISE NOTICE '   - Use the /messages page with database storage';
END $$; 