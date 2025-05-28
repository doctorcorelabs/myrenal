import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient'; // Import Supabase client
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

// User type including profile level - Updated levels
export type UserLevel = 'Free' | 'Researcher' | 'Administrator';

type User = {
  id: string;
  email?: string;
  level: UserLevel | null; // Add level from profiles table
  // Add other fields from Supabase user or profile if needed
};

interface AuthContextType {
  user: User | null;
  level: UserLevel | null;
  session: Session | null;
  isAuthenticated: boolean;
  navigate: (path: string) => void; // Add navigate function
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  isUpgradeDialogOpen: boolean;
  openUpgradeDialog: () => void;
  closeUpgradeDialog: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [level, setLevel] = useState<UserLevel | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [navigate, setNavigate] = useState(() => () => {}); // Initialize navigate
  const [loading, setLoading] = useState<boolean>(true);
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState<boolean>(false);

  // Function to fetch user profile including level
  const fetchUserProfile = async (supabaseUser: SupabaseUser): Promise<User | null> => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('level')
        .eq('id', supabaseUser.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116: 'Row not found' - expected if profile not created yet
        console.error('Error fetching profile:', error);
        return { id: supabaseUser.id, email: supabaseUser.email, level: null };
      }

      return {
        id: supabaseUser.id,
        email: supabaseUser.email,
        level: profile?.level as UserLevel ?? 'Free',
      };
    } catch (err) {
      console.error('Exception fetching profile:', err);
      return { id: supabaseUser.id, email: supabaseUser.email, level: null };
    }
  };


  useEffect(() => {
    setLoading(true);
    let isMounted = true;

    const handleAuthChange = async (session: Session | null) => {
      if (!isMounted) return;

      setSession(session);
      setIsAuthenticated(!!session);

      if (session?.user) {
        const profileData = await fetchUserProfile(session.user);
        if (isMounted) {
          setUser(profileData);
          setLevel(profileData?.level ?? null);
        }
      } else {
        if (isMounted) {
          setUser(null);
          setLevel(null);
        }
      }
      if (isMounted) {
         setLoading(false);
      }
    };

    // Get initial session and profile
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuthChange(session);
    });

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // Don't setLoading(true) here, only on explicit actions like login/logout/register
      handleAuthChange(session);
    });

    // Initialize navigate
    if (isMounted) {
      setNavigate(() => (path: string) => {
        // Use a try-catch block to handle potential errors
        try {
          // Access the history object from the router context
          window.location.href = path;
        } catch (error) {
          console.error("Navigation error:", error);
          // Handle the error appropriately, e.g., display an error message
        }
      });
    }

    // Cleanup listener on unmount
    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) throw error;
    return data;
  };

  const register = async (email: string, password: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    setLoading(false);

    if (error) {
      throw error;
    }
    return data;
  };

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
  };

  // Removed upgradeToResearcher function

  // Don't render children until initial auth check is complete
  if (loading) {
     return <div>Loading Authentication...</div>;
  }

  // Functions to control the global upgrade dialog
  const openUpgradeDialog = () => {
    setIsUpgradeDialogOpen(true);
  };

  const closeUpgradeDialog = () => {
    setIsUpgradeDialogOpen(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      level,
      session,
      isAuthenticated,
      navigate,
      loading,
      login,
      register,
      logout,
      isUpgradeDialogOpen,
      openUpgradeDialog,
      closeUpgradeDialog
    }}>
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
