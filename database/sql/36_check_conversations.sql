-- Check what conversations exist in the database
-- This will help debug why the admin panel isn't showing the Kateryna conversation

-- First, check what messages exist
SELECT 
    m.id,
    m.sender_id,
    m.receiver_id,
    m.content,
    m.created_at,
    sender.first_name as sender_name,
    receiver.first_name as receiver_name,
    sender.role as sender_role,
    receiver.role as receiver_role
FROM messages m
LEFT JOIN profiles sender ON m.sender_id = sender.id
LEFT JOIN profiles receiver ON m.receiver_id = receiver.id
ORDER BY m.created_at DESC
LIMIT 20;

-- Check what conversations exist
SELECT 
    c.id,
    c.user1_id,
    c.user2_id,
    c.last_message_at,
    c.created_at,
    c.updated_at,
    u1.first_name as user1_name,
    u2.first_name as user2_name,
    u1.role as user1_role,
    u2.role as user2_role
FROM conversations c
LEFT JOIN profiles u1 ON c.user1_id = u1.id
LEFT JOIN profiles u2 ON c.user2_id = u2.id
ORDER BY c.last_message_at DESC;

-- Check for Kateryna specifically
SELECT 
    p.id,
    p.first_name,
    p.last_name,
    p.role,
    p.created_at
FROM profiles p
WHERE p.first_name = 'Kateryna'
ORDER BY p.created_at;

-- Check for recent messages involving Kateryna
SELECT 
    m.id,
    m.sender_id,
    m.receiver_id,
    m.content,
    m.created_at,
    sender.first_name as sender_name,
    receiver.first_name as receiver_name
FROM messages m
LEFT JOIN profiles sender ON m.sender_id = sender.id
LEFT JOIN profiles receiver ON m.receiver_id = receiver.id
WHERE sender.first_name = 'Kateryna' OR receiver.first_name = 'Kateryna'
ORDER BY m.created_at DESC; 