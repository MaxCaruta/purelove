-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for users" ON transactions;
DROP POLICY IF EXISTS "Enable read access for users" ON subscription_purchases;
DROP POLICY IF EXISTS "Admins bypass RLS" ON transactions;
DROP POLICY IF EXISTS "Admins bypass RLS" ON subscription_purchases;

-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND (
        role = 'admin' 
        OR raw_app_meta_data->>'role' = 'admin'
        OR raw_user_meta_data->>'role' = 'admin'
      )
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get all transactions
CREATE OR REPLACE FUNCTION get_all_transactions()
RETURNS SETOF transactions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT auth.is_admin() THEN
    RAISE EXCEPTION 'Access denied. User is not an admin.';
  END IF;

  RETURN QUERY SELECT * FROM transactions ORDER BY created_at DESC;
END;
$$;

-- Create a function to get all subscription purchases
CREATE OR REPLACE FUNCTION get_all_subscription_purchases()
RETURNS SETOF subscription_purchases
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT auth.is_admin() THEN
    RAISE EXCEPTION 'Access denied. User is not an admin.';
  END IF;

  RETURN QUERY SELECT * FROM subscription_purchases ORDER BY created_at DESC;
END;
$$;

-- Create RLS policies for transactions
CREATE POLICY "Enable read access for users" ON transactions
FOR SELECT USING (
  auth.is_admin() OR auth.uid() = user_id
);

CREATE POLICY "Enable insert access for users" ON transactions
FOR INSERT WITH CHECK (
  auth.is_admin() OR auth.uid() = user_id
);

-- Create RLS policies for subscription_purchases
CREATE POLICY "Enable read access for users" ON subscription_purchases
FOR SELECT USING (
  auth.is_admin() OR auth.uid() = user_id
);

CREATE POLICY "Enable insert access for users" ON subscription_purchases
FOR INSERT WITH CHECK (
  auth.is_admin() OR auth.uid() = user_id
);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_all_transactions() TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_subscription_purchases() TO authenticated;
GRANT SELECT, INSERT ON transactions TO authenticated;
GRANT SELECT, INSERT ON subscription_purchases TO authenticated;

-- Make sure RLS is enabled
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_purchases ENABLE ROW LEVEL SECURITY;

-- Update admin user
UPDATE auth.users
SET role = 'admin',
    raw_app_meta_data = 
      CASE 
        WHEN raw_app_meta_data IS NULL THEN 
          jsonb_build_object('role', 'admin')
        ELSE 
          raw_app_meta_data || jsonb_build_object('role', 'admin')
      END
WHERE email = 'borsbogdan09@gmail.com';

-- Create a view to check admin status
CREATE OR REPLACE VIEW admin_status AS
SELECT 
  id,
  email,
  role,
  raw_app_meta_data->>'role' as meta_role,
  raw_user_meta_data->>'role' as user_meta_role,
  auth.is_admin() as is_admin
FROM auth.users
WHERE email = 'borsbogdan09@gmail.com';
