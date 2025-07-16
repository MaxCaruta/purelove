-- =============================================
-- Safely Fix Storage Policies for Profile Photos
-- =============================================

-- Drop ALL existing policies for storage.objects to start fresh
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop all existing policies on storage.objects
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON storage.objects';
    END LOOP;
END $$;

-- Create new working policies

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

-- Show all policies for storage.objects
SELECT policyname, cmd, roles, qual, with_check FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY policyname;
