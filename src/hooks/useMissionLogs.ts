import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface LogEntry {
    id: string;
    sender: 'Dispatcher' | 'Crew' | 'System';
    message: string;
    timestamp: string;
    callsign?: string;
    user_id?: string;
}

export const useMissionLogs = (missionId?: string, isGlobal: boolean = false) => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchLogs = useCallback(async () => {
        setIsLoading(true);
        if (isGlobal) {
            const { data } = await supabase
                .from('global_dispatch_logs')
                .select('*')
                .order('timestamp', { ascending: true })
                .limit(50);
            setLogs(data || []);
        } else if (missionId) {
            const { data } = await supabase
                .from('mission_radio_logs')
                .select('*')
                .eq('mission_id', missionId)
                .order('timestamp', { ascending: true });
            setLogs(data || []);
        }
        setIsLoading(false);
    }, [missionId, isGlobal]);

    useEffect(() => { fetchLogs(); }, [fetchLogs]);

    useEffect(() => {
        const channelName = isGlobal ? 'global_radio' : `mission_logs_${missionId}`;
        const channel = supabase.channel(channelName);

        const handleInsert = (payload: any) => {
            setLogs(prev => {
                // Avoid adding duplicates from optimistic updates
                if (prev.some(log => log.id === payload.new.id)) return prev;
                return [...prev, payload.new as LogEntry];
            });
        };

        if (isGlobal) {
            channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'global_dispatch_logs' }, handleInsert).subscribe();
        } else if (missionId) {
            channel.on('postgres_changes', { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'mission_radio_logs', 
                filter: `mission_id=eq.${missionId}` 
            }, handleInsert).subscribe();
        }

        return () => { supabase.removeChannel(channel); };
    }, [missionId, isGlobal]);

    const addLog = async (sender: LogEntry['sender'], message: string, callsign?: string) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        // Optimistic update
        const tempId = `temp-${Date.now()}`;
        const newLog: LogEntry = {
            id: tempId,
            sender,
            message,
            timestamp: new Date().toISOString(),
            callsign,
            user_id: session.user.id,
        };
        setLogs(prev => [...prev, newLog]);

        const table = isGlobal ? 'global_dispatch_logs' : 'mission_radio_logs';
        const payload: any = { sender, message, user_id: session.user.id, callsign };
        if (!isGlobal && missionId) {
            payload.mission_id = missionId;
        }

        const { error } = await supabase.from(table).insert([payload]);

        if (error) {
            // Revert optimistic update on failure
            setLogs(prev => prev.filter(log => log.id !== tempId));
            toast.error("Failed to send message.");
        }
    };

    return { logs, isLoading, addLog };
};