import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { TablesInsert } from '@/integrations/supabase/types';
import { toast } from '@/lib/toast';

export interface AnalysisLog {
  id: string | number;
  channel_name: string;
  created_at: string;
  channel_id?: string | null;
  channel_url?: string | null;
  video_count?: number | null;
  analyzed_at?: string | null;
  snapshot_data?: any | null;
  _status?: 'running';
}

interface AnalysisLogsContextType {
  logs: AnalysisLog[];
  loading: boolean;
  addOptimistic: (channelName: string, meta?: { channel_id?: string; channel_url?: string }) => string;
  commitInsert: (channelName: string, optimisticId: string, meta?: { channel_id?: string; channel_url?: string; video_count?: number; snapshot_data?: any }) => Promise<void>;
  removeLog: (id: string | number) => Promise<void>;
  refreshLogs: () => Promise<void>;
}

const AnalysisLogsContext = createContext<AnalysisLogsContextType | null>(null);

export function AnalysisLogsProvider({ children, userId }: { children: ReactNode; userId?: string }) {
  const [logs, setLogs] = useState<AnalysisLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Initial load
  useEffect(() => {
    console.log('[LOGS] 🔄 Initial load triggered, userId:', userId);
    
    if (!userId) {
      console.log('[LOGS] ⚠️ No userId, skipping load');
      setLogs([]);
      setLoading(false);
      return;
    }

    loadLogs();
  }, [userId]);

  const loadLogs = async () => {
    if (!userId) return;

    try {
      console.log('[LOGS] 📡 Fetching logs from DB...');
      const { data, error } = await supabase
        .from('analysis_logs')
        .select('id, channel_name, created_at, channel_id, channel_url, video_count, analyzed_at, snapshot_data')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      console.log('[LOGS] ✅ Logs fetched:', data?.length || 0, 'items');
      
      // Fetch actual video counts from youtube_videos table
      const logsWithRealCounts = await Promise.all(
        (data ?? []).map(async (log) => {
          if (log.channel_id) {
            const { count } = await supabase
              .from('youtube_videos')
              .select('*', { count: 'exact', head: true })
              .eq('channel_id', log.channel_id);
            return { ...log, video_count: count ?? log.video_count };
          }
          return log;
        })
      );
      
      setLogs(logsWithRealCounts as AnalysisLog[]);
    } catch (error) {
      console.error('[LOGS] ❌ Failed to load analysis logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const addOptimistic = (channelName: string, meta?: { channel_id?: string; channel_url?: string }): string => {
    const tempId = `temp-${Date.now()}`;
    const temp: AnalysisLog = {
      id: tempId,
      channel_name: channelName,
      created_at: new Date().toISOString(),
      channel_id: meta?.channel_id ?? null,
      channel_url: meta?.channel_url ?? null,
      _status: 'running',
    };
    
    console.log('[LOGS] ➕ Adding optimistic log:', temp);
    setLogs((prev) => [temp, ...prev].slice(0, 10));
    return tempId;
  };

  const commitInsert = async (channelName: string, optimisticId: string, meta?: { channel_id?: string; channel_url?: string; video_count?: number; snapshot_data?: any }) => {
    if (!userId) {
      console.warn('[SAVE] ⚠️ No userId, skipping insert');
      return;
    }

    console.log('[SAVE] 📝 Inserting analysis_log:', { channel_name: channelName, optimisticId, ...meta });

    try {
      const insertData: TablesInsert<'analysis_logs'> = {
        channel_name: channelName,
        channel_id: meta?.channel_id ?? null,
        channel_url: meta?.channel_url ?? null,
        video_count: meta?.video_count ?? null,
        analyzed_at: new Date().toISOString(),
        snapshot_data: meta?.snapshot_data ?? null,
      };

      const { data, error } = await supabase
        .from('analysis_logs')
        .insert([insertData])
        .select('id, channel_name, created_at, channel_id, channel_url, video_count, analyzed_at, snapshot_data')
        .single();

      if (error) throw error;

      console.log('[SAVE] ✅ Analysis log inserted:', data);
      console.log('[SAVE] 🔄 Refreshing logs...');

      // ✅ 강제 새로고침으로 확실하게 업데이트
      await loadLogs();
      
      toast.success('분석 기록이 저장되었습니다.');
    } catch (error) {
      console.error('[SAVE] ❌ Failed to insert analysis log:', error);
      // Rollback: optimistic 항목 제거
      setLogs((prev) => prev.filter((x) => String(x.id) !== optimisticId));
      toast.error('분석 기록 저장에 실패했습니다');
    }
  };

  const removeLog = async (id: string | number) => {
    if (!userId) return;

    try {
      const numericId = typeof id === 'string' && !id.startsWith('temp-') 
        ? parseInt(id, 10) 
        : id;
      
      if (typeof numericId === 'string') {
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
  };

  const refreshLogs = async () => {
    await loadLogs();
  };

  return (
    <AnalysisLogsContext.Provider value={{ logs, loading, addOptimistic, commitInsert, removeLog, refreshLogs }}>
      {children}
    </AnalysisLogsContext.Provider>
  );
}

export function useAnalysisLogs() {
  const context = useContext(AnalysisLogsContext);
  if (!context) {
    throw new Error('useAnalysisLogs must be used within AnalysisLogsProvider');
  }
  return context;
}
