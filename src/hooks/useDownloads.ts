import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DownloadItem {
  id: string;
  category: string;
  title: string;
  file_url: string;
  description: string | null;
  created_at: string;
}

interface DownloadInput {
  category: string;
  title: string;
  file_url: string;
  description: string | null; // FIX: Allow null description
}

const fetchAllDownloads = async (): Promise<DownloadItem[]> => {
  const { data, error } = await supabase
    .from('downloads')
    .select('*')
    .order('category', { ascending: true })
    .order('title', { ascending: true });

  if (error) {
    console.error("Error fetching downloads:", error);
    throw new Error(error.message);
  }
  return data as DownloadItem[];
};

const upsertDownload = async (data: DownloadInput & { id?: string }): Promise<DownloadItem> => {
  let result;
  if (data.id) {
    // Update existing
    result = await supabase
      .from('downloads')
      .update({ 
        category: data.category, 
        title: data.title, 
        file_url: data.file_url, 
        description: data.description 
      })
      .eq('id', data.id)
      .select()
      .single();
  } else {
    // Insert new
    result = await supabase
      .from('downloads')
      .insert(data)
      .select()
      .single();
  }

  if (result.error) throw new Error(result.error.message);
  return result.data as DownloadItem;
};

const deleteDownload = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('downloads')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
};

export const useDownloads = () => {
  const queryClient = useQueryClient();
  const queryKey = ['downloads'];

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  const upsertMutation = useMutation({
    mutationFn: upsertDownload,
    onSuccess: () => {
      invalidateQueries();
      toast.success("Download link saved successfully.");
    },
    onError: (error) => {
      toast.error(`Failed to save download: ${error.message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDownload,
    onSuccess: () => {
      invalidateQueries();
      toast.success("Download link deleted successfully.");
    },
    onError: (error) => {
      toast.error(`Failed to delete download: ${error.message}`);
    }
  });
  
  const downloadsQuery = useQuery({
      queryKey,
      queryFn: fetchAllDownloads,
      staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    downloads: downloadsQuery.data || [],
    isLoading: downloadsQuery.isLoading,
    isError: downloadsQuery.isError,
    upsertDownload: upsertMutation.mutateAsync,
    deleteDownload: deleteMutation.mutateAsync,
    isSaving: upsertMutation.isPending,
    isDeleting: deleteMutation.isPending,
    downloadsQuery,
  };
};