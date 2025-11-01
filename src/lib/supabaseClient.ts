// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

const url = 'https://ynhohgyttvriqlzwyqnw.supabase.co'
const anon = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InluaG9oZ3l0dHZyaXFsend5cW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNTc2MDIsImV4cCI6MjA3NjYzMzYwMn0.9ya4pwVS-lvwccZi-kAUDyGsIUaYPg4xHtBoLw4M7uw'

// 개발(HMR)에서 중복 생성을 막기 위한 싱글톤 캐시
const globalForSupabase = globalThis as unknown as {
  __yap_supabase?: ReturnType<typeof createClient>
}

export const supabase =
  globalForSupabase.__yap_supabase ??
  createClient(url, anon, {
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
