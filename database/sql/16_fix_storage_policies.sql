-- =============================================
-- Fix Storage Policies for Profile Photos
-- =============================================

-- Drop existing policies that are too restrictive
DROP POLICY IF EXISTS "Users can upload their own profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view profile photos" ON storage.objects;

-- Create simpler, working policies

-- Policy: Allow authenticated users to upload photos to profile-photos bucket
CREATE POLICY "Allow authenticated uploads to profile-photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profile-photos' 
  AND auth.role() = 'authenticated'
);

-- Policy: Allow anyone to view profile photos (public read)
CREATE POLICY "Allow public read access to profile-photos" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-photos');

-- Policy: Allow authenticated users to delete from profile-photos bucket
CREATE POLICY "Allow authenticated delete from profile-photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profile-photos' 
  AND auth.role() = 'authenticated'
);

-- Policy: Allow authenticated users to update profile-photos
CREATE POLICY "Allow authenticated update to profile-photos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profile-photos' 
  AND auth.role() = 'authenticated'
);

-- =============================================
-- Verification
-- =============================================

-- Verify new policies were created
SELECT policyname, cmd, roles FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%profile-photos%';
