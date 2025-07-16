-- =====================================================
-- ADD SAMPLE MODEL PROFILES
-- Add some model profiles for the browse page to display
-- =====================================================

-- First, let's check if we have any model profiles
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
  top1000,
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
    ('United States'), ('Canada'), ('United Kingdom'), ('Australia'), ('Germany'),
    ('France'), ('Italy'), ('Spain'), ('Netherlands'), ('Sweden'),
    ('Norway'), ('Denmark'), ('Finland'), ('Switzerland'), ('Austria'),
    ('Belgium'), ('Ireland'), ('New Zealand'), ('Japan'), ('South Korea')
) AS countries(country),
(
  VALUES 
    ('New York'), ('Los Angeles'), ('Chicago'), ('Houston'), ('Phoenix'),
    ('Philadelphia'), ('San Antonio'), ('San Diego'), ('Dallas'), ('San Jose'),
    ('Austin'), ('Jacksonville'), ('Fort Worth'), ('Columbus'), ('Charlotte'),
    ('San Francisco'), ('Indianapolis'), ('Seattle'), ('Denver'), ('Washington')
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
    (ARRAY['English', 'Spanish']),
    (ARRAY['English', 'French']),
    (ARRAY['English', 'German']),
    (ARRAY['English', 'Italian']),
    (ARRAY['English', 'Portuguese']),
    (ARRAY['English', 'Dutch']),
    (ARRAY['English', 'Swedish']),
    (ARRAY['English', 'Norwegian']),
    (ARRAY['English', 'Danish']),
    (ARRAY['English', 'Japanese'])
) AS languages(languages),
(
  VALUES 
    (ARRAY['https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400']),
    (ARRAY['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400']),
    (ARRAY['https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400']),
    (ARRAY['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400']),
    (ARRAY['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400']),
    (ARRAY['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400']),
    (ARRAY['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400']),
    (ARRAY['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400']),
    (ARRAY['https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400']),
    (ARRAY['https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400'])
) AS photos(photos)
WHERE NOT EXISTS (
  SELECT 1 FROM profiles WHERE role = 'model' LIMIT 1
)
LIMIT 20;

-- Check how many model profiles we now have
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

SELECT 'Sample model profiles added successfully!' as status; 