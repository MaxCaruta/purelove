-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- Helper functions and automated processes
-- =====================================================

-- Function to update user online status
CREATE OR REPLACE FUNCTION update_user_online_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update profiles.is_online based on recent activity
  UPDATE profiles 
  SET is_online = EXISTS (
    SELECT 1 FROM user_sessions 
    WHERE user_id = profiles.id 
    AND last_activity > NOW() - INTERVAL '5 minutes'
    AND is_online = true
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update online status when sessions change
CREATE TRIGGER trigger_update_online_status
  AFTER INSERT OR UPDATE ON user_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_online_status();

-- Function to automatically expire subscriptions
CREATE OR REPLACE FUNCTION expire_subscriptions()
RETURNS void AS $$
BEGIN
  -- Update subscription purchases that have expired
  UPDATE subscription_purchases 
  SET is_active = false 
  WHERE expires_at < NOW() AND is_active = true;
  
  -- Update profiles chat_subscription to null if expired
  UPDATE profiles 
  SET chat_subscription = NULL 
  WHERE chat_subscription IS NOT NULL 
  AND (chat_subscription->>'expiresAt')::timestamp < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to get user's active subscription
CREATE OR REPLACE FUNCTION get_user_active_subscription(user_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  subscription_data JSONB;
BEGIN
  -- Check profiles.chat_subscription first
  SELECT chat_subscription INTO subscription_data
  FROM profiles 
  WHERE id = user_uuid 
  AND chat_subscription IS NOT NULL 
  AND (chat_subscription->>'expiresAt')::timestamp > NOW();
  
  IF subscription_data IS NOT NULL THEN
    RETURN subscription_data;
  END IF;
  
  -- Check subscription_purchases table
  SELECT 
    jsonb_build_object(
      'type', s.name,
      'expiresAt', sp.expires_at,
      'purchasedAt', sp.created_at
    ) INTO subscription_data
  FROM subscription_purchases sp
  JOIN subscriptions s ON sp.subscription_id = s.id
  WHERE sp.user_id = user_uuid 
  AND sp.is_active = true 
  AND sp.expires_at > NOW()
  ORDER BY sp.expires_at DESC
  LIMIT 1;
  
  RETURN subscription_data;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate user age from birth_date
CREATE OR REPLACE FUNCTION calculate_age(birth_date DATE)
RETURNS INTEGER AS $$
BEGIN
  RETURN EXTRACT(YEAR FROM AGE(birth_date));
END;
$$ LANGUAGE plpgsql;

-- Function to get user's unread message count
CREATE OR REPLACE FUNCTION get_unread_message_count(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  count_val INTEGER;
BEGIN
  SELECT COUNT(*) INTO count_val
  FROM messages 
  WHERE receiver_id = user_uuid AND read = false;
  
  RETURN count_val;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's match count
CREATE OR REPLACE FUNCTION get_match_count(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  count_val INTEGER;
BEGIN
  SELECT COUNT(*) INTO count_val
  FROM matches 
  WHERE user1_id = user_uuid OR user2_id = user_uuid;
  
  RETURN count_val;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- Utility functions and automated triggers
-- =====================================================

-- Function to get user's age
CREATE OR REPLACE FUNCTION get_age(birth_date DATE)
RETURNS INTEGER AS $$
BEGIN
  RETURN EXTRACT(YEAR FROM AGE(birth_date));
END;
$$ LANGUAGE plpgsql;

-- Function to get conversation summaries for a user
CREATE OR REPLACE FUNCTION get_user_conversations(user_uuid UUID)
RETURNS TABLE (
  other_user_id UUID,
  last_message_content TEXT,
  last_message_time TIMESTAMPTZ,
  unread_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH conversation_messages AS (
    SELECT 
      CASE 
        WHEN sender_id = user_uuid THEN receiver_id 
        ELSE sender_id 
      END as other_user_id,
      content,
      created_at,
      read,
      receiver_id,
      ROW_NUMBER() OVER (
        PARTITION BY 
          CASE 
            WHEN sender_id = user_uuid THEN receiver_id 
            ELSE sender_id 
          END 
        ORDER BY created_at DESC
      ) as rn
    FROM messages 
    WHERE sender_id = user_uuid OR receiver_id = user_uuid
  ),
  last_messages AS (
    SELECT 
      other_user_id,
      content as last_message_content,
      created_at as last_message_time
    FROM conversation_messages 
    WHERE rn = 1
  ),
  unread_counts AS (
    SELECT 
      sender_id as other_user_id,
      COUNT(*) as unread_count
    FROM messages 
    WHERE receiver_id = user_uuid AND read = false
    GROUP BY sender_id
  )
  SELECT 
    lm.other_user_id,
    lm.last_message_content,
    lm.last_message_time,
    COALESCE(uc.unread_count, 0) as unread_count
  FROM last_messages lm
  LEFT JOIN unread_counts uc ON lm.other_user_id = uc.other_user_id
  ORDER BY lm.last_message_time DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark conversation messages as read
CREATE OR REPLACE FUNCTION mark_conversation_read(user_uuid UUID, other_user_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE messages 
  SET read = true 
  WHERE sender_id = other_user_uuid 
    AND receiver_id = user_uuid 
    AND read = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically update profile updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to profiles table
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to send a gift transaction
CREATE OR REPLACE FUNCTION send_gift_transaction(
  p_sender_id UUID,
  p_receiver_id UUID,
  p_gift_id UUID,
  p_quantity INTEGER DEFAULT 1,
  p_total_cost INTEGER
)
RETURNS VOID AS $$
BEGIN
  -- Start transaction
  BEGIN
    -- Deduct coins from sender
    UPDATE profiles 
    SET coins = coins - p_total_cost 
    WHERE id = p_sender_id AND coins >= p_total_cost;
    
    -- Check if update was successful (sender had enough coins)
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Insufficient coins';
    END IF;
    
    -- Add coins to receiver (optional - you might want to give them coins for receiving gifts)
    -- UPDATE profiles 
    -- SET coins = coins + (p_total_cost / 10) 
    -- WHERE id = p_receiver_id;
    
    -- Record the gift transaction
    INSERT INTO gift_transactions (
      sender_id,
      receiver_id,
      gift_id,
      quantity,
      coins_spent,
      created_at
    ) VALUES (
      p_sender_id,
      p_receiver_id,
      p_gift_id,
      p_quantity,
      p_total_cost,
      NOW()
    );
    
    -- Commit transaction
    COMMIT;
  EXCEPTION
    WHEN OTHERS THEN
      -- Rollback on any error
      ROLLBACK;
      RAISE;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments for documentation
COMMENT ON FUNCTION update_user_online_status() IS 'Updates user online status based on session activity';
COMMENT ON FUNCTION expire_subscriptions() IS 'Automatically expires subscriptions that have passed their expiry date';
COMMENT ON FUNCTION get_user_active_subscription(UUID) IS 'Returns the active subscription data for a user';
COMMENT ON FUNCTION calculate_age(DATE) IS 'Calculates age from birth date';
COMMENT ON FUNCTION get_unread_message_count(UUID) IS 'Returns the number of unread messages for a user';
COMMENT ON FUNCTION get_match_count(UUID) IS 'Returns the number of matches for a user';
COMMENT ON FUNCTION get_age(DATE) IS 'Calculate age from birth date';
COMMENT ON FUNCTION get_user_conversations(UUID) IS 'Get conversation summaries for a user including last message and unread count';
COMMENT ON FUNCTION mark_conversation_read(UUID, UUID) IS 'Mark all messages in a conversation as read';
COMMENT ON FUNCTION update_updated_at_column() IS 'Automatically update updated_at timestamp'; 
COMMENT ON FUNCTION send_gift_transaction(UUID, UUID, UUID, INTEGER, INTEGER) IS 'Send a gift from one user to another, deducting coins and recording the transaction'; 