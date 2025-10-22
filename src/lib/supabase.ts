import { createClient } from "@supabase/supabase-js";

const envUrl  = import.meta.env.VITE_SUPABASE_URL;
const envAnon = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 안전 가드 + 임시 폴백(배포 환경변수 누락 시에도 동작하도록)
// * 배포 환경변수 세팅 후에는 폴백이 아니라 env 값이 우선 사용됩니다.
const FALLBACK_URL  = "https://ynhohgyttvriqlzwyqnw.supabase.co";
const FALLBACK_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InluaG9oZ3l0dHZyaXFsend5cW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNTc2MDIsImV4cCI6MjA3NjYzMzYwMn0.9ya4pwVS-lvwccZi-kAUDyGsIUaYPg4xHtBoLw4M7uw";

const url  = envUrl  || FALLBACK_URL;
const anon = envAnon || FALLBACK_ANON;

if (!url || !anon) {
  throw new Error("Supabase env missing: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY and rebuild.");
}

export const supabase = createClient(url, anon);
