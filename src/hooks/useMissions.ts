import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { missionsAPI, Mission } from '@/integrations/aws/api';
import { toast } from 'sonner';
import { MissionReport } from '@/data/hemsData';

// Convert AWS Mission to MissionReport format for backwards compatibility
const convertToMissionReport = (m: Mission): MissionReport => ({
  missionId: m.mission_id,
  callsign: m.callsign,
  type: m.mission_type as any,
  dateTime: m.created_at,
  hemsBase: m.hems_base,
  helicopter: m.helicopter,
  crew: m.crew || [],
  origin: m.origin,
  pickup: m.pickup,
  destination: m.destination,
  patientAge: m.patient_age || null,
  patientGender: m.patient_gender as any || '',
  patientWeightLbs: m.patient_weight_lbs || null,
  patientDetails: m.patient_details || null,
  medicalResponse: null,
  waypoints: m.waypoints || [],
  liveData: {
    weather: 'Clear',
    mapUrl: '',
    aerialViewUrl: ''
  },
  tracking: {
    timeEnrouteMinutes: m.tracking?.timeEnrouteMinutes || 0,
    fuelRemainingLbs: m.tracking?.fuelRemainingLbs || 0,
    latitude: m.tracking?.latitude || 0,
    longitude: m.tracking?.longitude || 0,
    altitudeFt: m.tracking?.altitudeFt || 0,
    groundSpeedKts: m.tracking?.groundSpeedKts || 0,
    headingDeg: m.tracking?.headingDeg || 0,
    verticalSpeedFtMin: m.tracking?.verticalSpeedFtMin || 0,
    phase: m.tracking?.phase as any || 'Dispatch',
    altitude: m.tracking?.altitudeFt || 0,
    heading: m.tracking?.headingDeg || 0,
    speedKnots: m.tracking?.groundSpeedKts || 0,
    lastUpdate: m.tracking?.lastUpdate || Date.now()
  },
  status: m.status
});

export const useActiveMissions = () => {
  return useQuery({
    queryKey: ['activeMissions'],
    queryFn: async () => {
      const response = await missionsAPI.getActive();
      return response.missions.map(convertToMissionReport);
    },
    refetchInterval: 5000, // Refresh every 5 seconds for live tracking
    staleTime: 2000
  });
};

export const useMissions = (userId?: string, status?: string) => {
  return useQuery({
    queryKey: ['missions', userId, status],
    queryFn: async () => {
      const response = await missionsAPI.getAll(status);
      return response.missions.map(convertToMissionReport);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 // 1 minute
  });
};

export const useMission = (missionId?: string) => {
  return useQuery({
    queryKey: ['mission', missionId],
    queryFn: async () => {
      if (!missionId) throw new Error('Mission ID required');
      const response = await missionsAPI.getById(missionId);
      return convertToMissionReport(response.mission);
    },
    enabled: !!missionId,
    staleTime: 5000
  });
};

export const useCreateMission = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await missionsAPI.create(data);
      return response;
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

export const useUpdateTelemetry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ missionId, telemetry }: { missionId: string; telemetry: any }) => {
      return await missionsAPI.updateTelemetry(missionId, telemetry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeMissions'] });
    }
  });
};

export const useCompleteMission = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (missionId: string) => {
      return await missionsAPI.complete(missionId);
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

// Alias for backwards compatibility
export const useMissionReport = useMission;

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
    // For now, just complete it - we could add a proper cancel endpoint
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
// Force rebuild: Tue Feb 10 20:04:45 UTC 2026
