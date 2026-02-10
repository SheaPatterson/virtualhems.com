import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Loader2, Activity, ShieldAlert } from 'lucide-react';
import { 
  getCurrentUser, 
  signIn as cognitoSignIn, 
  signOut as cognitoSignOut,
  signUp as cognitoSignUp,
  confirmSignUp,
  getIdToken,
  AuthUser
} from '@/integrations/aws/auth';
import { authAPI, UserProfile } from '@/integrations/aws/api';

interface AuthContextType {
  user: AuthUser | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ needsConfirmation: boolean }>;
  confirmAccount: (email: string, code: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isLoading: true,
  signIn: async () => {},
  signUp: async () => ({ needsConfirmation: false }),
  confirmAccount: async () => {},
  signOut: async () => {},
  refreshProfile: async () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      
      if (currentUser) {
        // Fetch full profile from backend
        try {
          const { user: profileData } = await authAPI.me();
          setProfile(profileData);
        } catch (e) {
          console.error('Failed to load profile:', e);
        }
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const signIn = async (email: string, password: string) => {
    try {
      await cognitoSignIn(email, password);
      await loadUser();
    } catch (error: any) {
      if (error.code === 'UserNotConfirmedException') {
        throw new Error('Please verify your email first');
      }
      throw error;
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    const result = await cognitoSignUp(email, password, firstName, lastName);
    return { needsConfirmation: !result.userConfirmed };
  };

  const confirmAccount = async (email: string, code: string) => {
    await confirmSignUp(email, code);
  };

  const signOut = async () => {
    await cognitoSignOut();
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) {
      try {
        const { user: profileData } = await authAPI.me();
        setProfile(profileData);
      } catch (e) {
        console.error('Failed to refresh profile:', e);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile,
      isLoading, 
      signIn, 
      signUp, 
      confirmAccount, 
      signOut,
      refreshProfile
    }}>
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
