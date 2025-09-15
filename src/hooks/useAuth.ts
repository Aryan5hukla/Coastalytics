import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, UserProfile } from '../lib/supabase';

export interface AuthUser {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthUser>({
    user: null,
    profile: null,
    loading: true,
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setAuthState({ user: null, profile: null, loading: false });
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          fetchUserProfile(session.user);
        } else {
          setAuthState({ user: null, profile: null, loading: false });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (user: User) => {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        setAuthState({ user, profile: null, loading: false });
        return;
      }

      setAuthState({ user, profile, loading: false });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setAuthState({ user, profile: null, loading: false });
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, userData: Partial<UserProfile>) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData.full_name || '',
          role: userData.role || 'citizen',
          organization: userData.organization || '',
          phone: userData.phone || '',
        }
      }
    });

    if (error) throw error;

    // Check if email confirmation is required
    if (data.user && !data.session) {
      // User created but not signed in - email confirmation required
      console.log('User created, email confirmation required');
      // Don't attempt auto-signin as it will fail
      // Return the signup data as-is
      return data;
    }

    return data;
  };

  return {
    ...authState,
    signIn,
    signOut,
    signUp,
  };
}