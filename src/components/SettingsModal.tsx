import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { setSupabaseCredentials, hasSupabaseCredentials } from '@/lib/supabaseClient';
import { setYouTubeApiKey, hasYouTubeApiKey } from '@/lib/youtubeApi';
import { Settings } from 'lucide-react';

export const SettingsModal = () => {
  const [open, setOpen] = useState(!hasSupabaseCredentials() || !hasYouTubeApiKey());
  const [supabaseUrl, setSupabaseUrlState] = useState(localStorage.getItem('supabase_url') || '');
  const [supabaseKey, setSupabaseKeyState] = useState(localStorage.getItem('supabase_key') || '');
  const [youtubeKey, setYoutubeKeyState] = useState(localStorage.getItem('youtube_api_key') || '');

  const handleSave = () => {
    if (supabaseUrl && supabaseKey) {
      setSupabaseCredentials(supabaseUrl, supabaseKey);
    }
    if (youtubeKey) {
      setYouTubeApiKey(youtubeKey);
    }
    setOpen(false);
    window.location.reload();
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
          <Button onClick={handleSave} className="w-full">
            저장
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};
