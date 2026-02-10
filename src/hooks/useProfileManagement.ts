import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthGuard';
import { profilesAPI, UserProfile } from '@/integrations/aws/api';
import { toast } from 'sonner';

// Re-export Profile type for backwards compatibility
export type Profile = UserProfile;

interface ProfileUpdateInput {
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  location?: string;
  bio?: string;
  simulators?: string;
  experience?: string;
  social_links?: Record<string, string>;
  email_public?: string;
}

export const useProfileManagement = () => {
  const { user, profile: authProfile, refreshProfile } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['userProfile', user?.id];

  const profileQuery = useQuery({
    queryKey,
    queryFn: async () => {
      // Use profile from auth context, which already has the data
      return authProfile;
    },
    enabled: !!user,
    initialData: authProfile
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ProfileUpdateInput) => {
      await profilesAPI.update(data);
      return data;
    },
    onSuccess: async () => {
      await refreshProfile();
      queryClient.invalidateQueries({ queryKey: ['userProfile', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['allProfiles'] });
      toast.success("Personnel record updated.");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update profile.");
    }
  });

  const rotateKeyMutation = useMutation({
    mutationFn: async () => {
      const result = await profilesAPI.rotateKey();
      return result.api_key;
    },
    onSuccess: async () => {
      await refreshProfile();
      queryClient.invalidateQueries({ queryKey: ['userProfile', user?.id] });
      toast.success("Security token rotated.");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to rotate key.");
    }
  });

  // Combine auth profile with any additional query data
  const profile = authProfile ? {
    ...authProfile,
    id: authProfile.user_id,  // Backwards compatibility
    api_key: authProfile.api_key || 'LOGIN_TO_VIEW',
    is_subscribed: true  // All users get premium access
  } : null;

  return {
    profile,
    isLoading: profileQuery.isLoading,
    isUpdating: updateMutation.isPending,
    isRotatingKey: rotateKeyMutation.isPending,
    updateProfile: updateMutation.mutateAsync,
    rotateApiKey: rotateKeyMutation.mutateAsync,
    initiateCheckout: async () => { 
      toast.info("HEMS OPS-CENTER is free! Support the dev on Buy Me a Coffee."); 
    },
    initiateCustomerPortal: async () => { 
      toast.info("Standalone access enabled for all personnel."); 
    },
    isInitiatingCheckout: false,
    isInitiatingPortal: false,
  };
};
