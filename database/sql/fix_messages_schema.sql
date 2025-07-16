-- Drop existing foreign key constraints
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_receiver_id_fkey;

-- Update foreign key references to point to auth.users instead of profiles
ALTER TABLE messages 
  ADD CONSTRAINT messages_sender_id_fkey 
  FOREIGN KEY (sender_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

ALTER TABLE messages 
  ADD CONSTRAINT messages_receiver_id_fkey 
  FOREIGN KEY (receiver_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Create conversations table if it doesn't exist
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

-- Enable RLS on conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- RLS policies for conversations
CREATE POLICY "Users can view their conversations" ON conversations
    FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can insert conversations they're part of" ON conversations
    FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can update their conversations" ON conversations
    FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_users ON conversations(user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);

-- Create trigger function to update conversation on new message
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
GRANT EXECUTE ON FUNCTION update_conversation_on_message() TO authenticated; 