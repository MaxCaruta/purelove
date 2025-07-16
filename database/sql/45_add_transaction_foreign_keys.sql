-- Add foreign key constraints for transactions and subscription_purchases tables

-- Add foreign key for transactions.user_id
ALTER TABLE public.transactions
ADD CONSTRAINT transactions_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Add foreign key for subscription_purchases.user_id
ALTER TABLE public.subscription_purchases
ADD CONSTRAINT subscription_purchases_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Create view for user profiles with transactions
CREATE OR REPLACE VIEW public.transaction_profiles AS
SELECT 
  t.id as transaction_id,
  t.user_id,
  p.first_name,
  p.last_name
FROM public.transactions t
JOIN public.profiles p ON p.id = t.user_id;

-- Create view for user profiles with subscriptions
CREATE OR REPLACE VIEW public.subscription_profiles AS
SELECT 
  sp.id as subscription_purchase_id,
  sp.user_id,
  p.first_name,
  p.last_name
FROM public.subscription_purchases sp
JOIN public.profiles p ON p.id = sp.user_id;
