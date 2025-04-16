
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
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data;
  };

  // Update user profile
  const updateProfile = async (profileData: Partial<UserProfile>) => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', user.id);

    if (error) {
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
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          const userProfile = await fetchProfile(currentSession.user.id);
          setProfile(userProfile);
        } else {
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
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        const userProfile = await fetchProfile(currentSession.user.id);
        setProfile(userProfile);
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  const signOut = async () => {
    await supabase.auth.signOut();
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
