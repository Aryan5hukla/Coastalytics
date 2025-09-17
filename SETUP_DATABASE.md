# Database Setup Guide - Fix Report Submission

The report submission feature is not working because the Supabase database connection is not configured. Follow these steps to fix it:

## Option 1: Use Supabase Cloud (Recommended)

### Step 1: Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Wait for the project to be provisioned (2-3 minutes)

### Step 2: Get Your Project Credentials
1. In your Supabase dashboard, go to Settings → API
2. Copy the following values:
   - **Project URL** (something like `https://abc123.supabase.co`)
   - **anon public key** (starts with `eyJhbGciOiJIUzI1NiIs...`)

### Step 3: Configure Environment Variables
1. Create a `.env` file in the project root:
   ```bash
   cd /Users/aryan/Desktop/Hackathon/SIH/Coastalytics
   touch .env
   ```

2. Add your Supabase credentials to the `.env` file:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   VITE_OPENCAGE_API_KEY=demo
   ```

### Step 4: Set Up the Database Schema
1. In your Supabase dashboard, go to the SQL Editor
2. Run each of these migration files in order:
   - Copy the contents of `supabase/migrations/20250914115634_broken_flower.sql`
   - Run it in the SQL Editor
   - Copy the contents of `supabase/migrations/20250915000001_setup_storage.sql`
   - Run it in the SQL Editor
   - Copy the contents of `supabase/migrations/20250917000001_add_social_mentions.sql`
   - Run it in the SQL Editor

### Step 5: Configure Storage
1. In Supabase dashboard, go to Storage
2. The `media` bucket should be created automatically by the migration
3. If not, create a new public bucket named `media`

### Step 6: Test the Application
1. Restart your development server:
   ```bash
   npm run dev
   ```
2. Sign up for a new account or sign in
3. Try submitting a report - it should now work!

## Option 2: Use Supabase Local Development

### Prerequisites
- Docker Desktop must be installed and running
- Supabase CLI must be installed

### Steps
1. Start Docker Desktop
2. Initialize and start Supabase locally:
   ```bash
   cd /Users/aryan/Desktop/Hackathon/SIH/Coastalytics
   npx supabase start
   ```
3. The command will output local credentials - add them to your `.env` file
4. Run the migrations:
   ```bash
   npx supabase db reset
   ```

## Troubleshooting

### Issue: "Missing Supabase environment variables"
- Make sure the `.env` file exists in the project root
- Ensure the variable names are exactly `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart the development server after creating the `.env` file

### Issue: "Cannot connect to the database"
- Check that your Supabase project is active and not paused
- Verify the URL and anon key are correct
- Check your internet connection

### Issue: "Authentication error"
- Make sure you're signed in to the application
- Try signing out and signing back in
- Check that the user_profiles table was created correctly

### Issue: "Bucket not found" (for media uploads)
- Make sure the storage migration ran successfully
- Manually create a public bucket named `media` in the Supabase Storage section

## Current Status

The application has been updated with:
- ✅ Better error handling for database connection issues
- ✅ Visual indicators when the database is not configured
- ✅ Detailed error messages to help with debugging
- ✅ Proper form validation and submission logic

Once you configure the database connection, the report submission should work perfectly!
