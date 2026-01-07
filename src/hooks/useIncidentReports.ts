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
  status: 'Open' | 'Resolved';
  resolution: string | null;
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

const createReport = async (report: Partial<IncidentReport>): Promise<IncidentReport> => {
  const { data, error } = await supabase
    .from('incident_reports')
    .insert([report])
    .select()
    .single();

  if (error) throw error;
  return data as IncidentReport;
};

const resolveReport = async ({ id, resolution }: { id: string, resolution: string }): Promise<void> => {
    const { error } = await supabase
        .from('incident_reports')
        .update({ status: 'Resolved', resolution })
        .eq('id', id);
    if (error) throw error;
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
    }
  });

  const resolveMutation = useMutation({
      mutationFn: resolveReport,
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey });
          toast.success("Incident officially closed and resolved.");
      },
      onError: (e: any) => toast.error(`Failed to resolve: ${e.message}`)
  });

  return {
    reports: reportsQuery.data || [],
    isLoading: reportsQuery.isLoading,
    isError: reportsQuery.isError,
    fileReport: createMutation.mutateAsync,
    resolveReport: resolveMutation.mutateAsync,
    isSubmitting: createMutation.isPending,
    isResolving: resolveMutation.isPending,
  };
};