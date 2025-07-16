-- Add new columns for filters
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS eye_color text DEFAULT '',
  ADD COLUMN IF NOT EXISTS hair_color text DEFAULT '',
  ADD COLUMN IF NOT EXISTS appearance_type text DEFAULT '',
  ADD COLUMN IF NOT EXISTS alcohol text DEFAULT '',
  ADD COLUMN IF NOT EXISTS smoking text DEFAULT '',
  ADD COLUMN IF NOT EXISTS children text DEFAULT '',
  ADD COLUMN IF NOT EXISTS religion text DEFAULT '',
  ADD COLUMN IF NOT EXISTS zodiac_sign text DEFAULT '',
  ADD COLUMN IF NOT EXISTS english_level text DEFAULT '',
  ADD COLUMN IF NOT EXISTS has_intro_video boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_online boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_video boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_camera_on boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS birthday_soon boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS new_profile boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS top_1000 boolean DEFAULT false;

-- Add comments to describe the columns
COMMENT ON COLUMN public.profiles.eye_color IS 'User''s eye color';
COMMENT ON COLUMN public.profiles.hair_color IS 'User''s hair color';
COMMENT ON COLUMN public.profiles.appearance_type IS 'User''s body type/appearance (e.g., slim, athletic, etc.)';
COMMENT ON COLUMN public.profiles.alcohol IS 'User''s alcohol consumption habits';
COMMENT ON COLUMN public.profiles.smoking IS 'User''s smoking habits';
COMMENT ON COLUMN public.profiles.children IS 'User''s preference regarding children';
COMMENT ON COLUMN public.profiles.religion IS 'User''s religious beliefs';
COMMENT ON COLUMN public.profiles.zodiac_sign IS 'User''s zodiac sign';
COMMENT ON COLUMN public.profiles.english_level IS 'User''s English proficiency level';
COMMENT ON COLUMN public.profiles.has_intro_video IS 'Whether user has an introduction video';
COMMENT ON COLUMN public.profiles.is_online IS 'Whether user is currently online';
COMMENT ON COLUMN public.profiles.has_video IS 'Whether user has any video content';
COMMENT ON COLUMN public.profiles.has_camera_on IS 'Whether user has camera enabled';
COMMENT ON COLUMN public.profiles.birthday_soon IS 'Whether user''s birthday is approaching';
COMMENT ON COLUMN public.profiles.new_profile IS 'Whether this is a recently created profile';
COMMENT ON COLUMN public.profiles.top_1000 IS 'Whether user is in top 1000 profiles';

-- Create indexes for commonly filtered columns
CREATE INDEX IF NOT EXISTS idx_profiles_eye_color ON public.profiles(eye_color);
CREATE INDEX IF NOT EXISTS idx_profiles_hair_color ON public.profiles(hair_color);
CREATE INDEX IF NOT EXISTS idx_profiles_appearance_type ON public.profiles(appearance_type);
CREATE INDEX IF NOT EXISTS idx_profiles_religion ON public.profiles(religion);
CREATE INDEX IF NOT EXISTS idx_profiles_english_level ON public.profiles(english_level);
CREATE INDEX IF NOT EXISTS idx_profiles_is_online ON public.profiles(is_online);
CREATE INDEX IF NOT EXISTS idx_profiles_verified ON public.profiles(verified);

-- Add check constraints for enumerated values
ALTER TABLE public.profiles
  ADD CONSTRAINT check_eye_color CHECK (
    eye_color = ANY (ARRAY['', 'blue', 'brown', 'green', 'hazel', 'other'])
  ),
  ADD CONSTRAINT check_hair_color CHECK (
    hair_color = ANY (ARRAY['', 'black', 'blonde', 'brunette', 'red', 'other'])
  ),
  ADD CONSTRAINT check_appearance_type CHECK (
    appearance_type = ANY (ARRAY['', 'slim', 'athletic', 'average', 'curvy', 'other'])
  ),
  ADD CONSTRAINT check_alcohol CHECK (
    alcohol = ANY (ARRAY['', 'never', 'rarely', 'socially', 'regularly'])
  ),
  ADD CONSTRAINT check_smoking CHECK (
    smoking = ANY (ARRAY['', 'never', 'rarely', 'regularly', 'trying to quit'])
  ),
  ADD CONSTRAINT check_children CHECK (
    children = ANY (ARRAY['', 'have', 'want', 'maybe', 'no'])
  ),
  ADD CONSTRAINT check_religion CHECK (
    religion = ANY (ARRAY['', 'christian', 'catholic', 'orthodox', 'muslim', 'jewish', 'buddhist', 'hindu', 'other', 'none'])
  ),
  ADD CONSTRAINT check_english_level CHECK (
    english_level = ANY (ARRAY['', 'basic', 'intermediate', 'advanced', 'fluent', 'native'])
  );

-- Add function to automatically set new_profile flag
CREATE OR REPLACE FUNCTION set_new_profile() RETURNS trigger AS $$
BEGIN
  IF NEW.created_at >= NOW() - INTERVAL '30 days' THEN
    NEW.new_profile := true;
  ELSE
    NEW.new_profile := false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set new_profile flag
DROP TRIGGER IF EXISTS set_new_profile_trigger ON public.profiles;
CREATE TRIGGER set_new_profile_trigger
  BEFORE INSERT OR UPDATE OF created_at
  ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_new_profile();

-- Add function to automatically set birthday_soon flag
CREATE OR REPLACE FUNCTION set_birthday_soon() RETURNS trigger AS $$
BEGIN
  IF NEW.birth_date IS NOT NULL THEN
    NEW.birthday_soon := (
      TO_CHAR(NEW.birth_date, 'MMDD') BETWEEN 
      TO_CHAR(NOW(), 'MMDD') AND 
      TO_CHAR(NOW() + INTERVAL '30 days', 'MMDD')
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set birthday_soon flag
DROP TRIGGER IF EXISTS set_birthday_soon_trigger ON public.profiles;
CREATE TRIGGER set_birthday_soon_trigger
  BEFORE INSERT OR UPDATE OF birth_date
  ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_birthday_soon();

-- Add function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at timestamp
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE
    ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 