import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export function ChannelForm() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [defaultUrl, setDefaultUrl] = useState('');
  const [rangeDays, setRangeDays] = useState('90');
  const [includeShorts, setIncludeShorts] = useState(true);

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('channel_default_url, channel_range_days, channel_include_shorts')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setDefaultUrl(data.channel_default_url || '');
        setRangeDays(String(data.channel_range_days || 90));
        setIncludeShorts(data.channel_include_shorts ?? true);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          channel_default_url: defaultUrl,
          channel_range_days: parseInt(rangeDays),
          channel_include_shorts: includeShorts,
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast.success('채널 설정이 저장되었습니다.');
    } catch (error: any) {
      toast.error(error.message || '설정 저장에 실패했습니다.');
    } finally {
      setSaving(false);
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
        <h3 className="text-lg font-semibold mb-4">채널 설정</h3>
        <p className="text-sm text-muted-foreground mb-6">
          기본 채널 및 분석 옵션을 설정하세요.
        </p>
      </div>

      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="defaultUrl">기본 채널 URL</Label>
          <Input
            id="defaultUrl"
            type="url"
            placeholder="https://www.youtube.com/@channelname"
            value={defaultUrl}
            onChange={(e) => setDefaultUrl(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            자주 분석하는 채널 URL을 입력하세요. (@handle 또는 channelId 지원)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="rangeDays">기본 조회 범위</Label>
          <Select value={rangeDays} onValueChange={setRangeDays}>
            <SelectTrigger id="rangeDays">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30일</SelectItem>
              <SelectItem value="90">90일</SelectItem>
              <SelectItem value="180">180일</SelectItem>
              <SelectItem value="365">365일</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="includeShorts">Shorts 포함</Label>
            <p className="text-xs text-muted-foreground">
              분석에 YouTube Shorts를 포함합니다.
            </p>
          </div>
          <Switch
            id="includeShorts"
            checked={includeShorts}
            onCheckedChange={setIncludeShorts}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
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
