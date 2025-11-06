import type { SupabaseClient } from "@supabase/supabase-js";

export async function fetchUsageLast30(supabase: SupabaseClient) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  
  const thirtyDaysAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);
  const { data } = await supabase
    .from("usage_stats")
    .select("*")
    .eq("user_id", user.id)
    .gte("day", thirtyDaysAgo.toISOString().slice(0, 10))
    .order("day", { ascending: true });

  const { data: settings } = await supabase
    .from("user_settings")
    .select("credits_used, credits_total")
    .eq("user_id", user.id)
    .maybeSingle();

  const u = (data ?? []).map(x => ({
    day: x.day,
    analyzed_channels: x.analyzed_channels,
    data_api_calls: x.data_api_calls,
    analytics_api_calls: x.analytics_api_calls,
    data_save: x.data_save,
  }));

  // 크레딧 바 계산
  const creditsUsed = settings?.credits_used ?? 0;
  const creditsTotal = settings?.credits_total ?? 1000;
  const creditsUsedPct = creditsTotal > 0
    ? Math.round((creditsUsed / creditsTotal) * 100)
    : 0;

  return {
    data: u,
    creditsUsed,
    creditsTotal,
    creditsUsedPct,
  };
}
