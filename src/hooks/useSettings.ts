import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

interface NotificationSettings {
  email_alerts: boolean;
  email_reports: boolean;
  email_social_mentions: boolean;
  email_predictions: boolean;
  email_system_updates: boolean;
}

interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: NotificationSettings;
}

export function useSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'dark',
    language: 'en',
    notifications: {
      email_alerts: true,
      email_reports: true,
      email_social_mentions: false,
      email_predictions: true,
      email_system_updates: true
    }
  });
  const [loading, setLoading] = useState(false);

  // Load settings when user changes
  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (data && !error) {
        const loadedSettings = {
          theme: data.theme || 'dark',
          language: data.language || 'en',
          notifications: data.notifications || settings.notifications
        };
        setSettings(loadedSettings);
        
        // Apply theme from database
        document.documentElement.setAttribute('data-theme', loadedSettings.theme);
        localStorage.setItem('coastalytics_theme', loadedSettings.theme);
        localStorage.setItem('coastalytics_language', loadedSettings.language);
      } else if (error && error.code === 'PGRST116') {
        // No settings found, use defaults
        console.log('No user settings found, using defaults');
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user) return false;
    
    setLoading(true);
    try {
      const updatedSettings = { ...settings, ...newSettings };
      
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          theme: updatedSettings.theme,
          language: updatedSettings.language,
          notifications: updatedSettings.notifications,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      // Update local state
      setSettings(updatedSettings);
      
      // Apply theme immediately
      if (newSettings.theme) {
        document.documentElement.setAttribute('data-theme', newSettings.theme);
        localStorage.setItem('coastalytics_theme', newSettings.theme);
      }
      
      if (newSettings.language) {
        localStorage.setItem('coastalytics_language', newSettings.language);
      }
      
      return true;
    } catch (error) {
      console.error('Error updating settings:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    settings,
    loading,
    updateSettings,
    refreshSettings: loadSettings
  };
}
