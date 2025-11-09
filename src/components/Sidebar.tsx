import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AuthCard } from './AuthCard';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Video,
  BarChart3,
  GitCompare,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  MoreVertical,
  User,
  Edit2,
  Trash2
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

interface NavItem {
  title: string;
  icon: React.ElementType;
  active?: boolean;
  onClick?: () => void;
}

const navItems: NavItem[] = [
  { title: '대시보드', icon: LayoutDashboard, active: true },
  { title: '채널 분석', icon: Video },
  { title: '영상 분석', icon: BarChart3 },
  { title: '채널 비교', icon: GitCompare },
];

interface AnalysisLog {
  id: string;
  channel_name: string;
  created_at: string;
  user_id: string;
}

export function Sidebar() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [logs, setLogs] = useState<AnalysisLog[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    if (user) {
      loadLogs();
    } else {
      setLogs([]);
    }
  }, [user]);

  const loadLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('analysis_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);
      
      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Load logs error:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('로그아웃되었습니다.');
    } catch (error) {
      toast.error('로그아웃에 실패했습니다.');
    }
  };

  const handleDeleteLog = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;
    
    try {
      const { error } = await supabase
        .from('analysis_logs')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('삭제되었습니다.');
      loadLogs();
    } catch (error) {
      toast.error('삭제에 실패했습니다.');
    }
  };

  const handleEditLog = async (id: string) => {
    try {
      const { error } = await (supabase
        .from('analysis_logs') as any)
        .update({ channel_name: editValue })
        .eq('id', id);
      
      if (error) throw error;
      toast.success('수정되었습니다.');
      setEditingId(null);
      setEditValue('');
      loadLogs();
    } catch (error) {
      toast.error('수정에 실패했습니다.');
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

  const handleNavClick = (item: NavItem) => {
    if (!item.active) {
      toast.info('Coming Soon');
    }
  };

  return (
    <>
      <aside 
        data-sidebar
        className={cn(
          "sidebar hidden lg:flex flex-col h-screen border border-border rounded-2xl p-4 transition-all duration-300 sticky top-0",
          collapsed ? "w-20" : "w-64"
        )}
      >
        {/* Toggle button */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
          >
            <Menu className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Main Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Navigation - First Section */}
          <nav className="space-y-1 mb-6">
            {navItems.map((item) => (
              <button
                key={item.title}
                onClick={() => handleNavClick(item)}
                className={cn(
                  "nav-item w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors text-sm",
                  item.active && "font-medium"
                )}
                aria-current={item.active ? "page" : undefined}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </button>
            ))}
          </nav>

          {/* Analysis Logs - Second Section */}
          {!collapsed && user && (
            <div className="mb-4">
              <div className="text-xs font-medium text-muted-foreground mb-2 px-3">분석 기록</div>
              <ScrollArea className="h-[200px]">
                <div className="space-y-1">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="group flex items-center justify-between px-3 py-2 rounded-lg hover:bg-accent transition-colors"
                    >
                      {editingId === log.id ? (
                        <div className="flex-1 flex items-center gap-2">
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="flex-1 bg-background text-sm px-2 py-1 rounded border border-input focus:outline-none focus:ring-1 focus:ring-ring"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleEditLog(log.id);
                              if (e.key === 'Escape') {
                                setEditingId(null);
                                setEditValue('');
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditLog(log.id)}
                            className="h-6 px-2"
                          >
                            저장
                          </Button>
                        </div>
                      ) : (
                        <>
                          <span className="text-sm text-foreground truncate flex-1">
                            {log.channel_name}
                          </span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingId(log.id);
                                  setEditValue(log.channel_name);
                                }}
                              >
                                <Edit2 className="mr-2 h-4 w-4" />
                                편집
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteLog(log.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                삭제
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        {/* Footer - Fixed at Bottom */}
        <div className="mt-auto border-t border-border pt-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className={cn(
                    "w-full flex items-center gap-3 p-2 rounded-lg transition-colors",
                    "hover:bg-accent focus-visible:outline-none focus-visible:ring-2",
                    "focus-visible:ring-ring"
                  )}
                >
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(user.email)}
                    </AvatarFallback>
                  </Avatar>
                  {!collapsed && (
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">
                          {profile?.display_name || profile?.nickname || user.email?.split('@')[0]}
                        </p>
                        {getTierBadge(profile?.tier)}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  )}
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
          ) : (
            <div className="space-y-2">
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
          )}
        </div>
      </aside>

      <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <AuthCard onSuccess={() => setAuthDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
