import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MissionReport } from '@/data/hemsData';
import { toast } from 'sonner';

export interface HistoricalMission extends MissionReport {
    id: string;
    user_id: string; // Added user_id to resolve type errors in components
    created_at: string;
    status: 'active' | 'completed' | 'cancelled';
    pilot_notes?: string | null;
    performance_score?: number;
    flight_summary?: any;
}

const fetchMissions = async (userId?: string, status?: HistoricalMission['status'] | 'all'): Promise<HistoricalMission[]> => {
    let query = supabase
        .from('missions')
        .select('*')
        .order('created_at', { ascending: false });

    if (userId) {
        query = query.eq('user_id', userId);
    }
    
    if (status && status !== 'all') {
        query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching missions:", error);
        throw new Error(error.message);
    }

    return (data || []).map((m: any) => ({
        ...m,
        missionId: m.mission_id,
        type: m.mission_type,
        hemsBase: m.hems_base,
        helicopter: m.helicopter,
        patientAge: m.patient_age,
        patientGender: m.patient_gender,
        patientWeightLbs: m.patient_weight_lbs,
        patientDetails: m.patient_details,
        medicalResponse: m.medical_response,
        dateTime: m.created_at,
        tracking: m.tracking,
        waypoints: m.waypoints,
        liveData: m.live_data,
        origin: m.origin,
        destination: m.destination,
        status: m.status || 'active',
        pilot_notes: m.pilot_notes,
        performance_score: m.performance_score,
        flight_summary: m.flight_summary,
        user_id: m.user_id // Explicitly mapping user_id
    })) as HistoricalMission[];
};

const fetchMissionReport = async (missionId: string): Promise<HistoricalMission | null> => {
    if (!missionId) return null;
    
    const { data, error } = await supabase
        .from('missions')
        .select('*')
        .eq('mission_id', missionId)
        .single();

    if (error && error.code !== 'PGRST116') {
        console.error("Error fetching single mission:", error);
        throw new Error(error.message);
    }
    
    if (!data) return null;

    return {
        ...data,
        missionId: data.mission_id,
        type: data.mission_type,
        hemsBase: data.hems_base,
        helicopter: data.helicopter,
        patientAge: data.patient_age,
        patientGender: data.patient_gender,
        patientWeightLbs: data.patient_weight_lbs,
        patientDetails: data.patient_details,
        medicalResponse: data.medical_response,
        dateTime: data.created_at,
        tracking: data.tracking,
        waypoints: data.waypoints,
        liveData: data.live_data,
        origin: data.origin,
        destination: data.destination,
        status: data.status || 'active',
        pilot_notes: data.pilot_notes,
        performance_score: data.performance_score,
        flight_summary: data.flight_summary,
        user_id: data.user_id // Explicitly mapping user_id
    } as HistoricalMission;
};

export const useMissionReport = (missionId?: string) => {
    return useQuery({
        queryKey: ['missionReport', missionId],
        queryFn: () => fetchMissionReport(missionId!),
        enabled: !!missionId,
    });
};

export const useMissions = (userId?: string, status?: HistoricalMission['status'] | 'all') => {
    return useQuery({
        queryKey: ['missions', userId, status],
        queryFn: () => fetchMissions(userId, status),
    });
};

export const usePilotSummary = (userId?: string) => {
    const { data: missions } = useMissions(userId, 'completed');
    
    const stats = (missions || []).reduce((acc, m) => {
        acc.count += 1;
        acc.totalMinutes += m.tracking?.timeEnrouteMinutes || 0;
        acc.avgScore = (acc.avgScore * (acc.count - 1) + (m.performance_score || 0)) / acc.count;
        return acc;
    }, { count: 0, totalMinutes: 0, avgScore: 0 });

    return stats;
};

export const useActiveMissions = () => {
    return useQuery({
        queryKey: ['activeMissions'],
        queryFn: async () => {
            // Fetch only the summary data
            const { data: summaries, error: summaryError } = await supabase
                .from('telemetry_summary')
                .select('*');

            if (summaryError) throw summaryError;

            // Fetch the full mission details for the active missions found in the summary
            const missionIds = summaries.map(s => s.mission_id);
            
            if (missionIds.length === 0) return [];

            const { data: missions, error: missionError } = await supabase
                .from('missions')
                .select('*')
                .in('mission_id', missionIds);

            if (missionError) throw missionError;

            // Merge summary data into the full mission structure for compatibility
            const summaryMap = new Map(summaries.map(s => [s.mission_id, s]));

            return (missions || []).map((m: any) => {
                const summary = summaryMap.get(m.mission_id);
                
                // Use the lightweight summary data for tracking/telemetry fields
                const tracking = {
                    ...m.tracking,
                    latitude: summary?.latitude || m.tracking.latitude,
                    longitude: summary?.longitude || m.tracking.longitude,
                    phase: summary?.phase || m.tracking.phase,
                    fuelRemainingLbs: summary?.fuel_remaining_lbs || m.tracking.fuelRemainingLbs,
                };

                return {
                    ...m,
                    missionId: m.mission_id,
                    type: m.mission_type,
                    hemsBase: m.hems_base,
                    helicopter: m.helicopter,
                    tracking: tracking,
                    origin: m.origin,
                    destination: m.destination,
                    status: m.status,
                    pilot_notes: m.pilot_notes,
                    user_id: m.user_id
                } as HistoricalMission;
            });
        },
        refetchInterval: 10000, 
    });
};

export const useMissionManagement = () => {
    const queryClient = useQueryClient();

    const updateStatus = useMutation({
        mutationFn: async ({ 
            missionId, 
            status, 
            pilotNotes, 
            performanceScore, 
            flightSummary 
        }: { 
            missionId: string, 
            status: string, 
            pilotNotes?: string,
            performanceScore?: number,
            flightSummary?: any
        }) => {
            const payload: any = { status };
            if (pilotNotes !== undefined) payload.pilot_notes = pilotNotes;
            if (performanceScore !== undefined) payload.performance_score = performanceScore;
            if (flightSummary !== undefined) payload.flight_summary = flightSummary;

            const { error } = await supabase
                .from('missions')
                .update(payload)
                .eq('mission_id', missionId);
            if (error) throw error;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['activeMissions'] });
            queryClient.invalidateQueries({ queryKey: ['missions'] });
            queryClient.invalidateQueries({ queryKey: ['missionReport', variables.missionId] });
            toast.success("Mission archived to career logbook.");
        },
        onError: (error: any) => {
            toast.error(`Failed to update mission: ${error.message}`);
        }
    });

    return {
        updateStatus: updateStatus.mutateAsync,
        isUpdating: updateStatus.isPending
    };
};