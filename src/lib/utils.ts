import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// "HH:MM:SS" / "MM:SS" / "SS" -> seconds
export function parseDurationToSeconds(d?: string | null): number {
  if (!d) return 0;
  const parts = d.split(":").map((v) => Number(v));
  if (parts.some(Number.isNaN)) return 0;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 1) return parts[0];
  return 0;
}

export function formatNumber(n?: number | null): string {
  if (n == null) return "0";
  return n.toLocaleString();
}

// YouTube Shorts classification based on official policy
// https://support.google.com/youtube/answer/14470432
export function isYoutubeShort(
  video: { duration?: string | null; upload_date?: string; url?: string },
  channel?: { isOfficialArtistChannel?: boolean }
): boolean {
  const secs = parseDurationToSeconds(video.duration);
  const publishedAt = video.upload_date ? new Date(video.upload_date) : new Date(0);
  const cutoff = new Date('2024-10-15T00:00:00Z');

  // 1) URL hint: /shorts/ path indicates Shorts content
  const url = (video.url || '').toLowerCase();
  const urlLooksShort = /youtube\.com\/shorts\/|youtu\.be\/shorts\//.test(url);

  // 2) OAC exception: Official Artist Channels treat >60s vertical/square as long-form
  const isOAC = !!channel?.isOfficialArtistChannel;
  if (isOAC && secs > 60 && urlLooksShort) {
    return false; // OAC: >1min is long-form even if vertical/square
  }

  // 3) Date-based length cap
  const lengthCap = publishedAt >= cutoff ? 180 : 60;

  // 4) Classification logic
  // Since we don't have width/height data, rely primarily on URL hint
  if (urlLooksShort) {
    return secs <= lengthCap;
  }

  // Fallback: treat ≤60s as potential shorts (conservative approach)
  return secs <= 60;
}
