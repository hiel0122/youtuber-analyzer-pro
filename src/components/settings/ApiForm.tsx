import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function ApiForm() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [youtubeKey, setYoutubeKey] = useState('');
  const [showSupabaseKey, setShowSupabaseKey] = useState(false);
  const [showYoutubeKey, setShowYoutubeKey] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('api_supabase_url, api_supabase_anon_key, api_youtube_key')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setSupabaseUrl(data.api_supabase_url || '');
        // Mask keys for display
        if (data.api_supabase_anon_key) {
          setSupabaseKey(data.api_supabase_anon_key);
        }
        if (data.api_youtube_key) {
          setYoutubeKey(data.api_youtube_key);
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return url.includes('supabase.co');
    } catch {
      return false;
    }
  };

  const handleSave = async () => {
    if (!user) return;

    if (!supabaseUrl || !validateUrl(supabaseUrl)) {
      toast.error('유효한 Supabase URL을 입력하세요.');
      return;
    }

    if (!supabaseKey || supabaseKey.length < 20) {
      toast.error('Supabase Anon Key는 최소 20자 이상이어야 합니다.');
      return;
    }

    if (!youtubeKey || youtubeKey.length < 20) {
      toast.error('YouTube API Key는 최소 20자 이상이어야 합니다.');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          api_supabase_url: supabaseUrl,
          api_supabase_anon_key: supabaseKey,
          api_youtube_key: youtubeKey,
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast.success('API 설정이 저장되었습니다.');
    } catch (error: any) {
      toast.error(error.message || 'API 설정 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('모든 API 설정을 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      setSupabaseUrl('');
      setSupabaseKey('');
      setYoutubeKey('');
      toast.info('입력 필드가 초기화되었습니다. 저장 버튼을 눌러 적용하세요.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">API 설정</h3>
        <p className="text-sm text-muted-foreground mb-6">
          YouTube 채널 분석을 위해 API 키를 설정하세요. 키는 계정별로 안전하게 저장됩니다.
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          API 키는 암호화되어 저장되며, 다른 사용자와 공유되지 않습니다.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="supabaseUrl">Supabase URL</Label>
          <Input
            id="supabaseUrl"
            type="url"
            placeholder="https://xxxxx.supabase.co"
            value={supabaseUrl}
            onChange={(e) => setSupabaseUrl(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="supabaseKey">Supabase Anon Key</Label>
          <div className="relative">
            <Input
              id="supabaseKey"
              type={showSupabaseKey ? 'text' : 'password'}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowSupabaseKey(!showSupabaseKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded"
            >
              {showSupabaseKey ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="youtubeKey">YouTube API Key</Label>
          <div className="relative">
            <Input
              id="youtubeKey"
              type={showYoutubeKey ? 'text' : 'password'}
              placeholder="AIzaSyD..."
              value={youtubeKey}
              onChange={(e) => setYoutubeKey(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowYoutubeKey(!showYoutubeKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded"
            >
              {showYoutubeKey ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            YouTube Data API v3 키가 필요합니다.{' '}
            <a 
              href="https://console.cloud.google.com/apis/credentials" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              Google Cloud Console
            </a>
            에서 발급받을 수 있습니다.
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleReset}>
          초기화
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              저장 중...
            </>
          ) : (
            '저장'
          )}
        </Button>
      </div>
    </div>
  );
}
