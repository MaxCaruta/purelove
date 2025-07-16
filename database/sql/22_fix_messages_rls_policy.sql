-- =====================================================
-- FIX MESSAGES RLS POLICY
-- Allow users to insert messages in their conversations
-- (both their own messages and AI responses)
-- =====================================================

-- Drop the existing restrictive insert policy
DROP POLICY IF EXISTS "Users can insert messages they send" ON messages;

-- Create a new policy that allows users to insert messages in their conversations
-- This covers both:
-- 1. User sending messages (user is sender)
-- 2. System inserting AI responses (user is receiver)
CREATE POLICY "Users can insert messages in their conversations"
  ON messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Add a comment to explain the policy
COMMENT ON POLICY "Users can insert messages in their conversations" ON messages IS 
'Allows authenticated users to insert messages where they are either the sender (their own messages) or receiver (AI responses in their conversations)';

-- Also update the select policy to be more explicit
DROP POLICY IF EXISTS "Users can read messages they sent or received" ON messages;

CREATE POLICY "Users can read messages in their conversations"
  ON messages FOR SELECT TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

COMMENT ON POLICY "Users can read messages in their conversations" ON messages IS 
'Allows authenticated users to read messages where they are either the sender or receiver';

-- Update policy should remain the same (only receiver can mark as read)
-- No changes needed for the update policy 