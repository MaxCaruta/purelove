-- =====================================================
-- COMPREHENSIVE FIX FOR PROFILES AND STORAGE
-- Fixes profiles access and ensures storage buckets exist
-- =====================================================

-- 1. FIX RLS POLICIES FOR PROFILES
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Public can read profiles for browsing" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can read all profiles" ON profiles;

-- Create a new policy that allows both authenticated and anonymous users to read profiles
CREATE POLICY "Public can read profiles for browsing"
  ON profiles FOR SELECT TO authenticated, anon
  USING (true);

-- 2. CREATE STORAGE BUCKETS IF THEY DON'T EXIST
-- Create profile-photos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-photos',
  'profile-photos', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create chat-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-images',
  'chat-images', 
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- 3. CREATE STORAGE POLICIES
-- Drop existing storage policies
DROP POLICY IF EXISTS "Allow authenticated uploads to profile-photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to profile-photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete from profile-photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated update to profile-photos" ON storage.objects;

-- Create new storage policies for profile-photos
CREATE POLICY "Allow authenticated uploads to profile-photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profile-photos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow public read access to profile-photos" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-photos');

CREATE POLICY "Allow authenticated delete from profile-photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profile-photos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated update to profile-photos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profile-photos' 
  AND auth.role() = 'authenticated'
);

-- Create storage policies for chat-images
DROP POLICY IF EXISTS "Allow authenticated uploads to chat-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to chat-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete from chat-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated update to chat-images" ON storage.objects;

CREATE POLICY "Allow authenticated uploads to chat-images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'chat-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow public read access to chat-images" ON storage.objects
FOR SELECT USING (bucket_id = 'chat-images');

CREATE POLICY "Allow authenticated delete from chat-images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'chat-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated update to chat-images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'chat-images' 
  AND auth.role() = 'authenticated'
);

-- 4. ADD SAMPLE MODEL PROFILES WITH WORKING IMAGE URLS
-- First, check if we have any model profiles
SELECT COUNT(*) as model_count FROM profiles WHERE role = 'model';

-- Add sample model profiles if none exist
INSERT INTO profiles (
  id,
  first_name,
  last_name,
  gender,
  birth_date,
  country,
  city,
  bio,
  interests,
  profession,
  languages,
  photos,
  verified,
  role,
  is_online,
  has_video,
  has_camera_on,
  new_profile,
  top_1000,
  created_at,
  updated_at
) 
SELECT 
  gen_random_uuid(),
  first_names.name,
  last_names.name,
  'female',
  (CURRENT_DATE - INTERVAL '18 years' - (random() * INTERVAL '15 years'))::date,
  countries.country,
  cities.city,
  bios.bio,
  interests.interests,
  professions.profession,
  languages.languages,
  photos.photos,
  true,
  'model',
  random() > 0.5,
  random() > 0.3,
  random() > 0.4,
  random() > 0.7,
  random() > 0.8,
  NOW() - (random() * INTERVAL '30 days'),
  NOW()
