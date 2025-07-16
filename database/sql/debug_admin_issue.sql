-- Debug admin panel issue: checking profiles and conversations

-- 1. Check all profiles with their roles
SELECT 
  substring(id::text, 1, 8) as short_id,
  first_name,
  last_name,
  role,
  created_at
FROM profiles 
WHERE role IN ('user', 'model', 'admin') 
ORDER BY role, first_name;

-- 2. Check all conversations 
SELECT 
  substring(id::text, 1, 8) as conv_id,
  substring(user1_id::text, 1, 8) as user1_short,
  substring(user2_id::text, 1, 8) as user2_short,
  last_message_at,
  created_at
FROM conversations 
ORDER BY last_message_at DESC;

-- 3. Join conversations with profile details to see the full picture
SELECT 
  substring(c.id::text, 1, 8) as conv_id,
  p1.first_name || ' ' || p1.last_name as user1_name,
  p1.role as user1_role,
  substring(c.user1_id::text, 1, 8) as user1_short,
  p2.first_name || ' ' || p2.last_name as user2_name,
  p2.role as user2_role,
  substring(c.user2_id::text, 1, 8) as user2_short,
  c.last_message_at
FROM conversations c
LEFT JOIN profiles p1 ON c.user1_id = p1.id
LEFT JOIN profiles p2 ON c.user2_id = p2.id
ORDER BY c.last_message_at DESC;

-- 4. Check which conversations involve real users (role='user')
SELECT 
  substring(c.id::text, 1, 8) as conv_id,
  CASE 
    WHEN p1.role = 'user' THEN p1.first_name || ' ' || p1.last_name
    WHEN p2.role = 'user' THEN p2.first_name || ' ' || p2.last_name
    ELSE 'No real user found'
  END as real_user_name,
  CASE 
    WHEN p1.role = 'model' THEN p1.first_name || ' ' || p1.last_name
    WHEN p2.role = 'model' THEN p2.first_name || ' ' || p2.last_name
    ELSE 'No model found'
  END as model_name,
  c.last_message_at
FROM conversations c
LEFT JOIN profiles p1 ON c.user1_id = p1.id
LEFT JOIN profiles p2 ON c.user2_id = p2.id
WHERE (p1.role = 'user' OR p2.role = 'user')
ORDER BY c.last_message_at DESC; 