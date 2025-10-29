// supabase/functions/account-delete/index.ts
// - 로그인 사용자의 요청만 처리
// - 기본: 소프트 삭제(profiles.deleted_at 세팅)
// - 하드 삭제: ?mode=hard 쿼리스트링으로 선택 가능 (연쇄 삭제는 스키마/트리거에 맡기고 마지막에 Auth 유저 삭제)
// - CORS 포함

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PROJECT_URL = Deno.env.get("PROJECT_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY");

function cors() {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "POST,OPTIONS",
    "access-control-allow-headers": "authorization, content-type",
  };
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...cors() },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors() });

  try {
    // 0) 환경변수 체크
    if (!PROJECT_URL || !SERVICE_ROLE_KEY) {
      return json({ error: "Missing server secrets (PROJECT_URL / SERVICE_ROLE_KEY)" }, 500);
    }

    // 1) 호출자 인증 확인 (세션 토큰)
    const authHeader = req.headers.get("authorization") ?? req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) return json({ error: "Missing Authorization: Bearer <token>" }, 401);

    const admin = createClient(PROJECT_URL, SERVICE_ROLE_KEY);

    // 2) 토큰 → 사용자
    const { data: userRes, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userRes?.user) return json({ error: "Invalid or expired user token" }, 401);

    const userId = userRes.user.id;
    const url = new URL(req.url);
    const mode = (url.searchParams.get("mode") || "soft").toLowerCase();

    // 3) 분기: soft / hard
    if (mode === "soft") {
      // 프로필 소프트 삭제 (존재 안 해도 에러 없이 지나가도록 upsert 느낌으로 처리)
      const { error: upErr } = await admin
        .from("profiles")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", userId);

      if (upErr) return json({ error: upErr.message }, 400);
      return json({ ok: true, mode: "soft", user_id: userId });
    }

    if (mode === "hard") {
      // (옵션) 다른 사용자 연관 테이블 정리 필요하면 여기에 추가
      // 예) await admin.from("user_search_logs").delete().eq("user_id", userId);

      // 마지막: Auth 사용자 삭제
      const { error: delErr } = await admin.auth.admin.deleteUser(userId);
      if (delErr) return json({ error: delErr.message }, 400);

      return json({ ok: true, mode: "hard", user_id: userId });
    }

    return json({ error: `Unknown mode: ${mode}. Use "soft" or "hard".` }, 400);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
