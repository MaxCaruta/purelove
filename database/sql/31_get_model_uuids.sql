-- Query to get the UUIDs of all model profiles
-- Run this after inserting the model profiles to get their UUIDs
-- Use these UUIDs to update your frontend code

SELECT 
    p.id as uuid,
    p.first_name,
    p.last_name,
    u.email as model_email
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email LIKE '%@lcnmodels.com'
ORDER BY p.first_name;

-- Also show them in a format ready for frontend usage:
SELECT 
    '  { id: ''' || p.id || ''', userId: ''' || p.id || ''', firstName: ''' || p.first_name || ''', lastName: ''' || p.last_name || ''' },' as frontend_format
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email LIKE '%@lcnmodels.com'
ORDER BY p.first_name; 