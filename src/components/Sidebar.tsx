import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAnalysisLogs } from '@/contexts/AnalysisLogsContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Video,
  BarChart3,
  GitCompare,
  MoreVertical,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AnalysisLog } from '@/contexts/AnalysisLogsContext';

export function Sidebar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { logs: historyItems, removeLog, refreshLogs } = useAnalysisLogs();

  const handleHistoryClick = (log: AnalysisLog) => {
    const event = new CustomEvent('loadAnalysisFromHistory', { detail: { log } });
    window.dispatchEvent(event);
  };

  const handleDeleteLog = async (log: AnalysisLog) => {
    try {
      await removeLog(log.id);
      await refreshLogs();
      toast.success('분석 기록이 삭제되었습니다.');
    } catch (error) {
      toast.error('삭제에 실패했습니다.');
    }
  };

  const handleDeleteAll = async () => {
    if (!user?.id) return;

    try {
      const { data: logs } = await supabase
        .from('analysis_logs')
        .select('channel_id')
        .eq('user_id', user.id);
      
      if (logs && logs.length > 0) {
        const channelIds = logs
          .map(log => log.channel_id)
          .filter((id): id is string => id !== null);
        
        if (channelIds.length > 0) {
          await supabase
            .from('youtube_videos')
            .delete()
            .in('channel_id', channelIds);
          
          await supabase
            .from('youtube_channels')
            .delete()
            .in('channel_id', channelIds);
        }
      }
      
      await supabase
        .from('analysis_logs')
        .delete()
        .eq('user_id', user.id);

      await supabase
        .from('channel_snapshots')
        .delete()
        .eq('user_id', user.id);

      await refreshLogs();
      
      toast.success('모든 데이터가 삭제되었습니다.');
      setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      console.error('Failed to delete all data:', error);
      toast.error('삭제에 실패했습니다.');
    }
  };

  return (
    <>
      <aside className="w-64 bg-card border-r border-border flex flex-col h-screen">
        {/* 로고 영역 */}
        <div className="h-16 flex items-center px-6 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Video className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-foreground text-sm">ContentStudio</span>
              <span className="text-xs text-muted-foreground">YouTube Analytics</span>
            </div>
          </div>
        </div>

        {/* 네비게이션 메뉴 */}
        <ScrollArea className="flex-1 py-4 scroll-smooth">
          <nav className="px-3 space-y-6">
            {/* YOUTUBE ANALYTICS 섹션 */}
            <div>
              <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                YouTube Analytics
              </h3>
              <div className="space-y-1">
                <NavItem 
                  icon={Video} 
                  label="채널 분석" 
                  path="/analytics/channel"
                  active={location.pathname === '/analytics/channel'} 
                  onClick={() => navigate('/analytics/channel')}
                />
                <NavItem 
                  icon={BarChart3} 
                  label="영상 분석" 
                  path="/analytics/video"
                  onClick={() => navigate('/analytics/video')}
                />
                <NavItem 
                  icon={GitCompare} 
                  label="채널 비교" 
                  path="/analytics/compare"
                  onClick={() => navigate('/analytics/compare')}
                />
              </div>
            </div>

            {/* 분석 기록 섹션 */}
            {user && (
              <div>
                <div className="flex items-center justify-between px-3 mb-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    분석 기록
                  </h3>
                  {historyItems.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleDeleteAll}>
                          모두 삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                <div className="space-y-1">
                  {historyItems.length === 0 ? (
                    <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                      분석 기록이 없습니다
                    </div>
                  ) : (
                    historyItems.map((log) => (
                      <motion.button
                        key={log.id}
                        onClick={() => handleHistoryClick(log)}
                        className="w-full group flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                      >
                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                          <Video className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-sm font-medium text-foreground truncate">
                            {log.channel_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {log.video_count?.toLocaleString('ko-KR')}개 영상 • 
                            {new Date(log.analyzed_at || log.created_at).toLocaleDateString('ko-KR', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteLog(log);
                          }}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </motion.button>
                    ))
                  )}
                </div>
              </div>
            )}
          </nav>
        </ScrollArea>

      </aside>
    </>
  );
}

// NavItem 컴포넌트
function NavItem({ 
  icon: Icon, 
  label, 
  active,
  onClick,
}: { 
  icon: React.ElementType; 
  label: string; 
  path?: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors group",
        active 
          ? "bg-primary/10 text-primary" 
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      )}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4 flex-shrink-0" />
        <span className="text-sm font-medium">{label}</span>
      </div>
    </motion.button>
  );
}
