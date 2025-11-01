import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Plus, X } from 'lucide-react';

export function ChannelForm() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [competitors, setCompetitors] = useState<string[]>(['']);
  const [rangeDays, setRangeDays] = useState('90');

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Load user settings
      const { data: settings, error: settingsError } = await supabase
        .from('user_settings')
        .select('channel_range_days')
        .eq('user_id', user.id)
        .maybeSingle();

      if (settingsError && settingsError.code !== 'PGRST116') throw settingsError;

      if (settings) {
        const settingsData = settings as any;
        setRangeDays(String(settingsData.channel_range_days || 90));
      }

      // Load competitor channels
      const { data: competitorData, error: competitorError } = await supabase
        .from('user_competitor_channels')
        .select('channel_url')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(5);

      if (competitorError) throw competitorError;

      if (competitorData && competitorData.length > 0) {
        setCompetitors(competitorData.map((c: any) => c.channel_url));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const addCompetitor = () => {
    if (competitors.length < 5) {
      setCompetitors([...competitors, '']);
    }
  };

  const removeCompetitor = (index: number) => {
    setCompetitors(competitors.filter((_, i) => i !== index));
  };

  const updateCompetitor = (index: number, value: string) => {
    const newCompetitors = [...competitors];
    newCompetitors[index] = value;
    setCompetitors(newCompetitors);
  };

  const validateUrl = (url: string): boolean => {
    if (!url) return true; // Empty is okay
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const handleSave = async () => {
    if (!user) return;

    // Validate all URLs
    const validCompetitors = competitors.filter(c => c.trim());
    for (const url of validCompetitors) {
      if (!validateUrl(url)) {
        toast.error('유효하지 않은 YouTube URL이 포함되어 있습니다.');
        return;
      }
    }

    // Check for duplicates
    const uniqueUrls = new Set(validCompetitors);
    if (uniqueUrls.size !== validCompetitors.length) {
      toast.error('중복된 채널 URL이 있습니다.');
      return;
    }

    setSaving(true);
    try {
      // Save range days
      const { error: settingsError } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          channel_range_days: rangeDays === 'all' ? 9999 : parseInt(rangeDays),
        } as any, {
          onConflict: 'user_id'
        });

      if (settingsError) throw settingsError;

      // Delete existing competitors
      await supabase
        .from('user_competitor_channels')
        .delete()
        .eq('user_id', user.id);

      // Insert new competitors
      if (validCompetitors.length > 0) {
        const { error: competitorError } = await supabase
          .from('user_competitor_channels')
          .insert(
            validCompetitors.map(url => ({
              user_id: user.id,
              channel_url: url,
            })) as any
          );

        if (competitorError) throw competitorError;
      }

      toast.success(t('settings.saved'));
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
        <h3 className="text-lg font-semibold mb-4">{t('channel.title')}</h3>
      </div>

      <div className="grid gap-6">
        {/* Competitor Channels Section */}
        <div className="space-y-3">
          <div>
            <Label className="text-base">{t('channel.competitors')}</Label>
            <p className="text-xs text-muted-foreground mt-1">
              {t('channel.competitors.desc')}
            </p>
          </div>
          
          <div className="space-y-2">
            {competitors.map((url, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  type="url"
                  placeholder={t('channel.competitors.placeholder')}
                  value={url}
                  onChange={(e) => updateCompetitor(index, e.target.value)}
                  className={!validateUrl(url) && url ? 'border-destructive' : ''}
                />
                {competitors.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCompetitor(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            {competitors.length < 5 && (
              <Button
                variant="outline"
                size="sm"
                onClick={addCompetitor}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('channel.competitors.add')}
              </Button>
            )}
          </div>
        </div>

        {/* Range Days Section */}
        <div className="space-y-2">
          <Label htmlFor="rangeDays">{t('channel.range')}</Label>
          <Select value={rangeDays} onValueChange={setRangeDays}>
            <SelectTrigger id="rangeDays">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('channel.range.all')}</SelectItem>
              <SelectItem value="30">{t('channel.range.30')}</SelectItem>
              <SelectItem value="90">{t('channel.range.90')}</SelectItem>
              <SelectItem value="180">{t('channel.range.180')}</SelectItem>
              <SelectItem value="365">{t('channel.range.365')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('settings.saving')}
            </>
          ) : (
            t('settings.save')
          )}
        </Button>
      </div>
    </div>
  );
}
