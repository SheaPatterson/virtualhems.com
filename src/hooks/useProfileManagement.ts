import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthGuard';
import { Profile } from './useProfiles';
import { toast } from 'sonner';
import { createStripeCheckoutSession } from '@/integrations/stripe/api';
import { stripePromise } from '@/integrations/stripe/client';

interface ProfileUpdateInput extends Partial<Omit<Profile, 'id' | 'updated_at' | 'api_key'>> {}

const fetchUserProfile = async (userId: string): Promise<Profile & { api_key: string, stripe_customer_id: string | null } | null> => {
  if (!userId) return null;

  const { data: profile, error: pError } = await supabase
    .from('profiles')
    .select('*, is_subscribed')
    .eq('id', userId)
    .single();

  if (pError && pError.code !== 'PGRST116') throw new Error(pError.message);

  // Fetch API Key (from user_api_keys)
  const { data: keyData, error: kError } = await supabase
    .from('user_api_keys')
    .select('api_key')
    .eq('user_id', userId)
    .single();

  if (kError && kError.code !== 'PGRST116') throw new Error(kError.message);

  // Fetch sensitive data (from private_profiles)
  const { data: privateData, error: prError } = await supabase
    .from('private_profiles')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .single();

  if (prError && prError.code !== 'PGRST116') throw new Error(prError.message);

  return { 
    ...profile, 
    api_key: keyData?.api_key || 'NONE',
    stripe_customer_id: privateData?.stripe_customer_id || null,
  } as any;
};

const updateUserProfile = async (userId: string, data: ProfileUpdateInput): Promise<Profile> => {
  const { data: updatedProfile, error } = await supabase
    .from('profiles')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return updatedProfile as Profile;
};

const rotateApiKey = async (userId: string): Promise<string> => {
    const newKey = crypto.randomUUID();
    const { data, error } = await supabase
        .from('user_api_keys')
        .update({ api_key: newKey })
        .eq('user_id', userId)
        .select('api_key')
        .single();
    
    if (error) throw error;
    return data.api_key;
};

const initiateStripeCheckout = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
        toast.error("You must be logged in to subscribe.");
        return;
    }

    const sessionId = await createStripeCheckoutSession();
    if (!sessionId) return;

    const stripe = await stripePromise;
    if (stripe) {
        await (stripe as any).redirectToCheckout({ sessionId });
    } else {
        throw new Error("Stripe failed to load.");
    }
};

const initiateCustomerPortal = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
        toast.error("You must be logged in to manage your subscription.");
        return;
    }

    const { data, error } = await supabase.functions.invoke('create-customer-portal-session');
    if (error) throw error;

    window.location.href = data.url;
};

export const useProfileManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['userProfile', user?.id];

  const profileQuery = useQuery({
    queryKey,
    queryFn: () => fetchUserProfile(user?.id || ''),
    enabled: !!user,
  });

  const updateMutation = useMutation({
    mutationFn: (data: ProfileUpdateInput) => updateUserProfile(user!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['allProfiles'] });
      toast.success("Profile updated!");
    }
  });

  const rotateKeyMutation = useMutation({
      mutationFn: () => rotateApiKey(user!.id),
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['userProfile', user?.id] });
          toast.success("API Key rotated!");
      }
  });
  
  const initiateCheckoutMutation = useMutation({
      mutationFn: initiateStripeCheckout,
      onError: (error: any) => {
          toast.error(`Failed to start checkout: ${error.message}`);
      }
  });

  const initiatePortalMutation = useMutation({
      mutationFn: initiateCustomerPortal,
      onError: (error: any) => {
          const errorMessage = error.context?.body?.error || error.message || 'An unknown error occurred.';
          toast.error(`Failed to open portal: ${errorMessage}`);
      }
  });

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    isUpdating: updateMutation.isPending,
    isRotatingKey: rotateKeyMutation.isPending,
    isInitiatingCheckout: initiateCheckoutMutation.isPending,
    isInitiatingPortal: initiatePortalMutation.isPending,
    updateProfile: updateMutation.mutateAsync,
    rotateApiKey: rotateKeyMutation.mutateAsync,
    initiateCheckout: initiateCheckoutMutation.mutateAsync,
    initiateCustomerPortal: initiatePortalMutation.mutateAsync,
  };
};