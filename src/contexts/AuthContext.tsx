import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient'; // Import Supabase client
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

// Simplified User type for now, can be expanded
type User = {
  id: string;
  email?: string;
  // Add other fields from Supabase user or metadata if needed
  // name?: string; // Supabase doesn't store name by default in auth.users
};

interface AuthContextType {
  user: User | null;
  session: Session | null; // Expose session if needed
  isAuthenticated: boolean;
  loading: boolean; // Add loading state
  login: (email: string, password: string) => Promise<any>; // Return type depends on Supabase response
  register: (email: string, password: string) => Promise<any>; // Return type depends on Supabase response
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true); // Start loading

  useEffect(() => {
    setLoading(true);
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      const currentUser = session?.user ? { id: session.user.id, email: session.user.email } : null;
      setUser(currentUser);
      setIsAuthenticated(!!session);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      const currentUser = session?.user ? { id: session.user.id, email: session.user.email } : null;
      setUser(currentUser);
      setIsAuthenticated(!!session);
      // No need to setLoading here as it's for subsequent changes
    });

    // Cleanup listener on unmount
    return () => {
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
    // Note: Supabase signUp might require email confirmation by default
    const { data, error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) throw error;
    // User might not be immediately authenticated if email confirmation is needed
    return data;
  };

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    // State updates will be handled by onAuthStateChange listener
    setLoading(false);
  };

  // Don't render children until initial auth check is complete
  if (loading) {
     return <div>Loading Authentication...</div>; // Or a proper loading spinner component
  }

  return (
    <AuthContext.Provider value={{ user, session, isAuthenticated, loading, login, register, logout }}>
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
