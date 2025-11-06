import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { saveSettings, fetchSettings } from '@/lib/settings/actions';
import { fetchUsageLast30 } from '@/lib/settings/usage';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, Brush, ResponsiveContainer, Legend } from 'recharts';
import { Settings, Globe, Youtube, Key, User, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

type Tab = 'general' | 'channel' | 'api' | 'account' | 'usage';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: Tab;
}

const TABS = [
  { key: 'general' as const, label: 'General', icon: Globe },
  { key: 'channel' as const, label: 'Channel', icon: Youtube },
  { key: 'api' as const, label: 'API', icon: Key },
  { key: 'account' as const, label: 'Account', icon: User },
  { key: 'usage' as const, label: 'Usage', icon: BarChart3 },
];

const i18n = {
  ko: {
    language: "언어",
    theme: "테마",
    theme_dark: "다크",
    theme_light: "라이트",
    theme_system: "시스템",
    competitors: "경쟁 채널 등록 (최대 5개)",
    default_range: "기본 조회 범위",
    all: "전체",
    api_notice: "⚠️ API 키는 암호화되어 저장되며, 다른 사용자와 공유되지 않습니다.",
    supabase_url: "Supabase URL",
    supabase_anon: "Supabase Anon Key",
    yt_data: "YouTube Data API",
    yt_analytics: "YouTube Analytics API",
    analytics_warn: "Analytics API Key 값은 중요한 Key 이므로 노출에 주의하세요.",
    account_info: "계정 정보",
    account_manage: "계정 관리",
    display_name: "표시 이름",
    avatar: "프로필 사진",
    team_section: "팀 계정 관리 (리더 전용 섹션)",
    save: "저장",
    saved: "저장 완료",
    credits: "크레딧 사용량",
    details: "자세히 보기",
  },
  en: {
    language: "Language",
    theme: "Theme",
    theme_dark: "Dark",
    theme_light: "Light",
    theme_system: "System",
    competitors: "Competitor Channels (up to 5)",
    default_range: "Default Range",
    all: "All",
    api_notice: "⚠️ API keys are encrypted at rest and never shared with other users.",
    supabase_url: "Supabase URL",
    supabase_anon: "Supabase Anon Key",
    yt_data: "YouTube Data API",
    yt_analytics: "YouTube Analytics API",
    analytics_warn: "Analytics API key is sensitive. Avoid exposing it.",
    account_info: "Account",
    account_manage: "Account Management",
    display_name: "Display Name",
    avatar: "Avatar",
    team_section: "Team Management (Leader only)",
    save: "Save",
    saved: "Saved successfully",
    credits: "Credit Usage",
    details: "View more",
  },
};

