import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

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

interface SettingsContextType {
  savedSettings: UserSettings | null;
  previewSettings: UserSettings;
  setPreviewSetting: (key: keyof UserSettings, value: any) => void;
  saveChanges: () => Promise<boolean>;
  discardChanges: () => void;
  hasUnsavedChanges: boolean;
  loading: boolean;
}

const defaultSettings: UserSettings = {
  theme: 'dark',
  language: 'en',
  notifications: {
    email_alerts: true,
    email_reports: true,
    email_social_mentions: false,
    email_predictions: true,
    email_system_updates: true
  }
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: React.ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [savedSettings, setSavedSettings] = useState<UserSettings | null>(null);
  const [previewSettings, setPreviewSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(false);

  // Calculate if there are unsaved changes
  const hasUnsavedChanges = savedSettings ? 
    JSON.stringify(savedSettings) !== JSON.stringify(previewSettings) : 
    false;

  // Apply theme globally when preview theme changes
  useEffect(() => {
    const applyTheme = (theme: 'light' | 'dark') => {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
      document.documentElement.setAttribute('data-theme', theme);
      // Update localStorage immediately for consistency
      localStorage.setItem('coastalytics_theme', theme);
    };

    applyTheme(previewSettings.theme);
  }, [previewSettings.theme]);

  // Apply language changes immediately to localStorage
  useEffect(() => {
    localStorage.setItem('coastalytics_language', previewSettings.language);
  }, [previewSettings.language]);

  // Load settings from database when user changes
  useEffect(() => {
    if (user) {
      loadSettings();
    } else {
      // Reset to defaults when no user
      setSavedSettings(null);
      setPreviewSettings(defaultSettings);
    }
  }, [user]);

  // Load settings from localStorage on mount for immediate theme application
  useEffect(() => {
    const savedTheme = localStorage.getItem('coastalytics_theme') as 'light' | 'dark' || 'dark';
    const savedLanguage = localStorage.getItem('coastalytics_language') || 'en';
    
    setPreviewSettings(prev => ({
      ...prev,
      theme: savedTheme,
      language: savedLanguage
    }));
  }, []);

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
        const loadedSettings: UserSettings = {
          theme: data.theme || 'dark',
          language: data.language || 'en',
          notifications: data.notifications || defaultSettings.notifications
        };
        
        setSavedSettings(loadedSettings);
        setPreviewSettings(loadedSettings);
        
        // Update localStorage
        localStorage.setItem('coastalytics_theme', loadedSettings.theme);
        localStorage.setItem('coastalytics_language', loadedSettings.language);
        
      } else if (error && error.code === 'PGRST116') {
        // No settings found, use defaults
        setSavedSettings(defaultSettings);
        setPreviewSettings(defaultSettings);
        
        // Save defaults to database
        await supabase
          .from('user_settings')
          .insert({
            user_id: user.id,
            theme: defaultSettings.theme,
            language: defaultSettings.language,
            notifications: defaultSettings.notifications,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
      // Fallback to defaults
      setSavedSettings(defaultSettings);
      setPreviewSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  const setPreviewSetting = useCallback((key: keyof UserSettings, value: any) => {
    setPreviewSettings(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const saveChanges = useCallback(async (): Promise<boolean> => {
    if (!user || !hasUnsavedChanges) return true;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          theme: previewSettings.theme,
          language: previewSettings.language,
          notifications: previewSettings.notifications,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      // Update saved state to match preview state
      setSavedSettings({ ...previewSettings });
      
      // Update localStorage
      localStorage.setItem('coastalytics_theme', previewSettings.theme);
      localStorage.setItem('coastalytics_language', previewSettings.language);
      
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, previewSettings, hasUnsavedChanges]);

  const discardChanges = useCallback(() => {
    if (savedSettings) {
      setPreviewSettings({ ...savedSettings });
    }
  }, [savedSettings]);

  const value: SettingsContextType = {
    savedSettings,
    previewSettings,
    setPreviewSetting,
    saveChanges,
    discardChanges,
    hasUnsavedChanges,
    loading
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
