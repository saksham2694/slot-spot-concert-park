
import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

// Define a type for user profile
export interface UserProfile {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch user profile
  const fetchProfile = async (userId: string) => {
    console.log("Fetching profile for user:", userId);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      
      // If profile not found, let's create one
      if (error.code === 'PGRST116') {
        console.log('Profile not found, creating default profile');
        const { data: userData } = await supabase.auth.getUser();
        
        if (userData?.user) {
          const defaultProfile = {
            id: userData.user.id,
            first_name: userData.user.user_metadata?.first_name,
            last_name: userData.user.user_metadata?.last_name,
          };
          
          const { error: insertError, data: newProfile } = await supabase
            .from('profiles')
            .insert([defaultProfile])
            .select()
            .single();
            
          if (insertError) {
            console.error('Failed to create default profile:', insertError);
            return null;
          }
          return newProfile;
        }
      }
      
      return null;
    }
    
    console.log('Profile fetched successfully:', data);
    return data;
  };

  // Update user profile
  const updateProfile = async (profileData: Partial<UserProfile>) => {
    if (!user) return;
    
    console.log('Updating profile:', profileData);

    const { error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', user.id);

    if (error) {
      console.error('Profile update error:', error);
      toast({
        title: 'Profile Update Failed',
        description: error.message,
        variant: 'destructive'
      });
      return;
    }

    // Optimistically update local state
    setProfile(prev => ({ ...prev, ...profileData }) as UserProfile);
    
    toast({
      title: 'Profile Updated',
      description: 'Your profile has been successfully updated.'
    });
    
    console.log('Profile updated successfully');
  };

  useEffect(() => {
    console.log('Setting up auth state listener');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          console.log('User authenticated:', currentSession.user.email);
          const userProfile = await fetchProfile(currentSession.user.id);
          setProfile(userProfile);
        } else {
          console.log('No authenticated user');
          setProfile(null);
        }

        setIsLoading(false);

        if (event === 'SIGNED_IN') {
          toast({
            title: "Signed in",
            description: "You have successfully signed in",
          });
        } else if (event === 'SIGNED_OUT') {
          toast({
            title: "Signed out",
            description: "You have successfully signed out",
          });
        }
      }
    );

    // Initial session check
    console.log('Checking for existing session');
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      console.log('Initial session check:', currentSession ? 'Session found' : 'No session');
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        console.log('User authenticated from session check:', currentSession.user.email);
        const userProfile = await fetchProfile(currentSession.user.id);
        setProfile(userProfile);
      }
      
      setIsLoading(false);
    }).catch(error => {
      console.error('Error checking session:', error);
      setIsLoading(false);
    });

    return () => {
      console.log('Cleaning up auth state listener');
      subscription.unsubscribe();
    };
  }, [toast]);

  const signOut = async () => {
    console.log('Signing out...');
    await supabase.auth.signOut();
    console.log('Sign out complete');
  };

  const value = {
    user,
    profile,
    session,
    isLoading,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
