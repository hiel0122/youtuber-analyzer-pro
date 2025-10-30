import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Loader2, Send } from 'lucide-react';

export function ConnectForm() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [gaId, setGaId] = useState('');
  const [gaEnabled, setGaEnabled] = useState(false);
  const [slackWebhook, setSlackWebhook] = useState('');
  const [discordWebhook, setDiscordWebhook] = useState('');

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('connect_ga_id, connect_slack_webhook, connect_discord_webhook')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setGaId(data.connect_ga_id || '');
        setGaEnabled(!!data.connect_ga_id);
        setSlackWebhook(data.connect_slack_webhook || '');
        setDiscordWebhook(data.connect_discord_webhook || '');
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
          connect_ga_id: gaEnabled ? gaId : null,
          connect_slack_webhook: slackWebhook,
          connect_discord_webhook: discordWebhook,
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast.success('연동 설정이 저장되었습니다.');
    } catch (error: any) {
      toast.error(error.message || '설정 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleTestWebhook = (type: 'slack' | 'discord') => {
    // Placeholder for webhook testing
    toast.info(`${type === 'slack' ? 'Slack' : 'Discord'} 웹훅 테스트 기능은 구현 예정입니다.`);
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
        <h3 className="text-lg font-semibold mb-4">외부 서비스 연동</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Google Analytics, Slack, Discord 등과 연동하세요.
        </p>
      </div>

      <div className="space-y-6">
        {/* Google Analytics */}
        <div className="space-y-4 pb-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Google Analytics</h4>
              <p className="text-sm text-muted-foreground">
                GA4 Measurement ID를 입력하세요 (예: G-XXXXXXXXXX)
              </p>
            </div>
            <Switch
              checked={gaEnabled}
              onCheckedChange={setGaEnabled}
            />
          </div>
          {gaEnabled && (
            <div className="space-y-2">
              <Label htmlFor="gaId">Measurement ID</Label>
              <Input
                id="gaId"
                placeholder="G-XXXXXXXXXX"
                value={gaId}
                onChange={(e) => setGaId(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Slack */}
        <div className="space-y-4 pb-6 border-b">
          <div>
            <h4 className="font-medium">Slack</h4>
            <p className="text-sm text-muted-foreground">
              분석 결과를 Slack으로 전송합니다.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="slackWebhook">Webhook URL</Label>
            <Input
              id="slackWebhook"
              type="url"
              placeholder="https://hooks.slack.com/services/..."
              value={slackWebhook}
              onChange={(e) => setSlackWebhook(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleTestWebhook('slack')}
            disabled={!slackWebhook}
          >
            <Send className="mr-2 h-4 w-4" />
            테스트 전송
          </Button>
        </div>

        {/* Discord */}
        <div className="space-y-4 pb-6 border-b">
          <div>
            <h4 className="font-medium">Discord</h4>
            <p className="text-sm text-muted-foreground">
              분석 결과를 Discord로 전송합니다.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="discordWebhook">Webhook URL</Label>
            <Input
              id="discordWebhook"
              type="url"
              placeholder="https://discord.com/api/webhooks/..."
              value={discordWebhook}
              onChange={(e) => setDiscordWebhook(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleTestWebhook('discord')}
            disabled={!discordWebhook}
          >
            <Send className="mr-2 h-4 w-4" />
            테스트 전송
          </Button>
        </div>

        {/* Coming Soon */}
        <div className="space-y-4 opacity-50">
          <div>
            <h4 className="font-medium">추가 연동 (구현 예정)</h4>
            <p className="text-sm text-muted-foreground">
              Notion, Google Sheets 등의 서비스 연동을 준비 중입니다.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
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
