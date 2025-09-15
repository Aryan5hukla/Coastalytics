-- Create storage bucket for media files
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the media bucket
CREATE POLICY "Authenticated users can upload media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media');

CREATE POLICY "Anyone can view media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media');

CREATE POLICY "Users can delete their own media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'media' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Update reports table to ensure it has proper constraints
ALTER TABLE reports 
ADD CONSTRAINT reports_urgency_level_check 
CHECK (urgency_level >= 1 AND urgency_level <= 5);

-- Add index for faster media URL queries
CREATE INDEX IF NOT EXISTS reports_media_urls_idx ON reports USING GIN (media_urls);

-- Add function to clean up unused media files (optional)
CREATE OR REPLACE FUNCTION cleanup_unused_media()
RETURNS void AS $$
DECLARE
  media_record RECORD;
  is_used BOOLEAN;
BEGIN
  -- This function can be called periodically to clean up unused media files
  FOR media_record IN 
    SELECT name FROM storage.objects WHERE bucket_id = 'media'
  LOOP
    -- Check if the media file is referenced in any report
    SELECT EXISTS(
      SELECT 1 FROM reports 
      WHERE media_record.name = ANY(media_urls)
    ) INTO is_used;
    
    -- If not used, delete it (commented out for safety)
    -- IF NOT is_used THEN
    --   DELETE FROM storage.objects 
    --   WHERE bucket_id = 'media' AND name = media_record.name;
    -- END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
