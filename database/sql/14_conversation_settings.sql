-- =============================================
-- Conversation Settings and User Interactions
-- Complete implementation for /messages and ChatWindow
-- =============================================

-- 1. Table for conversation-specific settings
CREATE TABLE IF NOT EXISTS conversation_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    other_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Notification settings
    notifications_enabled BOOLEAN DEFAULT true,
    sounds_enabled BOOLEAN DEFAULT true,
    message_preview_enabled BOOLEAN DEFAULT true,
    
    -- Chat preferences
    read_receipts_enabled BOOLEAN DEFAULT true,
    online_status_visible BOOLEAN DEFAULT true,
    
    -- Conversation status
    is_archived BOOLEAN DEFAULT false,
    is_favorite BOOLEAN DEFAULT false,
    is_muted BOOLEAN DEFAULT false,
    
    -- Auto-archive settings
    auto_archive_enabled BOOLEAN DEFAULT false,
    auto_archive_days INTEGER DEFAULT 30,
    
    -- Timestamps
    archived_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure unique conversation settings per user pair
    UNIQUE(user_id, other_user_id)
);

-- 2. Table for blocked users
CREATE TABLE IF NOT EXISTS blocked_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reason TEXT,
    blocked_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure unique blocks
    UNIQUE(blocker_id, blocked_id)
);

-- 3. Table for reported users
CREATE TABLE IF NOT EXISTS reported_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reported_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    admin_notes TEXT,
    reported_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES auth.users(id)
);

-- 4. Table for file attachments
CREATE TABLE IF NOT EXISTS message_attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,
    file_url TEXT NOT NULL,
    thumbnail_url TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Table for conversation metadata
CREATE TABLE IF NOT EXISTS conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Conversation info
    last_message_id UUID REFERENCES messages(id),
    last_message_at TIMESTAMPTZ,
    
    -- Unread counts for each user
    user1_unread_count INTEGER DEFAULT 0,
    user2_unread_count INTEGER DEFAULT 0,
    
    -- Status flags
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure unique conversation per user pair (ordered)
    UNIQUE(user1_id, user2_id),
    CHECK(user1_id < user2_id) -- Ensure consistent ordering
);

-- 6. Table for WhatsApp contact sharing
CREATE TABLE IF NOT EXISTS whatsapp_contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    shared_with_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL,
    shared_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure unique sharing per user pair
    UNIQUE(user_id, shared_with_user_id)
);

-- 7. Enhance messages table for better file support
ALTER TABLE messages ADD COLUMN IF NOT EXISTS has_attachments BOOLEAN DEFAULT false;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachment_count INTEGER DEFAULT 0;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS voice_duration INTEGER; -- in seconds
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT false;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'voice', 'gift', 'emoji'));

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversation_settings_user_id ON conversation_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_settings_other_user_id ON conversation_settings(other_user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_settings_archived ON conversation_settings(user_id, is_archived);

CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker_id ON blocked_users(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked_id ON blocked_users(blocked_id);

CREATE INDEX IF NOT EXISTS idx_reported_users_reporter_id ON reported_users(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reported_users_status ON reported_users(status);

CREATE INDEX IF NOT EXISTS idx_message_attachments_message_id ON message_attachments(message_id);

CREATE INDEX IF NOT EXISTS idx_conversations_users ON conversations(user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_whatsapp_contacts_user ON whatsapp_contacts(user_id);

CREATE INDEX IF NOT EXISTS idx_messages_attachments ON messages(has_attachments) WHERE has_attachments = true;
CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(message_type);

-- 9. Enable Row Level Security
ALTER TABLE conversation_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reported_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_contacts ENABLE ROW LEVEL SECURITY;

-- 10. Create RLS policies
CREATE POLICY "Users can manage their own conversation settings" ON conversation_settings
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their blocked users" ON blocked_users
    FOR ALL USING (auth.uid() = blocker_id);

CREATE POLICY "Users can view their own reports" ON reported_users
    FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "Users can report other users" ON reported_users
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view attachments in their conversations" ON message_attachments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM messages m 
            WHERE m.id = message_attachments.message_id 
            AND (m.sender_id = auth.uid() OR m.receiver_id = auth.uid())
        )
    );

CREATE POLICY "Users can insert attachments for their messages" ON message_attachments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM messages m 
            WHERE m.id = message_attachments.message_id 
            AND m.sender_id = auth.uid()
        )
    );

CREATE POLICY "Users can view their conversations" ON conversations
    FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can insert conversations they're part of" ON conversations
    FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can update their conversations" ON conversations
    FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can view their shared WhatsApp contacts" ON whatsapp_contacts
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = shared_with_user_id);

