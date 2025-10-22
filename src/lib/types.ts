export type VideoRow = {
  id: string;
  channel_id: string;
  topic: string | null;
  title: string;
  presenter: string | null;
  views: number | null;
  likes: number | null;
  upload_date: string; // ISO (YYYY-MM-DD) or date-ish string
  duration: string | null; // "HH:MM:SS" | "MM:SS" | "SS"
  url: string;
};
