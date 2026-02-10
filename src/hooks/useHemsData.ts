import { useQuery } from '@tanstack/react-query';
import { dataAPI, HemsBase, Hospital, Helicopter } from '@/integrations/aws/api';

interface HemsDataState {
  bases: HemsBase[];
  hospitals: Hospital[];
  helicopters: Helicopter[];
  isLoading: boolean;
  error: Error | null;
}

export const useHemsData = (): HemsDataState => {
  const basesQuery = useQuery({
    queryKey: ['hemsBases'],
    queryFn: async () => {
      const response = await dataAPI.getHemsBases();
      return response.bases;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  const hospitalsQuery = useQuery({
    queryKey: ['hospitals'],
    queryFn: async () => {
      const response = await dataAPI.getHospitals();
      return response.hospitals;
    },
    staleTime: 1000 * 60 * 10,
  });

  const helicoptersQuery = useQuery({
    queryKey: ['helicopters'],
    queryFn: async () => {
      const response = await dataAPI.getHelicopters();
      return response.helicopters;
    },
    staleTime: 1000 * 60 * 10,
  });

  return {
    bases: basesQuery.data || [],
    hospitals: hospitalsQuery.data || [],
    helicopters: helicoptersQuery.data || [],
    isLoading: basesQuery.isLoading || hospitalsQuery.isLoading || helicoptersQuery.isLoading,
    error: basesQuery.error || hospitalsQuery.error || helicoptersQuery.error,
  };
};
