-- =====================================================
-- PROFILES TABLE
-- Main user profiles with all attributes and features
-- =====================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  gender TEXT DEFAULT 'male',
  birth_date DATE,
  country TEXT,
  city TEXT,
  bio TEXT,
  interests TEXT[] DEFAULT '{}',
  profession TEXT,
  languages TEXT[] DEFAULT '{}',
  photos TEXT[] DEFAULT '{}',
  verified BOOLEAN DEFAULT false,
  premium BOOLEAN DEFAULT false,
  coins INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Physical attributes
  height INTEGER, -- in cm
  weight INTEGER, -- in kg
  
  -- Appearance
  eye_color TEXT,
  hair_color TEXT,
  appearance_type TEXT,
  
  -- Lifestyle
  alcohol TEXT,
  smoking TEXT,
  children TEXT,
  
  -- Personal info
  religion TEXT,
  zodiac_sign TEXT,
  english_level TEXT,
  
  -- Special features
  has_intro_video BOOLEAN DEFAULT false,
  is_online BOOLEAN DEFAULT false,
  has_video BOOLEAN DEFAULT false,
  has_camera_on BOOLEAN DEFAULT false,
  birthday_soon BOOLEAN DEFAULT false,
  new_profile BOOLEAN DEFAULT false,
  top1000 BOOLEAN DEFAULT false,
  
  -- Chat subscription (JSONB)
  chat_subscription JSONB DEFAULT NULL
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Security Policies
CREATE POLICY "Users can read their own profile"
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow service role to insert profiles (for auth triggers and signup)
CREATE POLICY "Service role can insert profiles"
  ON profiles FOR INSERT TO service_role
  WITH CHECK (true);

-- Allow anon users to insert profiles during signup
CREATE POLICY "Allow profile creation during signup"
  ON profiles FOR INSERT TO anon
  WITH CHECK (true);

-- Allow public read access for browsing
CREATE POLICY "Public can read profiles for browsing"
  ON profiles FOR SELECT TO authenticated
  USING (true);

-- Indexes for performance
CREATE INDEX idx_profiles_gender ON profiles(gender);
CREATE INDEX idx_profiles_country ON profiles(country);
CREATE INDEX idx_profiles_verified ON profiles(verified);
CREATE INDEX idx_profiles_is_online ON profiles(is_online);
CREATE INDEX idx_profiles_created_at ON profiles(created_at);

-- Function to check if chat subscription is active
CREATE OR REPLACE FUNCTION is_chat_subscription_active(subscription_data JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  IF subscription_data IS NULL THEN
    RETURN FALSE;
  END IF;
  
  RETURN (subscription_data->>'expiresAt')::timestamp > NOW();
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE profiles IS 'Main user profiles with all personal and preference data';
COMMENT ON COLUMN profiles.chat_subscription IS 'JSON object containing subscription details: {type, expiresAt, purchasedAt}';
COMMENT ON FUNCTION is_chat_subscription_active(JSONB) IS 'Check if a chat subscription is still active based on expiry date'; 