-- Admin functions to bypass RLS for admin panel access

-- Function to get all conversations for admin panel (bypasses RLS)
CREATE OR REPLACE FUNCTION get_all_conversations_for_admin(user_ids UUID[])
RETURNS TABLE (
  id UUID,
  user1_id UUID,
  user2_id UUID,
  last_message_id UUID,
  last_message_at TIMESTAMPTZ,
  user1_unread_count INTEGER,
  user2_unread_count INTEGER,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the current user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Return all conversations involving the specified user IDs
  -- This bypasses RLS since we're using SECURITY DEFINER
  RETURN QUERY
  SELECT 
    c.id,
    c.user1_id,
    c.user2_id,
    c.last_message_id,
    c.last_message_at,
    c.user1_unread_count,
    c.user2_unread_count,
    c.is_active,
    c.created_at,
    c.updated_at
  FROM conversations c
  WHERE c.user1_id = ANY(user_ids) OR c.user2_id = ANY(user_ids)
  ORDER BY c.last_message_at DESC NULLS LAST;
END;
$$;

-- Function to get all messages for admin panel (bypasses RLS)
CREATE OR REPLACE FUNCTION get_all_messages_for_admin(conversation_user1_id UUID, conversation_user2_id UUID)
RETURNS TABLE (
  id UUID,
  sender_id UUID,
  receiver_id UUID,
  content TEXT,
  read BOOLEAN,
  created_at TIMESTAMPTZ,
  message_type TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the current user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Return all messages between the two users
  RETURN QUERY
  SELECT 
    m.id,
    m.sender_id,
    m.receiver_id,
    m.content,
    m.read,
    m.created_at,
    m.type as message_type
  FROM messages m
  WHERE (
    (m.sender_id = conversation_user1_id AND m.receiver_id = conversation_user2_id) OR
    (m.sender_id = conversation_user2_id AND m.receiver_id = conversation_user1_id)
  )
  ORDER BY m.created_at ASC;
END;
$$;

-- Grant execute permissions to authenticated users (admin check is inside the function)
GRANT EXECUTE ON FUNCTION get_all_conversations_for_admin(UUID[]) TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_messages_for_admin(UUID, UUID) TO authenticated; 