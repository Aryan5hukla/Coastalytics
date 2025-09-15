-- Run this SQL in your Supabase SQL Editor to create the storage bucket

-- 1. Create the media bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime', 'video/x-msvideo']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Set up storage policies for the media bucket
CREATE POLICY IF NOT EXISTS "Authenticated users can upload media" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'media');

CREATE POLICY IF NOT EXISTS "Anyone can view media" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'media');

CREATE POLICY IF NOT EXISTS "Users can delete their own media" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'media' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. Verify the bucket was created
SELECT * FROM storage.buckets WHERE id = 'media';
