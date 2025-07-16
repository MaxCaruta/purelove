-- Simple admin fix without modifying auth schema
-- This approach uses public functions and policies

-- Create a simple admin check function in public schema
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND email = 'borsbogdan09@gmail.com'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get all transactions for admin
CREATE OR REPLACE FUNCTION get_all_transactions_admin()
RETURNS SETOF transactions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is the admin email
  IF NOT is_admin_user() THEN
    RAISE EXCEPTION 'Access denied. Admin access required.';
  END IF;
  
  RETURN QUERY SELECT * FROM transactions ORDER BY created_at DESC;
END;
$$;

-- Create function to get all subscription purchases for admin
CREATE OR REPLACE FUNCTION get_all_subscription_purchases_admin()
RETURNS SETOF subscription_purchases
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is the admin email
  IF NOT is_admin_user() THEN
    RAISE EXCEPTION 'Access denied. Admin access required.';
  END IF;
  
  RETURN QUERY SELECT * FROM subscription_purchases ORDER BY created_at DESC;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION is_admin_user() TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_transactions_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_subscription_purchases_admin() TO authenticated;

-- Create simple RLS policies that allow the admin email
DROP POLICY IF EXISTS "Enable read access for users" ON transactions;
CREATE POLICY "Enable read access for users" ON transactions
FOR SELECT USING (
  is_admin_user() OR auth.uid() = user_id
);

DROP POLICY IF EXISTS "Enable read access for users" ON subscription_purchases;
CREATE POLICY "Enable read access for users" ON subscription_purchases
FOR SELECT USING (
  is_admin_user() OR auth.uid() = user_id
);

-- Ensure RLS is enabled
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_purchases ENABLE ROW LEVEL SECURITY;

-- Grant basic permissions
GRANT SELECT ON transactions TO authenticated;
GRANT SELECT ON subscription_purchases TO authenticated; 