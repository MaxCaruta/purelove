-- Comprehensive fix for real-time subscriptions
-- This ensures that Supabase real-time works properly for messages

-- First, ensure the messages table is added to the realtime publication
-- (This might already be done, but we're making sure)
DO $$
BEGIN
    -- Try to add messages table to realtime publication
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE messages;
        RAISE LOG 'Added messages table to supabase_realtime publication';
    EXCEPTION WHEN duplicate_object THEN
        RAISE LOG 'Messages table already in supabase_realtime publication';
    END;
END $$;

-- Set replica identity to FULL for complete row data in real-time
ALTER TABLE messages REPLICA IDENTITY FULL;

-- Ensure conversations table is also set up for real-time
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
        RAISE LOG 'Added conversations table to supabase_realtime publication';
    EXCEPTION WHEN duplicate_object THEN
        RAISE LOG 'Conversations table already in supabase_realtime publication';
    END;
END $$;

ALTER TABLE conversations REPLICA IDENTITY FULL;

-- Create a simple function to test real-time (for debugging)
CREATE OR REPLACE FUNCTION test_realtime_message(
    test_sender_id uuid,
    test_receiver_id uuid,
    test_content text
)
RETURNS uuid AS $$
DECLARE
    new_message_id uuid;
BEGIN
    INSERT INTO messages (sender_id, receiver_id, content, type)
    VALUES (test_sender_id, test_receiver_id, test_content, 'text')
    RETURNING id INTO new_message_id;
    
    RAISE LOG 'Test message inserted with ID: %', new_message_id;
    RETURN new_message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION test_realtime_message(uuid, uuid, text) TO authenticated;

-- Ensure RLS policies allow real-time subscriptions
-- Update the messages RLS policy to be more permissive for real-time
DROP POLICY IF EXISTS "Users can view messages in their conversations or admins can view all" ON messages;

CREATE POLICY "Users can view messages in their conversations or admins can view all"
ON messages FOR SELECT
USING (
    -- User is sender or receiver
    (auth.uid() = sender_id OR auth.uid() = receiver_id) OR
    -- OR user is admin
    (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    )
);

-- Also ensure INSERT policy exists for sending messages
DROP POLICY IF EXISTS "Users can insert their own messages" ON messages;

CREATE POLICY "Users can insert their own messages"
ON messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Create a trigger to log message inserts (for debugging)
CREATE OR REPLACE FUNCTION log_message_insert()
RETURNS TRIGGER AS $$
BEGIN
    RAISE LOG 'Message inserted: ID=%, sender=%, receiver=%, content=%', 
        NEW.id, NEW.sender_id, NEW.receiver_id, NEW.content;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists and recreate
DROP TRIGGER IF EXISTS log_message_insert_trigger ON messages;
CREATE TRIGGER log_message_insert_trigger
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION log_message_insert();

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';

-- Final verification query
SELECT 
    'messages' as table_name,
    EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
    ) as in_realtime_publication,
    (
        SELECT CASE c.relreplident
            WHEN 'd' THEN 'default'
            WHEN 'n' THEN 'nothing'
            WHEN 'f' THEN 'full'
            WHEN 'i' THEN 'index'
        END
        FROM pg_class c 
        WHERE c.relname = 'messages' AND c.relkind = 'r'
    ) as replica_identity;

-- Log completion
DO $$
BEGIN
    RAISE LOG 'Comprehensive real-time fix completed for messages table';
END $$; 