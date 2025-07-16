-- =====================================================
-- DATING APP DATABASE SETUP
-- Complete database schema for the dating application
-- =====================================================

-- This file sets up the complete database schema
-- Run this file to create all tables, policies, and sample data

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set timezone
SET timezone = 'UTC';

-- Clean up any existing tables that might conflict
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS likes CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS gifts CASCADE;
DROP TABLE IF EXISTS gift_transactions CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS subscription_purchases CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;

-- Drop any existing functions
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS handle_user_update() CASCADE;
DROP FUNCTION IF EXISTS handle_user_deletion() CASCADE;
DROP FUNCTION IF EXISTS is_chat_subscription_active(JSONB) CASCADE;

-- Comments for documentation
COMMENT ON SCHEMA public IS 'PureLove dating platform database schema';

-- Create all tables in order
\i 01_profiles.sql
\i 02_messages.sql
\i 03_matches.sql
\i 04_likes.sql
\i 05_transactions.sql
\i 06_gifts.sql
\i 07_gift_transactions.sql
\i 08_subscriptions.sql
\i 09_subscription_purchases.sql
\i 10_user_sessions.sql

-- Create functions and triggers
\i 11_functions_and_triggers.sql

-- Create auth triggers for automatic profile creation
\i 13_auth_triggers.sql

-- Insert sample data
\i 12_sample_data.sql

-- Final setup message
DO $$
BEGIN
  RAISE NOTICE 'Database setup completed successfully!';
  RAISE NOTICE 'All tables, policies, and sample data have been created.';
  RAISE NOTICE 'Auth triggers are set up for automatic profile creation.';
  RAISE NOTICE 'You can now connect your application to Supabase.';
END $$; 