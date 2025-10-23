import { serve } from "https://deno.land/std/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

type YtChannelsResp = {
  items?: Array<{
    id?: string;
    statistics?: { videoCount?: string };
  }>;
};

serve(async (req) => {
  // Preflight
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const channelKey: string | undefined = body?.channelKey || body?.channel;
    if (!channelKey || typeof channelKey !== "string") {
      return json({ ok: false, error: "channelKey is required" }, 400);
    }

    const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");
    if (!YOUTUBE_API_KEY) {
      return json({ ok: false, error: "MISSING_YOUTUBE_API_KEY" }, 500);
    }

    // 1) channelKey가 @핸들이면 forHandle, URL이면 파싱
    const isHandle = channelKey.trim().startsWith("@");
    let query = "";
    if (isHandle) {
      // forHandle로 바로 조회
      query = `https://www.googleapis.com/youtube/v3/channels?part=id,statistics&forHandle=${encodeURIComponent(channelKey)}&key=${YOUTUBE_API_KEY}`;
    } else {
      // URL에서 채널ID 추정 (https://www.youtube.com/channel/UCxxxx 형태면 바로 id)
      const m = channelKey.match(/youtube\.com\/channel\/([^/?]+)/i);
      if (m?.[1]) {
        query = `https://www.googleapis.com/youtube/v3/channels?part=id,statistics&id=${encodeURIComponent(m[1])}&key=${YOUTUBE_API_KEY}`;
      } else {
        // fallback: forHandle처럼 취급(핸들이면 앞에 @붙여)
        const handle = channelKey.includes("@") ? channelKey : `@${channelKey.split("/").pop()}`;
        query = `https://www.googleapis.com/youtube/v3/channels?part=id,statistics&forHandle=${encodeURIComponent(handle!)}&key=${YOUTUBE_API_KEY}`;
      }
    }

    const resp = await fetch(query);
    if (!resp.ok) {
      return json({ ok: false, error: `YouTube API error ${resp.status}` }, 502);
    }
    const data = (await resp.json()) as YtChannelsResp;
    const item = data.items?.[0];
    const channelId = item?.id;
    const totalVideos = item?.statistics?.videoCount ? parseInt(item.statistics.videoCount, 10) : undefined;

    if (!channelId) {
      return json({ ok: false, error: "CHANNEL_NOT_FOUND" }, 404);
    }
    return json({ ok: true, channelId, totalVideos: totalVideos ?? null }, 200);
  } catch (e) {
    return json({ ok: false, error: String(e) }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
