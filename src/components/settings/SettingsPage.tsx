import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSettings } from '../../contexts/SettingsContext';
import { supabase } from '../../lib/supabase';
import {
  User,
  Lock,
  Camera,
  Trash2,
  Bell,
  Sun,
  Moon,
  Globe,
  Save,
  Eye,
  EyeOff,
  Upload,
  X,
  Check,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

interface NotificationSettings {
  email_alerts: boolean;
  email_reports: boolean;
  email_social_mentions: boolean;
  email_predictions: boolean;
  email_system_updates: boolean;
}

interface UserSettings {
  theme: 'light' | 'dark';
  language: string;
  notifications: NotificationSettings;
}

interface SettingsPageProps {
  initialTab?: string;
  onTabChange?: (tab: string) => void;
}

export default function SettingsPage({ initialTab = 'profile', onTabChange }: SettingsPageProps) {
  const { user, profile, refreshProfile } = useAuth();
  const { language, setLanguage: setGlobalLanguage, t, availableLanguages } = useLanguage();
  const { 
    previewSettings, 
    savedSettings, 
    setPreviewSetting, 
    saveChanges, 
    discardChanges, 
    hasUnsavedChanges, 
    loading: settingsLoading 
  } = useSettings();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Profile form states
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    organization: ''
  });
  
  // Password form states
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  // Settings are now managed by the SettingsProvider context
  
  // Profile picture states
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [uploadingPicture, setUploadingPicture] = useState(false);

  // Update activeTab when initialTab changes
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Language is now managed by the SettingsProvider context

  // Handle tab change and notify parent
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  // Load user data and profile picture on component mount
  useEffect(() => {
    if (user && profile) {
      loadUserData();
      loadProfilePicture();
    }
  }, [user, profile]);

  // Load user profile data into form
  const loadUserData = () => {
    setProfileForm({
      full_name: profile?.full_name || '',
      email: user?.email || '',
      phone: profile?.phone || '',
      organization: profile?.organization || ''
    });
  };


  const loadProfilePicture = async () => {
    if (!user) return;
    
    try {
      // List all files in the user's folder to find any profile picture
      const { data: files, error: listError } = await supabase.storage
        .from('profile-pictures')
        .list(user.id, {
          limit: 10,
          offset: 0
        });
      
      if (listError) {
        console.error('Error listing profile pictures:', listError);
        return;
      }
      
      // Find avatar file (any extension)
      const avatarFile = files?.find(file => file.name.startsWith('avatar.'));
      
      if (avatarFile) {
        const { data } = supabase.storage
          .from('profile-pictures')
          .getPublicUrl(`${user.id}/${avatarFile.name}`);
        
        if (data?.publicUrl) {
          // Check if image actually exists by trying to load it
          const img = new Image();
          img.onload = () => setProfilePicture(data.publicUrl);
          img.onerror = () => {
            console.error('Failed to load profile picture from URL:', data.publicUrl);
            setProfilePicture(null);
          };
          img.src = data.publicUrl;
        }
      } else {
        setProfilePicture(null);
      }
    } catch (error) {
      console.error('Error loading profile picture:', error);
      setProfilePicture(null);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let emailChanged = false;
      
      // Update auth email if changed
      if (profileForm.email !== user?.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: profileForm.email
        });
        
        if (emailError) throw emailError;
        emailChanged = true;
      }
      
      // Update profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          full_name: profileForm.full_name,
          phone: profileForm.phone,
          organization: profileForm.organization,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);
      
      if (profileError) throw profileError;
      
      // Refresh profile data to reflect changes immediately
      await refreshProfile();
      
      // Show appropriate success message
      if (emailChanged) {
        showMessage('success', 'Profile updated! Email change confirmation sent to your inbox.');
      } else {
        showMessage('success', 'Profile updated successfully!');
      }
      
    } catch (error: any) {
      console.error('Error updating profile:', error);
      showMessage('error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };


  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form inputs
    if (!passwordForm.current_password) {
      showMessage('error', 'Current password is required');
      return;
    }
    
    if (!passwordForm.new_password) {
      showMessage('error', 'New password is required');
      return;
    }
    
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      showMessage('error', 'New passwords do not match');
      return;
    }
    
    if (passwordForm.new_password.length < 6) {
      showMessage('error', 'Password must be at least 6 characters long');
      return;
    }
    
    if (passwordForm.new_password === passwordForm.current_password) {
      showMessage('error', 'New password must be different from current password');
      return;
    }
    
    // Check for password strength
    const hasUpperCase = /[A-Z]/.test(passwordForm.new_password);
    const hasLowerCase = /[a-z]/.test(passwordForm.new_password);
    const hasNumbers = /\d/.test(passwordForm.new_password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(passwordForm.new_password);
    
    if (passwordForm.new_password.length < 8 || !hasUpperCase || !hasLowerCase || !hasNumbers) {
      showMessage('error', 'Password must be at least 8 characters and contain uppercase, lowercase, and numbers');
      return;
    }
    
    setLoading(true);
    
    try {
      // First, verify the current password by attempting to sign in with it
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: passwordForm.current_password
      });
      
      if (signInError) {
        throw new Error('Current password is incorrect');
      }
      
      // If current password is correct, update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordForm.new_password
      });
      
      if (updateError) throw updateError;
      
      // Clear the form
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      
      showMessage('success', 'Password updated successfully! Please use your new password for future logins.');
      
      // Log the password change event
      console.log('Password changed successfully for user:', user?.id);
      
    } catch (error: any) {
      console.error('Error updating password:', error);
      
      // Provide specific error messages
      if (error.message === 'Current password is incorrect') {
        showMessage('error', 'Current password is incorrect');
      } else if (error.message?.includes('Password should be at least')) {
        showMessage('error', error.message);
      } else if (error.message?.includes('signup is disabled')) {
        showMessage('error', 'Password updates are currently disabled. Please contact support.');
      } else if (error.message?.includes('rate limit')) {
        showMessage('error', 'Too many password change attempts. Please wait before trying again.');
      } else {
        showMessage('error', error.message || 'Failed to update password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) {
      console.log('No file selected or user not available');
      return;
    }
    
    console.log('Selected file:', file.name, file.type, file.size);
    
    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      showMessage('error', 'Please select an image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      showMessage('error', 'Image size must be less than 5MB');
      return;
    }
    
    setUploadingPicture(true);
    
    try {
      // First, try to create the bucket if it doesn't exist
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      console.log('Available buckets:', buckets);
      
      const profilePicturesBucket = buckets?.find(bucket => bucket.id === 'profile-pictures');
      if (!profilePicturesBucket) {
        console.log('Profile pictures bucket not found, attempting to create...');
        const { error: createBucketError } = await supabase.storage.createBucket('profile-pictures', {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'],
          fileSizeLimit: 5242880 // 5MB
        });
        
        if (createBucketError) {
          console.error('Error creating bucket:', createBucketError);
          // Continue anyway - bucket might exist but not be visible
        }
      }
      
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `avatar.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      console.log('Uploading to path:', filePath);
      
      // Remove existing avatar files first
      try {
        await supabase.storage
          .from('profile-pictures')
          .remove([`${user.id}/avatar.jpg`, `${user.id}/avatar.png`, `${user.id}/avatar.jpeg`, `${user.id}/avatar.gif`, `${user.id}/avatar.webp`]);
      } catch (removeError) {
        console.log('Error removing existing files (this is okay):', removeError);
      }
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, file, { 
          upsert: true,
          contentType: file.type
        });
      
      console.log('Upload result:', { uploadData, uploadError });
      
      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw uploadError;
      }
      
      // Get public URL
      const { data } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);
      
      console.log('Public URL:', data.publicUrl);
      
      if (data?.publicUrl) {
        setProfilePicture(data.publicUrl);
        showMessage('success', 'Profile picture updated successfully!');
        
        // Clear the input to allow re-upload of the same file
        e.target.value = '';
      } else {
        throw new Error('Failed to get public URL for uploaded image');
      }
    } catch (error: any) {
      console.error('Error uploading profile picture:', error);
      
      // Provide more specific error messages
      if (error.message?.includes('bucket')) {
        showMessage('error', 'Storage not properly configured. Please contact support.');
      } else if (error.message?.includes('policy')) {
        showMessage('error', 'Permission denied. Please check your account permissions.');
      } else if (error.message?.includes('size')) {
        showMessage('error', 'File too large. Please select an image under 5MB.');
      } else {
        showMessage('error', `Upload failed: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleDeleteProfilePicture = async () => {
    if (!user || !profilePicture) return;
    
    setUploadingPicture(true);
    
    try {
      // List all files in the user's folder and remove avatar files
      const { data: files, error: listError } = await supabase.storage
        .from('profile-pictures')
        .list(user.id);
      
      if (listError) {
        console.error('Error listing files:', listError);
        throw listError;
      }
      
      const avatarFiles = files?.filter(file => file.name.startsWith('avatar.')) || [];
      const filePaths = avatarFiles.map(file => `${user.id}/${file.name}`);
      
      if (filePaths.length > 0) {
        const { error } = await supabase.storage
          .from('profile-pictures')
          .remove(filePaths);
        
        if (error) throw error;
      }
      
      setProfilePicture(null);
      showMessage('success', 'Profile picture removed successfully!');
    } catch (error: any) {
      console.error('Error deleting profile picture:', error);
      showMessage('error', error.message || 'Failed to delete profile picture');
    } finally {
      setUploadingPicture(false);
    }
  };

  // Theme application is now handled by the SettingsProvider context

  const handleSettingsUpdate = async () => {
    setLoading(true);
    
    try {
      const success = await saveChanges();
      if (success) {
        showMessage('success', t('settings.saveChanges') + ' successful!');
      } else {
        showMessage('error', 'Failed to save settings');
      }
    } catch (error: any) {
      console.error('Error updating settings:', error);
      showMessage('error', error.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleDiscardChanges = () => {
    discardChanges();
    showMessage('info', 'Changes discarded');
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    
    if (!confirmed) return;
    
    const doubleConfirm = window.confirm(
      'This will permanently delete all your data including reports, settings, and profile information. Type "DELETE" in the next prompt to confirm.'
    );
    
    if (!doubleConfirm) return;
    
    const deleteConfirmation = window.prompt('Type "DELETE" to confirm account deletion:');
    
    if (deleteConfirmation !== 'DELETE') {
      showMessage('error', 'Account deletion cancelled - confirmation text did not match');
      return;
    }
    
    setLoading(true);
    
    try {
      // Delete user data from our tables
      await supabase.from('user_profiles').delete().eq('id', user.id);
      await supabase.from('user_settings').delete().eq('user_id', user.id);
      await supabase.from('reports').delete().eq('citizen_id', user.id);
      
      // Delete profile picture
      await supabase.storage
        .from('profile-pictures')
        .remove([`${user.id}/avatar.jpg`, `${user.id}/avatar.png`, `${user.id}/avatar.jpeg`]);
      
      // Note: Supabase doesn't allow deleting auth users from client side
      // This would need to be handled by an admin function
      showMessage('success', 'Account data deleted. Please contact support to complete account deletion.');
      
    } catch (error: any) {
      console.error('Error deleting account:', error);
      showMessage('error', error.message || 'Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: t('settings.userProfile'), icon: User },
    { id: 'security', label: t('settings.security'), icon: Lock },
    { id: 'notifications', label: t('settings.notifications'), icon: Bell },
    { id: 'appearance', label: t('settings.appearance'), icon: Sun },
    { id: 'account', label: t('settings.account'), icon: Trash2 }
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
          message.type === 'success' 
            ? 'bg-green-500/20 border border-green-500/30 text-green-400' 
            : 'bg-red-500/20 border border-red-500/30 text-red-400'
        }`}>
          {message.type === 'success' ? (
            <Check className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{message.text}</span>
          <button 
            onClick={() => setMessage(null)}
            className="ml-auto p-1 hover:bg-white/10 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg mb-6">
        <div className="grid grid-cols-5 w-full divide-x divide-slate-700">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-sky-500/20 text-sky-400 border-b-2 border-sky-500'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-4">{t('settings.userProfile')}</h2>
            
            {/* Profile Picture Section */}
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
                  {profilePicture ? (
                    <img 
                      src={profilePicture} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-slate-400" />
                  )}
                </div>
                {uploadingPicture && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-400"></div>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <div className="flex flex-wrap gap-3">
                  <label className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors flex items-center space-x-2">
                    <Upload className="w-4 h-4" />
                    <span>{t('settings.uploadPhoto')}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureUpload}
                      className="hidden"
                      disabled={uploadingPicture}
                    />
                  </label>
                  
                  {profilePicture && (
                    <button
                      onClick={handleDeleteProfilePicture}
                      disabled={uploadingPicture}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>{t('settings.removePhoto')}</span>
                    </button>
                  )}
                </div>
                <p className="text-sm text-slate-400">
                  {t('settings.photoRecommendation')}
                </p>
              </div>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t('settings.fullName')}
                  </label>
                  <input
                    type="text"
                    value={profileForm.full_name}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, full_name: e.target.value }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t('settings.email')}
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t('settings.phone')}
                  </label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t('settings.organization')}
                  </label>
                  <input
                    type="text"
                    value={profileForm.organization}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, organization: e.target.value }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? t('settings.saving') : t('settings.saveChanges')}</span>
              </button>
            </form>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-4">Security Settings</h2>
            
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordForm.current_password}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, current_password: e.target.value }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, new_password: e.target.value }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                {/* Password Requirements */}
                {passwordForm.new_password && (
                  <div className="mt-2 p-3 bg-slate-700/50 border border-slate-600 rounded-lg">
                    <p className="text-sm font-medium text-slate-300 mb-2">Password Requirements:</p>
                    <div className="space-y-1">
                      <div className={`flex items-center space-x-2 text-xs ${
                        passwordForm.new_password.length >= 8 ? 'text-green-400' : 'text-slate-400'
                      }`}>
                        <span>{passwordForm.new_password.length >= 8 ? '✓' : '○'}</span>
                        <span>At least 8 characters</span>
                      </div>
                      <div className={`flex items-center space-x-2 text-xs ${
                        /[A-Z]/.test(passwordForm.new_password) ? 'text-green-400' : 'text-slate-400'
                      }`}>
                        <span>{/[A-Z]/.test(passwordForm.new_password) ? '✓' : '○'}</span>
                        <span>Uppercase letter</span>
                      </div>
                      <div className={`flex items-center space-x-2 text-xs ${
                        /[a-z]/.test(passwordForm.new_password) ? 'text-green-400' : 'text-slate-400'
                      }`}>
                        <span>{/[a-z]/.test(passwordForm.new_password) ? '✓' : '○'}</span>
                        <span>Lowercase letter</span>
                      </div>
                      <div className={`flex items-center space-x-2 text-xs ${
                        /\d/.test(passwordForm.new_password) ? 'text-green-400' : 'text-slate-400'
                      }`}>
                        <span>{/\d/.test(passwordForm.new_password) ? '✓' : '○'}</span>
                        <span>Number</span>
                      </div>
                      <div className={`flex items-center space-x-2 text-xs ${
                        /[!@#$%^&*(),.?":{}|<>]/.test(passwordForm.new_password) ? 'text-green-400' : 'text-slate-400'
                      }`}>
                        <span>{/[!@#$%^&*(),.?":{}|<>]/.test(passwordForm.new_password) ? '✓' : '○'}</span>
                        <span>Special character (recommended)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordForm.confirm_password}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm_password: e.target.value }))}
                    className={`w-full bg-slate-700 border rounded-lg px-3 py-2 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                      passwordForm.confirm_password && passwordForm.new_password
                        ? passwordForm.confirm_password === passwordForm.new_password
                          ? 'border-green-500'
                          : 'border-red-500'
                        : 'border-slate-600'
                    }`}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                {/* Password Match Indicator */}
                {passwordForm.confirm_password && passwordForm.new_password && (
                  <p className={`mt-1 text-xs ${
                    passwordForm.confirm_password === passwordForm.new_password
                      ? 'text-green-400'
                      : 'text-red-400'
                  }`}>
                    {passwordForm.confirm_password === passwordForm.new_password
                      ? '✓ Passwords match'
                      : '✗ Passwords do not match'
                    }
                  </p>
                )}
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Lock className="w-4 h-4" />
                <span>{loading ? 'Updating...' : 'Update Password'}</span>
              </button>
            </form>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-4">Notification Preferences</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Emergency Alerts</h3>
                  <p className="text-sm text-slate-400">Get notified about emergency alerts and warnings</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={previewSettings.notifications.email_alerts}
                    onChange={(e) => setPreviewSetting('notifications', {
                      ...previewSettings.notifications,
                      email_alerts: e.target.checked
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Report Updates</h3>
                  <p className="text-sm text-slate-400">Get notified when your reports are verified or updated</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={previewSettings.notifications.email_reports}
                    onChange={(e) => setPreviewSetting('notifications', {
                      ...previewSettings.notifications,
                      email_reports: e.target.checked
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Social Media Summaries</h3>
                  <p className="text-sm text-slate-400">Get weekly summaries of social media mentions</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={previewSettings.notifications.email_social_mentions}
                    onChange={(e) => setPreviewSetting('notifications', {
                      ...previewSettings.notifications,
                      email_social_mentions: e.target.checked
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">AI Predictions</h3>
                  <p className="text-sm text-slate-400">Get notified about new hazard predictions in your area</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={previewSettings.notifications.email_predictions}
                    onChange={(e) => setPreviewSetting('notifications', {
                      ...previewSettings.notifications,
                      email_predictions: e.target.checked
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">System Updates</h3>
                  <p className="text-sm text-slate-400">Get notified about system maintenance and updates</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={previewSettings.notifications.email_system_updates}
                    onChange={(e) => setPreviewSetting('notifications', {
                      ...previewSettings.notifications,
                      email_system_updates: e.target.checked
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                </label>
              </div>
            </div>
            
            <button
              onClick={handleSettingsUpdate}
              disabled={loading}
              className="bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? t('settings.saving') : t('settings.saveChanges')}</span>
            </button>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-4">{t('settings.appearance')} & {t('settings.language')}</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-white font-medium mb-3">{t('settings.theme')}</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'light', label: t('settings.light'), icon: Sun },
                    { value: 'dark', label: t('settings.dark'), icon: Moon }
                  ].map((theme) => {
                    const Icon = theme.icon;
                    return (
                      <button
                        key={theme.value}
                        onClick={() => {
                          const newTheme = theme.value as 'light' | 'dark';
                          setPreviewSetting('theme', newTheme);
                        }}
                        className={`p-4 rounded-lg border-2 transition-colors flex flex-col items-center space-y-2 ${
                          previewSettings.theme === theme.value
                            ? 'border-sky-500 bg-sky-500/20'
                            : 'border-slate-600 bg-slate-700 hover:border-slate-500'
                        }`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                        <span className="text-white text-sm font-medium">{theme.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div>
                <h3 className="text-white font-medium mb-3">{t('settings.language')}</h3>
                <select
                  value={previewSettings.language}
                  onChange={(e) => {
                    const newLanguage = e.target.value;
                    setPreviewSetting('language', newLanguage);
                  }}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {availableLanguages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.nativeName} ({lang.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {hasUnsavedChanges && (
              <div className="flex items-center space-x-4 pt-4 border-t border-slate-700">
                <button
                  onClick={handleSettingsUpdate}
                  disabled={loading || settingsLoading}
                  className="bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading || settingsLoading ? t('settings.saving') : t('settings.saveChanges')}</span>
                </button>
                <button
                  onClick={handleDiscardChanges}
                  disabled={loading || settingsLoading}
                  className="bg-slate-600 hover:bg-slate-500 disabled:opacity-50 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'account' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-4">Account Management</h2>
            
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-red-400 font-medium mb-2">Delete Account</h3>
                  <p className="text-slate-300 text-sm mb-4">
                    Permanently delete your account and all associated data. This action cannot be undone.
                    All your reports, settings, and profile information will be permanently removed.
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={loading}
                    className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{loading ? 'Deleting...' : 'Delete Account'}</span>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6">
              <h3 className="text-white font-medium mb-2">Account Information</h3>
              <div className="space-y-2 text-sm text-slate-300">
                <p><span className="font-medium">User ID:</span> {user?.id}</p>
                <p><span className="font-medium">Email:</span> {user?.email}</p>
                <p><span className="font-medium">Account Created:</span> {new Date(user?.created_at || '').toLocaleDateString()}</p>
                <p><span className="font-medium">Role:</span> {profile?.role}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
