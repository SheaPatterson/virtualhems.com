import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Supabase Project ID: orhfcrrydmgxradibbqb
const BASE_URL = "https://orhfcrrydmgxradibbqb.supabase.co/functions/v1";

export const sendCrewMessageToAgent = async (missionId: string, message: string, apiKey?: string): Promise<{ responseText: string } | null> => {
    try {
        const headers: HeadersInit = { 'Content-Type': 'application/json' };

        if (apiKey) {
            headers['x-api-key'] = apiKey;
        } else {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                toast.error("Authentication required to contact Dispatch.");
                return null;
            }
            headers['Authorization'] = `Bearer ${session.access_token}`;
        }

        const response = await fetch(`${BASE_URL}/dispatch-agent`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ mission_id: missionId, crew_message: message }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return {
            responseText: data.response_text as string,
        };
    } catch (error) {
        console.error("Dispatch Agent API Error:", error);
        toast.error(`Dispatch communication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return null;
    }
};

export const fetchDispatchAudio = async (text: string): Promise<string | null> => {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            console.error("Cannot fetch audio: User not authenticated.");
            return null;
        }

        const response = await fetch(`${BASE_URL}/generate-tts-audio`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ text }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.audio_url as string;

    } catch (error) {
        console.error("TTS Audio API Error:", error);
        return null;
    }
};