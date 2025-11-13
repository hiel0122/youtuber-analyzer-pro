import type { SupabaseClient } from "@supabase/supabase-js";

type SavePayload = {
  language: "ko" | "en";
  theme: "dark" | "light" | "system";
  competitor_channels: string[];
  default_range: string;
  supabase_url?: string;
  supabase_anon?: string;
  yt_data_api?: string;
  yt_analytics_api?: string;
  display_name?: string;
  avatar_file?: File;
};

export async function fetchSettings(supabase: SupabaseClient) {
  const readLocal = () => {
    try { return JSON.parse(localStorage.getItem("yap:settings") || "null"); } catch { return null; }
  };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return readLocal();

  // 최소 컬럼만 select (스키마 캐시 문제 회피)
  const { data, error } = await supabase
    .from("user_settings")
    .select("supabase_url_enc,supabase_anon_enc,yt_data_api_enc,yt_analytics_api_enc,updated_at,display_name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error && error.message) {
    console.warn("fetchSettings:", error.message);
  }

  const db = data ? {
    supabase_url_plain: data.supabase_url_enc?.replace(/^enc:/, '') || '',
    supabase_anon_plain: data.supabase_anon_enc?.replace(/^enc:/, '') || '',
    yt_data_api_plain: data.yt_data_api_enc?.replace(/^enc:/, '') || '',
    yt_analytics_api_plain: data.yt_analytics_api_enc?.replace(/^enc:/, '') || '',
    display_name: data.display_name || '',
    updated_at: data.updated_at || null,
  } : null;

  return db ?? readLocal();
}

export async function saveSettings(supabase: SupabaseClient, p: SavePayload) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다.");

  // ✅ 1단계: 필수/선택 키만 최소 업서트 (DB 누락 컬럼 차단)
  const minimalRow = {
    user_id: user.id,
    supabase_url_enc: p.supabase_url ? `enc:${p.supabase_url}` : null,
    supabase_anon_enc: p.supabase_anon ? `enc:${p.supabase_anon}` : null,
    yt_data_api_enc: p.yt_data_api ? `enc:${p.yt_data_api}` : null,
    yt_analytics_api_enc: p.yt_analytics_api ? `enc:${p.yt_analytics_api}` : null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("user_settings")
    .upsert(minimalRow, { onConflict: "user_id" })
    .select("user_id")
    .single();

  if (error) {
    console.error("saveSettings (minimal upsert) error:", error);
    throw new Error(error.message || "설정 저장 실패");
  }

  // ✅ 2단계: 로컬 백업 (언어/테마/기타 포함) — 분석/화면 즉시 반영
  try {
    localStorage.setItem("yap:settings", JSON.stringify({
      language: p.language ?? "ko",
      theme: p.theme ?? "dark",
      competitor_channels: p.competitor_channels ?? [],
      default_range: p.default_range ?? "30d",
      supabase_url_plain: p.supabase_url || "",
      supabase_anon_plain: p.supabase_anon || "",
      yt_data_api_plain: p.yt_data_api || "",
      yt_analytics_api_plain: p.yt_analytics_api || "",
      display_name: p.display_name || "",
      updated_at: Date.now(),
    }));
  } catch {}

  // (선택) 표시 이름은 Auth metadata에 동기화
  if (p.display_name) {
    try {
      await supabase.auth.updateUser({ data: { display_name: p.display_name } });
    } catch {}
  }
}

export async function ensureApiConfigured(supabase: SupabaseClient): Promise<boolean> {
  const s = await fetchSettings(supabase);
  return Boolean(s?.supabase_url_plain) 
      && Boolean(s?.supabase_anon_plain) 
      && Boolean(s?.yt_data_api_plain);
}

export async function ensureApiConfiguredDetailed(supabase: SupabaseClient) {
  const s = await fetchSettings(supabase);
  const clean = (v: string | undefined) => (v || "").replace(/[*.•\s]/g, "");
  const supabaseUrl    = clean(s?.supabase_url_plain);
  const supabaseAnon   = clean(s?.supabase_anon_plain);
  const ytDataApi      = clean(s?.yt_data_api_plain);

  const missing = {
    supabaseUrl:    !supabaseUrl,
    supabaseAnon:   !supabaseAnon,
    ytDataApi:      !ytDataApi,
  };
  const ok = !missing.supabaseUrl && !missing.supabaseAnon && !missing.ytDataApi;
  return { ok, missing };
}
