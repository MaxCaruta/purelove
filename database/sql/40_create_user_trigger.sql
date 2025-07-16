-- Drop existing trigger and function
drop trigger if exists create_auth_user_from_profile on public.profiles;
drop function if exists public.handle_new_profile();

-- Function to create a user in auth.users (commented out since we use create_user_with_profile instead)
/*
create or replace function public.handle_new_profile()
returns trigger
language plpgsql
security definer
as $$
declare
  new_user_id uuid;
  random_password text;
begin
  -- Generate a random password using uuid
  random_password := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
  
  -- Create the user in auth.users
  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
  )
  values (
    '00000000-0000-0000-0000-000000000000'::uuid,  -- default instance_id
    gen_random_uuid(),  -- generate a new UUID for the user
    'authenticated',    -- default audience
    'authenticated',    -- default role
    NEW.email,         -- use the email from the profile
    md5(random_password), -- hash the password with md5
    now(),             -- confirm email immediately
    now(),
    now(),
    replace(gen_random_uuid()::text, '-', ''),  -- random confirmation token
    replace(gen_random_uuid()::text, '-', '')   -- random recovery token
  )
  returning id into new_user_id;

  -- Update the profile with the new user_id
  NEW.id := new_user_id;
  
  return NEW;
end;
$$;

-- Create the trigger
create trigger create_auth_user_from_profile
  before insert on public.profiles
  for each row
  execute function public.handle_new_profile();

-- Grant necessary permissions
grant usage on schema auth to postgres;
grant all on auth.users to postgres;
grant execute on function public.handle_new_profile to postgres;

-- Add comment explaining the trigger
comment on function public.handle_new_profile is 'Automatically creates an auth.users entry when a new profile is created';
*/

-- Comment: This trigger is not needed when using create_user_with_profile function
-- which handles both auth.users and profiles creation in a single transaction 