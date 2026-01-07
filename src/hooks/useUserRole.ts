import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthGuard';
import { useQuery } from '@tanstack/react-query';

const fetchUserRoles = async (userId: string): Promise<string[]> => {
    if (!userId) return [];
    
    try {
        const { data, error } = await supabase
            .from('user_roles')
            .select('role_id')
            .eq('user_id', userId);

        if (error) return []; // Return empty instead of throwing to prevent crash
        return (data || []).map((r: any) => r.role_id);
    } catch (e) {
        return [];
    }
};

export const useUserRole = () => {
  const { user, isLoading: isAuthLoading } = useAuth();

  const { data: roles = [], isLoading: isRoleLoading } = useQuery({
    queryKey: ['userRoles', user?.id],
    queryFn: () => fetchUserRoles(user!.id),
    enabled: !!user && !isAuthLoading,
    staleTime: 1000 * 60 * 5,
  });

  const isAdmin = roles.includes('admin');
  
  return { roles, isAdmin, isLoading: isRoleLoading || isAuthLoading };
};