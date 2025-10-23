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

export type UploadFrequency = {
  windowWeeks: number;
  windowMonths: number;
  uploads: {
    last12Weeks: number;
    last12Months: number;
    last12MonthsLong: number;
    last12MonthsShort: number;
  };
  averages: {
    perWeek: number;
    perMonth: number;
    perMonthGeneral: number;  // 롱폼
    perMonthShorts: number;   // 숏폼
  };
};

export type SyncResponse = {
  ok: boolean;
  channelId: string;
  title?: string;
  inserted_or_updated?: number;
  newest_uploaded_at?: string;
  channelStats?: {
    subscriberCount: number;
    videoCount: number;
    viewCount: number;
  };
  uploadFrequency?: UploadFrequency;
};
