import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ConfigItem {
  key: string;
  value: string;
  description: string | null;
  updated_at: string;
}

interface ConfigUpdateInput {
  key: string;
  value: string;
  description?: string | null;
}

const fetchAllConfig = async (): Promise<ConfigItem[]> => {
  // RLS ensures only admins can read this table
  const { data, error } = await supabase
    .from('config')
    .select('*')
    .order('key', { ascending: true });

  if (error) {
    console.error("Error fetching configuration:", error);
    throw new Error(error.message);
  }
  return data as ConfigItem[];
};

const upsertConfig = async (data: ConfigUpdateInput): Promise<ConfigItem> => {
  const { data: result, error } = await supabase
    .from('config')
    .upsert(data, { onConflict: 'key' })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return result as ConfigItem;
};

export const useConfig = () => {
  const queryClient = useQueryClient();
  const queryKey = ['systemConfig'];

  const configQuery = useQuery({
    queryKey,
    queryFn: fetchAllConfig,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const upsertMutation = useMutation({
    mutationFn: upsertConfig,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey });
      toast.success(`Setting '${data.key}' updated successfully.`);
    },
    onError: (error: any) => {
      toast.error(`Failed to save configuration: ${error.message}`);
    }
  });

  return {
    config: configQuery.data || [],
    isLoading: configQuery.isLoading,
    isError: configQuery.isError,
    upsertConfig: upsertMutation.mutateAsync,
    isSaving: upsertMutation.isPending,
  };
};