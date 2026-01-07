import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CommunityPost {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
}

const fetchPosts = async (): Promise<CommunityPost[]> => {
  const { data, error } = await supabase
    .from('community_posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching community posts:", error);
    throw new Error(error.message);
  }
  return data as CommunityPost[];
};

const createPost = async (post: { title: string; content: string; user_id: string }): Promise<CommunityPost> => {
  const { data, error } = await supabase
    .from('community_posts')
    .insert(post)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as CommunityPost;
};

const deletePost = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('community_posts')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
};

export const useCommunityPosts = () => {
  const queryClient = useQueryClient();
  const queryKey = ['communityPosts'];

  const postsQuery = useQuery({
    queryKey,
    queryFn: fetchPosts,
    staleTime: 1000 * 60, // 1 minute
  });

  const createMutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Post created successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to create post: ${error.message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Post deleted successfully.");
    },
    onError: (error) => {
      toast.error(`Failed to delete post: ${error.message}`);
    }
  });

  return {
    posts: postsQuery.data || [],
    isLoading: postsQuery.isLoading,
    isError: postsQuery.isError,
    createPost: createMutation.mutateAsync,
    deletePost: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};