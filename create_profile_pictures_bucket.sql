-- Script to create profile-pictures storage bucket manually
-- Run this if the automatic migration didn't create the bucket

-- Create profile-pictures storage bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES ('profile-pictures', 'profile-pictures', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for profile pictures
DO $$ 
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can upload their own profile pictures" ON storage.objects;
    DROP POLICY IF EXISTS "Users can view profile pictures" ON storage.objects;
    DROP POLICY IF EXISTS "Users can update their own profile pictures" ON storage.objects;
    DROP POLICY IF EXISTS "Users can delete their own profile pictures" ON storage.objects;
    
    -- Create new policies
    CREATE POLICY "Users can upload their own profile pictures" ON storage.objects
        FOR INSERT WITH CHECK (
            bucket_id = 'profile-pictures' AND 
            auth.uid()::text = (storage.foldername(name))[1]
        );

    CREATE POLICY "Users can view profile pictures" ON storage.objects
        FOR SELECT USING (bucket_id = 'profile-pictures');

    CREATE POLICY "Users can update their own profile pictures" ON storage.objects
        FOR UPDATE USING (
            bucket_id = 'profile-pictures' AND 
            auth.uid()::text = (storage.foldername(name))[1]
        );

    CREATE POLICY "Users can delete their own profile pictures" ON storage.objects
        FOR DELETE USING (
            bucket_id = 'profile-pictures' AND 
            auth.uid()::text = (storage.foldername(name))[1]
        );
EXCEPTION 
    WHEN others THEN
        RAISE NOTICE 'Error creating policies: %', SQLERRM;
END $$;
