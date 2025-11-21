import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useAnalysisLogs } from '@/contexts/AnalysisLogsContext';
import type { AnalysisLog } from '@/contexts/AnalysisLogsContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AuthCard } from './AuthCard';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { cn } from '@/lib/utils';
import { 
  Video,
  BarChart3,
  GitCompare,
  LogOut,
  Menu,
  MoreVertical,
  User,
  Trash2,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface NavItem {
  title: string;
  icon: React.ElementType;
  path: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Youtube Analytics',
    items: [
      { title: '채널 분석', icon: Video, path: '/analytics/channel' },
      { title: '영상 분석', icon: BarChart3, path: '/analytics/video' },
      { title: '채널 비교', icon: GitCompare, path: '/analytics/compare' },
    ]
  }
];

export function Sidebar() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();
  const { logs: historyItems, removeLog, refreshLogs } = useAnalysisLogs();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(() =>
    typeof window !== "undefined" && localStorage.getItem("sb-collapsed") === "1"
  );
  const [analyticsOpen, setAnalyticsOpen] = useState(true);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    try { 
      localStorage.setItem("sb-collapsed", collapsed ? "1" : "0"); 
    } catch {}
  }, [collapsed]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('로그아웃되었습니다.');
    } catch (error) {
      toast.error('로그아웃에 실패했습니다.');
    }
  };

  const handleHistoryClick = (item: typeof historyItems[0]) => {
    // Pass the full log object to enable cache-first loading
    const event = new CustomEvent('loadAnalysisFromHistory', { detail: { log: item } });
    window.dispatchEvent(event);
  };

  const handleDelete = (id: string | number) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      removeLog(id);
    }
  };

  // 리셋: 분석 기록만 삭제 (데이터 유지)
  const handleResetLogs = async () => {
    if (!user?.id) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('analysis_logs')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      await refreshLogs();
      
      toast.success('분석 기록이 초기화되었습니다.');
      setShowResetDialog(false);
    } catch (error) {
      console.error('Failed to reset logs:', error);
      toast.error('초기화에 실패했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  // 완전 삭제: 모든 데이터 삭제
  const handleDeleteAll = async () => {
    if (!user?.id) return;
    
    setIsDeleting(true);
    try {
      // 1. 분석 기록 삭제
      await supabase
        .from('analysis_logs')
        .delete()
        .eq('user_id', user.id);

      // 2. 채널 스냅샷 삭제
      await supabase
        .from('channel_snapshots')
        .delete()
        .eq('user_id', user.id);

      await refreshLogs();
      
      toast.success('모든 데이터가 삭제되었습니다.');
      setShowDeleteAllDialog(false);
    } catch (error) {
      console.error('Failed to delete all data:', error);
      toast.error('삭제에 실패했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getInitials = (email: string | undefined) => {
    if (!email) return 'U';
    return email.charAt(0).toUpperCase();
  };

  const getTierBadge = (tier?: string) => {
    if (!tier) return null;
    
    const badges: Record<string, { label: string; className: string }> = {
      free: { label: 'Free', className: 'bg-secondary text-secondary-foreground' },
      plus: { label: 'Plus', className: 'bg-blue-500/10 text-blue-400 font-serif italic' },
      pro: { label: 'Pro', className: 'bg-red-500/10 text-red-400 font-serif italic' },
      early_bird: { label: 'Early bird', className: 'bg-green-500/10 text-green-400 font-serif italic' },
      admin: { 
        label: 'Admin', 
        className: 'bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 text-white font-serif italic' 
      },
    };
    
    const badge = badges[tier];
    if (!badge) return null;
    
    return (
      <Badge className={cn('text-[10px] px-1.5 py-0', badge.className)}>
        {badge.label}
      </Badge>
    );
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      <aside 
        data-sidebar
        className={cn(
          "sidebar hidden lg:flex flex-col h-screen border border-border rounded-2xl transition-all duration-300 sticky top-0",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Header with Toggle & Brand */}
        <div className={cn(
          "flex items-center gap-2 mb-6 pt-4",
          collapsed ? "justify-center px-0" : "px-4"
        )}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="h-8 w-8 flex-shrink-0"
          >
            <Menu className="h-4 w-4" />
          </Button>
          {!collapsed && (
            <span className="text-foreground font-semibold tracking-wide select-none text-base">
              Content<span className="inline-block align-baseline leading-none text-[1.5em] text-red-500">S</span>tudio
            </span>
          )}
        </div>

        {/* Main Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto overflow-x-visible">
          {/* Youtube Analytics Group */}
          {navGroups.map((group) => (
            <Collapsible
              key={group.label}
              open={analyticsOpen}
              onOpenChange={setAnalyticsOpen}
              className="mb-4"
            >
              <CollapsibleTrigger asChild>
                <button
                  className={cn(
                    "w-full flex items-center justify-between rounded-lg hover:bg-accent transition-colors text-sm font-medium text-muted-foreground",
                    collapsed ? "justify-center px-0 py-2" : "px-3 py-2"
                  )}
                >
                  {!collapsed && <span>{group.label}</span>}
                  {!collapsed && (
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 transition-transform",
                        analyticsOpen && "rotate-90"
                      )}
                    />
                  )}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 mt-1">
                {group.items.map((item) => {
                  const isActive = isActivePath(item.path);
                  return (
                    <button
                      key={item.title}
                      onClick={() => {
                        if (item.path === '/analytics/video' || item.path === '/analytics/compare') {
                          toast.info('Coming Soon');
                        } else {
                          navigate(item.path);
                        }
                      }}
                      className={cn(
                        "nav-item w-full rounded-lg transition-colors text-sm",
                        isActive && "bg-accent font-medium",
                        collapsed 
                          ? "mx-auto my-1 flex h-12 w-12 items-center justify-center" 
                          : "flex items-center gap-3 px-3 py-2"
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <span className={cn(
                        "grid place-items-center shrink-0 overflow-visible",
                        collapsed ? "h-6 w-6" : "h-5 w-5"
                      )}>
                        <item.icon className="h-full w-full" />
                      </span>
                      {!collapsed && <span>{item.title}</span>}
                    </button>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          ))}

          {/* Analysis History - Second Section */}
          {!collapsed && user && (
            <div className="mt-6 px-2">
              <div className="flex items-center justify-between mb-2 px-3">
                <div className="text-xs font-medium text-muted-foreground">분석 기록</div>
                
                {/* 더보기 메뉴 */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={() => setShowResetDialog(true)}
                      disabled={historyItems.length === 0}
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      리셋
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setShowDeleteAllDialog(true)}
                      disabled={historyItems.length === 0}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      완전 삭제
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="space-y-1">
                {historyItems.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-muted-foreground">최근 분석 없음</div>
                ) : (
                  historyItems.map((item) => (
                    <div
                      key={item.id}
                      className="group rounded-lg hover:bg-accent transition-colors flex items-center justify-between px-3 py-2"
                    >
                      <button
                        onClick={() => handleHistoryClick(item)}
                        className="truncate text-left text-sm flex-1 min-w-0"
                      >
                        {item.channel_name}
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            onClick={() => handleDelete(item.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            삭제
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer - Fixed at Bottom */}
        <div className={cn(
          "mt-auto border-t border-border pt-3",
          collapsed ? "pb-3" : "pb-3 px-4"
        )}>
          {user ? (
            collapsed ? (
              // Collapsed: Avatar only, centered
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center justify-center mx-auto p-2 rounded-lg hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="User menu"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getInitials(user.email)}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="end" className="w-56">
                  <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                    <User className="mr-2 h-4 w-4" />
                    설정
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // Expanded: Full profile info
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(user.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">
                          {profile?.display_name || profile?.nickname || user.email?.split('@')[0]}
                        </p>
                        {getTierBadge(profile?.tier)}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="start" className="w-56">
                  <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                    <User className="mr-2 h-4 w-4" />
                    설정
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          ) : (
            !collapsed && (
              <div className="space-y-2 px-0">
                <Button
                  onClick={() => setAuthDialogOpen(true)}
                  variant="default"
                  size="sm"
                  className="w-full"
                >
                  로그인
                </Button>
                <Button
                  onClick={() => setAuthDialogOpen(true)}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  회원가입
                </Button>
              </div>
            )
          )}
        </div>
      </aside>

      <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <AuthCard onSuccess={() => setAuthDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />

      {/* 리셋 확인 다이얼로그 */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>분석 기록을 초기화하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              분석 기록 목록만 삭제됩니다. 채널과 영상 데이터는 유지됩니다.
              <br />
              <span className="text-sm text-muted-foreground mt-2 block">
                • 영향 받는 항목: 분석 기록 {historyItems.length}개
                <br />
                • 유지되는 항목: 채널 데이터, 영상 데이터, 통계 데이터
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetLogs}
              disabled={isDeleting}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isDeleting ? '처리 중...' : '리셋'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 완전 삭제 확인 다이얼로그 */}
      <AlertDialog open={showDeleteAllDialog} onOpenChange={setShowDeleteAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              모든 분석 데이터를 삭제하시겠습니까?
            </AlertDialogTitle>
            <AlertDialogDescription>
              <span className="text-destructive font-semibold">⚠️ 이 작업은 되돌릴 수 없습니다.</span>
              <br />
              <br />
              다음 데이터가 영구적으로 삭제됩니다:
              <br />
              <span className="text-sm text-muted-foreground mt-2 block">
                • 분석 기록 {historyItems.length}개
                <br />
                • 모든 저장된 스냅샷
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAll}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? '삭제 중...' : '완전 삭제'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
