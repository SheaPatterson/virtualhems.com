import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DynamicContent } from './useContent';

const fetchAllDynamicContent = async (): Promise<DynamicContent[]> => {
  const { data, error } = await supabase
    .from('content')
    .select('id, slug, title, body, updated_at')
    .order('slug', { ascending: true });

  if (error) {
    console.error("Error fetching all dynamic content:", error);
    throw new Error(error.message);
  }

  return data as DynamicContent[];
};

export const useAllContent = () => {
  return useQuery({
    queryKey: ['allDynamicContent'],
    queryFn: fetchAllDynamicContent,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};