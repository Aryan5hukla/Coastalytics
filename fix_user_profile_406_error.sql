-- Fix for 406 User Profile Error
-- This script addresses the 406 Not Acceptable error when fetching user profiles

-- 1. First, check if the trigger exists and recreate it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Recreate the function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role, organization, phone)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'citizen')::user_role,
    COALESCE(new.raw_user_meta_data->>'organization', ''),
    COALESCE(new.raw_user_meta_data->>'phone', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, user_profiles.full_name),
    updated_at = now();
  RETURN new;
END;
$$;

-- 3. Recreate the trigger
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Update RLS policies to be more permissive for profile creation
DROP POLICY IF EXISTS "Allow profile creation" ON user_profiles;

CREATE POLICY "Allow profile creation"
    ON user_profiles FOR INSERT
    TO authenticated, anon, service_role
    WITH CHECK (true);

-- 5. Add a policy to allow authenticated users to insert their own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

CREATE POLICY "Users can insert own profile"
    ON user_profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- 6. Ensure proper permissions on the user_profiles table
GRANT SELECT, INSERT, UPDATE ON user_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_profiles TO anon;

-- 7. Fix any existing users who might not have profiles
-- This will create profiles for any auth.users who don't have a corresponding user_profile
INSERT INTO public.user_profiles (id, email, full_name, role, organization, phone)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', ''),
    COALESCE(au.raw_user_meta_data->>'role', 'citizen')::user_role,
    COALESCE(au.raw_user_meta_data->>'organization', ''),
    COALESCE(au.raw_user_meta_data->>'phone', '')
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE up.id IS NULL
ON CONFLICT (id) DO NOTHING;
