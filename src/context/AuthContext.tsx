
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  signUp: (details: any) => Promise<any>;
  signIn: (details: any) => Promise<any>;
  signOut: () => Promise<void>;
  updateProfile: (updates: any) => Promise<void>;
  checkIfAdmin: () => Promise<boolean>;
  checkIfVendor: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Defer profile loading to prevent deadlocks
        if (currentSession?.user) {
          setTimeout(() => {
            getProfile(currentSession.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log("Initial session check:", currentSession ? "Session found" : "No session");
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        getProfile(currentSession.user.id);
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getProfile = async (userId: string) => {
    try {
      setIsLoading(true);
      let { data, error, status } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setProfile(data);
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  async function signUp(details: any) {
    const { email, password, firstName, lastName } = details;
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });
      
      if (error) throw error;
      alert('Please check your email to verify your account!');
      return data;
    } catch (error: any) {
      alert(error.error_description || error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  async function signIn(details: any) {
    const { email, password } = details;
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      return data;
    } catch (error: any) {
      alert(error.error_description || error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  async function signOut() {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
    } catch (error: any) {
      alert(error.error_description || error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function updateProfile(updates: any) {
    try {
      setIsLoading(true);
      
      if (!user) throw new Error('No user logged in');
      
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        ...updates,
      });
      
      if (error) throw error;
      
      alert('Profile updated!');
      
      // Update local profile state with the updates
      if (profile) {
        setProfile({
          ...profile,
          ...updates
        });
      }
    } catch (error: any) {
      alert(error.error_description || error.message);
    } finally {
      setIsLoading(false);
    }
  }

  // Check if the authenticated user has the admin role
  const checkIfAdmin = async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('is_admin');
      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }
      return data || false;
    } catch (error) {
      console.error('Error in checkIfAdmin:', error);
      return false;
    }
  };

  // Check if the authenticated user has the vendor role
  const checkIfVendor = async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('has_role', { _role: 'vendor' });
      if (error) {
        console.error('Error checking vendor status:', error);
        return false;
      }
      return data || false;
    } catch (error) {
      console.error('Error in checkIfVendor:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        isLoading,
        signUp,
        signIn,
        signOut,
        updateProfile,
        checkIfAdmin,
        checkIfVendor,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
