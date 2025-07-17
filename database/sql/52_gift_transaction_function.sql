-- =====================================================
-- GIFT TRANSACTION FUNCTION
-- Function to handle gift sending between users
-- =====================================================

-- Function to send a gift transaction
CREATE OR REPLACE FUNCTION send_gift_transaction(
  p_sender_id UUID,
  p_receiver_id UUID,
  p_gift_id UUID,
  p_quantity INTEGER DEFAULT 1,
  p_total_cost INTEGER DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  gift_price INTEGER;
  calculated_cost INTEGER;
BEGIN
  -- If total_cost is not provided, calculate it from the gift price
  IF p_total_cost IS NULL THEN
    SELECT price INTO gift_price FROM gifts WHERE id = p_gift_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Gift not found';
    END IF;
    calculated_cost := gift_price * p_quantity;
  ELSE
    calculated_cost := p_total_cost;
  END IF;

  -- Deduct coins from sender
  UPDATE profiles 
  SET coins = coins - calculated_cost 
  WHERE id = p_sender_id AND coins >= calculated_cost;
  
  -- Check if update was successful (sender had enough coins)
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient coins';
  END IF;
  
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
    calculated_cost,
    NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments for documentation
COMMENT ON FUNCTION send_gift_transaction(UUID, UUID, UUID, INTEGER, INTEGER) IS 'Send a gift from one user to another, deducting coins and recording the transaction'; 