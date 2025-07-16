-- Complete fix for model profiles with consistent UUIDs
-- This script will clean up and recreate the model profiles with the exact UUIDs used in the frontend

-- First, clean up any existing model profiles that might be causing conflicts
DELETE FROM public.profiles WHERE first_name IN ('Olena', 'Natalia', 'Madina', 'Irina', 'Kateryna', 'Aisha', 'Anastasia', 'Zuzana', 'Karolina', 'Elena')
AND last_name ~ '^[A-Z]\.$';

DELETE FROM auth.users WHERE email LIKE '%@lcnmodels.com';

-- Allow 'model' role in the profiles table
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS check_role_valid;
ALTER TABLE profiles ADD CONSTRAINT check_role_valid CHECK (role IN ('user', 'admin', 'super_admin', 'model'));

-- Now create the model profiles with the exact UUIDs used in the frontend

-- Model 1: Olena K.
INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at)
VALUES ('c0a6fef9-7cb5-4f69-8c77-a4754e283e77', 'olena.k@lcnmodels.com', NOW(), NOW(), NOW());

INSERT INTO public.profiles (
    id, first_name, last_name, gender, birth_date, country, city, bio, 
    interests, profession, languages, photos, verified, role, created_at
) VALUES (
    'c0a6fef9-7cb5-4f69-8c77-a4754e283e77', 'Olena', 'K.', 'female', '1995-05-15', 'Ukraine', 'Kyiv',
    'I feel music in every cell of my body. Looking for someone who shares my passion for arts and travel.',
    ARRAY['Music', 'Travel', 'Art'], 'Graphic Designer', 
    ARRAY['Ukrainian', 'English', 'Russian'],
    ARRAY['https://images.unsplash.com/photo-1607746882042-944635dfe10e?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80'],
    true, 'model', NOW()
);

-- Model 2: Natalia M.
INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at)
VALUES ('cd8983ed-6a0a-4034-ac27-60b4a345419d', 'natalia.m@lcnmodels.com', NOW(), NOW(), NOW());

INSERT INTO public.profiles (
    id, first_name, last_name, gender, birth_date, country, city, bio, 
    interests, profession, languages, photos, verified, role, created_at
) VALUES (
    'cd8983ed-6a0a-4034-ac27-60b4a345419d', 'Natalia', 'M.', 'female', '1992-08-23', 'Russia', 'Moscow',
    'Passionate about literature and philosophy. I enjoy deep conversations and quiet evenings with good wine.',
    ARRAY['Reading', 'Philosophy', 'Wine Tasting'], 'Literature Professor', 
    ARRAY['Russian', 'English', 'French'],
    ARRAY['https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80'],
    true, 'model', NOW()
);

-- Model 3: Madina A.
INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at)
VALUES ('7640ee5a-0ca2-4839-85fc-e467102d44b5', 'madina.a@lcnmodels.com', NOW(), NOW(), NOW());

INSERT INTO public.profiles (
    id, first_name, last_name, gender, birth_date, country, city, bio, 
    interests, profession, languages, photos, verified, role, created_at
) VALUES (
    '7640ee5a-0ca2-4839-85fc-e467102d44b5', 'Madina', 'A.', 'female', '1997-11-05', 'Kazakhstan', 'Almaty',
    'Adventurous spirit who loves mountains and outdoor activities. Looking for someone who isn''t afraid of heights—emotional or literal.',
    ARRAY['Hiking', 'Mountains', 'Photography'], 'Tour Guide', 
    ARRAY['Kazakh', 'Russian', 'English'],
    ARRAY['https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80'],
    false, 'model', NOW()
);

-- Model 4: Irina S.
INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at)
VALUES ('bb77508f-6c74-44e2-a2a3-e3ab4cb764b0', 'irina.s@lcnmodels.com', NOW(), NOW(), NOW());

INSERT INTO public.profiles (
    id, first_name, last_name, gender, birth_date, country, city, bio, 
    interests, profession, languages, photos, verified, role, created_at
) VALUES (
    'bb77508f-6c74-44e2-a2a3-e3ab4cb764b0', 'Irina', 'S.', 'female', '1990-02-12', 'Belarus', 'Minsk',
    'Professional dancer with a passion for classical ballet. I love to cook traditional dishes and enjoy quiet evenings at home.',
    ARRAY['Dancing', 'Cooking', 'Ballet'], 'Ballet Dancer', 
    ARRAY['Belarusian', 'Russian', 'English'],
    ARRAY['https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80'],
    true, 'model', NOW()
);

-- Model 5: Kateryna P.
INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at)
VALUES ('f75cbbb3-ea44-4ac5-a350-3516c386b5f7', 'kateryna.p@lcnmodels.com', NOW(), NOW(), NOW());

INSERT INTO public.profiles (
    id, first_name, last_name, gender, birth_date, country, city, bio, 
    interests, profession, languages, photos, verified, role, created_at
) VALUES (
    'f75cbbb3-ea44-4ac5-a350-3516c386b5f7', 'Kateryna', 'P.', 'female', '1994-09-30', 'Ukraine', 'Lviv',
    'Software engineer by day, book lover by night. Looking for an intellectual partner who enjoys deep conversations and traveling.',
    ARRAY['Technology', 'Reading', 'Travel'], 'Software Engineer', 
    ARRAY['Ukrainian', 'English', 'Polish'],
    ARRAY['https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?ixlib=rb-4.0.3&auto=format&fit=crop&w=778&q=80'],
    true, 'model', NOW()
);

