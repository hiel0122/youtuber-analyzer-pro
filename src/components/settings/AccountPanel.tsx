import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Loader2, LogOut, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function AccountPanel() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [nickname, setNickname] = useState(profile?.nickname || '');
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const handleUpdateProfile = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          nickname: nickname,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('프로필이 업데이트되었습니다.');
    } catch (error: any) {
      toast.error(error.message || '프로필 업데이트에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('로그아웃되었습니다.');
      window.location.href = '/';
    } catch (error: any) {
      toast.error('로그아웃에 실패했습니다.');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      toast.error('"DELETE"를 정확히 입력하세요.');
      return;
    }

    try {
      // Note: Account deletion should be handled by an edge function
      // This is a placeholder
      toast.info('계정 삭제는 관리자에게 문의하세요.');
    } catch (error: any) {
      toast.error('계정 삭제에 실패했습니다.');
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">계정 정보</h3>
        <p className="text-sm text-muted-foreground mb-6">
          프로필 정보 및 계정 설정을 관리하세요.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Avatar className="w-20 h-20">
          <AvatarFallback className="text-2xl">
            {getInitials(profile?.display_name || profile?.email)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-medium">{profile?.display_name || profile?.nickname}</p>
          <p className="text-sm text-muted-foreground">{profile?.email}</p>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="displayName">표시 이름</Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="이름을 입력하세요"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nickname">별명</Label>
          <Input
            id="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="별명을 입력하세요"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">이메일</Label>
          <Input
            id="email"
            type="email"
            value={profile?.email || ''}
            disabled
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground">
            이메일은 변경할 수 없습니다.
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleUpdateProfile} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              저장 중...
            </>
          ) : (
            '프로필 저장'
          )}
        </Button>
      </div>

      <div className="border-t pt-6 space-y-4">
        <h4 className="text-sm font-semibold">계정 관리</h4>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">로그아웃</p>
            <p className="text-sm text-muted-foreground">현재 세션에서 로그아웃합니다.</p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            로그아웃
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-destructive">계정 삭제</p>
            <p className="text-sm text-muted-foreground">
              모든 데이터가 영구적으로 삭제됩니다.
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                계정 삭제
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>정말로 계정을 삭제하시겠습니까?</AlertDialogTitle>
                <AlertDialogDescription>
                  이 작업은 되돌릴 수 없습니다. 모든 분석 데이터와 설정이 영구적으로 삭제됩니다.
                  계속하려면 아래에 "DELETE"를 입력하세요.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <Input
                placeholder="DELETE 입력"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
              />
              <AlertDialogFooter>
                <AlertDialogCancel>취소</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  계정 삭제
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
