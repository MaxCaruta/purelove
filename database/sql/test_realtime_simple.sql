-- Simple test to debug real-time subscriptions
-- First, let's check if real-time is enabled for the messages table

-- Check current publications
SELECT schemaname, tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

-- Check if messages table is in the publication
SELECT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
) as messages_realtime_enabled;

-- Check table replica identity (correct way)
SELECT c.relname as table_name, 
       CASE c.relreplident
           WHEN 'd' THEN 'default'
           WHEN 'n' THEN 'nothing'
           WHEN 'f' THEN 'full'
           WHEN 'i' THEN 'index'
       END as replica_identity
FROM pg_class c 
WHERE c.relname = 'messages' AND c.relkind = 'r';

-- Show some recent messages for debugging
SELECT id, sender_id, receiver_id, content, type, created_at 
FROM messages 
ORDER BY created_at DESC 
LIMIT 5;

-- Test insert a message (you can use this manually to test if real-time works)
-- INSERT INTO messages (sender_id, receiver_id, content, type) 
-- VALUES ('your-user-id', 'profile-id', 'Test real-time message', 'text');

-- Check RLS policies on messages
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'messages';

-- Enable logging for real-time events (useful for debugging)
DO $$
BEGIN
    RAISE LOG 'Real-time debug test completed. Check if messages table is properly configured for real-time.';
END $$; 