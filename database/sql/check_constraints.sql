SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'public.profiles'::regclass AND contype = 'c';
