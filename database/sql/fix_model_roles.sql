
-- Allow 'model' role in the profiles table
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS check_role_valid;
ALTER TABLE profiles ADD CONSTRAINT check_role_valid CHECK (role IN ('user', 'admin', 'super_admin', 'model'));

-- Update model profiles to have role='model'
UPDATE public.profiles SET role = 'model' WHERE id IN (
    'c0a6fef9-7cb5-4f69-8c77-a4754e283e77', -- Olena
    'cd8983ed-6a0a-4034-ac27-60b4a345419d', -- Natalia  
    '7640ee5a-0ca2-4839-85fc-e467102d44b5', -- Madina
    'bb77508f-6c74-44e2-a2a3-e3ab4cb764b0', -- Irina
    'f75cbbb3-ea44-4ac5-a350-3516c386b5f7', -- Kateryna
    '8b280ce8-d2db-456a-a074-62ae53dc5828', -- Aisha
    '4b82e757-1065-4b74-899f-28cb7cdb6b4d', -- Anastasia
    '150fd9f0-aa91-44e4-8bd4-7637bf66737b', -- Zuzana
    '987a5400-4552-4fc6-9875-bf7a89c09c76', -- Karolina
    '1d34559b-6a60-4450-8a1a-25156e189e8f'  -- Elena
);

