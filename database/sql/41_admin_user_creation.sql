-- Drop existing policies and functions for clean slate
drop policy if exists "Admins can create users" on profiles;
drop function if exists create_user_with_profile;

-- Function to create a new user with proper auth and profile
create or replace function create_user_with_profile(
  admin_user_id uuid,
  user_email text,
  user_first_name text,
  user_last_name text,
  user_role text,
  user_photos text[],
  user_coins integer,
  user_gender text,
  user_birth_date date,
  user_country text,
  user_city text,
  user_profession text,
  user_languages text[],
  user_bio text
)
returns json
language plpgsql
security definer
set search_path = auth, public
as $$
declare
  new_user_id uuid;
  random_password text;
  created_user json;
begin
  -- Check if the calling user is an admin
  if not exists (
    select 1 from public.profiles 
    where id = admin_user_id 
    and role in ('admin', 'super_admin')
  ) then
    raise exception 'Only admins can create users';
  end if;

  -- Check if email already exists
  if exists (
    select 1 from auth.users 
    where email = user_email
  ) then
    raise exception 'User with email % already exists', user_email;
  end if;

  -- Generate a random password using uuid
  random_password := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
  new_user_id := gen_random_uuid();
  
  -- Create the user in auth.users
  insert into auth.users (
    id,
    email,
    raw_user_meta_data,
    raw_app_meta_data,
    is_super_admin,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    last_sign_in_at,
    aud,
    role,
    confirmation_sent_at,
    email_change_sent_at,
    recovery_sent_at,
    instance_id,
    email_change,
    phone_change,
    phone_confirmed_at,
    banned_until,
    reauthentication_sent_at,
    is_sso_user
  )
  values (
    new_user_id,
    user_email,
    jsonb_build_object('role', user_role),
    jsonb_build_object('provider', 'email'),
    false,
    md5(random_password),
    now(),
    now(),
    now(),
    now(),
    'authenticated',
    'authenticated',
    null,
    null,
    null,
    '00000000-0000-0000-0000-000000000000'::uuid,
    null,
    null,
    null,
    null,
    null,
    false
  );

  -- Create identities record
  insert into auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    created_at,
    updated_at,
    last_sign_in_at
  )
  values (
    gen_random_uuid(),
    new_user_id,
    jsonb_build_object(
      'sub', new_user_id::text,
      'email', user_email,
      'provider_id', user_email
    ),
    'email',
    user_email,
    now(),
    now(),
    now()
  );

  -- Create the profile
  insert into public.profiles (
    id,
    first_name,
    last_name,
    role,
    photos,
    coins,
    gender,
    birth_date,
    country,
    city,
    profession,
    languages,
    bio
  ) values (
    new_user_id,
    user_first_name,
    user_last_name,
    user_role,
    user_photos,
    user_coins,
    user_gender,
    user_birth_date,
    user_country,
    user_city,
    user_profession,
    user_languages,
    user_bio
  );

  -- Return the created user info
  created_user := json_build_object(
    'id', new_user_id,
    'email', user_email,
    'role', user_role,
    'password', random_password
  );

  return created_user;
exception
  when others then
    -- Log the error details
    raise notice 'Error in create_user_with_profile: %', SQLERRM;
    -- Re-raise the error
    raise;
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function create_user_with_profile to authenticated;

-- Fix the recursive policy issue by modifying the admin check policy
drop policy if exists "Admins can create users" on public.profiles;
create policy "Admins can create users"
  on public.profiles for all
  using (
    exists (
      select 1 from auth.users 
      where id = auth.uid() 
      and raw_app_meta_data ->> 'role' in ('admin', 'super_admin')
    )
  );

-- Add comment explaining the function
comment on function create_user_with_profile is 'Creates a new user with auth entry and profile, only accessible by admins'; 