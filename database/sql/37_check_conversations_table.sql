-- Check if conversations table has the records it should have
-- The database trigger should automatically create conversation records when messages are inserted

SELECT 
    c.id,
    c.user1_id,
    c.user2_id,
    c.last_message_at,
    c.created_at,
    u1.first_name as user1_name,
    u1.role as user1_role,
    u2.first_name as user2_name,
    u2.role as user2_role
FROM conversations c
LEFT JOIN profiles u1 ON c.user1_id = u1.id
LEFT JOIN profiles u2 ON c.user2_id = u2.id
ORDER BY c.last_message_at DESC;

-- Check if trigger exists and is working
SELECT trigger_name, event_manipulation, trigger_schema, trigger_name
FROM information_schema.triggers 
WHERE trigger_name = 'update_conversation_on_message';

-- If no conversations exist, we might need to manually create them
-- Let's see what conversations SHOULD exist based on messages
SELECT DISTINCT
    LEAST(sender_id, receiver_id) as user1_id,
    GREATEST(sender_id, receiver_id) as user2_id,
    MAX(created_at) as last_message_at,
    COUNT(*) as message_count
FROM messages
GROUP BY LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id)
ORDER BY last_message_at DESC; 