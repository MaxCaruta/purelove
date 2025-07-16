-- Drop existing policies
DROP POLICY IF EXISTS "Users can read their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON transactions;
DROP POLICY IF EXISTS "Admins can read all transactions" ON transactions;

-- Create new policies
CREATE POLICY "Users can read their own transactions"
ON transactions FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND (
      profiles.role IN ('admin', 'super_admin') OR
      EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND (
          auth.users.raw_app_meta_data->>'role' IN ('admin', 'super_admin') OR
          auth.users.raw_user_meta_data->>'role' IN ('admin', 'super_admin')
        )
      )
    )
  )
);

CREATE POLICY "Users can insert their own transactions"
ON transactions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Drop existing policies for subscription_purchases
DROP POLICY IF EXISTS "Users can read their own subscriptions" ON subscription_purchases;
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON subscription_purchases;
DROP POLICY IF EXISTS "Admins can read all subscriptions" ON subscription_purchases;

-- Create new policies for subscription_purchases
CREATE POLICY "Users can read their own subscriptions"
ON subscription_purchases FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND (
      profiles.role IN ('admin', 'super_admin') OR
      EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND (
          auth.users.raw_app_meta_data->>'role' IN ('admin', 'super_admin') OR
          auth.users.raw_user_meta_data->>'role' IN ('admin', 'super_admin')
        )
      )
    )
  )
);

CREATE POLICY "Users can insert their own subscriptions"
ON subscription_purchases FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Enable RLS on both tables if not already enabled
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_purchases ENABLE ROW LEVEL SECURITY;

-- Add role to profiles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'user';
    ALTER TABLE profiles ADD CONSTRAINT check_role_valid 
      CHECK (role IN ('user', 'admin', 'super_admin', 'model'));
  END IF;
END $$;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND (
      profiles.role IN ('admin', 'super_admin') OR
      EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND (
          auth.users.raw_app_meta_data->>'role' IN ('admin', 'super_admin') OR
          auth.users.raw_user_meta_data->>'role' IN ('admin', 'super_admin')
        )
      )
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin() TO service_role;

-- Update the policies to use the function
CREATE POLICY "Admins can read all transactions"
ON transactions FOR SELECT
TO authenticated
USING (is_admin() OR auth.uid() = user_id);

CREATE POLICY "Admins can read all subscriptions"
ON subscription_purchases FOR SELECT
TO authenticated
USING (is_admin() OR auth.uid() = user_id);
