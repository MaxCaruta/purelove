-- Drop all existing policies for transactions
DROP POLICY IF EXISTS "Users can read their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON transactions;
DROP POLICY IF EXISTS "Admins can read all transactions" ON transactions;
DROP POLICY IF EXISTS "Users can read their own gift transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert their own gift transactions" ON transactions;

-- Create simplified policies for transactions
CREATE POLICY "Enable read access for users" ON transactions
FOR SELECT USING (
  -- Allow if user is admin
  (SELECT role = 'admin' FROM auth.users WHERE id = auth.uid())
  -- Or if it's their own transaction
  OR auth.uid() = user_id
);

CREATE POLICY "Enable insert for users" ON transactions
FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

-- Drop all existing policies for subscription_purchases
DROP POLICY IF EXISTS "Users can read their own subscriptions" ON subscription_purchases;
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON subscription_purchases;
DROP POLICY IF EXISTS "Admins can read all subscriptions" ON subscription_purchases;

-- Create simplified policies for subscription_purchases
CREATE POLICY "Enable read access for users" ON subscription_purchases
FOR SELECT USING (
  -- Allow if user is admin
  (SELECT role = 'admin' FROM auth.users WHERE id = auth.uid())
  -- Or if it's their own subscription
  OR auth.uid() = user_id
);

CREATE POLICY "Enable insert for users" ON subscription_purchases
FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

-- Make sure RLS is enabled
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_purchases ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT SELECT ON transactions TO authenticated;
GRANT INSERT ON transactions TO authenticated;
GRANT SELECT ON subscription_purchases TO authenticated;
GRANT INSERT ON subscription_purchases TO authenticated;

-- Add admin role to auth.users if not exists
DO $$
BEGIN
  ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';
  EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Update your user to be admin (replace with your user's ID)
UPDATE auth.users 
SET role = 'admin' 
WHERE email = 'borsbogdan09@gmail.com';
