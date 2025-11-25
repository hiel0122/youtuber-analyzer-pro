import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAnalysisLogs } from '@/contexts/AnalysisLogsContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { 
  Video,
  LayoutDashboard,
  BarChart3,
  GitCompare,
  Settings,
  LogOut,
  MoreVertical,
  X,
  ChevronDown,
  Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AnalysisLog } from '@/contexts/AnalysisLogsContext';
import { SettingsModal } from '@/components/settings/SettingsModal';

export function Sidebar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { logs: historyItems, removeLog, refreshLogs } = useAnalysisLogs();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('로그아웃되었습니다.');
    } catch (error) {
      toast.error('로그아웃에 실패했습니다.');
    }
  };

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
      <aside className="w-64 bg-[#141414] border-r border-[#27272a] flex flex-col h-screen">
        {/* 로고 영역 */}
        <div className="h-16 flex items-center px-6 border-b border-[#27272a]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Video className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white text-sm">ContentStudio</span>
              <span className="text-xs text-gray-500">YouTube Analytics</span>
            </div>
          </div>
        </div>

        {/* 네비게이션 메뉴 */}
        <ScrollArea className="flex-1 py-4">
          <nav className="px-3 space-y-6">
            {/* OVERVIEW 섹션 */}
            <div>
              <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Overview
              </h3>
              <div className="space-y-1">
                <NavItem 
                  icon={LayoutDashboard} 
                  label="Dashboard" 
                  path="/" 
                  active={location.pathname === '/'} 
                  onClick={() => navigate('/')}
                />
                <NavItem 
                  icon={BarChart3} 
                  label="Analytics" 
                  path="/analytics"
                  active={location.pathname === '/analytics'} 
                  onClick={() => navigate('/analytics')}
                />
                <NavItem 
                  icon={Building2} 
                  label="Organization" 
                  path="/organization"
                  onClick={() => navigate('/organization')}
                />
              </div>
            </div>

            {/* YOUTUBE ANALYTICS 섹션 */}
            <div>
              <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
                    <div className="px-3 py-6 text-center text-sm text-gray-500">
                      분석 기록이 없습니다
                    </div>
                  ) : (
                    historyItems.map((log) => (
                      <motion.button
                        key={log.id}
                        onClick={() => handleHistoryClick(log)}
                        className="w-full group flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
                        whileHover={{ x: 4, backgroundColor: "rgba(39, 39, 42, 1)" }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                      >
                        <div className="w-10 h-10 rounded-lg bg-[#27272a] flex items-center justify-center flex-shrink-0">
                          <Video className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-sm font-medium text-white truncate">
                            {log.channel_name}
                          </p>
                          <p className="text-xs text-gray-500">
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

        {/* 하단 사용자 프로필 */}
        <div className="border-t border-[#27272a] p-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center gap-3 hover:bg-[#27272a] rounded-lg p-2 transition-colors">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-500 text-white">
                      {user?.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {user?.email?.split('@')[0] || 'User'}
                    </p>
                    <p className="text-xs text-gray-500">Administrator</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              onClick={() => navigate('/')} 
              className="w-full"
            >
              로그인
            </Button>
          )}
        </div>
      </aside>

      {/* Settings Modal */}
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}

// NavItem 컴포넌트
function NavItem({ 
  icon: Icon, 
  label, 
  path,
  active,
  onClick,
  badge
}: { 
  icon: React.ElementType; 
  label: string; 
  path: string;
  active?: boolean;
  onClick: () => void;
  badge?: string;
}) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors group",
        active 
          ? "bg-blue-500/10 text-blue-500" 
          : "text-gray-400 hover:bg-[#27272a] hover:text-white"
      )}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4 flex-shrink-0" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      {badge && (
        <Badge 
          variant={active ? "default" : "secondary"}
          className={cn(
            "h-5 px-1.5 text-xs",
            active && "bg-blue-500 text-white"
          )}
        >
          {badge}
        </Badge>
      )}
    </motion.button>
  );
}
