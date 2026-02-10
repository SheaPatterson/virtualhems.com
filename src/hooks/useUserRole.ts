import { useAuth } from '@/components/AuthGuard';

export const useUserRole = () => {
  const { user, profile, isLoading } = useAuth();

  // Check if user has admin flag in their profile
  const isAdmin = profile?.is_admin === true;
  
  // Build roles array from profile
  const roles: string[] = [];
  if (isAdmin) roles.push('admin');
  if (profile?.is_subscribed) roles.push('subscriber');
  
  return { 
    roles, 
    isAdmin, 
    isLoading 
  };
};