FROM (
  VALUES 
    ('Emma'), ('Sophia'), ('Olivia'), ('Ava'), ('Isabella'),
    ('Mia'), ('Charlotte'), ('Amelia'), ('Harper'), ('Evelyn'),
    ('Abigail'), ('Emily'), ('Elizabeth'), ('Sofia'), ('Madison'),
    ('Avery'), ('Ella'), ('Scarlett'), ('Grace'), ('Chloe')
) AS first_names(name),
(
  VALUES 
    ('Smith'), ('Johnson'), ('Williams'), ('Brown'), ('Jones'),
    ('Garcia'), ('Miller'), ('Davis'), ('Rodriguez'), ('Martinez'),
    ('Hernandez'), ('Lopez'), ('Gonzalez'), ('Wilson'), ('Anderson'),
    ('Thomas'), ('Taylor'), ('Moore'), ('Jackson'), ('Martin')
) AS last_names(name),
(
  VALUES 
    ('Ukraine'), ('Russia'), ('Belarus'), ('Poland'), ('Czech Republic'),
    ('Slovakia'), ('Hungary'), ('Romania'), ('Bulgaria'), ('Serbia'),
    ('Croatia'), ('Slovenia'), ('Latvia'), ('Lithuania'), ('Estonia'),
    ('Moldova'), ('Armenia'), ('Azerbaijan'), ('Georgia'), ('Kazakhstan')
) AS countries(country),
(
  VALUES 
    ('Kyiv'), ('Moscow'), ('Minsk'), ('Warsaw'), ('Prague'),
    ('Bratislava'), ('Budapest'), ('Bucharest'), ('Sofia'), ('Belgrade'),
    ('Zagreb'), ('Ljubljana'), ('Riga'), ('Vilnius'), ('Tallinn'),
    ('Chisinau'), ('Yerevan'), ('Baku'), ('Tbilisi'), ('Almaty')
) AS cities(city),
(
  VALUES 
    ('I love traveling and meeting new people from around the world. Looking for meaningful connections and great conversations.'),
    ('Passionate about art, music, and culture. I enjoy deep conversations and learning about different perspectives.'),
    ('Adventure seeker who loves hiking, photography, and exploring new places. Let''s share stories and experiences.'),
    ('Creative soul who finds joy in cooking, reading, and spending time with friends. Looking for genuine connections.'),
    ('Fitness enthusiast who believes in living life to the fullest. Love trying new activities and meeting interesting people.'),
    ('Nature lover with a passion for environmental causes. I enjoy outdoor activities and meaningful conversations.'),
    ('Music lover who plays guitar and sings. Looking for someone to share melodies and life experiences with.'),
    ('Foodie who loves exploring new cuisines and restaurants. Let''s discover amazing flavors together.'),
    ('Bookworm who finds magic in stories and words. Looking for someone to discuss literature and life with.'),
    ('Yoga instructor who believes in mindfulness and positive energy. Seeking meaningful and authentic connections.')
) AS bios(bio),
(
  VALUES 
    (ARRAY['travel', 'photography', 'cooking']),
    (ARRAY['art', 'music', 'museums']),
    (ARRAY['hiking', 'adventure', 'nature']),
    (ARRAY['reading', 'writing', 'coffee']),
    (ARRAY['fitness', 'running', 'healthy living']),
    (ARRAY['environment', 'sustainability', 'outdoors']),
    (ARRAY['music', 'guitar', 'concerts']),
    (ARRAY['food', 'cooking', 'restaurants']),
    (ARRAY['books', 'literature', 'poetry']),
    (ARRAY['yoga', 'meditation', 'wellness'])
) AS interests(interests),
(
  VALUES 
    ('Photographer'), ('Artist'), ('Teacher'), ('Nurse'), ('Engineer'),
    ('Designer'), ('Writer'), ('Chef'), ('Doctor'), ('Architect'),
    ('Lawyer'), ('Consultant'), ('Manager'), ('Analyst'), ('Developer'),
    ('Marketing'), ('Sales'), ('HR'), ('Finance'), ('Research')
) AS professions(profession),
(
  VALUES 
    (ARRAY['English', 'Ukrainian']),
    (ARRAY['English', 'Russian']),
    (ARRAY['English', 'Belarusian']),
    (ARRAY['English', 'Polish']),
    (ARRAY['English', 'Czech']),
    (ARRAY['English', 'Slovak']),
    (ARRAY['English', 'Hungarian']),
    (ARRAY['English', 'Romanian']),
    (ARRAY['English', 'Bulgarian']),
    (ARRAY['English', 'Serbian'])
) AS languages(languages),
(
  VALUES 
    -- Using reliable placeholder images that should work
    (ARRAY['https://via.placeholder.com/400x600/FF6B6B/FFFFFF?text=Emma']),
    (ARRAY['https://via.placeholder.com/400x600/4ECDC4/FFFFFF?text=Sophia']),
    (ARRAY['https://via.placeholder.com/400x600/45B7D1/FFFFFF?text=Olivia']),
    (ARRAY['https://via.placeholder.com/400x600/96CEB4/FFFFFF?text=Ava']),
    (ARRAY['https://via.placeholder.com/400x600/FFEAA7/FFFFFF?text=Isabella']),
    (ARRAY['https://via.placeholder.com/400x600/DDA0DD/FFFFFF?text=Mia']),
    (ARRAY['https://via.placeholder.com/400x600/98D8C8/FFFFFF?text=Charlotte']),
    (ARRAY['https://via.placeholder.com/400x600/F7DC6F/FFFFFF?text=Amelia']),
    (ARRAY['https://via.placeholder.com/400x600/BB8FCE/FFFFFF?text=Harper']),
    (ARRAY['https://via.placeholder.com/400x600/85C1E9/FFFFFF?text=Evelyn'])
) AS photos(photos)
WHERE NOT EXISTS (
  SELECT 1 FROM profiles WHERE role = 'model' LIMIT 1
)
LIMIT 20;

-- 5. VERIFY THE FIXES
-- Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'profiles' 
AND policyname LIKE '%browsing%';

-- Check storage buckets
SELECT name, public, file_size_limit FROM storage.buckets WHERE name IN ('profile-photos', 'chat-images');

-- Check model profiles count
SELECT COUNT(*) as total_model_profiles FROM profiles WHERE role = 'model';

-- Show a sample of the model profiles
SELECT 
  id,
  first_name,
  last_name,
  country,
  city,
  verified,
  is_online,
  created_at
FROM profiles 
WHERE role = 'model' 
ORDER BY created_at DESC 
LIMIT 5;

SELECT 'Comprehensive profiles and storage fix completed successfully!' as status; 