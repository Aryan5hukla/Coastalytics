# User Settings & Profile Management Documentation

## Overview

The Coastalytics application now includes a comprehensive settings system that allows users to manage their profile, security, notifications, appearance preferences, and account. This system is fully integrated into the sidebar navigation and provides a complete user experience.

## Features Implemented

### 1. User Profile Management
- **Edit Name**: Users can update their full name
- **Change Email Address**: Users can change their email (requires email confirmation)
- **Update Phone**: Users can update their phone number
- **Organization**: Users can update their organization information
- **Profile Picture Upload**: Users can upload, view, and delete profile pictures
  - Supported formats: JPG, PNG, JPEG
  - Size limit: 5MB
  - Images are stored in Supabase Storage bucket `profile-pictures`

### 2. Security Settings
- **Update Password**: Users can change their password with current password verification
- **Password visibility toggle**: Show/hide password fields
- **Secure validation**: Ensures new password meets requirements (minimum 6 characters)
- **Confirmation matching**: Validates that new password and confirmation match

### 3. Notification Preferences
Users can enable/disable email notifications for:
- **Emergency Alerts**: Critical alerts and warnings
- **Report Updates**: Status changes on submitted reports
- **Social Media Summaries**: Weekly social media mention summaries
- **AI Predictions**: New hazard predictions in user's area
- **System Updates**: Maintenance and system update notifications

### 4. Appearance & Localization
- **Theme Selection**: Light, Dark, or System theme
- **Language Preference**: Support for 10 Indian languages:
  - English
  - हिन्दी (Hindi)
  - বাংলা (Bengali)
  - తెలుగు (Telugu)
  - தமிழ் (Tamil)
  - मराठी (Marathi)
  - ગુજરાતી (Gujarati)
  - ಕನ್ನಡ (Kannada)
  - മലയാളം (Malayalam)
  - ଓଡ଼ିଆ (Odia)

### 5. Account Management
- **Account Information Display**: Shows user ID, email, creation date, and role
- **Delete Account**: Secure multi-step account deletion process
  - Triple confirmation required
  - Deletes all user data (reports, settings, profile pictures)
  - Includes warning about data permanence

## Technical Implementation

### Database Schema

#### `user_settings` Table
```sql
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
```

#### Storage Bucket
- **Name**: `profile-pictures`
- **Public**: Yes (for public profile picture access)
- **Path Structure**: `{user_id}/avatar.{ext}`

### Row Level Security (RLS)
All settings data is protected with RLS policies ensuring users can only:
- View their own settings
- Update their own settings
- Insert their own settings
- Delete their own settings

### File Structure
```
src/components/settings/
└── SettingsPage.tsx          # Complete settings interface

supabase/migrations/
└── 20250919000001_add_user_settings.sql    # Database migration
```

### API Integration
The settings page integrates with:
- **Supabase Auth**: For password updates and email changes
- **Supabase Database**: For profile and settings storage
- **Supabase Storage**: For profile picture management

## User Experience

### Navigation
- Settings accessible via sidebar (bottom section)
- Clean tab-based interface with 5 main sections
- Persistent active tab state
- Loading states for all operations

### Feedback System
- Success/error messages for all operations
- Visual feedback with icons (checkmark/warning)
- Auto-dismissing messages (5-second timeout)
- Manual dismiss option

### Form Validation
- Client-side validation for all forms
- Password strength requirements
- Email format validation
- File type and size validation for profile pictures

### Responsive Design
- Mobile-friendly interface
- Grid layouts adapt to screen size
- Touch-friendly toggle switches
- Accessible form controls

## Security Features

### Password Management
- Current password verification required
- Minimum length enforcement
- Secure password visibility toggles
- Password confirmation matching

### Profile Picture Security
- File type validation (images only)
- Size limits (5MB maximum)
- User-specific storage paths
- RLS protection on storage bucket

### Account Deletion
- Multi-step confirmation process
- Clear warnings about data loss
- Complete data cleanup
- Secure text confirmation required

## Usage Instructions

### For Users
1. **Access Settings**: Click the Settings button in the sidebar
2. **Profile Updates**: Use the "User Profile" tab to update personal information
3. **Security**: Use the "Security" tab to change passwords
4. **Notifications**: Configure email preferences in the "Notifications" tab
5. **Appearance**: Customize theme and language in the "Appearance" tab
6. **Account**: View account info or delete account in the "Account" tab

### For Developers
1. **Database Setup**: Run the migration `20250919000001_add_user_settings.sql`
2. **Storage Setup**: The migration creates the `profile-pictures` bucket automatically
3. **Environment**: Ensure Supabase URL and keys are configured
4. **Import**: The SettingsPage component is imported in App.tsx

## Future Enhancements

### Planned Features
- Two-factor authentication setup
- Export user data functionality
- Advanced notification scheduling
- Custom theme color selection
- Bulk notification preferences
- Account suspension (temporary deactivation)

### Integration Opportunities
- Connect with external authentication providers
- Integrate with email service for notifications
- Add push notification support
- Implement notification history tracking

## Troubleshooting

### Common Issues
1. **Profile picture not uploading**: Check file size (must be < 5MB) and format (images only)
2. **Email change not working**: Check for email confirmation in inbox
3. **Settings not saving**: Verify user authentication and database connection
4. **Theme not applying**: Ensure theme value is correctly stored and applied to DOM

### Error Handling
- All operations include try-catch blocks
- User-friendly error messages
- Console logging for debugging
- Graceful degradation for missing features

## Compliance & Privacy

### Data Protection
- All user data is encrypted at rest
- RLS ensures data privacy
- Account deletion removes all personal data
- No third-party data sharing

### Accessibility
- Keyboard navigation support
- Screen reader friendly
- High contrast mode support
- Focus indicators on all interactive elements

This comprehensive settings system provides users with complete control over their account while maintaining security and privacy standards.
