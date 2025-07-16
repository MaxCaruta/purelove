-- =============================================
-- Create Storage Buckets for Chat Files
-- =============================================

-- Create the chat-images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-images',
  'chat-images', 
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create the chat-voice storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-voice',
  'chat-voice', 
  true,
  52428800, -- 50MB limit
  ARRAY['audio/webm', 'audio/wav', 'audio/mp3', 'audio/ogg']
) ON CONFLICT (id) DO NOTHING;

-- =============================================
-- Storage Policies for Chat Images
-- =============================================

-- Policy: Allow authenticated users to upload chat images
CREATE POLICY "Users can upload chat images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'chat-images' 
  AND auth.role() = 'authenticated'
);

-- Policy: Allow users to view all chat images (public read)
CREATE POLICY "Anyone can view chat images" ON storage.objects
FOR SELECT USING (bucket_id = 'chat-images');

-- Policy: Allow users to delete their own chat images
CREATE POLICY "Users can delete their own chat images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'chat-images' 
  AND auth.role() = 'authenticated'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Allow users to update their own chat images
CREATE POLICY "Users can update their own chat images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'chat-images' 
  AND auth.role() = 'authenticated'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =============================================
-- Storage Policies for Chat Voice
-- =============================================

-- Policy: Allow authenticated users to upload voice messages
CREATE POLICY "Users can upload voice messages" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'chat-voice' 
  AND auth.role() = 'authenticated'
);

-- Policy: Allow users to view all voice messages (public read)
CREATE POLICY "Anyone can view voice messages" ON storage.objects
FOR SELECT USING (bucket_id = 'chat-voice');

-- Policy: Allow users to delete their own voice messages
CREATE POLICY "Users can delete their own voice messages" ON storage.objects
FOR DELETE USING (
  bucket_id = 'chat-voice' 
  AND auth.role() = 'authenticated'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Allow users to update their own voice messages
CREATE POLICY "Users can update their own voice messages" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'chat-voice' 
  AND auth.role() = 'authenticated'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =============================================
-- Verification
-- =============================================

-- Verify buckets were created
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE name IN ('chat-images', 'chat-voice');

-- Verify policies were created
SELECT policyname, cmd, roles FROM pg_policies 
WHERE tablename = 'objects' 
AND (policyname LIKE '%chat images%' OR policyname LIKE '%voice messages%')
ORDER BY policyname;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Chat storage buckets created successfully!';
    RAISE NOTICE '📷 chat-images bucket: 10MB limit, images only';
    RAISE NOTICE '🎤 chat-voice bucket: 50MB limit, audio files only';
    RAISE NOTICE '🔒 Proper RLS policies applied for security';
END $$; 