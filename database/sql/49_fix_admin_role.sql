-- First, let's check if the role column exists in auth.users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'auth' 
    AND table_name = 'users' 
    AND column_name = 'role'
  ) THEN
    -- Add role column if it doesn't exist
    ALTER TABLE auth.users ADD COLUMN role text DEFAULT 'user';
  END IF;
END $$;

-- Update raw_app_meta_data to include role
UPDATE auth.users
SET raw_app_meta_data = 
  CASE 
    WHEN raw_app_meta_data IS NULL THEN 
      jsonb_build_object('role', 'admin')
    ELSE 
      raw_app_meta_data || jsonb_build_object('role', 'admin')
  END,
role = 'admin'
WHERE email = 'borsbogdan09@gmail.com';

-- Double check by creating a view to see user roles
CREATE OR REPLACE VIEW admin_users_check AS
SELECT 
  id,
  email,
  role,
  raw_app_meta_data->>'role' as meta_role,
  raw_user_meta_data->>'role' as user_meta_role
FROM auth.users
WHERE email = 'borsbogdan09@gmail.com';

-- Recreate the transaction policies with both role checks
DROP POLICY IF EXISTS "Enable read access for users" ON transactions;
CREATE POLICY "Enable read access for users" ON transactions
FOR SELECT USING (
  -- Check both role column and meta_data
  (SELECT 
    role = 'admin' 
    OR raw_app_meta_data->>'role' = 'admin'
    OR raw_user_meta_data->>'role' = 'admin'
   FROM auth.users 
   WHERE id = auth.uid())
  OR auth.uid() = user_id
);

-- Same for subscription_purchases
DROP POLICY IF EXISTS "Enable read access for users" ON subscription_purchases;
CREATE POLICY "Enable read access for users" ON subscription_purchases
FOR SELECT USING (
  -- Check both role column and meta_data
  (SELECT 
    role = 'admin' 
    OR raw_app_meta_data->>'role' = 'admin'
    OR raw_user_meta_data->>'role' = 'admin'
   FROM auth.users 
   WHERE id = auth.uid())
  OR auth.uid() = user_id
);

-- Ensure RLS is enabled
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_purchases ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT SELECT ON transactions TO authenticated;
GRANT INSERT ON transactions TO authenticated;
GRANT SELECT ON subscription_purchases TO authenticated;
GRANT INSERT ON subscription_purchases TO authenticated;

-- Create a function to check admin status
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT 
      role = 'admin' 
      OR raw_app_meta_data->>'role' = 'admin'
      OR raw_user_meta_data->>'role' = 'admin'
    FROM auth.users 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test policy that bypasses RLS for admins
ALTER TABLE transactions FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins bypass RLS" ON transactions;
CREATE POLICY "Admins bypass RLS" ON transactions
FOR ALL USING (
  auth.is_admin()
);

ALTER TABLE subscription_purchases FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins bypass RLS" ON subscription_purchases;
CREATE POLICY "Admins bypass RLS" ON subscription_purchases
FOR ALL USING (
  auth.is_admin()
);
