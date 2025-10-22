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
