-- Create RPC function to get all transactions
CREATE OR REPLACE FUNCTION get_all_transactions()
RETURNS TABLE (
  id uuid,
  created_at timestamptz,
  user_id uuid,
  amount numeric,
  currency text,
  status text,
  payment_method text,
  description text,
  transaction_type text,
  subscription_id uuid,
  gift_id uuid,
  profile_id uuid
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if user is admin
  IF NOT auth.is_admin() THEN
    RAISE EXCEPTION 'Access denied. User is not an admin.';
  END IF;

  -- Return all transactions
  RETURN QUERY
  SELECT t.*
  FROM transactions t
  ORDER BY t.created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_all_transactions() TO authenticated;

-- Create RPC function to get all subscription purchases
CREATE OR REPLACE FUNCTION get_all_subscription_purchases()
RETURNS TABLE (
  id uuid,
  created_at timestamptz,
  user_id uuid,
  subscription_id uuid,
  status text,
  start_date timestamptz,
  end_date timestamptz,
  auto_renew boolean,
  payment_method text,
  amount numeric,
  currency text
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if user is admin
  IF NOT auth.is_admin() THEN
    RAISE EXCEPTION 'Access denied. User is not an admin.';
  END IF;

  -- Return all subscription purchases
  RETURN QUERY
  SELECT sp.*
  FROM subscription_purchases sp
  ORDER BY sp.created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_all_subscription_purchases() TO authenticated;
