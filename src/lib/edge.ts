import { supabase } from "./supabase";
import { SyncResponse } from "./types";

export async function resolveChannelId(channelKey: string) {
  const { data, error } = await supabase.functions.invoke("resolve-channel-id", {
    body: { channelKey },
  });
  if (error) throw new Error(error.message || "resolve-channel-id failed");
  if (!data?.ok || !data?.channelId) throw new Error(data?.error || "Cannot resolve channelId");
  return { channelId: data.channelId as string, totalVideos: (data.totalVideos ?? 0) as number };
}

export async function syncNewVideos(channelKey: string, fullSync = true) {
  const { data, error } = await supabase.functions.invoke("sync-new-videos", {
    body: { channelKey, fullSync },
  });
  if (error) throw new Error(error.message || "sync-new-videos failed");
  if (!data?.ok) throw new Error(data?.error || "sync-new-videos returned not ok");
  return data as SyncResponse;
}