CREATE POLICY "Users can share their WhatsApp contacts" ON whatsapp_contacts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 11. Create functions for conversation management

-- Function to get conversation settings with defaults
CREATE OR REPLACE FUNCTION get_conversation_settings(other_user_uuid UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    settings_json JSON;
BEGIN
    SELECT row_to_json(cs) INTO settings_json
    FROM (
        SELECT 
            notifications_enabled,
            sounds_enabled,
            message_preview_enabled,
            read_receipts_enabled,
            online_status_visible,
            is_archived,
            is_favorite,
            is_muted,
            auto_archive_enabled,
            auto_archive_days,
            archived_at,
            created_at,
            updated_at
        FROM conversation_settings
        WHERE user_id = auth.uid() AND other_user_id = other_user_uuid
    ) cs;
    
    -- If no settings exist, return defaults
    IF settings_json IS NULL THEN
        settings_json := json_build_object(
            'notifications_enabled', true,
            'sounds_enabled', true,
            'message_preview_enabled', true,
            'read_receipts_enabled', true,
            'online_status_visible', true,
            'is_archived', false,
            'is_favorite', false,
            'is_muted', false,
            'auto_archive_enabled', false,
            'auto_archive_days', 30,
            'archived_at', null,
            'created_at', NOW(),
            'updated_at', NOW()
        );
    END IF;
    
    RETURN settings_json;
END;
$$;

-- Function to upsert conversation settings
CREATE OR REPLACE FUNCTION upsert_conversation_settings(
    other_user_uuid UUID,
    settings_json JSON
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result_settings JSON;
BEGIN
    INSERT INTO conversation_settings (
        user_id, 
        other_user_id,
        notifications_enabled,
        sounds_enabled,
        message_preview_enabled,
        read_receipts_enabled,
        online_status_visible,
        is_archived,
        is_favorite,
        is_muted,
        auto_archive_enabled,
        auto_archive_days,
        archived_at
    ) VALUES (
        auth.uid(),
        other_user_uuid,
        COALESCE((settings_json->>'notifications_enabled')::boolean, true),
        COALESCE((settings_json->>'sounds_enabled')::boolean, true),
        COALESCE((settings_json->>'message_preview_enabled')::boolean, true),
        COALESCE((settings_json->>'read_receipts_enabled')::boolean, true),
        COALESCE((settings_json->>'online_status_visible')::boolean, true),
        COALESCE((settings_json->>'is_archived')::boolean, false),
        COALESCE((settings_json->>'is_favorite')::boolean, false),
        COALESCE((settings_json->>'is_muted')::boolean, false),
        COALESCE((settings_json->>'auto_archive_enabled')::boolean, false),
        COALESCE((settings_json->>'auto_archive_days')::integer, 30),
        CASE WHEN COALESCE((settings_json->>'is_archived')::boolean, false) THEN NOW() ELSE NULL END
    )
    ON CONFLICT (user_id, other_user_id) 
    DO UPDATE SET
        notifications_enabled = COALESCE((settings_json->>'notifications_enabled')::boolean, conversation_settings.notifications_enabled),
        sounds_enabled = COALESCE((settings_json->>'sounds_enabled')::boolean, conversation_settings.sounds_enabled),
        message_preview_enabled = COALESCE((settings_json->>'message_preview_enabled')::boolean, conversation_settings.message_preview_enabled),
        read_receipts_enabled = COALESCE((settings_json->>'read_receipts_enabled')::boolean, conversation_settings.read_receipts_enabled),
        online_status_visible = COALESCE((settings_json->>'online_status_visible')::boolean, conversation_settings.online_status_visible),
        is_archived = COALESCE((settings_json->>'is_archived')::boolean, conversation_settings.is_archived),
        is_favorite = COALESCE((settings_json->>'is_favorite')::boolean, conversation_settings.is_favorite),
        is_muted = COALESCE((settings_json->>'is_muted')::boolean, conversation_settings.is_muted),
        auto_archive_enabled = COALESCE((settings_json->>'auto_archive_enabled')::boolean, conversation_settings.auto_archive_enabled),
        auto_archive_days = COALESCE((settings_json->>'auto_archive_days')::integer, conversation_settings.auto_archive_days),
        archived_at = CASE 
            WHEN COALESCE((settings_json->>'is_archived')::boolean, conversation_settings.is_archived) AND conversation_settings.archived_at IS NULL 
            THEN NOW() 
            WHEN NOT COALESCE((settings_json->>'is_archived')::boolean, conversation_settings.is_archived) 
            THEN NULL 
            ELSE conversation_settings.archived_at 
        END,
        updated_at = NOW();
    
    -- Return the updated settings
    SELECT get_conversation_settings(other_user_uuid) INTO result_settings;
    RETURN result_settings;
END;
$$;

-- Function to check if user is blocked
CREATE OR REPLACE FUNCTION is_user_blocked(other_user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    blocked_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO blocked_count
    FROM blocked_users
    WHERE (blocker_id = auth.uid() AND blocked_id = other_user_uuid)
    OR (blocker_id = other_user_uuid AND blocked_id = auth.uid());
    
    RETURN blocked_count > 0;
END;
$$;

-- Function to get all conversations with metadata
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
                'message_type', m.message_type,
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
        CASE 
            WHEN c.user1_id = auth.uid() THEN c.user2_id = p.user_id
            ELSE c.user1_id = p.user_id
        END
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
        AND NOT EXISTS (
            SELECT 1 FROM blocked_users bu 
            WHERE (bu.blocker_id = auth.uid() AND bu.blocked_id = CASE WHEN c.user1_id = auth.uid() THEN c.user2_id ELSE c.user1_id END)
            OR (bu.blocked_id = auth.uid() AND bu.blocker_id = CASE WHEN c.user1_id = auth.uid() THEN c.user2_id ELSE c.user1_id END)
        )
    ORDER BY c.last_message_at DESC NULLS LAST;
END;
$$;

-- Function to mark messages as read and update unread count
CREATE OR REPLACE FUNCTION mark_conversation_read(other_user_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Mark messages as read
    UPDATE messages 
    SET read = true 
    WHERE sender_id = other_user_uuid 
    AND receiver_id = auth.uid() 
    AND read = false;
    
    -- Update conversation unread count
    UPDATE conversations
    SET 
        user1_unread_count = CASE WHEN user1_id = auth.uid() THEN 0 ELSE user1_unread_count END,
        user2_unread_count = CASE WHEN user2_id = auth.uid() THEN 0 ELSE user2_unread_count END,
        updated_at = NOW()
    WHERE (user1_id = LEAST(auth.uid(), other_user_uuid) AND user2_id = GREATEST(auth.uid(), other_user_uuid));
END;
$$;

-- 12. Create triggers for automatic updates

-- Trigger to update conversation last_message when new message is sent
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
    -- Update or create conversation
    INSERT INTO conversations (user1_id, user2_id, last_message_id, last_message_at, user1_unread_count, user2_unread_count)
    VALUES (
        LEAST(NEW.sender_id, NEW.receiver_id),
        GREATEST(NEW.sender_id, NEW.receiver_id),
        NEW.id,
        NEW.created_at,
        CASE WHEN NEW.receiver_id = LEAST(NEW.sender_id, NEW.receiver_id) THEN 1 ELSE 0 END,
        CASE WHEN NEW.receiver_id = GREATEST(NEW.sender_id, NEW.receiver_id) THEN 1 ELSE 0 END
    )
    ON CONFLICT (user1_id, user2_id) 
    DO UPDATE SET
        last_message_id = NEW.id,
        last_message_at = NEW.created_at,
        user1_unread_count = CASE 
            WHEN NEW.receiver_id = conversations.user1_id THEN conversations.user1_unread_count + 1
            ELSE conversations.user1_unread_count
        END,
        user2_unread_count = CASE 
            WHEN NEW.receiver_id = conversations.user2_id THEN conversations.user2_unread_count + 1
            ELSE conversations.user2_unread_count
        END,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_update_conversation_on_message ON messages;
CREATE TRIGGER trigger_update_conversation_on_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_on_message();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_conversation_settings_updated_at 
    BEFORE UPDATE ON conversation_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at 
    BEFORE UPDATE ON conversations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 13. Grant necessary permissions
GRANT ALL ON conversation_settings TO authenticated;
GRANT ALL ON blocked_users TO authenticated;
GRANT ALL ON reported_users TO authenticated;
GRANT ALL ON message_attachments TO authenticated;
GRANT ALL ON conversations TO authenticated;
GRANT ALL ON whatsapp_contacts TO authenticated;

GRANT EXECUTE ON FUNCTION get_conversation_settings(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_conversation_settings(UUID, JSON) TO authenticated;
GRANT EXECUTE ON FUNCTION is_user_blocked(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_conversations() TO authenticated;
GRANT EXECUTE ON FUNCTION mark_conversation_read(UUID) TO authenticated;
