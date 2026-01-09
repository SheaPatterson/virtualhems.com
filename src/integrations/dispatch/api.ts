import { supabase } from '@/integrations/supabase/client';

const BASE_URL = "https://orhfcrrydmgxradibbqb.supabase.co/functions/v1";

export const callTacticalAnalyst = async (mode: 'GENERATE_SCENARIO' | 'REVIEW_FLIGHT', context: any) => {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Auth required");

        const response = await fetch(`${BASE_URL}/tactical-analyst`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ mode, context }),
        });

        if (!response.ok) throw new Error("AI Uplink Failed");
        return await response.json();
    } catch (error) {
        console.error("AI Analyst Error:", error);
        return null;
    }
};

export const sendCrewMessageToAgent = async (missionId: string, message: string, apiKey?: string): Promise<{ responseText: string } | null> => {
    try {
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (apiKey) {
            headers['x-api-key'] = apiKey;
        } else {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return null;
            headers['Authorization'] = `Bearer ${session.access_token}`;
        }

        const response = await fetch(`${BASE_URL}/dispatch-agent`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ mission_id: missionId, crew_message: message }),
        });

        if (!response.ok) throw new Error("Agent Offline");
        const data = await response.json();
        return { responseText: data.response_text as string };
    } catch (error) {
        return null;
    }
};

export const fetchDispatchAudio = async (text: string): Promise<string | null> => {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return null;

        const response = await fetch(`${BASE_URL}/generate-tts-audio`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ text }),
        });

        const data = await response.json();
        return data.audio_url as string;
    } catch (error) {
        return null;
    }
};