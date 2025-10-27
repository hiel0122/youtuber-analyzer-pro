// src/hooks/useChannelBundle.ts
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type VideoLite = {
  id: string;
  title: string | null;
  views: number | null;
  likes: number | null;
  duration: string | null;
  upload_date: string | null;
};

export type UploadFrequency = {
  averages: {
    perWeek: number;
    perMonth: number;
    perQuarter: number;
    perYear: number;
  };
};

function calcUploadFrequency(dates: Date[]): UploadFrequency {
  if (!dates.length) {
    return { averages: { perWeek: 0, perMonth: 0, perQuarter: 0, perYear: 0 } };
  }
  // 범위를 첫 업로드~오늘로 잡고 간단히 평균 업로드 수 계산
  const sorted = [...dates].sort((a, b) => +a - +b);
  const start = sorted[0];
  const end = new Date();
  const days = Math.max(1, Math.round((+end - +start) / 86_400_000));
  const perDay = dates.length / days;
  return {
    averages: {
      perWeek: perDay * 7,
      perMonth: perDay * 30,
      perQuarter: perDay * 90,
      perYear: perDay * 365,
    },
  };
}

export function useChannelBundle(channelId?: string) {
  const [loading, setLoading] = useState(false);
  const [channelName, setChannelName] = useState<string | undefined>(undefined);
  const [videos, setVideos] = useState<VideoLite[]>([]);
  const [uploadFrequency, setUploadFrequency] = useState<UploadFrequency>({
    averages: { perWeek: 0, perMonth: 0, perQuarter: 0, perYear: 0 },
  });

  useEffect(() => {
    if (!channelId) return;
    let abort = false;

    (async () => {
      setLoading(true);

      // 1) 채널명
      const { data: ch } = await (supabase as any)
        .from("youtube_channels")
        .select("channel_id, channel_name")
        .eq("channel_id", channelId)
        .maybeSingle();

      if (!abort) {
        setChannelName((ch?.channel_name || "") as string);
      }

      // 2) 동영상 목록(요약에 필요한 필드만)
      const { data: vids } = await (supabase as any)
        .from("youtube_videos")
        .select("id, title, views, likes, duration, upload_date")
        .eq("channel_id", channelId)
        .order("upload_date", { ascending: false })
        .limit(5000);

      const v = (vids || []) as VideoLite[];
      if (!abort) {
        setVideos(v);

        const dates = v
          .map((x) => (x.upload_date ? new Date(x.upload_date) : null))
          .filter((d): d is Date => !!d && !isNaN(+d));
        setUploadFrequency(calcUploadFrequency(dates));
        setLoading(false);
      }
    })();

    return () => {
      abort = true;
    };
  }, [channelId]);

  return { loading, channelName, videos, uploadFrequency };
}
