import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DynamicContent } from './useContent';

interface ContentUpdateInput {
  slug: string;
  title: string;
  body: string;
}

interface UpsertContentPayload extends ContentUpdateInput {
  id: string | null; // null for insert, string for update
}

const upsertContent = async (payload: UpsertContentPayload): Promise<DynamicContent> => {
  const contentData = {
    slug: payload.slug,
    title: payload.title,
    body: payload.body,
    updated_at: new Date().toISOString(),
  };

  let result;

  if (payload.id) {
    // Update existing content
    result = await supabase
      .from('content')
      .update(contentData)
      .eq('id', payload.id)
      .select()
      .single();
  } else {
    // Insert new content
    result = await supabase
      .from('content')
      .insert([contentData])
      .select()
      .single();
  }

  if (result.error) throw new Error(result.error.message);
  return result.data as DynamicContent;
};

export const useContentManagement = () => {
  const queryClient = useQueryClient();
  
  const upsertMutation = useMutation({
    mutationFn: upsertContent,
    onSuccess: (data) => {
      // Invalidate the specific content query and the overall content list
      queryClient.invalidateQueries({ queryKey: ['dynamicContent', data.slug] });
      queryClient.invalidateQueries({ queryKey: ['allDynamicContent'] });
      toast.success(`Content for '${data.title}' saved successfully.`);
    },
    onError: (error: any) => {
      toast.error(`Failed to save content: ${error.message}`);
      console.error("Content save error:", error);
    }
  });

  return {
    upsertContent: upsertMutation.mutateAsync,
    isSaving: upsertMutation.isPending,
  };
};