-- Update model profiles to have role 'model' instead of 'user'
-- This will help the admin panel distinguish between real users and AI model profiles

UPDATE public.profiles 
SET role = 'model' 
WHERE email LIKE '%@lcnmodels.com' 
   OR first_name IN ('Olena', 'Natalia', 'Madina', 'Irina', 'Kateryna', 'Aisha', 'Anastasia', 'Zuzana', 'Karolina', 'Elena')
   AND last_name ~ '^[A-Z]\.$' -- Last names like 'K.', 'M.', etc.
   AND role = 'user';

-- Let's also update by checking for the specific model emails we created
UPDATE public.profiles 
SET role = 'model' 
WHERE id IN (
    SELECT p.id 
    FROM public.profiles p 
    JOIN auth.users u ON p.id = u.id 
    WHERE u.email IN (
        'olena.k@lcnmodels.com',
        'natalia.m@lcnmodels.com', 
        'madina.a@lcnmodels.com',
        'irina.s@lcnmodels.com',
        'kateryna.p@lcnmodels.com',
        'aisha.t@lcnmodels.com',
        'anastasia.v@lcnmodels.com',
        'zuzana.k@lcnmodels.com',
        'karolina.w@lcnmodels.com',
        'elena.d@lcnmodels.com'
    )
);

-- Verify the update
SELECT 
    p.first_name, 
    p.last_name, 
    p.role, 
    u.email
FROM public.profiles p
JOIN auth.users u ON p.id = u.id  
WHERE p.role = 'model'
ORDER BY p.first_name; 