import { createClient, SupabaseClient } from "@supabase/supabase-js";

// 현재 앱이 사용하는 Supabase URL/Anon 추적(로컬/ENV/하드코드 우선순위 노출)
export function resolveSupabaseContext() {
  let ls: any = null;
  try { ls = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("yap:settings") || "null") : null; } catch {}
  const url  = ls?.supabase_url_plain  || import.meta.env.VITE_SUPABASE_URL  || (globalThis as any).NEXT_PUBLIC_SUPABASE_URL || "";
  const anon = ls?.supabase_anon_plain || import.meta.env.VITE_SUPABASE_ANON_KEY || (globalThis as any).NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return {
    url, anon,
    fromLocal: Boolean(ls?.supabase_url_plain && ls?.supabase_anon_plain),
    fromEnv: Boolean(import.meta?.env?.VITE_SUPABASE_URL || (globalThis as any).NEXT_PUBLIC_SUPABASE_URL),
  };
}

export function makeAdhocClient(): SupabaseClient | null {
  const { url, anon } = resolveSupabaseContext();
  if (!url || !anon) return null;
  return createClient(url, anon);
}

export type DoctorReport = {
  supabase: { url: string; anonTail: string; source: "local"|"env"|"unknown" };
  auth: { userId: string | null; ok: boolean; error?: string };
  table: { exists: boolean; error?: string };
  columns: { missing: string[]; present: string[]; error?: string };
  rls: { canSelectOwn: boolean; canUpsertOwn: boolean; error?: string };
};

const REQUIRED_COLUMNS = [
  "language","theme","competitor_channels","default_range",
  "supabase_url_enc","supabase_anon_enc","yt_data_api_enc","yt_analytics_api_enc",
  "display_name","avatar_url","credits_used","credits_total","updated_at","user_id"
];

export async function runDoctor(): Promise<DoctorReport> {
  const adhoc = makeAdhocClient();
  const ctx = resolveSupabaseContext();
  const source: "local"|"env"|"unknown" = ctx.fromLocal ? "local" : (ctx.fromEnv ? "env" : "unknown");
  const supabaseInfo = { url: ctx.url, anonTail: ctx.anon ? ctx.anon.slice(-8) : "", source };

  if (!adhoc) {
    return {
      supabase: supabaseInfo,
      auth: { userId: null, ok: false, error: "Supabase URL/Anon 미설정" },
      table: { exists: false, error: "클라이언트 생성 실패" },
      columns: { missing: REQUIRED_COLUMNS, present: [], error: "클라이언트 생성 실패" },
      rls: { canSelectOwn: false, canUpsertOwn: false, error: "클라이언트 생성 실패" },
    };
  }

  // Auth
  const { data: authData, error: authErr } = await adhoc.auth.getUser();
  const userId = authData?.user?.id ?? null;

  // Table 존재 여부
  let tableExists = false; let tableErr: string | undefined;
  try {
    const q = await adhoc.from("user_settings").select("user_id").limit(1);
    if (!q.error) tableExists = true; else tableErr = q.error.message;
  } catch (e: any) { tableErr = e?.message || String(e); }

  // 컬럼 목록 (information_schema 접근이 막히면 fallback)
  let present: string[] = []; let missing = REQUIRED_COLUMNS.slice(); let colErr: string | undefined;
  try {
    const { data, error } = await adhoc
      .from("user_settings")
      .select("*")
      .limit(0); // 메타만
    if (error) colErr = error.message;
    else {
      // Supabase-js가 스키마를 직접 안 줘서, fallback: known columns를 기반으로 probe
      // 0-limit select는 메타만 검증되므로, REQUIRED_COLUMNS 기준 missing 계산 유지
      // (정확한 컬럼 리스트가 필요하면 서버 RPC로 information_schema 조회 추가)
    }
  } catch (e: any) { colErr = e?.message || String(e); }
  // 간단 probe: 필수 중 실제 select 에러 메시지에 언급된 컬럼을 제외할 수 없으므로, tableExists 기준만 유지
  if (tableExists) {
    // 테이블만 있으면 최소 user_id, updated_at 등은 있다고 가정하지 말고, 아래에서 RLS/UPSERT 시 에러로 감지
    present = []; // 알 수 없으면 비워둠
  }

  // RLS/권한 – 본인 행 select/upsert 시도
  let canSelectOwn = false, canUpsertOwn = false, rlsErr: string | undefined;
  try {
    if (userId) {
      const sel = await adhoc.from("user_settings").select("user_id").eq("user_id", userId).maybeSingle();
      canSelectOwn = !sel.error || sel.error?.code === "PGRST116"; // not found는 권한 OK
      const up = await adhoc.from("user_settings").upsert({ user_id: userId, updated_at: new Date().toISOString() }).select("user_id").single();
      canUpsertOwn = !up.error;
      if (up.error) rlsErr = up.error.message;
    }
  } catch (e: any) { rlsErr = e?.message || String(e); }

  // 최종 missing 계산은 런타임 오류로 노출되는 컬럼명을 신뢰하기 어려우므로, Doctor UI에서 SQL을 안내
  return {
    supabase: supabaseInfo,
    auth: { userId, ok: !!userId, error: authErr?.message },
    table: { exists: tableExists, error: tableErr },
    columns: { missing, present, error: colErr },
    rls: { canSelectOwn, canUpsertOwn, error: rlsErr },
  };
}

// 마이그레이션 SQL – UI에서 복사 제공
export const MIGRATION_SQL = `
create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.user_settings add column if not exists language text;
alter table public.user_settings add column if not exists theme text;
alter table public.user_settings add column if not exists competitor_channels text[];
alter table public.user_settings add column if not exists default_range text;
alter table public.user_settings add column if not exists supabase_url_enc text;
alter table public.user_settings add column if not exists supabase_anon_enc text;
alter table public.user_settings add column if not exists yt_data_api_enc text;
alter table public.user_settings add column if not exists yt_analytics_api_enc text;
alter table public.user_settings add column if not exists display_name text;
alter table public.user_settings add column if not exists avatar_url text;
alter table public.user_settings add column if not exists credits_used int default 0;
alter table public.user_settings add column if not exists credits_total int default 1000;
create or replace function public.set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end; $$ language plpgsql;
drop trigger if exists trg_user_settings_updated_at on public.user_settings;
create trigger trg_user_settings_updated_at before update on public.user_settings
for each row execute function public.set_updated_at();
alter table public.user_settings enable row level security;
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='user_settings' and policyname='user_settings_select_own') then
    create policy user_settings_select_own  on public.user_settings for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='user_settings' and policyname='user_settings_insert_own') then
    create policy user_settings_insert_own  on public.user_settings for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='user_settings' and policyname='user_settings_update_own') then
    create policy user_settings_update_own  on public.user_settings for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;
`;
