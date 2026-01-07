import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Supabase Project ID: orhfcrrydmgxradibbqb
const BASE_URL = "https://orhfcrrydmgxradibbqb.supabase.co/functions/v1";

export const createStripeCheckoutSession = async (): Promise<string | null> => {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            toast.error("You must be logged in to subscribe.");
            return null;
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
        };

        const response = await fetch(`${BASE_URL}/create-checkout-session`, {
            method: 'POST',
            headers,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.sessionId as string;
    } catch (error) {
        console.error("Stripe Checkout API Error:", error);
        toast.error(`Failed to initiate checkout: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return null;
    }
};