-- Check and fix model profile UUIDs
-- This script will show us what UUIDs actually exist and help fix the mismatch

-- First, let's see what model profiles exist
SELECT 
    p.id,
    p.first_name,
    p.last_name,
    p.role,
    u.email,
    u.created_at
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE p.first_name IN ('Olena', 'Natalia', 'Madina', 'Irina', 'Kateryna', 'Aisha', 'Anastasia', 'Zuzana', 'Karolina', 'Elena')
ORDER BY p.first_name;

-- Check if there are any orphaned profiles (profiles without auth.users entries)
SELECT 
    p.id,
    p.first_name,
    'No auth.users entry' as issue
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE u.id IS NULL
AND p.first_name IN ('Olena', 'Natalia', 'Madina', 'Irina', 'Kateryna', 'Aisha', 'Anastasia', 'Zuzana', 'Karolina', 'Elena');

-- Also check conversations that might be failing
SELECT 
    c.id,
    c.user1_id,
    c.user2_id,
    u1.email as user1_email,
    u2.email as user2_email,
    p1.first_name as user1_name,
    p2.first_name as user2_name
FROM conversations c
LEFT JOIN auth.users u1 ON c.user1_id = u1.id
LEFT JOIN auth.users u2 ON c.user2_id = u2.id
LEFT JOIN public.profiles p1 ON c.user1_id = p1.id
LEFT JOIN public.profiles p2 ON c.user2_id = p2.id
WHERE u1.id IS NULL OR u2.id IS NULL
ORDER BY c.created_at DESC
LIMIT 10; 