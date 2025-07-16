-- Create conversations table and related functionality
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

-- Create conversation settings table
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

-- Enable RLS on conversation tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for conversations
CREATE POLICY "Users can view their conversations" ON conversations
    FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can insert conversations they're part of" ON conversations
    FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can update their conversations" ON conversations
    FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- RLS policies for conversation settings
CREATE POLICY "Users can manage their conversation settings" ON conversation_settings
    FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_users ON conversations(user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_settings_user ON conversation_settings(user_id);

-- Function to get user conversations
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

-- Function to mark messages as read
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

-- Grant necessary permissions
GRANT ALL ON conversations TO authenticated;
GRANT ALL ON conversation_settings TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_conversations() TO authenticated;
GRANT EXECUTE ON FUNCTION mark_conversation_read(UUID) TO authenticated; 