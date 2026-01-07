import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Achievement {
    id: string;
    user_id: string;
    type: string;
    awarded_at: string;
}

export const ACHIEVEMENT_TYPES = {
    FIRST_FLIGHT: { label: "First Dispatch", icon: "Zap", color: "bg-blue-500", desc: "Successfully completed first mission." },
    TRAUMA_SPEC: { label: "Trauma Specialist", icon: "HeartPulse", color: "bg-red-600", desc: "Completed 10 Scene Call missions." },
    NIGHT_OWL: { label: "Night Vision", icon: "Moon", color: "bg-indigo-700", desc: "Completed 5 missions during night cycles." },
    COMMANDER: { label: "Flight Command", icon: "ShieldCheck", color: "bg-primary", desc: "Reached the rank of Captain." },
    IRON_AIRFRAME: { label: "Iron Airframe", icon: "Wrench", color: "bg-slate-600", desc: "Completed a mission with a technical discrepancy." },
};

const fetchAchievements = async (userId?: string): Promise<Achievement[]> => {
    let query = supabase.from('achievements').select('*');
    if (userId) query = query.eq('user_id', userId);
    
    const { data, error } = await query;
    if (error) throw error;
    return data as Achievement[];
};

export const useAchievements = (userId?: string) => {
    const queryClient = useQueryClient();

    const { data: achievements = [], isLoading } = useQuery({
        queryKey: ['achievements', userId],
        queryFn: () => fetchAchievements(userId),
    });

    const awardAchievement = useMutation({
        mutationFn: async (type: string) => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("No session");
            
            const { error } = await supabase.from('achievements').insert([{
                user_id: session.user.id,
                type
            }]);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['achievements'] });
            toast.success("New Achievement Unlocked!");
        }
    });

    return { achievements, isLoading, awardAchievement: awardAchievement.mutateAsync };
};