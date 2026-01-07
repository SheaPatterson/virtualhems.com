import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DynamicContent {
  id: string;
  slug: string;
  title: string;
  body: string;
  updated_at: string;
}

const fetchContentBySlug = async (slug: string): Promise<DynamicContent | null> => {
  if (!slug) return null;

  const { data, error } = await supabase
    .from('content')
    .select('id, slug, title, body, updated_at')
    .eq('slug', slug)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 means 'No rows found'
    console.error(`Error fetching content for slug ${slug}:`, error);
    throw new Error(error.message);
  }

  if (!data) return null;

  return data as DynamicContent;
};

export const useContent = (slug: string) => {
  return useQuery({
    queryKey: ['dynamicContent', slug],
    queryFn: () => fetchContentBySlug(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const fetchAllContent = async (): Promise<DynamicContent[]> => {
  const { data, error } = await supabase
    .from('content')
    .select('id, slug, title, body, updated_at')
    .order('slug', { ascending: true });

  if (error) {
    console.error("Error fetching all content:", error);
    throw new Error(error.message);
  }

  return data as DynamicContent[];
};