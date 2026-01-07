import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Hospital } from '@/data/hemsData';

interface HospitalInput {
  name: string;
  city: string;
  faaIdentifier: string | null;
  latitude: number;
  longitude: number;
  isTraumaCenter: boolean;
  traumaLevel: number | null; // Added traumaLevel
}

const mapDbToHospital = (h: any): Hospital => ({
    id: h.id,
    name: h.name,
    city: h.city,
    faaIdentifier: h.faa_identifier,
    latitude: h.latitude,
    longitude: h.longitude,
    isTraumaCenter: h.is_trauma_center,
    traumaLevel: h.trauma_level,
    createdAt: h.created_at,
});

const insertHospital = async (data: HospitalInput): Promise<Hospital> => {
  const { data: newHospital, error } = await supabase
    .from('hospitals')
    .insert({
      name: data.name,
      city: data.city,
      faa_identifier: data.faaIdentifier,
      latitude: data.latitude,
      longitude: data.longitude,
      is_trauma_center: data.isTraumaCenter,
      trauma_level: data.traumaLevel,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapDbToHospital(newHospital);
};

const updateHospital = async (id: string, data: HospitalInput): Promise<Hospital> => {
  const { data: updatedHospital, error } = await supabase
    .from('hospitals')
    .update({
      name: data.name,
      city: data.city,
      faa_identifier: data.faaIdentifier,
      latitude: data.latitude,
      longitude: data.longitude,
      is_trauma_center: data.isTraumaCenter,
      trauma_level: data.traumaLevel,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapDbToHospital(updatedHospital);
};

const deleteHospital = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('hospitals')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
};

export const useHospitalManagement = () => {
  const queryClient = useQueryClient();
  const queryKey = ['hospitals'];

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey });
    queryClient.invalidateQueries({ queryKey: ['hemsBases'] });
  };

  const createMutation = useMutation({
    mutationFn: insertHospital,
    onSuccess: () => invalidateQueries(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: HospitalInput }) => updateHospital(id, data),
    onSuccess: () => invalidateQueries(),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteHospital,
    onSuccess: () => invalidateQueries(),
  });

  return {
    createHospital: createMutation.mutateAsync,
    updateHospital: updateMutation.mutateAsync,
    deleteHospital: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};