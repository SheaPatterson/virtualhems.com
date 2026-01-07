import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface IncidentReport {
  id: string;
  mission_id: string;
  user_id: string;
  report_type: 'Operational' | 'Maintenance' | 'Medical' | 'Weather' | 'Other';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  actions_taken: string | null;
  created_at: string;
}

const fetchReports = async (): Promise<IncidentReport[]> => {
  const { data, error } = await supabase
    .from('incident_reports')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data as IncidentReport[];
};

const createReport = async (report: Omit<IncidentReport, 'id' | 'created_at'>): Promise<IncidentReport> => {
  const { data, error } = await supabase
    .from('incident_reports')
    .insert([report])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as IncidentReport;
};

export const useIncidentReports = () => {
  const queryClient = useQueryClient();
  const queryKey = ['incidentReports'];

  const reportsQuery = useQuery({
    queryKey,
    queryFn: fetchReports,
    staleTime: 1000 * 60 * 5,
  });

  const createMutation = useMutation({
    mutationFn: createReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Safety report filed successfully.");
    },
    onError: (error: any) => {
      toast.error(`Failed to file report: ${error.message}`);
    }
  });

  return {
    reports: reportsQuery.data || [],
    isLoading: reportsQuery.isLoading,
    isError: reportsQuery.isError,
    fileReport: createMutation.mutateAsync,
    isSubmitting: createMutation.isPending,
  };
};