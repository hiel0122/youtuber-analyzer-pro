import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { setSupabaseCredentials, hasSupabaseCredentials, testSupabaseConnection } from '@/lib/supabaseClient';
import { setYouTubeApiKey, hasYouTubeApiKey, testYouTubeConnection } from '@/lib/youtubeApi';
import { Settings, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const SettingsModal = () => {
  const [open, setOpen] = useState(!hasSupabaseCredentials() || !hasYouTubeApiKey());
  const [supabaseUrl, setSupabaseUrlState] = useState(localStorage.getItem('ya_supabase_url') || '');
  const [supabaseKey, setSupabaseKeyState] = useState(localStorage.getItem('ya_supabase_anon') || '');
  const [youtubeKey, setYoutubeKeyState] = useState(localStorage.getItem('ya_youtube_key') || '');
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!supabaseUrl || !supabaseKey || !youtubeKey) {
      setError('모든 필드를 입력하세요');
      return;
    }

    setTesting(true);
    setError('');

    try {
      // Test Supabase connection
      const supabaseOk = await testSupabaseConnection(supabaseUrl, supabaseKey);
      if (!supabaseOk) {
        setError('Supabase 연결 실패: URL과 Anon Key를 확인하세요');
        setTesting(false);
        return;
      }

      // Test YouTube connection
      const youtubeOk = await testYouTubeConnection(youtubeKey);
      if (!youtubeOk) {
        setError('YouTube API 연결 실패: API Key를 확인하세요');
        setTesting(false);
        return;
      }

      // Save credentials
      setSupabaseCredentials(supabaseUrl, supabaseKey);
      setYouTubeApiKey(youtubeKey);
      
      toast.success('✅ 연결 성공');
      setOpen(false);
      window.location.reload();
    } catch (err) {
      console.error('Connection test error:', err);
      setError('연결 테스트 실패: 네트워크를 확인하세요');
    } finally {
      setTesting(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setOpen(true)}
        className="fixed top-4 right-4 z-50"
      >
        <Settings className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>API 설정</DialogTitle>
            <DialogDescription>
              YouTube 채널 분석을 위해 API 키를 설정하세요.
            </DialogDescription>
          </DialogHeader>
          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md text-sm">
              {error}
            </div>
          )}
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="supabase-url">Supabase URL</Label>
              <Input
                id="supabase-url"
                placeholder="https://your-project.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrlState(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supabase-key">Supabase Anon Key</Label>
              <Input
                id="supabase-key"
                type="password"
                placeholder="your-anon-key"
                value={supabaseKey}
                onChange={(e) => setSupabaseKeyState(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="youtube-key">YouTube API Key</Label>
              <Input
                id="youtube-key"
                type="password"
                placeholder="your-youtube-api-key"
                value={youtubeKey}
                onChange={(e) => setYoutubeKeyState(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1" disabled={testing}>
              {testing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  연결 테스트 중...
                </>
              ) : (
                '저장'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
