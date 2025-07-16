-- Fix real-time subscriptions for messages and conversations
-- This ensures that Supabase real-time can properly broadcast changes

-- Enable realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Enable realtime for conversations table  
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

-- Enable realtime for conversation_settings table
ALTER PUBLICATION supabase_realtime ADD TABLE conversation_settings;

-- Make sure the tables have proper replica identity for real-time
ALTER TABLE messages REPLICA IDENTITY FULL;
ALTER TABLE conversations REPLICA IDENTITY FULL;
ALTER TABLE conversation_settings REPLICA IDENTITY FULL;

-- Create a function to check if user can receive real-time updates for messages
CREATE OR REPLACE FUNCTION can_receive_message_realtime(user_id uuid, sender_id uuid, receiver_id uuid)
RETURNS boolean AS $$
BEGIN
    -- User can receive real-time updates if they are either sender or receiver
    -- OR if they are an admin
    RETURN (
        user_id = sender_id OR 
        user_id = receiver_id OR
        is_admin_user()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policy for messages to allow real-time subscriptions
-- Note: Real-time subscriptions respect RLS policies
DROP POLICY IF EXISTS "Users can view messages in their conversations or admins can view all" ON messages;

CREATE POLICY "Users can view messages in their conversations or admins can view all"
ON messages FOR SELECT
USING (
    -- User is sender or receiver
    (auth.uid() = sender_id OR auth.uid() = receiver_id) OR
    -- OR user is admin
    is_admin_user()
);

-- Update RLS policy for conversations to allow real-time subscriptions  
DROP POLICY IF EXISTS "Users can view their own conversations or admins can view all" ON conversations;

CREATE POLICY "Users can view their own conversations or admins can view all"
ON conversations FOR SELECT
USING (
    -- User is participant in conversation
    (auth.uid() = user1_id OR auth.uid() = user2_id) OR
    -- OR user is admin
    is_admin_user()
);

-- Grant necessary permissions for real-time
GRANT SELECT ON messages TO authenticated;
GRANT SELECT ON conversations TO authenticated;
GRANT SELECT ON conversation_settings TO authenticated;

-- Refresh the schema to apply changes
NOTIFY pgrst, 'reload schema';

-- Log that real-time is configured
DO $$
BEGIN
    RAISE LOG 'Real-time subscriptions configured for messages, conversations, and conversation_settings tables';
END $$; 