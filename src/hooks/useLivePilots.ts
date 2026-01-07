import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LivePilot {
    user_id: string;
    last_seen: string;
    latitude: number;
    longitude: number;
    altitude_ft: number;
    ground_speed_kts: number;
    heading_deg: number;
    fuel_remaining_lbs: number;
    phase: string;
    callsign: string;
}

const fetchLivePilots = async (): Promise<LivePilot[]> => {
    // Only fetch pilots seen in the last 15 minutes to avoid stale 'ghost' aircraft
    const bufferTime = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
        .from('live_pilot_status')
        .select('*')
        .gt('last_seen', bufferTime);

    if (error) throw error;
    return data as LivePilot[];
};

export const useLivePilots = () => {
    return useQuery({
        queryKey: ['livePilots'],
        queryFn: fetchLivePilots,
        refetchInterval: 10000, // Poll every 10s for global map updates
    });
};