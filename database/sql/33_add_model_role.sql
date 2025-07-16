-- Add 'model' role to the existing check constraint
-- This allows model profiles to have role = 'model'

-- Drop the existing constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS check_role_valid;

-- Add the new constraint that includes 'model'
ALTER TABLE profiles 
ADD CONSTRAINT check_role_valid 
CHECK (role IN ('user', 'admin', 'super_admin', 'model'));

-- Now update model profiles to have role 'model'
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