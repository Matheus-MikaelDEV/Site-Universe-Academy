import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Session, User } from "@supabase/supabase-js";

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
  cpf: string | null;
  points?: number;
  email?: string | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  refetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  refetchProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (currentUser: User | null) => {
    if (currentUser) {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single();
      
      if (profileError) {
        console.error("Error fetching profile:", profileError.message);
        setProfile(null);
      } else {
        setProfile(profileData);
      }
    } else {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    // Initial check for session to set state and loading correctly
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      fetchProfile(currentUser).finally(() => setLoading(false)); // Ensure loading is false after initial fetch
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session); // Added logging for debugging
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        // Only refetch profile if user is signed in, token refreshed, or initial session
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
          await fetchProfile(currentUser);
        } else if (event === 'SIGNED_OUT') {
          setProfile(null); // Clear profile on sign out
        }
        setLoading(false); // Ensure loading is false after any auth state change
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [fetchProfile]);

  const refetchProfile = useCallback(async () => {
    await fetchProfile(user);
  }, [user, fetchProfile]);

  const value = {
    session,
    user,
    profile,
    loading,
    isAdmin: !loading && profile?.role === 'admin',
    refetchProfile,
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