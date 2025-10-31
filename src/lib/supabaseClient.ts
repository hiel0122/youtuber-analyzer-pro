// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string

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