-- Model 6: Aisha T.
INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at)
VALUES ('8b280ce8-d2db-456a-a074-62ae53dc5828', 'aisha.t@lcnmodels.com', NOW(), NOW(), NOW());

INSERT INTO public.profiles (
    id, first_name, last_name, gender, birth_date, country, city, bio, 
    interests, profession, languages, photos, verified, role, created_at
) VALUES (
    '8b280ce8-d2db-456a-a074-62ae53dc5828', 'Aisha', 'T.', 'female', '1996-07-18', 'Kazakhstan', 'Nur-Sultan',
    'Medical student with a love for traditional music and modern art. I enjoy outdoor activities and exploring nature.',
    ARRAY['Medicine', 'Music', 'Art', 'Nature'], 'Medical Student', 
    ARRAY['Kazakh', 'Russian', 'English'],
    ARRAY['https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?ixlib=rb-4.0.3&auto=format&fit=crop&w=928&q=80'],
    false, 'model', NOW()
);

-- Model 7: Anastasia V.
INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at)
VALUES ('4b82e757-1065-4b74-899f-28cb7cdb6b4d', 'anastasia.v@lcnmodels.com', NOW(), NOW(), NOW());

INSERT INTO public.profiles (
    id, first_name, last_name, gender, birth_date, country, city, bio, 
    interests, profession, languages, photos, verified, role, created_at
) VALUES (
    '4b82e757-1065-4b74-899f-28cb7cdb6b4d', 'Anastasia', 'V.', 'female', '1993-12-08', 'Russia', 'Saint Petersburg',
    'Classical pianist who finds beauty in both music and mathematics. Looking for someone who appreciates the harmony in life.',
    ARRAY['Piano', 'Mathematics', 'Classical Music'], 'Pianist', 
    ARRAY['Russian', 'English', 'German'],
    ARRAY['https://images.unsplash.com/photo-1616803689943-5601631c7fec?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80'],
    true, 'model', NOW()
);

-- Model 8: Zuzana K.
INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at)
VALUES ('150fd9f0-aa91-44e4-8bd4-7637bf66737b', 'zuzana.k@lcnmodels.com', NOW(), NOW(), NOW());

INSERT INTO public.profiles (
    id, first_name, last_name, gender, birth_date, country, city, bio, 
    interests, profession, languages, photos, verified, role, created_at
) VALUES (
    '150fd9f0-aa91-44e4-8bd4-7637bf66737b', 'Zuzana', 'K.', 'female', '1991-04-22', 'Czech Republic', 'Prague',
    'Architect with a passion for sustainable design. I love exploring old buildings and creating new spaces that respect history.',
    ARRAY['Architecture', 'Design', 'History'], 'Architect', 
    ARRAY['Czech', 'English', 'German'],
    ARRAY['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80'],
    false, 'model', NOW()
);

-- Model 9: Karolina W.
INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at)
VALUES ('987a5400-4552-4fc6-9875-bf7a89c09c76', 'karolina.w@lcnmodels.com', NOW(), NOW(), NOW());

INSERT INTO public.profiles (
    id, first_name, last_name, gender, birth_date, country, city, bio, 
    interests, profession, languages, photos, verified, role, created_at
) VALUES (
    '987a5400-4552-4fc6-9875-bf7a89c09c76', 'Karolina', 'W.', 'female', '1998-01-14', 'Poland', 'Warsaw',
    'Fashion designer inspired by traditional Polish patterns and modern trends. Looking for someone who values creativity and authenticity.',
    ARRAY['Fashion', 'Design', 'Travel'], 'Fashion Designer', 
    ARRAY['Polish', 'English', 'Italian'],
    ARRAY['https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80'],
    true, 'model', NOW()
);

-- Model 10: Elena D.
INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at)
VALUES ('1d34559b-6a60-4450-8a1a-25156e189e8f', 'elena.d@lcnmodels.com', NOW(), NOW(), NOW());

INSERT INTO public.profiles (
    id, first_name, last_name, gender, birth_date, country, city, bio, 
    interests, profession, languages, photos, verified, role, created_at
) VALUES (
    '1d34559b-6a60-4450-8a1a-25156e189e8f', 'Elena', 'D.', 'female', '1989-06-30', 'Bulgaria', 'Sofia',
    'Yoga instructor and wellness coach. I believe in the power of mindfulness and living a balanced life.',
    ARRAY['Yoga', 'Wellness', 'Meditation'], 'Yoga Instructor', 
    ARRAY['Bulgarian', 'English', 'Greek'],
    ARRAY['https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80'],
    true, 'model', NOW()
);

-- Verify the fix
SELECT 
    p.id,
    p.first_name,
    p.last_name,
    p.role,
    u.email
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.role = 'model'
ORDER BY p.first_name; 