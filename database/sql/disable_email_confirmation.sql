-- =====================================================
-- DISABLE EMAIL CONFIRMATION
-- Run this to disable email confirmation for easier testing
-- =====================================================

-- Disable email confirmation
UPDATE auth.config 
SET confirm_email_change = false,
    enable_signup = true,
    enable_confirmations = false;

-- Alternative: Update auth.users to mark existing users as confirmed
-- (Only run this if you want to confirm existing users)
-- UPDATE auth.users 
-- SET email_confirmed_at = NOW() 
-- WHERE email_confirmed_at IS NULL;

-- Check the current configuration
SELECT 
  confirm_email_change,
  enable_signup,
  enable_confirmations
FROM auth.config;

-- Success message
SELECT 'Email confirmation disabled successfully!' as status; 