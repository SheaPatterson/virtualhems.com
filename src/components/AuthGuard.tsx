import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Loader2, Activity, ShieldAlert } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, isLoading: true });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export const AuthGuard: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !user && location.pathname !== '/login') {
      navigate('/login', { state: { from: location }, replace: true });
    }
  }, [user, isLoading, navigate, location]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background space-y-6">
        <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <Activity className="absolute inset-0 m-auto h-6 w-6 text-primary animate-pulse" />
        </div>
        <div className="text-center space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Validating Credentials</p>
            <p className="text-xs text-muted-foreground animate-pulse font-mono uppercase">Syncing Security Handshake...</p>
        </div>
      </div>
    );
  }

  if (!user && location.pathname !== '/login') {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-background space-y-4">
              <ShieldAlert className="w-12 h-12 text-destructive" />
              <p className="text-sm font-bold uppercase tracking-widest italic">Redirecting to Secure Login...</p>
          </div>
      );
  }

  return children ? <>{children}</> : <Outlet />;
};