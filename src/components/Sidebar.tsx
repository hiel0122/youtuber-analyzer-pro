import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AuthCard } from './AuthCard';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  CreditCard,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface NavItem {
  title: string;
  icon: React.ElementType;
  active?: boolean;
}

const navItems: NavItem[] = [
  { title: '프로젝트', icon: LayoutDashboard, active: true },
  { title: '팀', icon: Users },
  { title: '설정', icon: Settings },
  { title: '구독 관리', icon: CreditCard },
];

export function Sidebar() {
  const { user } = useAuth();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('로그아웃되었습니다.');
    } catch (error) {
      toast.error('로그아웃에 실패했습니다.');
    }
  };

  const getInitials = (email: string | undefined) => {
    if (!email) return 'U';
    return email.charAt(0).toUpperCase();
  };

  return (
    <>
      <aside 
        className={cn(
          "hidden lg:flex flex-col h-screen bg-slate-900/60 border border-slate-800/60 rounded-2xl p-4 transition-all duration-300",
          collapsed ? "w-20" : "w-64"
        )}
      >
        {/* Toggle button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="self-end mb-4 h-8 w-8"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.title}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm",
                item.active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </button>
          ))}
        </nav>

        {/* Usage card */}
        {!collapsed && (
          <div className="mb-4 p-3 bg-slate-800/40 rounded-lg border border-slate-700/40">
            <div className="text-xs text-muted-foreground mb-2">무료 버전 적용중</div>
            <div className="text-sm font-semibold mb-2">85/100</div>
            <Button size="sm" className="w-full" variant="secondary">
              프리미엄 시작
            </Button>
          </div>
        )}

        {/* User section */}
        <div className="border-t border-slate-700/40 pt-4">
          {user ? (
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitials(user.email)}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.email}</p>
                  <button
                    onClick={handleSignOut}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mt-1"
                  >
                    <LogOut className="h-3 w-3" />
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Button
              onClick={() => setAuthDialogOpen(true)}
              variant="secondary"
              size={collapsed ? "icon" : "default"}
              className="w-full"
            >
              {collapsed ? <Users className="h-4 w-4" /> : '로그인/회원가입'}
            </Button>
          )}
        </div>
      </aside>

      <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <AuthCard onSuccess={() => setAuthDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
