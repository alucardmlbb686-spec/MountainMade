"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { getSharedSupabaseClient } from '@/hooks/useSupabaseClient';
import { useSupabaseErrorHandler } from '@/hooks/useSupabaseErrorHandler';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'user' | 'wholesale';
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  authReady: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: () => boolean;
  isWholesale: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const router = useRouter();
  const supabase = getSharedSupabaseClient();

  // Suppress unhandled Supabase AbortErrors globally
  useSupabaseErrorHandler();

  useEffect(() => {
    let isMounted = true;

    const getUser = async () => {
      try {
        // Wait for auth session to be initialized
        await supabase.auth.getSession();
        
        if (!isMounted) return;
        setAuthReady(true);

        const { data: { user } } = await supabase.auth.getUser();
        
        if (!isMounted) return;
        setUser(user);
        
        if (user) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (isMounted && profile) {
            setUserProfile({
              id: profile.id,
              email: profile.email,
              fullName: profile.full_name,
              role: profile.role,
              avatarUrl: profile.avatar_url,
            });
          }
        }
      } catch (error) {
        if (isMounted) {
          // Suppress AbortError and allow UI to load
          const errorName = (error as any)?.name || '';
          const errorMsg = String((error as any)?.message || '');
          
          // Check for AbortError by name and message
          const isAbortError = errorName.includes('AbortError') || errorMsg.includes('AbortError');
          
          if (!isAbortError) {
            console.error('Auth initialization failed:', error);
          }
          setAuthReady(true); // Set to true anyway to prevent UI blocks
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (isMounted && profile) {
          setUserProfile({
            id: profile.id,
            email: profile.email,
            fullName: profile.full_name,
            role: profile.role,
            avatarUrl: profile.avatar_url,
          });
        }
      } else {
        if (isMounted) {
          setUserProfile(null);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error: any) {
      const errorMessage = error?.message || 'Authentication failed';
      
      // Filter out abort errors that are already being handled by React
      if (errorMessage.includes('AbortError') || errorMessage.includes('abort')) {
        console.debug('Request was cancelled');
        return;
      }
      
      throw error;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserProfile(null);
    router.push('/homepage');
    router.refresh();
  };

  const isAdmin = () => {
    return userProfile?.role === 'admin';
  };

  const isWholesale = () => {
    return userProfile?.role === 'wholesale';
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, authReady, signIn, signOut, isAdmin, isWholesale }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}