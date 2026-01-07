import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Notam {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  active: boolean;
  created_at: string;
}

const fetchNotams = async (): Promise<Notam[]> => {
  const { data, error } = await supabase
    .from('notams')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data as Notam[];
};

export const useNotams = () => {
  const queryClient = useQueryClient();
  const queryKey = ['notams'];

  const notamsQuery = useQuery({
    queryKey,
    queryFn: fetchNotams,
  });

  const createNotam = useMutation({
    mutationFn: async (notam: Omit<Notam, 'id' | 'created_at' | 'active'>) => {
        const { data: { session } } = await supabase.auth.getSession();
        const { error } = await supabase.from('notams').insert([{ ...notam, user_id: session?.user.id }]);
        if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("NOTAM broadcasted successfully.");
    }
  });

  const deactivateNotam = useMutation({
    mutationFn: async (id: string) => {
        const { error } = await supabase.from('notams').update({ active: false }).eq('id', id);
        if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("NOTAM archived.");
    }
  });

  return {
    notams: notamsQuery.data || [],
    isLoading: notamsQuery.isLoading,
    createNotam: createNotam.mutateAsync,
    deactivateNotam: deactivateNotam.mutateAsync,
    isCreating: createNotam.isPending,
  };
};