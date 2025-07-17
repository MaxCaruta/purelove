-- Debug script to check why messages aren't showing in admin
-- This will help us understand the user roles and conversation structure

-- 1. Check all users and their roles
SELECT '=== ALL USERS AND ROLES ===' as info;
SELECT 
    id,
    first_name,
    last_name,
    role,
    created_at
FROM profiles 
ORDER BY created_at DESC;

-- 2. Check recent messages
SELECT '=== RECENT MESSAGES ===' as info;
SELECT 
    m.id,
    m.sender_id,
    m.receiver_id,
    m.content,
    m.created_at,
    sender.first_name as sender_name,
    sender.role as sender_role,
    receiver.first_name as receiver_name,
    receiver.role as receiver_role
FROM messages m
LEFT JOIN profiles sender ON m.sender_id = sender.id
LEFT JOIN profiles receiver ON m.receiver_id = receiver.id
ORDER BY m.created_at DESC
LIMIT 10;

-- 3. Check conversations
SELECT '=== CONVERSATIONS ===' as info;
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

-- 4. Check specific conversation for the recent message
SELECT '=== SPECIFIC CONVERSATION FOR RECENT MESSAGE ===' as info;
SELECT 
    c.id,
    c.user1_id,
    c.user2_id,
    c.last_message_at,
    u1.first_name as user1_name,
    u1.role as user1_role,
    u2.first_name as user2_name,
    u2.role as user2_role
FROM conversations c
LEFT JOIN profiles u1 ON c.user1_id = u1.id
LEFT JOIN profiles u2 ON c.user2_id = u2.id
WHERE (c.user1_id = 'fba86d82-3922-40b9-b745-9426f02b28ff' OR c.user2_id = 'fba86d82-3922-40b9-b745-9426f02b28ff')
ORDER BY c.last_message_at DESC;

-- 5. Check if the user "Bogdan" exists and their role
SELECT '=== CHECKING BOGDAN USER ===' as info;
SELECT 
    id,
    first_name,
    last_name,
    role,
    created_at
FROM profiles 
WHERE first_name ILIKE '%bogdan%' OR last_name ILIKE '%bogdan%'
ORDER BY created_at DESC; 