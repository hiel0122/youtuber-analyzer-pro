import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { TablesInsert } from '@/integrations/supabase/types';
import { toast } from '@/lib/toast';

export interface AnalysisLog {
  id: string | number;
  channel_name: string;
  created_at: string;
  _status?: 'running';
}

export function useAnalysisLogs(userId?: string) {
  const [logs, setLogs] = useState<AnalysisLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Initial load
  useEffect(() => {
    if (!userId) {
      setLogs([]);
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const { data, error } = await supabase
          .from('analysis_logs')
          .select('id, channel_name, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;
        setLogs((data ?? []) as AnalysisLog[]);
      } catch (error) {
        console.error('Failed to load analysis logs:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  // Realtime subscription
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('analysis_logs_live')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'analysis_logs',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setLogs((prev) => {
            const newLog = payload.new as AnalysisLog;
            // Remove temp item if exists with same channel_name
            const withoutTemp = prev.filter(
              (x) => !(String(x.id).startsWith('temp-') && x.channel_name === newLog.channel_name)
            );
            const next = [newLog, ...withoutTemp];
            
            // Deduplicate by id
            const dedup = new Map(next.map((x) => [String(x.id), x]));
            return Array.from(dedup.values())
              .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
              .slice(0, 10);
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // Optimistic add
  function addOptimistic(channelName: string): string {
    const tempId = `temp-${Date.now()}`;
    const temp: AnalysisLog = {
      id: tempId,
      channel_name: channelName,
      created_at: new Date().toISOString(),
      _status: 'running',
    };
    setLogs((prev) => [temp, ...prev].slice(0, 10));
    return tempId;
  }

  // Commit insert to DB
  async function commitInsert(channelName: string, optimisticId: string) {
    if (!userId) return;

    try {
      const insertData: TablesInsert<'analysis_logs'> = {
        channel_name: channelName,
      };

      const { data, error } = await supabase
        .from('analysis_logs')
        .insert([insertData])
        .select('id, channel_name, created_at')
        .single();

      if (error) throw error;

      // Replace temp with real record
      setLogs((prev) => {
        const replaced = prev.map((x) =>
          String(x.id) === optimisticId ? (data as AnalysisLog) : x
        );
        return replaced.slice(0, 10);
      });
    } catch (error) {
      console.error('Failed to insert analysis log:', error);
      // Rollback optimistic item
      setLogs((prev) => prev.filter((x) => String(x.id) !== optimisticId));
      toast.error('분석 기록 저장에 실패했습니다');
    }
  }

  // Remove log
  async function removeLog(id: string | number) {
    if (!userId) return;

    try {
      // Convert to number if it's a string (but not a temp id)
      const numericId = typeof id === 'string' && !id.startsWith('temp-') 
        ? parseInt(id, 10) 
        : id;
      
      if (typeof numericId === 'string') {
        // It's a temp id, just remove from state
        setLogs((prev) => prev.filter((x) => x.id !== id));
        return;
      }

      const { error } = await supabase
        .from('analysis_logs')
        .delete()
        .eq('id', numericId)
        .eq('user_id', userId);

      if (error) throw error;

      setLogs((prev) => prev.filter((x) => x.id !== id));
      toast.success('기록이 삭제되었습니다');
    } catch (error) {
      console.error('Failed to delete analysis log:', error);
      toast.error('삭제에 실패했습니다');
    }
  }

  return {
    logs,
    loading,
    addOptimistic,
    commitInsert,
    removeLog,
  };
}
