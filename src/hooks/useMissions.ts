import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MissionReport } from '@/data/hemsData';

// Fetch active missions from Supabase
export const useActiveMissions = () => {
  return useQuery({
    queryKey: ['activeMissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data?.map(mapDbToMissionReport) || [];
    },
    refetchInterval: 5000,
    staleTime: 2000
  });
};

// Fetch missions by user/status
export const useMissions = (userId?: string, status?: string) => {
  return useQuery({
    queryKey: ['missions', userId, status],
    queryFn: async () => {
      let query = supabase.from('missions').select('*');
      
      if (userId) query = query.eq('user_id', userId);
      if (status) query = query.eq('status', status);
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data?.map(mapDbToMissionReport) || [];
    },
    enabled: !!userId,
    staleTime: 60000
  });
};

// Fetch single mission
export const useMission = (missionId?: string) => {
  return useQuery({
    queryKey: ['mission', missionId],
    queryFn: async () => {
      if (!missionId) throw new Error('Mission ID required');
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .eq('mission_id', missionId)
        .single();

      if (error) throw error;
      return mapDbToMissionReport(data);
    },
    enabled: !!missionId,
    staleTime: 5000
  });
};

// Alias for backwards compatibility
export const useMissionReport = useMission;

// Create mission
export const useCreateMission = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await supabase
        .from('missions')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeMissions'] });
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      toast.success('Mission created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create mission');
    }
  });
};

// Update telemetry
export const useUpdateTelemetry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ missionId, telemetry }: { missionId: string; telemetry: any }) => {
      const { error } = await supabase
        .from('missions')
        .update({ tracking: telemetry, updated_at: new Date().toISOString() })
        .eq('mission_id', missionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeMissions'] });
    }
  });
};

// Complete mission
export const useCompleteMission = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (missionId: string) => {
      const { error } = await supabase
        .from('missions')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq('mission_id', missionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeMissions'] });
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      toast.success('Mission completed');
    }
  });
};

// Pilot summary stats
export const usePilotSummary = (userId?: string) => {
  const { data: missions } = useMissions(userId, 'completed');
  
  const count = missions?.length || 0;
  const totalMinutes = missions?.reduce((acc, m) => acc + (m.tracking?.timeEnrouteMinutes || 0), 0) || 0;
  
  return { count, totalMinutes };
};

// Mission management hook for admin/tracking pages  
export const useMissionManagement = () => {
  const queryClient = useQueryClient();
  const createMission = useCreateMission();
  const updateTelemetry = useUpdateTelemetry();
  const completeMission = useCompleteMission();
  
  const updateMissionPhase = async (missionId: string, phase: string) => {
    return updateTelemetry.mutateAsync({
      missionId,
      telemetry: { phase }
    });
  };
  
  const cancelMission = async (missionId: string) => {
    return completeMission.mutateAsync(missionId);
  };
  
  return {
    createMission: createMission.mutateAsync,
    updateTelemetry: updateTelemetry.mutateAsync,
    completeMission: completeMission.mutateAsync,
    updateMissionPhase,
    cancelMission,
    isCreating: createMission.isPending,
    isUpdating: updateTelemetry.isPending,
    isCompleting: completeMission.isPending
  };
};

// Helper function to map database record to MissionReport
const mapDbToMissionReport = (m: any): MissionReport => ({
  missionId: m.mission_id,
  callsign: m.callsign || '',
  type: m.mission_type || 'Scene Call',
  dateTime: m.created_at,
  hemsBase: m.hems_base || {},
  helicopter: m.helicopter || {},
  crew: m.crew || [],
  origin: m.origin || {},
  pickup: m.pickup || {},
  destination: m.destination || {},
  patientAge: m.patient_age || null,
  patientGender: m.patient_gender || '',
  patientWeightLbs: m.patient_weight_lbs || null,
  patientDetails: m.patient_details || null,
  medicalResponse: m.medical_response || null,
  waypoints: m.waypoints || [],
  liveData: m.live_data || { weather: 'Clear', mapUrl: '', aerialViewUrl: '' },
  tracking: {
    timeEnrouteMinutes: m.tracking?.timeEnrouteMinutes || 0,
    fuelRemainingLbs: m.tracking?.fuelRemainingLbs || 0,
    latitude: m.tracking?.latitude || 0,
    longitude: m.tracking?.longitude || 0,
    altitudeFt: m.tracking?.altitudeFt || 0,
    groundSpeedKts: m.tracking?.groundSpeedKts || 0,
    headingDeg: m.tracking?.headingDeg || 0,
    verticalSpeedFtMin: m.tracking?.verticalSpeedFtMin || 0,
    phase: m.tracking?.phase || 'Dispatch',
    altitude: m.tracking?.altitudeFt || 0,
    heading: m.tracking?.headingDeg || 0,
    speedKnots: m.tracking?.groundSpeedKts || 0,
    lastUpdate: m.tracking?.lastUpdate || Date.now()
  },
  status: m.status || 'active'
});
