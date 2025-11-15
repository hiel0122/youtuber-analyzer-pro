// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/integrations/supabase/types'

// 로컬 스토리지에서 사용자 설정 읽기 (우선 순위)
const readLocal = () => {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(localStorage.getItem("yap:settings") || "null"); } catch { return null; }
};
const ls = readLocal();

// 우선순위: 로컬 스토리지 → 환경 변수 → 하드코드 폴백
const url = ls?.supabase_url_plain || 'https://ynhohgyttvriqlzwyqnw.supabase.co';
const anon = ls?.supabase_anon_plain || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InluaG9oZ3l0dHZyaXFsend5cW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNTc2MDIsImV4cCI6MjA3NjYzMzYwMn0.9ya4pwVS-lvwccZi-kAUDyGsIUaYPg4xHtBoLw4M7uw';

// 개발(HMR)에서 중복 생성을 막기 위한 싱글톤 캐시
const globalForSupabase = globalThis as unknown as {
  __yap_supabase?: ReturnType<typeof createClient<Database>>
}

export const supabase =
  globalForSupabase.__yap_supabase ??
  createClient<Database>(url, anon, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      // (선택) 로컬스토리지 키 고정
      storageKey: 'yap-auth',
    },
  })

if (!globalForSupabase.__yap_supabase) {
  globalForSupabase.__yap_supabase = supabase
}

// Export helper functions for compatibility
export function getSupabaseClient() {
  return supabase
}

export function hasSupabaseCredentials(): boolean {
  return !!(url && anon && url.includes('supabase') && anon.length > 20)
}
