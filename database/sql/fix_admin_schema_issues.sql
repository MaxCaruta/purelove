-- Fix admin schema issues
-- Run this in Supabase SQL Editor to fix the message_type column and RLS issues

-- 1. Update admin functions to use correct column names
-- Drop existing functions first
DROP FUNCTION IF EXISTS get_all_messages_for_admin(UUID, UUID);
DROP FUNCTION IF EXISTS get_all_conversations_for_admin(UUID[]);

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

-- 2. Create is_admin_user function if it doesn't exist
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'super_admin')
  );
END;
$$;

-- 3. Update RLS policies to allow admin access
-- Drop existing policies and recreate them

-- Messages table policies
DROP POLICY IF EXISTS "Users can read messages they sent or received" ON messages;
DROP POLICY IF EXISTS "Users can insert messages they send" ON messages;
DROP POLICY IF EXISTS "Users can update messages they received" ON messages;

-- Recreate with admin access
CREATE POLICY "Users can read messages they sent or received"
  ON messages FOR SELECT TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id OR is_admin_user());

CREATE POLICY "Users can insert messages they send"
  ON messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id OR is_admin_user());

CREATE POLICY "Users can update messages they received"
  ON messages FOR UPDATE TO authenticated
  USING (auth.uid() = receiver_id OR is_admin_user());

-- Conversations table policies
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update their conversations" ON conversations;

-- Recreate with admin access
CREATE POLICY "Users can view their conversations"
  ON conversations FOR SELECT TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id OR is_admin_user());

CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id OR is_admin_user());

CREATE POLICY "Users can update their conversations"
  ON conversations FOR UPDATE TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id OR is_admin_user());

-- Conversation_settings table policies
DROP POLICY IF EXISTS "Users can view their conversation settings" ON conversation_settings;
DROP POLICY IF EXISTS "Users can insert their conversation settings" ON conversation_settings;
DROP POLICY IF EXISTS "Users can update their conversation settings" ON conversation_settings;

-- Recreate with admin access
CREATE POLICY "Users can view their conversation settings"
  ON conversation_settings FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR is_admin_user());

CREATE POLICY "Users can insert their conversation settings"
  ON conversation_settings FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR is_admin_user());

CREATE POLICY "Users can update their conversation settings"
  ON conversation_settings FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR is_admin_user());

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_all_conversations_for_admin(UUID[]) TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_messages_for_admin(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin_user() TO authenticated;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema'; 