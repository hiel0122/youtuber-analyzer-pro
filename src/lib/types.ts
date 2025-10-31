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
    perQuarter: number;
    perYear: number;
    perYearAvg: number;
    perMonthGeneral: number;  // 롱폼
    perMonthShorts: number;   // 숏폼
  };
};

export type SubscriptionRates = {
  day: number;   // 최근 24h Δ subscribers
  week: number;  // 7d Δ
  month: number; // 30d Δ
  year: number;  // 365d Δ
};

export type CommentStats = {
  total: number;       // 전체 댓글 수(모든 영상 합)
  maxPerVideo: number;
  minPerVideo: number;
  avgPerVideo: number; // per video 평균
};

export type SyncResponse = {
  ok: boolean;
  channelId: string;
  title?: string;
  inserted_or_updated?: number;
  newest_uploaded_at?: string;
  mode?: "incremental" | "full";
  channelStats?: {
    subscriberCount: number;
    videoCount: number;
    viewCount: number;
  };
  uploadFrequency?: UploadFrequency;
  subscriptionRates?: SubscriptionRates;
  commentStats?: CommentStats;
};

// 1) Supabase에서 생성된 전체 타입 정의 가져오기
//    경로 별칭(@/...)이 안 먹으면 아래 주석 라인을 참고하세요.
import type { Database } from "../integrations/supabase/types";
// import type { Database } from "../../integrations/supabase/types"; // 상대경로 예시

// 2) 자주 쓰는 테이블 타입을 별칭(alias)으로 정의 (필요한 것만 골라서)
export type UserRow = Database["public"]["Tables"]["users"]["Row"];
export type UserInsert = Database["public"]["Tables"]["users"]["Insert"];
export type UserUpdate = Database["public"]["Tables"]["users"]["Update"];

// 3) 앱 전용 타입(DB에 없는 추가 정보 등)
export type Role = "admin" | "editor" | "viewer";

// 4) 조합 타입 예시: DB 사용자(Row)에 앱 전용 역할 필드 붙이기
export type CurrentUser = UserRow & { role: Role };
