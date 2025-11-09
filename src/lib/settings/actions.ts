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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("user_settings").select("*").eq("user_id", user.id).maybeSingle();
  
  // 암호화된 값을 복호화 (임시로 enc: 접두사 제거)
  if (data) {
    return {
      ...data,
      supabase_url_plain: data.supabase_url_enc?.replace(/^enc:/, '') || '',
      supabase_anon_plain: data.supabase_anon_enc?.replace(/^enc:/, '') || '',
      yt_data_api_plain: data.yt_data_api_enc?.replace(/^enc:/, '') || '',
      yt_analytics_api_plain: data.yt_analytics_api_enc?.replace(/^enc:/, '') || '',
    };
  }
  return data;
}

export async function saveSettings(supabase: SupabaseClient, p: SavePayload) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("no user");

  // 아바타 업로드 (선택)
  let avatar_url: string | undefined;
  if (p.avatar_file) {
    const ext = p.avatar_file.name.split(".").pop() || "png";
    const path = `${user.id}/${Date.now()}.${ext}`;
    
    // avatars 버킷 존재 확인, 없으면 생성하지 않고 스킵
    try {
      const { data: up } = await supabase.storage.from("avatars").upload(path, p.avatar_file, { upsert: true });
      if (up) {
        const { data: pub } = supabase.storage.from("avatars").getPublicUrl(up.path);
        avatar_url = pub.publicUrl;
      }
    } catch (e) {
      console.warn('Avatar upload failed:', e);
    }
  }

  // 키는 여기서 평문 저장하지 말고, 임시로 enc: 접두사만 붙여서 저장
  const row = {
    user_id: user.id,
    language: p.language,
    theme: p.theme,
    competitor_channels: p.competitor_channels,
    default_range: p.default_range,
    supabase_url_enc: p.supabase_url ? `enc:${p.supabase_url}` : undefined,
    supabase_anon_enc: p.supabase_anon ? `enc:${p.supabase_anon}` : undefined,
    yt_data_api_enc: p.yt_data_api ? `enc:${p.yt_data_api}` : undefined,
    yt_analytics_api_enc: p.yt_analytics_api ? `enc:${p.yt_analytics_api}` : undefined,
    display_name: p.display_name,
    avatar_url: avatar_url || undefined,
    updated_at: new Date().toISOString(),
  };

  await supabase.from("user_settings").upsert(row, { onConflict: "user_id" });

  // 표시 이름은 auth user_metadata에도 반영
  if (p.display_name) {
    try {
      await supabase.auth.updateUser({ data: { display_name: p.display_name } });
    } catch (e) {
      console.warn('User metadata update failed:', e);
    }
  }
}

export async function ensureApiConfigured(supabase: SupabaseClient): Promise<boolean> {
  const s = await fetchSettings(supabase);
  const ok = Boolean(s?.yt_data_api_enc) && Boolean(s?.supabase_url_enc) && Boolean(s?.supabase_anon_enc);
  return ok;
}

export async function ensureApiConfiguredDetailed(supabase: SupabaseClient) {
  const s = await fetchSettings(supabase);
  const missing = {
    supabaseUrl: !Boolean(s?.supabase_url_enc),
    supabaseAnon: !Boolean(s?.supabase_anon_enc),
    ytDataApi: !Boolean(s?.yt_data_api_enc),
    ytAnalyticsApi: !Boolean(s?.yt_analytics_api_enc), // 참고(선택)
  };
  const ok = !missing.supabaseUrl && !missing.supabaseAnon && !missing.ytDataApi;
  return { ok, missing };
}
