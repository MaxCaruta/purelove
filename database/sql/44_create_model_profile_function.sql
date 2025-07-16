-- Create function to create model profiles
-- This function handles the creation of both auth.users and profiles entries

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

-- Display success message
DO $$
BEGIN
    RAISE NOTICE 'create_model_profile function successfully created!';
END $$; 