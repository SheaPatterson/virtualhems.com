import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Hospital, HemsBase, Helicopter } from '@/data/hemsData';

const fetchHospitals = async (): Promise<Hospital[]> => {
    const { data, error } = await supabase
        .from('hospitals')
        .select('*')
        .order('name', { ascending: true });

    if (error) throw new Error(error.message);
    return (data || []).map(h => ({
        id: h.id,
        name: h.name || 'Unknown',
        city: h.city || 'Unknown',
        faaIdentifier: h.faa_identifier || null,
        latitude: h.latitude || 0,
        longitude: h.longitude || 0,
        isTraumaCenter: h.is_trauma_center || false,
        traumaLevel: h.trauma_level || null,
        createdAt: h.created_at || new Date().toISOString(),
    }));
};

const fetchHelicopters = async (): Promise<Helicopter[]> => {
    const { data, error } = await supabase
        .from('helicopters')
        .select('*')
        .order('registration', { ascending: true });

    if (error) throw new Error(error.message);
    return (data || []).map(h => ({
        id: h.id,
        model: h.model || 'Unknown',
        registration: h.registration || 'N/A',
        fuelCapacityLbs: h.fuel_capacity_lbs || 0,
        cruiseSpeedKts: h.cruise_speed_kts || 0,
        fuelBurnRateLbHr: h.fuel_burn_rate_lb_hr || 450,
        imageUrl: h.image_url || null,
        maintenanceStatus: h.maintenance_status || 'FMC',
        createdAt: h.created_at || new Date().toISOString(),
    }));
};

const fetchHemsBases = async (): Promise<HemsBase[]> => {
    // Fetch bases and the registration of their assigned helicopter
    const { data, error } = await supabase
        .from('hems_bases')
        .select(`
            *,
            helicopters (
                registration
            )
        `)
        .order('name', { ascending: true });

    if (error) throw new Error(error.message);

    return (data || []).map(b => ({
        id: b.id,
        name: b.name || 'Unknown Base',
        location: b.location || 'Unknown Location',
        contact: b.contact || null,
        faaIdentifier: b.faa_identifier || null,
        latitude: b.latitude || 0,
        longitude: b.longitude || 0,
        helicopterId: b.helicopter_id || null,
        assignedHelicopterRegistration: (b.helicopters as any)?.registration || null,
        createdAt: b.created_at || new Date().toISOString(),
    }));
};

export const useHemsData = () => {
    const hospitalsQuery = useQuery({ queryKey: ['hospitals'], queryFn: fetchHospitals });
    const basesQuery = useQuery({ queryKey: ['hemsBases'], queryFn: fetchHemsBases });
    const helicoptersQuery = useQuery({ queryKey: ['helicopters'], queryFn: fetchHelicopters });

    return {
        hospitals: hospitalsQuery.data || [],
        bases: basesQuery.data || [],
        helicopters: helicoptersQuery.data || [],
        isLoading: hospitalsQuery.isLoading || basesQuery.isLoading || helicoptersQuery.isLoading,
        isError: hospitalsQuery.isError || basesQuery.isError || helicoptersQuery.isError,
        error: hospitalsQuery.error || basesQuery.error || helicoptersQuery.error,
        refetch: () => {
            hospitalsQuery.refetch();
            basesQuery.refetch();
            helicoptersQuery.refetch();
        }
    };
};