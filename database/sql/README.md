# Dating App Database Schema

This folder contains all the SQL files needed to set up the complete database schema for the dating application.

## File Structure

```
database/sql/
├── 00_setup.sql              # Main setup file (runs all others)
├── 01_profiles.sql           # User profiles table
├── 02_messages.sql           # Chat messages table
├── 03_matches.sql            # User matches table
├── 04_likes.sql              # User likes table
├── 05_transactions.sql       # Payment transactions table
├── 06_gifts.sql              # Available gifts catalog
├── 07_gift_transactions.sql  # Gift sending history
├── 08_subscriptions.sql      # Subscription plans
├── 09_subscription_purchases.sql # Subscription purchase history
├── 10_user_sessions.sql      # Online status tracking
├── 11_functions_and_triggers.sql # Helper functions and triggers
├── 12_sample_data.sql        # Sample data for testing
├── 13_auth_triggers.sql      # Auth triggers for profile creation
└── README.md                 # This file
```

## Quick Setup

### Option 1: Run All Files at Once
```sql
-- In your Supabase SQL editor, run:
\i 00_setup.sql
```

### Option 2: Run Files Individually
If you prefer to run files individually, run them in this order:

1. `01_profiles.sql`
2. `02_messages.sql`
3. `03_matches.sql`
4. `04_likes.sql`
5. `05_transactions.sql`
6. `06_gifts.sql`
7. `07_gift_transactions.sql`
8. `08_subscriptions.sql`
9. `09_subscription_purchases.sql`
10. `10_user_sessions.sql`
11. `11_functions_and_triggers.sql`
12. `13_auth_triggers.sql`
13. `12_sample_data.sql`

## Tables Overview

### Core Tables
- **profiles**: Main user profiles with all personal data
- **messages**: Chat messages between users
- **matches**: User matches when both users like each other
- **likes**: User likes/interests in other profiles

### Payment & Economy
- **transactions**: Payment transactions and coin purchases
- **gifts**: Available gifts catalog
- **gift_transactions**: Gift sending history
- **subscriptions**: Available subscription plans
- **subscription_purchases**: Subscription purchase history

### System Tables
- **user_sessions**: Online status tracking

## Key Features

### Row Level Security (RLS)
All tables have RLS enabled with appropriate policies to ensure users can only access their own data.

### Indexes
Performance indexes are created on frequently queried columns.

### Helper Functions
- `is_chat_subscription_active()`: Check if subscription is active
- `update_user_online_status()`: Update online status automatically
- `expire_subscriptions()`: Automatically expire subscriptions
- `get_user_active_subscription()`: Get user's active subscription
- `calculate_age()`: Calculate age from birth date
- `get_unread_message_count()`: Get unread message count
- `get_match_count()`: Get user's match count

### Triggers
- Automatic online status updates when sessions change
- **Automatic profile creation** when users sign up
- **Automatic profile updates** when user data changes
- **Automatic cleanup** when users are deleted

### Authentication Integration
- **Automatic profile creation**: When a user signs up through Supabase Auth, a profile is automatically created
- **Profile synchronization**: Profile data stays in sync with auth user data
- **Cascade deletion**: When a user is deleted, all related data is cleaned up

## Environment Variables

Add these to your `.env` file:
```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Sample Data

The `12_sample_data.sql` file includes:
- 10 sample gifts with different categories and prices
- 3 subscription plans (weekly, monthly, premium)
- Sample coins for existing users

## Notes

- All tables use UUID primary keys for security
- Foreign key relationships are properly set up with CASCADE deletes
- JSONB fields are used for flexible data storage (subscriptions, features)
- Timestamps are in UTC (TIMESTAMPTZ)
- All monetary values use DECIMAL(10,2) for precision
- **Auth integration**: Profiles are automatically created when users sign up

## Troubleshooting

If you encounter errors:
1. Make sure you're running the files in the correct order
2. Check that Supabase extensions are enabled
3. Verify your Supabase project has the necessary permissions
4. Check the Supabase logs for detailed error messages

### "Database error saving new user" Error

If you encounter this error during signup, follow these steps:

1. **Reset the database:**
   ```sql
   -- Drop all tables and recreate them
   \i 00_setup.sql
   ```

2. **Check if profiles table exists:**
   ```sql
   SELECT EXISTS (
     SELECT FROM information_schema.tables 
     WHERE table_name = 'profiles'
   );
   ```

3. **Verify auth trigger:**
   ```sql
   SELECT trigger_name FROM information_schema.triggers 
   WHERE trigger_name = 'on_auth_user_created';
   ```

4. **Test manual profile creation:**
   ```sql
   -- This should work without errors
   INSERT INTO profiles (id, first_name, last_name) 
   VALUES (gen_random_uuid(), 'Test', 'User');
   ```

### Common Issues

- **GIN Index Error**: The profiles table no longer has problematic GIN indexes
- **RLS Policy Issues**: All policies are created with proper permissions
- **Trigger Conflicts**: Auth triggers now handle errors gracefully

## Support

If you continue to have issues, check the Supabase logs in your project dashboard for more detailed error information. 