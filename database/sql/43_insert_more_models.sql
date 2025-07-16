-- Insert more model profiles into the database
-- This script adds a variety of models with different backgrounds and characteristics

-- Function to create model profiles
CREATE OR REPLACE FUNCTION create_model_profile(
  model_first_name text,
  model_last_name text,
  model_gender text,
  model_birth_date date,
  model_country text,
  model_city text,
  model_profession text,
  model_languages text[],
  model_bio text,
  model_photos text[],
  model_coins integer DEFAULT 1000
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public
AS $$
DECLARE
  new_user_id uuid;
  random_password text;
  user_email text;
  base_email text;
  suffix text;
  created_user json;
BEGIN
  -- Generate base email
  base_email := lower(model_first_name || '.' || model_last_name || '@model.lcn.com');
  user_email := base_email;
  -- Ensure email is unique
  WHILE EXISTS (SELECT 1 FROM auth.users WHERE email = user_email) LOOP
    suffix := lpad((trunc(random()*10000))::int::text, 4, '0');
    user_email := lower(model_first_name || '.' || model_last_name || suffix || '@model.lcn.com');
  END LOOP;

  random_password := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
  new_user_id := gen_random_uuid();
  
  -- Create the user in auth.users
  INSERT INTO auth.users (
    id, email, raw_user_meta_data, raw_app_meta_data, is_super_admin,
    encrypted_password, email_confirmed_at, created_at, updated_at, last_sign_in_at,
    aud, role, confirmation_sent_at, email_change_sent_at, recovery_sent_at,
    instance_id, email_change, phone_change, phone_confirmed_at, banned_until,
    reauthentication_sent_at, is_sso_user
  )
  VALUES (
    new_user_id, user_email,
    jsonb_build_object('role', 'model'),
    jsonb_build_object('provider', 'email'),
    false, md5(random_password), now(), now(), now(), now(),
    'authenticated', 'authenticated', null, null, null,
    '00000000-0000-0000-0000-000000000000'::uuid, null, null, null, null, null, false
  );

  -- Create identities record
  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, created_at, updated_at, last_sign_in_at
  )
  VALUES (
    gen_random_uuid(), new_user_id,
    jsonb_build_object('sub', new_user_id::text, 'email', user_email, 'provider_id', user_email),
    'email', user_email, now(), now(), now()
  );

  -- Create the profile
  INSERT INTO public.profiles (
    id, first_name, last_name, role, photos, coins, gender, birth_date,
    country, city, profession, languages, bio
  ) VALUES (
    new_user_id, model_first_name, model_last_name, 'model', model_photos, model_coins,
    model_gender, model_birth_date, model_country, model_city, model_profession,
    model_languages, model_bio
  );

  RETURN json_build_object(
    'id', new_user_id,
    'email', user_email,
    'password', random_password,
    'name', model_first_name || ' ' || model_last_name
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_model_profile TO authenticated;

-- Insert Models

-- European Models
SELECT create_model_profile(
  'Sophia', 'Martinez', 'female', '1995-03-15', 'Spain', 'Barcelona',
  'Fashion Designer',
  ARRAY['Spanish', 'English', 'French'],
  'Passionate fashion designer from Barcelona. I love creating unique pieces that blend traditional Spanish elegance with modern trends. When I''m not sketching designs, you''ll find me exploring the vibrant streets of my city or enjoying tapas with friends.',
  ARRAY['https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400']
);

SELECT create_model_profile(
  'Isabella', 'Rossi', 'female', '1993-07-22', 'Italy', 'Milan',
  'Art Curator',
  ARRAY['Italian', 'English', 'German'],
  'Art curator with a deep passion for Renaissance masterpieces. I spend my days surrounded by beauty and love sharing the stories behind famous artworks. My dream is to open my own gallery showcasing emerging Italian artists.',
  ARRAY['https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400']
);

SELECT create_model_profile(
  'Emma', 'Andersen', 'female', '1994-11-08', 'Denmark', 'Copenhagen',
  'Sustainability Consultant',
  ARRAY['Danish', 'English', 'Swedish'],
  'Environmental advocate working to make the world greener, one company at a time. I believe in the power of sustainable living and love sharing tips on reducing our carbon footprint. Cycling enthusiast and organic food lover.',
  ARRAY['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400']
);

SELECT create_model_profile(
  'Lena', 'Müller', 'female', '1992-05-14', 'Germany', 'Berlin',
  'Software Engineer',
  ARRAY['German', 'English', 'French'],
  'Tech enthusiast and software engineer working on innovative AI solutions. I love coding, attending tech meetups, and exploring Berlin''s vibrant startup scene. When not debugging code, I enjoy classical music and hiking.',
  ARRAY['https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400']
);

-- American Models
SELECT create_model_profile(
  'Ava', 'Thompson', 'female', '1996-09-30', 'United States', 'New York',
  'Marketing Director',
  ARRAY['English', 'Spanish'],
  'Dynamic marketing professional with a passion for creative campaigns. I love the energy of New York and the fast-paced world of digital marketing. Coffee addict, yoga enthusiast, and always up for trying new restaurants.',
  ARRAY['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400']
);

SELECT create_model_profile(
  'Mia', 'Garcia', 'female', '1995-12-03', 'United States', 'Los Angeles',
  'Film Producer',
  ARRAY['English', 'Spanish'],
  'Independent film producer passionate about telling diverse stories. I''ve worked on documentaries and feature films that highlight important social issues. Love the creative energy of LA and collaborating with talented artists.',
  ARRAY['https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400']
);

SELECT create_model_profile(
  'Zoe', 'Chen', 'female', '1994-04-18', 'United States', 'San Francisco',
  'Data Scientist',
  ARRAY['English', 'Mandarin'],
  'Data scientist working on machine learning projects that make a difference. I love turning complex data into meaningful insights. Tech conference speaker, marathon runner, and amateur photographer.',
  ARRAY['https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400']
);

-- Asian Models
SELECT create_model_profile(
  'Yuki', 'Tanaka', 'female', '1993-08-25', 'Japan', 'Tokyo',
  'Interior Designer',
  ARRAY['Japanese', 'English'],
  'Minimalist interior designer inspired by Japanese aesthetics. I create peaceful spaces that blend functionality with beauty. Tea ceremony enthusiast and lover of traditional Japanese gardens.',
  ARRAY['https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400']
);

SELECT create_model_profile(
  'Ji-eun', 'Kim', 'female', '1996-01-12', 'South Korea', 'Seoul',
  'K-pop Dance Instructor',
  ARRAY['Korean', 'English'],
  'Professional dance instructor specializing in K-pop choreography. I love teaching others the art of dance and sharing Korean culture. Fashion enthusiast and beauty blogger in my free time.',
  ARRAY['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400']
);

SELECT create_model_profile(
  'Priya', 'Patel', 'female', '1995-06-20', 'India', 'Mumbai',
  'Yoga Instructor',
  ARRAY['Hindi', 'English', 'Gujarati'],
  'Certified yoga instructor with a passion for holistic wellness. I teach traditional and modern yoga styles, helping others find balance in their lives. Ayurveda enthusiast and meditation guide.',
  ARRAY['https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400']
);

-- Australian Models
SELECT create_model_profile(
  'Ruby', 'Williams', 'female', '1994-02-28', 'Australia', 'Sydney',
  'Marine Biologist',
  ARRAY['English'],
  'Marine biologist studying coral reef ecosystems. I spend my days diving and researching ocean conservation. Passionate about protecting marine life and educating others about ocean sustainability.',
  ARRAY['https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400']
);

SELECT create_model_profile(
  'Scarlett', 'O''Connor', 'female', '1993-10-15', 'Australia', 'Melbourne',
  'Chef',
  ARRAY['English'],
  'Award-winning chef specializing in fusion cuisine. I love creating dishes that blend Australian ingredients with international flavors. Food blogger and cooking class instructor.',
  ARRAY['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400']
);

-- Canadian Models
SELECT create_model_profile(
  'Maple', 'Anderson', 'female', '1995-12-25', 'Canada', 'Toronto',
  'Graphic Designer',
  ARRAY['English', 'French'],
  'Creative graphic designer with a love for minimalist aesthetics. I work with brands to create memorable visual identities. Art gallery enthusiast and coffee shop connoisseur.',
  ARRAY['https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400']
);

SELECT create_model_profile(
  'Aurora', 'Dubois', 'female', '1994-07-04', 'Canada', 'Montreal',
  'Fashion Photographer',
  ARRAY['French', 'English'],
  'Fashion photographer capturing beauty in unexpected places. I love working with emerging designers and creating editorial spreads. Travel enthusiast and street art lover.',
  ARRAY['https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400']
);

-- Brazilian Models
SELECT create_model_profile(
  'Bella', 'Silva', 'female', '1996-03-10', 'Brazil', 'Rio de Janeiro',
  'Dance Teacher',
  ARRAY['Portuguese', 'English', 'Spanish'],
  'Professional dance teacher specializing in Brazilian samba and contemporary dance. I love sharing the joy of dance and Brazilian culture. Carnival enthusiast and beach lover.',
  ARRAY['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400']
);

SELECT create_model_profile(
  'Luna', 'Santos', 'female', '1993-11-18', 'Brazil', 'São Paulo',
  'Architect',
  ARRAY['Portuguese', 'English'],
  'Sustainable architect designing eco-friendly buildings. I believe in creating spaces that harmonize with nature. Art collector and museum enthusiast.',
  ARRAY['https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400']
);

-- Russian Models
SELECT create_model_profile(
  'Anastasia', 'Ivanova', 'female', '1994-05-22', 'Russia', 'Moscow',
  'Classical Pianist',
  ARRAY['Russian', 'English'],
  'Professional classical pianist performing with major orchestras. I love sharing the beauty of classical music and teaching piano to young students. Opera enthusiast and art lover.',
  ARRAY['https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400']
);

SELECT create_model_profile(
  'Natalia', 'Petrova', 'female', '1995-09-14', 'Russia', 'St. Petersburg',
  'Ballet Dancer',
  ARRAY['Russian', 'English', 'French'],
  'Principal ballet dancer with the Mariinsky Theatre. I''ve performed in classic ballets like Swan Lake and The Nutcracker. Love sharing the grace and discipline of classical ballet.',
  ARRAY['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400']
);

-- Swedish Models
SELECT create_model_profile(
  'Astrid', 'Lindgren', 'female', '1993-12-06', 'Sweden', 'Stockholm',
  'Environmental Scientist',
  ARRAY['Swedish', 'English', 'Norwegian'],
  'Environmental scientist researching climate change solutions. I''m passionate about protecting our planet and educating others about sustainability. Hiking enthusiast and nature photographer.',
  ARRAY['https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400']
);

SELECT create_model_profile(
  'Freja', 'Eriksson', 'female', '1996-04-30', 'Sweden', 'Gothenburg',
  'Furniture Designer',
  ARRAY['Swedish', 'English'],
  'Furniture designer creating sustainable, Scandinavian-inspired pieces. I believe in the beauty of simplicity and functionality. Woodworking enthusiast and design blogger.',
  ARRAY['https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400']
);

-- Dutch Models
SELECT create_model_profile(
  'Fleur', 'van der Berg', 'female', '1994-08-12', 'Netherlands', 'Amsterdam',
  'Art Historian',
  ARRAY['Dutch', 'English', 'German'],
  'Art historian specializing in Dutch Golden Age paintings. I work at the Rijksmuseum and love sharing the stories behind masterpieces. Bicycle enthusiast and canal tour guide.',
  ARRAY['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400']
);

SELECT create_model_profile(
  'Lotte', 'de Vries', 'female', '1995-01-28', 'Netherlands', 'Rotterdam',
  'Urban Planner',
  ARRAY['Dutch', 'English'],
  'Urban planner designing sustainable cities of the future. I focus on creating walkable, green spaces that bring communities together. Architecture enthusiast and city explorer.',
  ARRAY['https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400']
);

-- More Models (to reach 50 total)

-- Male Models
SELECT create_model_profile(
  'Liam', 'Smith', 'male', '1992-02-10', 'United Kingdom', 'London',
  'Fitness Trainer',
  ARRAY['English', 'Spanish'],
  'Certified fitness trainer and nutrition coach. I help clients achieve their health goals and love sharing workout tips. Marathon runner and healthy recipe creator.',
  ARRAY['https://images.unsplash.com/photo-1519340333755-c2f6c58f5c4b?w=400', 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400']
);

SELECT create_model_profile(
  'Noah', 'Dubois', 'male', '1993-06-18', 'France', 'Paris',
  'Fashion Model',
  ARRAY['French', 'English'],
  'Paris-based fashion model working with top designers. I love the energy of runway shows and collaborating on creative shoots. Jazz music lover and café enthusiast.',
  ARRAY['https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400', 'https://images.unsplash.com/photo-1464983953574-0892a716854b?w=400']
);

SELECT create_model_profile(
  'Mateo', 'Fernandez', 'male', '1994-09-25', 'Argentina', 'Buenos Aires',
  'Photographer',
  ARRAY['Spanish', 'English'],
  'Freelance photographer capturing the vibrant life of Buenos Aires. I specialize in portrait and street photography. Tango dancer and football fan.',
  ARRAY['https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400', 'https://images.unsplash.com/photo-1519340333755-c2f6c58f5c4b?w=400']
);

SELECT create_model_profile(
  'Ethan', 'Nguyen', 'male', '1995-11-12', 'Vietnam', 'Ho Chi Minh City',
  'Barista',
  ARRAY['Vietnamese', 'English'],
  'Barista and latte art champion. I love experimenting with coffee flavors and sharing my passion for specialty brews. Street food explorer and music festival goer.',
  ARRAY['https://images.unsplash.com/photo-1464983953574-0892a716854b?w=400', 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400']
);

SELECT create_model_profile(
  'Lucas', 'Silva', 'male', '1992-07-08', 'Brazil', 'Salvador',
  'Surf Instructor',
  ARRAY['Portuguese', 'English'],
  'Surf instructor teaching on the beautiful beaches of Bahia. I love the ocean, beach volleyball, and playing guitar at sunset.',
  ARRAY['https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400', 'https://images.unsplash.com/photo-1519340333755-c2f6c58f5c4b?w=400']
);

SELECT create_model_profile(
  'Maksim', 'Volkov', 'male', '1993-03-19', 'Russia', 'Saint Petersburg',
  'Actor',
  ARRAY['Russian', 'English'],
  'Stage and film actor performing in Russian and international productions. I enjoy reading classic literature and exploring art museums.',
  ARRAY['https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400', 'https://images.unsplash.com/photo-1464983953574-0892a716854b?w=400']
);

SELECT create_model_profile(
  'Omar', 'Hassan', 'male', '1991-05-23', 'Egypt', 'Cairo',
  'Architect',
  ARRAY['Arabic', 'English'],
  'Architect designing modern buildings inspired by ancient Egyptian heritage. I love sketching, traveling, and exploring historical sites.',
  ARRAY['https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400', 'https://images.unsplash.com/photo-1519340333755-c2f6c58f5c4b?w=400']
);

SELECT create_model_profile(
  'David', 'Goldberg', 'male', '1994-10-02', 'Israel', 'Tel Aviv',
  'DJ',
  ARRAY['Hebrew', 'English'],
  'DJ and music producer performing at clubs and festivals. I love mixing electronic music and collaborating with other artists. Beach lover and foodie.',
  ARRAY['https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400', 'https://images.unsplash.com/photo-1464983953574-0892a716854b?w=400']
);

SELECT create_model_profile(
  'Samuel', 'Johnson', 'male', '1992-12-15', 'United States', 'Chicago',
  'Chef',
  ARRAY['English', 'Spanish'],
  'Executive chef at a top Chicago restaurant. I love creating new dishes and sharing my passion for food. Jazz fan and cyclist.',
  ARRAY['https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400', 'https://images.unsplash.com/photo-1519340333755-c2f6c58f5c4b?w=400']
);

SELECT create_model_profile(
  'Andreas', 'Berg', 'male', '1993-08-27', 'Norway', 'Oslo',
  'Ski Instructor',
  ARRAY['Norwegian', 'English'],
  'Ski instructor and mountain guide. I love the outdoors, snowboarding, and sharing my love for winter sports with others.',
  ARRAY['https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400', 'https://images.unsplash.com/photo-1464983953574-0892a716854b?w=400']
);

-- More Female Models
SELECT create_model_profile(
  'Camila', 'Morales', 'female', '1995-05-11', 'Mexico', 'Mexico City',
  'Makeup Artist',
  ARRAY['Spanish', 'English'],
  'Professional makeup artist working with celebrities and on film sets. I love sharing beauty tips and creating bold looks. Salsa dancer and art lover.',
  ARRAY['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400']
);

SELECT create_model_profile(
  'Sofia', 'Costa', 'female', '1994-03-22', 'Portugal', 'Lisbon',
  'Travel Blogger',
  ARRAY['Portuguese', 'English', 'Spanish'],
  'Travel blogger sharing stories and tips from around the world. I love discovering hidden gems and connecting with locals. Photography enthusiast and foodie.',
  ARRAY['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400']
);

SELECT create_model_profile(
  'Elena', 'Popova', 'female', '1993-07-19', 'Ukraine', 'Kyiv',
  'Journalist',
  ARRAY['Ukrainian', 'English', 'Russian'],
  'Investigative journalist covering social issues and human rights. I love storytelling and giving a voice to the unheard. Runner and poetry lover.',
  ARRAY['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400']
);

SELECT create_model_profile(
  'Amelia', 'Evans', 'female', '1996-01-30', 'Ireland', 'Dublin',
  'Musician',
  ARRAY['English', 'Irish'],
  'Singer-songwriter performing in pubs and festivals. I love writing music and connecting with audiences. Bookworm and coffee lover.',
  ARRAY['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400']
);

SELECT create_model_profile(
  'Hanna', 'Jensen', 'female', '1995-10-05', 'Finland', 'Helsinki',
  'Graphic Designer',
  ARRAY['Finnish', 'English', 'Swedish'],
  'Graphic designer creating visual identities for startups. I love minimalist design and exploring Helsinki''s art scene. Cyclist and ice swimmer.',
  ARRAY['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400']
);

SELECT create_model_profile(
  'Julia', 'Nowak', 'female', '1994-08-14', 'Poland', 'Warsaw',
  'Fashion Stylist',
  ARRAY['Polish', 'English'],
  'Fashion stylist working with magazines and celebrities. I love creating unique looks and following the latest trends. Vintage collector and traveler.',
  ARRAY['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400']
);

SELECT create_model_profile(
  'Sara', 'Nielsen', 'female', '1993-11-23', 'Denmark', 'Aarhus',
  'Yoga Teacher',
  ARRAY['Danish', 'English'],
  'Yoga teacher helping people find balance and strength. I love nature, meditation, and healthy living. Vegan and animal lover.',
  ARRAY['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400']
);

SELECT create_model_profile(
  'Maya', 'Singh', 'female', '1996-06-17', 'India', 'Delhi',
  'Software Developer',
  ARRAY['Hindi', 'English'],
  'Software developer building apps for social good. I love coding, hackathons, and mentoring young women in tech. Bollywood fan and foodie.',
  ARRAY['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400']
);

SELECT create_model_profile(
  'Lea', 'Dubois', 'female', '1995-04-09', 'France', 'Lyon',
  'Pastry Chef',
  ARRAY['French', 'English'],
  'Pastry chef creating delicious desserts and pastries. I love experimenting with flavors and sharing my creations. Runner and art lover.',
  ARRAY['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400']
);

SELECT create_model_profile(
  'Nina', 'Keller', 'female', '1994-12-12', 'Switzerland', 'Zurich',
  'Marketing Specialist',
  ARRAY['German', 'English', 'French'],
  'Marketing specialist working with international brands. I love traveling, skiing, and learning new languages. Chocolate lover and hiker.',
  ARRAY['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400']
);

SELECT create_model_profile(
  'Eva', 'Horvath', 'female', '1993-02-28', 'Hungary', 'Budapest',
  'Dancer',
  ARRAY['Hungarian', 'English'],
  'Professional dancer performing in musicals and shows. I love teaching dance and inspiring others to move. Jazz lover and traveler.',
  ARRAY['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400']
);

SELECT create_model_profile(
  'Marta', 'Lopez', 'female', '1995-09-01', 'Spain', 'Madrid',
  'Event Planner',
  ARRAY['Spanish', 'English'],
  'Event planner organizing weddings and corporate events. I love creating memorable experiences and working with creative teams. Flamenco dancer and foodie.',
  ARRAY['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400']
);

SELECT create_model_profile(
  'Anna', 'Ivanova', 'female', '1994-10-20', 'Russia', 'Kazan',
  'Doctor',
  ARRAY['Russian', 'English'],
  'Medical doctor specializing in pediatrics. I love helping children and making a difference in their lives. Runner and painter.',
  ARRAY['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400']
);

SELECT create_model_profile(
  'Jasmine', 'Lee', 'female', '1995-08-15', 'Singapore', 'Singapore',
  'Entrepreneur',
  ARRAY['English', 'Mandarin'],
  'Entrepreneur running a successful tech startup. I love innovation, networking, and empowering women in business. Foodie and traveler.',
  ARRAY['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400']
);

SELECT create_model_profile(
  'Olivia', 'Brown', 'female', '1996-03-11', 'United States', 'Miami',
  'Swimwear Model',
  ARRAY['English', 'Spanish'],
  'Swimwear model working with top brands. I love the beach, surfing, and fitness. Yoga instructor and smoothie lover.',
  ARRAY['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400']
);

SELECT create_model_profile(
  'Victoria', 'Clark', 'female', '1994-07-29', 'Australia', 'Brisbane',
  'Veterinarian',
  ARRAY['English'],
  'Veterinarian caring for animals at a busy clinic. I love wildlife rescue and educating others about animal care. Hiker and animal lover.',
  ARRAY['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400']
);

SELECT create_model_profile(
  'Samantha', 'Evans', 'female', '1993-05-18', 'Canada', 'Vancouver',
  'Photographer',
  ARRAY['English', 'French'],
  'Photographer capturing the beauty of nature and city life. I love hiking, camping, and sharing my adventures through photos. Coffee lover and traveler.',
  ARRAY['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400']
);

SELECT create_model_profile(
  'Chloe', 'Martin', 'female', '1995-12-02', 'France', 'Nice',
  'Florist',
  ARRAY['French', 'English'],
  'Florist creating beautiful arrangements for weddings and events. I love working with flowers and bringing joy to others. Gardener and painter.',
  ARRAY['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400']
);

SELECT create_model_profile(
  'Isabel', 'Gomez', 'female', '1994-11-27', 'Colombia', 'Bogota',
  'TV Presenter',
  ARRAY['Spanish', 'English'],
  'TV presenter hosting a popular morning show. I love interviewing interesting people and sharing stories. Salsa dancer and foodie.',
  ARRAY['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400']
);

SELECT create_model_profile(
  'Gabriela', 'Mendez', 'female', '1993-09-13', 'Peru', 'Lima',
  'Chef',
  ARRAY['Spanish', 'English'],
  'Chef specializing in Peruvian cuisine. I love sharing my culture through food and teaching cooking classes. Runner and art lover.',
  ARRAY['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400']
);

SELECT create_model_profile(
  'Sienna', 'Bianchi', 'female', '1995-06-21', 'Italy', 'Florence',
  'Painter',
  ARRAY['Italian', 'English'],
  'Painter inspired by the beauty of Tuscany. I love creating landscapes and portraits. Art teacher and wine lover.',
  ARRAY['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400']
);

SELECT create_model_profile(
  'Megan', 'Walker', 'female', '1994-02-14', 'United States', 'Seattle',
  'UX Designer',
  ARRAY['English'],
  'UX designer creating intuitive digital experiences. I love user research, prototyping, and hiking in the Pacific Northwest. Coffee lover and bookworm.',
  ARRAY['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400']
);

SELECT create_model_profile(
  'Alicia', 'Ramirez', 'female', '1993-03-03', 'Spain', 'Valencia',
  'Dancer',
  ARRAY['Spanish', 'English'],
  'Professional dancer performing in musicals and shows. I love teaching dance and inspiring others to move. Jazz lover and traveler.',
  ARRAY['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400']
);

SELECT create_model_profile(
  'Helena', 'Peterson', 'female', '1995-07-07', 'Sweden', 'Malmo',
  'Interior Designer',
  ARRAY['Swedish', 'English'],
  'Interior designer creating cozy and functional spaces. I love Scandinavian design, baking, and spending time with family.',
  ARRAY['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400']
);

SELECT create_model_profile(
  'Lara', 'Khan', 'female', '1994-09-09', 'United Arab Emirates', 'Dubai',
  'Fashion Influencer',
  ARRAY['Arabic', 'English'],
  'Fashion influencer sharing style tips and travel adventures. I love exploring new destinations and connecting with followers. Foodie and beach lover.',
  ARRAY['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400']
);

SELECT create_model_profile(
  'Mila', 'Novak', 'female', '1993-12-19', 'Croatia', 'Zagreb',
  'Actress',
  ARRAY['Croatian', 'English'],
  'Actress performing in theater and film. I love storytelling, traveling, and learning new languages. Yoga enthusiast and animal lover.',
  ARRAY['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400']
);

-- Clean up the function
DROP FUNCTION IF EXISTS create_model_profile(text, text, text, date, text, text, text, text[], text, text[], integer);

-- Success message
SELECT 'Successfully created 50 new model profiles!' as result; 