export function SettingsModal({ open, onOpenChange, defaultTab = 'general' }: SettingsModalProps) {
  const [tab, setTab] = useState<Tab>(defaultTab);
  const [loading, setLoading] = useState(false);

  // form state
  const [language, setLanguage] = useState<"ko" | "en">("ko");
  const [theme, setTheme] = useState<"dark" | "light" | "system">("dark");
  const [competitors, setCompetitors] = useState<string[]>([""]);
  const [defaultRange, setDefaultRange] = useState<string>("30d");
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseAnon, setSupabaseAnon] = useState("");
  const [ytDataApi, setYtDataApi] = useState("");
  const [ytAnalyticsApi, setYtAnalyticsApi] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [usage, setUsage] = useState<any>(null);

  const t = i18n[language];

  useEffect(() => {
    if (!open) return;
    (async () => {
      const s = await fetchSettings(supabase);
      if (s) {
        setLanguage((s.language as any) ?? "ko");
        setTheme((s.theme as any) ?? "dark");
        setCompetitors(Array.isArray(s.competitor_channels) ? s.competitor_channels.slice(0, 5) : [""]);
        setDefaultRange(s.default_range ?? "30d");
        setDisplayName(s.display_name ?? "");
        setSupabaseUrl(s.supabase_url_plain ?? "");
        setSupabaseAnon(s.supabase_anon_plain ?? "");
        setYtDataApi(s.yt_data_api_plain ?? "");
        setYtAnalyticsApi(s.yt_analytics_api_plain ?? "");
      }
      const u = await fetchUsageLast30(supabase);
      setUsage(u);
    })();
  }, [open]);

  const addCompetitor = () => {
    if (competitors.length >= 5) return;
    setCompetitors([...competitors, ""]);
  };

  const removeCompetitor = (idx: number) => {
    const next = competitors.filter((_, i) => i !== idx);
    setCompetitors(next.length ? next : [""]);
  };

  const onSave = async () => {
    setLoading(true);
    try {
      await saveSettings(supabase, {
        language,
        theme,
        competitor_channels: competitors.filter(Boolean).slice(0, 5),
        default_range: defaultRange,
        supabase_url: supabaseUrl,
        supabase_anon: supabaseAnon,
        yt_data_api: ytDataApi,
        yt_analytics_api: ytAnalyticsApi,
        display_name: displayName,
        avatar_file: avatarFile ?? undefined,
      });
      toast.success(t.saved);
    } catch (e) {
      toast.error('저장 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[85vh] p-0">
        <div className="flex h-full">
          {/* Left Sidebar - 30% */}
          <div className="w-48 border-r bg-muted/30 p-4">
            <DialogHeader className="mb-6 px-2">
              <DialogTitle className="flex items-center gap-2 text-lg">
                <Settings className="w-5 h-5" />
                설정
              </DialogTitle>
            </DialogHeader>

            <nav className="space-y-1">
              {TABS.map((x) => {
                const Icon = x.icon;
                return (
                  <button
                    key={x.key}
                    onClick={() => setTab(x.key)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-ink,#1D348F)]",
                      tab === x.key
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {x.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Content - 70% */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {tab === "general" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-1 inline-block">{t.language}</Label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as any)}
                        className="w-full rounded-md bg-background border border-input px-3 py-2"
                      >
                        <option value="ko">한국어</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                    <div>
                      <Label className="mb-1 inline-block">{t.theme}</Label>
                      <select
                        value={theme}
                        onChange={(e) => setTheme(e.target.value as any)}
                        className="w-full rounded-md bg-background border border-input px-3 py-2"
                      >
                        <option value="dark">{t.theme_dark}</option>
                        <option value="light">{t.theme_light}</option>
                        <option value="system">{t.theme_system}</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {tab === "channel" && (
                <div className="space-y-4">
                  <div>
                    <Label className="mb-2 inline-block">{t.competitors}</Label>
                    <div className="space-y-2">
                      {competitors.map((v, i) => (
                        <div key={i} className="flex gap-2">
                          <Input
                            value={v}
                            onChange={(e) => {
                              const next = [...competitors];
                              next[i] = e.target.value;
                              setCompetitors(next);
                            }}
                            placeholder="https://www.youtube.com/@channel"
                          />
                          <Button type="button" variant="outline" onClick={() => removeCompetitor(i)}>
                            삭제
                          </Button>
                        </div>
                      ))}
                      {competitors.length < 5 && (
                        <Button type="button" variant="secondary" onClick={addCompetitor}>
                          + 추가
                        </Button>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="mb-2 inline-block">{t.default_range}</Label>
                    <select
                      value={defaultRange}
                      onChange={(e) => setDefaultRange(e.target.value)}
                      className="w-full rounded-md bg-background border border-input px-3 py-2"
                    >
                      <option value="all">{t.all}</option>
                      <option value="7d">최근 7일</option>
                      <option value="30d">최근 30일</option>
                      <option value="90d">최근 90일</option>
                    </select>
                  </div>
                </div>
              )}

              {tab === "api" && (
                <TooltipProvider>
                  <div className="space-y-4">
                    <p className="text-sm font-medium text-red-400">{t.api_notice}</p>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label className="mb-1 inline-flex items-center gap-2">
                          {t.supabase_url}
                          <Tooltip>
                            <TooltipTrigger className="text-xs">?</TooltipTrigger>
                            <TooltipContent>Supabase 프로젝트 URL. 프로젝트 생성 시 제공됩니다.</TooltipContent>
                          </Tooltip>
                        </Label>
                        <Input
                          type="password"
                          placeholder="https://xxxx.supabase.co"
                          value={supabaseUrl}
                          onChange={(e) => setSupabaseUrl(e.target.value)}
                        />
                      </div>

                      <div>
                        <Label className="mb-1 inline-flex items-center gap-2">
                          {t.supabase_anon}
                          <Tooltip>
                            <TooltipTrigger className="text-xs">?</TooltipTrigger>
                            <TooltipContent>Supabase 프로젝트의 anon public key.</TooltipContent>
                          </Tooltip>
                        </Label>
                        <Input
                          type="password"
                          placeholder="supabase anon key"
                          value={supabaseAnon}
                          onChange={(e) => setSupabaseAnon(e.target.value)}
                        />
                      </div>

                      <div>
                        <Label className="mb-1 inline-flex items-center gap-2">
                          {t.yt_data}
                          <Tooltip>
                            <TooltipTrigger className="text-xs">?</TooltipTrigger>
                            <TooltipContent>
                              YouTube Data API v3 키가 필요합니다. Google Cloud Console에서 발급받을 수 있습니다.
                            </TooltipContent>
                          </Tooltip>
                        </Label>
                        <Input
                          type="password"
                          placeholder="YouTube Data API key"
                          value={ytDataApi}
                          onChange={(e) => setYtDataApi(e.target.value)}
                        />
                      </div>

                      <div>
                        <Label className="mb-1 inline-flex items-center gap-2">
                          {t.yt_analytics}
                          <Tooltip>
                            <TooltipTrigger className="text-xs">?</TooltipTrigger>
                            <TooltipContent>
                              Google Cloud Console에서 발급. OAuth 또는 서비스 계정 구성 필요할 수 있습니다.
                            </TooltipContent>
                          </Tooltip>
                        </Label>
                        <Input
                          type="password"
                          placeholder="YouTube Analytics API key"
                          value={ytAnalyticsApi}
                          onChange={(e) => setYtAnalyticsApi(e.target.value)}
                        />
                        <div className="mt-2 rounded-md bg-yellow-900/40 p-2 text-sm font-medium text-yellow-300">
                          {t.analytics_warn}
                        </div>
                      </div>
                    </div>
                  </div>
                </TooltipProvider>
              )}

              {tab === "account" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-semibold">{t.account_info}</h3>
                    <div className="mt-3 grid grid-cols-2 gap-4">
                      <div>
                        <Label className="mb-1 inline-block">{t.display_name}</Label>
                        <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="홍길동" />
                      </div>
                      <div>
                        <Label className="mb-1 inline-block">{t.avatar}</Label>
                        <Input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-semibold">{t.account_manage}</h3>
                    <div className="mt-3 rounded-lg border border-white/10 p-4">
                      <div className="text-sm">{t.team_section}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        향후 팀/엔터프라이즈 플랜에서 리더가 팀원을 초대/권한 설정할 수 있도록 확장 (지금은 디자인만)
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {tab === "usage" && usage && (
                <div className="space-y-6">
                  {/* 크레딧 바 */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-semibold">{t.credits}</h3>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full bg-blue-500 transition-all duration-1000 ease-out"
                        style={{ width: `${Math.min(100, usage.creditsUsedPct)}%` }}
                      />
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      {usage.creditsUsed} / {usage.creditsTotal} credits
                    </div>
                  </div>

                  {/* 사용량 추이 */}
                  <div className="rounded-lg border border-white/10 p-3">
                    <div className="mb-2 text-sm font-medium">일별 사용량 추이 (최근 최대 30일)</div>
                    <div className="h-72 w-full">
                      <ResponsiveContainer>
                        <LineChart data={usage.data}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" interval={9} />
                          <YAxis />
                          <RTooltip />
                          <Legend />
                          <Line type="monotone" dataKey="analyzed_channels" stroke="#60a5fa" dot={false} name="분석 채널" />
                          <Line type="monotone" dataKey="data_api_calls" stroke="#34d399" dot={false} name="Data API" />
                          <Line type="monotone" dataKey="analytics_api_calls" stroke="#f59e0b" dot={false} name="Analytics API" />
                          <Line type="monotone" dataKey="data_save" stroke="#f87171" dot={false} name="Data Save" />
                          <Brush dataKey="day" height={18} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer buttons */}
            <div className="border-t p-4 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => onOpenChange(false)}>
                닫기
              </Button>
              <Button onClick={onSave} disabled={loading}>
                {loading ? "저장 중..." : t.save}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
