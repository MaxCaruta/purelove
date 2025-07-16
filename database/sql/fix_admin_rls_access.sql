-- =====================================================
-- FIX ADMIN RLS ACCESS
-- Allow admin users to access all conversations and settings
-- for the admin panel while maintaining user privacy
-- =====================================================

-- Check if admin_functions.sql has been run (our functions should exist)
-- If not, create basic admin check function
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION is_admin_user() TO authenticated;

-- Update conversations RLS policies to allow admin access
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
CREATE POLICY "Users can view their conversations" ON conversations
    FOR SELECT USING (
        auth.uid() = user1_id 
        OR auth.uid() = user2_id 
        OR is_admin_user()
    );

DROP POLICY IF EXISTS "Users can insert conversations they're part of" ON conversations;
CREATE POLICY "Users can insert conversations they're part of" ON conversations
    FOR INSERT WITH CHECK (
        auth.uid() = user1_id 
        OR auth.uid() = user2_id 
        OR is_admin_user()
    );

DROP POLICY IF EXISTS "Users can update their conversations" ON conversations;
CREATE POLICY "Users can update their conversations" ON conversations
    FOR UPDATE USING (
        auth.uid() = user1_id 
        OR auth.uid() = user2_id 
        OR is_admin_user()
    );

-- Update conversation_settings RLS policies to allow admin access
DROP POLICY IF EXISTS "Users can manage their conversation settings" ON conversation_settings;
CREATE POLICY "Users can manage their conversation settings" ON conversation_settings
    FOR ALL USING (
        auth.uid() = user_id 
        OR is_admin_user()
    );

-- Also update messages RLS policies to allow admin access for the admin panel
DROP POLICY IF EXISTS "Users can read messages in their conversations" ON messages;
CREATE POLICY "Users can read messages in their conversations" ON messages
    FOR SELECT TO authenticated
    USING (
        auth.uid() = sender_id 
        OR auth.uid() = receiver_id 
        OR is_admin_user()
    );

DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON messages;
CREATE POLICY "Users can insert messages in their conversations" ON messages
    FOR INSERT TO authenticated
    WITH CHECK (
        auth.uid() = sender_id 
        OR auth.uid() = receiver_id 
        OR is_admin_user()
    );

-- Add admin access to message updates (for marking as read, etc.)
DROP POLICY IF EXISTS "Users can update messages they received" ON messages;
CREATE POLICY "Users can update messages they received" ON messages
    FOR UPDATE TO authenticated
    USING (
        auth.uid() = receiver_id 
        OR is_admin_user()
    );

-- Comments to document the admin access
COMMENT ON POLICY "Users can view their conversations" ON conversations IS 
'Allows users to view conversations they participate in, and admin users to view all conversations for management purposes';

COMMENT ON POLICY "Users can manage their conversation settings" ON conversation_settings IS 
'Allows users to manage their own conversation settings, and admin users to manage all settings for support purposes';

COMMENT ON POLICY "Users can read messages in their conversations" ON messages IS 
'Allows users to read messages in their conversations, and admin users to read all messages for moderation purposes';

COMMENT ON FUNCTION is_admin_user() IS 
'Helper function to check if the current authenticated user has admin or super_admin role';

-- Log the update
SELECT 'Admin RLS policies updated successfully' as status; 