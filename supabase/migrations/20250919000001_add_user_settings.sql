-- Create user_settings table for storing user preferences
CREATE TABLE user_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'system')),
    language TEXT DEFAULT 'en',
    notifications JSONB DEFAULT '{
        "email_alerts": true,
        "email_reports": true,
        "email_social_mentions": false,
        "email_predictions": true,
        "email_system_updates": true
    }'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);

-- Enable RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own settings" ON user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON user_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings" ON user_settings
    FOR DELETE USING (auth.uid() = user_id);

-- Create profile-pictures storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-pictures', 'profile-pictures', true);

-- Create storage policies for profile pictures
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

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for user_settings
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON user_settings TO authenticated;
GRANT ALL ON user_settings TO service_role;
