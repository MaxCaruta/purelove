-- Drop all existing policies and the recursive function with CASCADE
drop policy if exists "Users can read their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Service role can insert profiles" on public.profiles;
drop policy if exists "Allow profile creation during signup" on public.profiles;
drop policy if exists "Public can read profiles for browsing" on public.profiles;
drop policy if exists "Admins can create users" on public.profiles;
drop policy if exists "Service role can manage profiles" on public.profiles;
drop policy if exists "Admins can manage all profiles" on public.profiles;
drop policy if exists "Public can read profiles" on public.profiles;
drop policy if exists "Admins can view all profiles" on public.profiles;
drop policy if exists "Only admins can access audit logs" on admin_audit_log;
drop policy if exists "Only admins can manage models" on admin_models;

-- Drop the recursive function with CASCADE to remove all dependencies
drop function if exists is_admin(uuid) cascade;

-- Create new policies without recursion
create policy "Users can read their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Service role can manage profiles"
  on public.profiles for all
  using (auth.jwt() ->> 'role' = 'service_role');

-- Simple admin check using raw_app_meta_data from auth.users
create policy "Admins can manage all profiles"
  on public.profiles for all
  using (
    exists (
      select 1 from auth.users 
      where id = auth.uid() 
      and raw_app_meta_data ->> 'role' in ('admin', 'super_admin')
    )
  );

create policy "Public can read profiles"
  on public.profiles for select
  using (true);

-- Recreate admin policies for other tables using the same approach
create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from auth.users 
      where id = auth.uid() 
      and raw_app_meta_data ->> 'role' in ('admin', 'super_admin')
    )
  );

create policy "Only admins can access audit logs"
  on admin_audit_log for all
  using (
    exists (
      select 1 from auth.users 
      where id = auth.uid() 
      and raw_app_meta_data ->> 'role' in ('admin', 'super_admin')
    )
  );

create policy "Only admins can manage models"
  on admin_models for all
  using (
    exists (
      select 1 from auth.users 
      where id = auth.uid() 
      and raw_app_meta_data ->> 'role' in ('admin', 'super_admin')
    )
  );

-- Add helpful comments
comment on policy "Users can read their own profile" on public.profiles is 'Allow users to read their own profile';
comment on policy "Users can update their own profile" on public.profiles is 'Allow users to update their own profile';
comment on policy "Users can insert their own profile" on public.profiles is 'Allow users to insert their own profile';
comment on policy "Service role can manage profiles" on public.profiles is 'Allow service role complete access to profiles';
comment on policy "Admins can manage all profiles" on public.profiles is 'Allow admins complete access to all profiles';
comment on policy "Public can read profiles" on public.profiles is 'Allow public read access to all profiles';
comment on policy "Admins can view all profiles" on public.profiles is 'Allow admins to view all profiles';
comment on policy "Only admins can access audit logs" on admin_audit_log is 'Allow only admins to access audit logs';
comment on policy "Only admins can manage models" on admin_models is 'Allow only admins to manage models'; 