-- Add foreign key from transactions to profiles
ALTER TABLE transactions
DROP CONSTRAINT IF EXISTS transactions_user_id_fkey;

ALTER TABLE transactions
ADD CONSTRAINT transactions_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES profiles(id)
ON DELETE CASCADE;

-- Add foreign key from subscription_purchases to profiles
ALTER TABLE subscription_purchases
DROP CONSTRAINT IF EXISTS subscription_purchases_user_id_fkey;

ALTER TABLE subscription_purchases
ADD CONSTRAINT subscription_purchases_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES profiles(id)
ON DELETE CASCADE;

-- Add indexes for better join performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_purchases_user_id ON subscription_purchases(user_id);
