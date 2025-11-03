# YouTuber Analyzer Pro - 기능 명세서

## 📋 목차

1. [프로젝트 개요](#-프로젝트-개요)
2. [기술 스택](#-기술-스택)
3. [주요 기능 목록](#-주요-기능-목록)
4. [상세 기능 설명](#-상세-기능-설명)
5. [데이터베이스 스키마](#-데이터베이스-스키마)
6. [API 엔드포인트](#-api-엔드포인트)
7. [사용자 설정](#-사용자-설정)
8. [시각화 기능](#-시각화-기능)

---

## 📖 프로젝트 개요

**YouTuber Analyzer Pro**는 YouTube 채널의 영상 데이터를 종합적으로 분석하고 시각화하는 웹 애플리케이션입니다. YouTube Data API v3를 활용하여 채널 및 영상 통계를 수집하고, 사용자 친화적인 대시보드를 통해 다양한 인사이트를 제공합니다.

### 주요 목적
- YouTube 채널의 성과 분석 및 추적
- 영상 업로드 패턴 및 빈도 분석
- 조회수, 좋아요, 댓글 등 참여도 지표 분석
- 구독자 증감 추이 모니터링
- 영상 주제 및 카테고리 분포 시각화

---

## 🛠 기술 스택

### Frontend
| 구분 | 기술 | 버전 |
|------|------|------|
| 프레임워크 | React | 18.3.1 |
| 언어 | TypeScript | 5.8.3 |
| 빌드 도구 | Vite | 5.4.19 |
| UI 라이브러리 | shadcn-ui (Radix UI) | - |
| 스타일링 | Tailwind CSS | 3.4.17 |
| 차트 라이브러리 | Recharts | 2.15.4 |
| 상태 관리 | React Query (TanStack Query) | 5.83.0 |
| 라우팅 | React Router DOM | 6.30.1 |
| 폼 관리 | React Hook Form + Zod | 7.61.1 + 3.25.76 |
| 알림 | Sonner | 1.7.4 |
| 아이콘 | Lucide React | 0.462.0 |
| 테마 | next-themes | 0.3.0 |

### Backend
| 구분 | 기술 | 설명 |
|------|------|------|
| BaaS | Supabase | PostgreSQL 데이터베이스 + Auth |
| Edge Functions | Deno Runtime | 서버리스 함수 실행 |
| 외부 API | YouTube Data API v3 | 영상 및 채널 데이터 수집 |
| 인증 | Supabase Auth | JWT 기반 인증 시스템 |

---

## 🎯 주요 기능 목록

### 1. 채널 분석 기능
- ✅ 다양한 형식의 채널 URL 지원 (@handle, /channel/, /c/, /user/)
- ✅ 채널 ID 자동 해석 및 검증
- ✅ 전체 동기화 / 증분 동기화 모드 지원
- ✅ 실시간 동기화 진행률 표시
- ✅ 최대 100,000개 영상 분석 지원

### 2. 데이터 수집 및 관리
- ✅ YouTube Data API v3를 통한 데이터 수집
- ✅ 채널 통계 (구독자, 총 조회수, 영상 수)
- ✅ 영상 상세 정보 (제목, 조회수, 좋아요, 댓글, 길이)
- ✅ 일별 스냅샷 추적 (채널 및 영상)
- ✅ 데이터 중복 방지 (Upsert 로직)

### 3. 대시보드 및 지표
- ✅ **Quantity (양적 지표)**
  - 총 구독자 수
  - 총 영상 수
  - 총 조회수
  - 최근 업로드 날짜
- ✅ **Quality (질적 지표)**
  - 영상 유형 분류 (일반/쇼츠)
  - 영상 길이 통계 (최대/최소/평균)
  - 조회수 통계 (최대/최소/평균)
  - 좋아요 평균
  - 댓글 통계 (총 댓글, 영상당 평균/최대/최소)
- ✅ **Upload Frequency (업로드 빈도)**
  - 12주/12개월 업로드 수
  - 장편/단편 콘텐츠 분리 통계
  - 주간/월간/분기/연간 평균 빈도
- ✅ **Subscription Rates (구독자 변화율)**
  - 1일/7일/30일/1년 구독자 증감

### 4. 데이터 시각화
- ✅ 조회수 추이 그래프 (7/14/30일 선택 가능)
- ✅ 주제별 분포 파이 차트
- ✅ 영상 목록 테이블 (페이지네이션, 정렬)
- ✅ 스켈레톤 로딩 UI

### 5. YouTube Shorts 분류
- ✅ 영상 길이 기반 분류 (60초 이하)
- ✅ URL 패턴 감지 (`youtube.com/shorts/`)
- ✅ 날짜 기반 임계값 조정 (2024-10-15 이후)
- ✅ 장편/단편 콘텐츠 별도 통계

### 6. 사용자 인증 및 설정
- ✅ Supabase 이메일/비밀번호 인증
- ✅ OAuth 콜백 처리
- ✅ 비밀번호 재설정
- ✅ 사용자별 설정 저장 (언어, 테마, 시간대 등)
- ✅ 계정 삭제 기능

### 7. 테마 및 다국어
- ✅ 다크/라이트 모드 지원
- ✅ 시스템 테마 자동 감지
- ✅ 한국어/영어 지원
- ✅ 테마 설정 영구 저장

### 8. 성능 최적화
- ✅ React Query 캐싱
- ✅ 페이지네이션 (영상 테이블 10개/페이지)
- ✅ API 배치 요청 (50개씩)
- ✅ 스켈레톤 로딩 상태
- ✅ 전역 동기화 상태 관리

---

## 📝 상세 기능 설명

### 1. 채널 분석 프로세스

#### 1.1 채널 URL 입력 (ChannelInput.tsx)
사용자가 다음 형식 중 하나로 채널 URL 입력:
- `@channelhandle` (핸들)
- `https://www.youtube.com/channel/UC...` (채널 ID)
- `https://www.youtube.com/c/customname` (커스텀 URL)
- `https://www.youtube.com/user/username` (레거시 사용자명)
- 비디오 URL에서 채널 추출

#### 1.2 Quick Check (빠른 검증)
```typescript
// src/lib/edge.ts - syncQuickCheck()
```
- 채널 존재 여부 확인
- 채널 ID 해석
- 총 영상 수 확인
- DB에 기존 데이터 있는지 체크

#### 1.3 동기화 모드 결정
```typescript
// src/pages/Index.tsx - handleAnalyze()
```
- **최초 분석**: 전체 동기화 (fullSync = true)
- **재분석**: 사용자 선택
  - 증분 동기화: 새 영상만 추가
  - 전체 동기화: 모든 영상 재분석

#### 1.4 데이터 동기화 (Edge Function)
```typescript
// supabase/functions/sync-new-videos/index.ts
```

**동기화 프로세스:**
1. 채널 ID 해석 (`resolveChannelId`)
2. 업로드 재생목록 ID 가져오기
3. 영상 목록 페이지네이션 (50개씩)
4. 영상 통계 배치 수집 (50개씩)
5. 데이터베이스 Upsert (`upsert_videos` RPC)
6. 업로드 빈도 계산
7. 구독자 변화율 계산
8. 댓글 통계 계산
9. 스냅샷 저장

**반환 데이터:**
```typescript
{
  ok: boolean;
  mode: "full" | "incremental";
  channelId: string;
  title: string;
  fetched: number;
  upserted: number;
  channelStats: {
    subscriberCount: number;
    videoCount: number;
    viewCount: number;
  };
  uploadFrequency: UploadFrequency;
  subscriptionRates: SubscriptionRates;
  commentStats: CommentStats;
}
```

#### 1.5 실시간 진행률 표시
```typescript
// src/hooks/useSync.ts
```
- 2초마다 DB 영상 수 폴링
- 진행률 퍼센트 계산
- GlobalBusyOverlay에 표시
- 스크롤 잠금 (useBodyLock)

### 2. 대시보드 구성

#### 2.1 Summary 섹션 (ChannelSummary.tsx)
- 채널명
- 총 영상 수
- 업로드 빈도 요약
  - 주간 평균
  - 월간 평균
  - 최근 12주/12개월 업로드 수

#### 2.2 Quantity 섹션 (4개 카드)
```typescript
// src/pages/Index.tsx - Quantity Section
```
| 지표 | 아이콘 | 설명 |
|------|--------|------|
| 총 구독자 수 | Users | 채널 구독자 수 (숨김 여부 표시) |
| 총 영상 수 | Video | 분석된 영상 개수 |
| 총 조회수 | Eye | 전체 영상 조회수 합계 |
| 최근 업로드 | Calendar | 마지막 영상 업로드 날짜 |

#### 2.3 Quality 섹션 (5개 행)
```typescript
// src/components/QuantityQuality.tsx
```

**Row 1 - Video Type:**
- 일반 영상 수 (60초 초과)
- 쇼츠 영상 수 (60초 이하)

**Row 2 - Duration:**
- 최대 길이
- 최소 길이
- 평균 길이

**Row 3 - Hits & Likes:**
- 최대 조회수
- 최소 조회수
- 평균 조회수
- 평균 좋아요

**Row 4 - Upload Frequency:**
- 최근 12주 업로드 수
- 최근 12개월 업로드 수 (장편)
- 최근 12개월 업로드 수 (쇼츠)
- 주간 평균
- 월간 평균 (장편)
- 월간 평균 (쇼츠)

**Row 5 - Subscription Rates:**
- 1일 구독자 증감
- 7일 구독자 증감
- 30일 구독자 증감
- 1년 구독자 증감

**Row 6 - Comment Stats:**
- 총 댓글 수
- 영상당 평균 댓글
- 최대 댓글 수
- 최소 댓글 수

#### 2.4 Views Trend (조회수 추이)
```typescript
// src/components/ViewsTrend.tsx
```
- Recharts ComposedChart 사용
- 7일/14일/30일 기간 선택
- 일별 조회수 막대 그래프
- 누적 조회수 라인 그래프
- 반응형 디자인

#### 2.5 Topic Chart (주제 분포)
```typescript
// src/components/TopicChart.tsx
```
- Recharts PieChart 사용
- 영상 주제별 개수 표시
- 색상 구분
- 툴팁 포함

#### 2.6 Video Table (영상 목록)
```typescript
// src/components/VideoTable.tsx
```
| 컬럼 | 설명 |
|------|------|
| 주제 | 영상 카테고리 |
| 제목 | 클릭 시 YouTube 링크 |
| 발표자 | 발표자명 (있는 경우) |
| 조회수 | 포맷팅된 조회수 |
| 좋아요 | 좋아요 수 |
| 업로드일 | YYYY-MM-DD |
| 길이 | H:MM:SS 또는 M:SS |

- 페이지네이션 (10개/페이지)
- 정렬 기능
- 반응형 레이아웃

### 3. YouTube Shorts 분류 로직

```typescript
// src/utils/isShorts.ts
```

**분류 기준:**
1. **URL 패턴 우선 판단**
   - `youtube.com/shorts/` 포함 → 쇼츠

2. **날짜 기반 임계값**
   - 2024-10-15 이전: 60초 이하 = 쇼츠
   - 2024-10-15 이후: 180초 이하 = 쇼츠

3. **Fallback**
   - 길이 정보 없으면 일반 영상으로 분류

### 4. 데이터 동기화 세부 사항

#### 4.1 증분 동기화 (Incremental Sync)
- DB에서 최신 영상의 `publishedAt` 조회
- 해당 날짜 이후 영상만 가져오기
- 기존 데이터 유지하면서 새 영상만 추가
- API 할당량 절약

#### 4.2 전체 동기화 (Full Sync)
- 채널의 모든 영상 데이터 수집
- 기존 데이터 덮어쓰기 (Upsert)
- 최대 100,000개 영상 제한
- 느리지만 정확한 데이터 보장

#### 4.3 배치 처리
```typescript
// Edge Function - fetchVideosStats()
```
- 영상 ID 50개씩 묶어서 API 요청
- 병렬 처리로 성능 향상
- Rate Limiting 방지

#### 4.4 에러 처리
- API 키 검증
- 채널 존재 여부 확인
- 네트워크 오류 재시도
- 사용자 친화적 에러 메시지 (Toast)

---

## 🗄 데이터베이스 스키마

### 주요 테이블

#### 1. `youtube_channels`
채널 기본 정보 및 통계

| 컬럼 | 타입 | 설명 |
|------|------|------|
| channel_id | TEXT (PK) | YouTube 채널 ID |
| channel_name | TEXT | 채널명 |
| subscriber_count | INTEGER | 구독자 수 |
| total_videos | INTEGER | 총 영상 수 |
| total_views | BIGINT | 총 조회수 |
| last_updated | TIMESTAMPTZ | 마지막 업데이트 시각 |

#### 2. `youtube_videos`
영상 상세 정보

| 컬럼 | 타입 | 설명 |
|------|------|------|
| video_id | TEXT (PK) | YouTube 영상 ID |
| channel_id | TEXT (FK) | 채널 ID |
| title | TEXT | 영상 제목 |
| topic | TEXT | 영상 주제/카테고리 |
| presenter | TEXT | 발표자명 |
| views | INTEGER | 조회수 |
| likes | INTEGER | 좋아요 수 |
| dislikes | INTEGER | 싫어요 수 (deprecated) |
| comments | INTEGER | 댓글 수 |
| upload_date | DATE | 업로드 날짜 |
| duration | TEXT | 영상 길이 (H:MM:SS) |
| url | TEXT | YouTube URL |

#### 3. `channel_snapshots`
채널 통계 스냅샷 (시계열)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| channel_id | TEXT (PK) | 채널 ID |
| snapshot_date | DATE (PK) | 스냅샷 날짜 |
| subscriber_count | INTEGER | 구독자 수 |
| view_count | BIGINT | 총 조회수 |
| video_count | INTEGER | 영상 수 |

#### 4. `video_snapshots`
영상 통계 스냅샷 (시계열)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| video_id | TEXT (PK) | 영상 ID |
| snapshot_date | DATE (PK) | 스냅샷 날짜 |
| view_count | INTEGER | 조회수 |
| like_count | INTEGER | 좋아요 수 |
| comment_count | INTEGER | 댓글 수 |

#### 5. `channel_upload_stats`
업로드 빈도 통계

| 컬럼 | 타입 | 설명 |
|------|------|------|
| channel_id | TEXT (PK) | 채널 ID |
| uploads_12w | INTEGER | 최근 12주 업로드 수 |
| uploads_12m | INTEGER | 최근 12개월 업로드 수 |
| uploads_12m_long | INTEGER | 12개월 장편 영상 수 |
| uploads_12m_short | INTEGER | 12개월 쇼츠 수 |
| avg_per_week | NUMERIC | 주간 평균 업로드 |
| avg_per_month | NUMERIC | 월간 평균 업로드 |
| avg_per_month_long | NUMERIC | 월간 평균 장편 |
| avg_per_month_short | NUMERIC | 월간 평균 쇼츠 |

#### 6. `user_settings`
사용자 설정

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID (PK) | 설정 ID |
| user_id | UUID (FK) | 사용자 ID |
| general_language | TEXT | 언어 (ko/en) |
| general_theme | TEXT | 테마 (dark/light/system) |
| general_timezone | TEXT | 시간대 |
| general_date_format | TEXT | 날짜 형식 |
| channel_default_url | TEXT | 기본 채널 URL |
| channel_range_days | INTEGER | 분석 기간 (일) |
| channel_include_shorts | BOOLEAN | 쇼츠 포함 여부 |
| api_supabase_url | TEXT | Supabase URL |
| api_supabase_anon_key | TEXT | Supabase Anon Key |
| api_youtube_key | TEXT | YouTube API Key |
| connect_ga_id | TEXT | Google Analytics ID |
| connect_slack_webhook | TEXT | Slack Webhook URL |
| connect_discord_webhook | TEXT | Discord Webhook URL |
| usage_videos_scanned | INTEGER | 스캔한 영상 수 |
| usage_api_calls_youtube | INTEGER | YouTube API 호출 수 |

#### 7. `profiles`
사용자 프로필

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID (PK) | 사용자 ID |
| email | TEXT | 이메일 |
| display_name | TEXT | 표시 이름 |
| nickname | TEXT | 닉네임 |
| tier | TEXT | 멤버십 등급 |

**멤버십 등급:**
- `free`: 무료
- `plus`: 플러스
- `pro`: 프로
- `Earlybird`: 얼리버드
- `admin`: 관리자

### 데이터베이스 뷰

#### 1. `v_subscription_deltas`
구독자 변화량 계산

```sql
-- 1일, 7일, 30일, 365일 구독자 증감
SELECT
  channel_id,
  delta_1d,
  delta_7d,
  delta_30d,
  delta_365d
FROM v_subscription_deltas
WHERE channel_id = 'UC...';
```

#### 2. `v_channel_comment_stats`
채널별 댓글 통계

```sql
-- 총 댓글, 평균, 최대, 최소
SELECT
  channel_id,
  total_comments,
  avg_comments,
  max_comments,
  min_comments
FROM v_channel_comment_stats
WHERE channel_id = 'UC...';
```

#### 3. `v_channel_daily_delta`
일별 채널 지표 변화

```sql
SELECT
  channel_id,
  snapshot_date,
  subscriber_delta,
  view_delta,
  video_delta
FROM v_channel_daily_delta
WHERE channel_id = 'UC...'
ORDER BY snapshot_date DESC;
```

### RPC 함수

#### 1. `upsert_videos(p_rows jsonb)`
영상 데이터 일괄 삽입/업데이트

```sql
SELECT upsert_videos('[
  {
    "video_id": "abc123",
    "channel_id": "UC...",
    "title": "제목",
    "views": 1000,
    ...
  }
]'::jsonb);
```

#### 2. `snapshot_video(...)`
영상 스냅샷 기록

```sql
SELECT snapshot_video(
  'video_id',
  1000,  -- views
  50,    -- likes
  10     -- comments
);
```

#### 3. `upsert_channel_stats(...)`
채널 통계 업데이트

```sql
SELECT upsert_channel_stats(
  'UC...',
  '채널명',
  1000000,  -- subscribers
  50,       -- videos
  10000000  -- views
);
```

#### 4. `parse_duration_seconds(t text)`
길이 문자열을 초 단위로 변환

```sql
SELECT parse_duration_seconds('1:23:45');  -- 5025
SELECT parse_duration_seconds('12:30');    -- 750
```

---

## 🌐 API 엔드포인트

### Supabase Edge Functions

#### 1. `sync-new-videos`
채널 영상 동기화

**Endpoint:**
```
POST https://{PROJECT_REF}.supabase.co/functions/v1/sync-new-videos
```

**Headers:**
```
Authorization: Bearer {ANON_KEY}
Content-Type: application/json
```

**Request Body:**
```typescript
{
  channelKey: string;      // YouTube URL 또는 핸들
  channelId?: string;      // 직접 채널 ID (선택)
  fullSync?: boolean;      // true = 전체, false = 증분
  quickCheck?: boolean;    // true = 빠른 검증만
}
```

**Response (Full Sync):**
```typescript
{
  ok: true,
  mode: "full",
  channelId: "UC...",
  title: "채널명",
  fetched: 150,
  upserted: 150,
  channelStats: {
    subscriberCount: 1000000,
    videoCount: 150,
    viewCount: 50000000
  },
  uploadFrequency: {
    uploads_12w: 12,
    uploads_12m: 48,
    uploads_12m_long: 40,
    uploads_12m_short: 8,
    avg_per_week: 1.0,
    avg_per_month: 4.0,
    avg_per_month_long: 3.3,
    avg_per_month_short: 0.7
  },
  subscriptionRates: {
    delta_1d: 100,
    delta_7d: 500,
    delta_30d: 2000,
    delta_365d: 50000
  },
  commentStats: {
    total_comments: 5000,
    avg_comments: 33.3,
    max_comments: 500,
    min_comments: 0
  }
}
```

**Response (Quick Check):**
```typescript
{
  ok: true,
  mode: "quickCheck",
  channelId: "UC...",
  title: "채널명",
  totalVideos: 150
}
```

**Error Response:**
```typescript
{
  error: "채널을 찾을 수 없습니다",
  details: "..."
}
```

#### 2. `account-delete`
사용자 계정 삭제

**Endpoint:**
```
POST https://{PROJECT_REF}.supabase.co/functions/v1/account-delete
```

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Response:**
```typescript
{
  ok: true,
  message: "계정이 삭제되었습니다"
}
```

### YouTube Data API v3 사용

Edge Function에서 다음 YouTube API 엔드포인트 사용:

1. **channels** - 채널 정보
   ```
   GET https://www.googleapis.com/youtube/v3/channels
   ```

2. **playlistItems** - 업로드 영상 목록
   ```
   GET https://www.googleapis.com/youtube/v3/playlistItems
   ```

3. **videos** - 영상 통계
   ```
   GET https://www.googleapis.com/youtube/v3/videos
   ```

4. **search** - 채널 검색 (fallback)
   ```
   GET https://www.googleapis.com/youtube/v3/search
   ```

---

## ⚙️ 사용자 설정

### Settings 패널 구조

```typescript
// src/pages/Settings.tsx
```

6개 탭으로 구성:

#### 1. General (일반 설정)
```typescript
// src/components/settings/GeneralForm.tsx
```

| 설정 | 옵션 | 기본값 |
|------|------|--------|
| 언어 | 한국어, English | 한국어 |
| 테마 | Dark, Light, System | Dark |
| 시간대 | 전 세계 시간대 | Asia/Seoul |
| 날짜 형식 | YYYY-MM-DD, MM/DD/YYYY 등 | YYYY-MM-DD |

#### 2. Channel (채널 설정)
```typescript
// src/components/settings/ChannelForm.tsx
```

| 설정 | 타입 | 기본값 |
|------|------|--------|
| 기본 채널 URL | TEXT | - |
| 분석 기간 (일) | INTEGER | 90 |
| 쇼츠 포함 | BOOLEAN | true |

#### 3. API (API 설정)
```typescript
// src/components/settings/ApiForm.tsx
```

| 설정 | 설명 |
|------|------|
| YouTube API Key | YouTube Data API v3 키 |
| Supabase URL | Supabase 프로젝트 URL |
| Supabase Anon Key | Supabase 익명 키 |

**보안:**
- RLS 정책으로 본인 데이터만 접근
- API 키는 암호화하지 않음 (주의 필요)

#### 4. Account (계정 정보)
```typescript
// src/components/settings/AccountPanel.tsx
```

- 이메일 표시
- 사용자명 표시
- 멤버십 등급 표시
- 로그아웃 버튼
- 계정 삭제 버튼 (확인 다이얼로그)

#### 5. Usage (사용량 통계)
```typescript
// src/components/settings/UsagePanel.tsx
```

| 지표 | 설명 |
|------|------|
| 스캔한 영상 수 | 총 분석한 영상 개수 |
| YouTube API 호출 수 | API 사용량 |

#### 6. Connect (연동 설정)
```typescript
// src/components/settings/ConnectForm.tsx
```

| 연동 서비스 | 설정 항목 |
|------------|-----------|
| Google Analytics | GA ID |
| Slack | Webhook URL |
| Discord | Webhook URL |

**기능 (예정):**
- 분석 완료 시 Slack/Discord 알림
- GA로 사용량 추적

---

## 📊 시각화 기능

### 1. Views Trend Chart

**컴포넌트:** `src/components/ViewsTrend.tsx`

**기능:**
- 일별 조회수 막대 그래프 (Bar)
- 누적 조회수 라인 그래프 (Line)
- 기간 선택: 7일 / 14일 / 30일
- 반응형 크기
- 커스텀 툴팁

**데이터 처리:**
```typescript
// 1. 영상을 날짜별로 그룹화
const videosByDate = videos.reduce((acc, v) => {
  const date = v.upload_date;
  if (!acc[date]) acc[date] = [];
  acc[date].push(v);
  return acc;
}, {});

// 2. 날짜별 조회수 합계
const dailyViews = Object.keys(videosByDate).map(date => ({
  date,
  views: videosByDate[date].reduce((sum, v) => sum + v.views, 0)
}));

// 3. 누적 조회수 계산
let cumulative = 0;
const chartData = dailyViews.map(d => {
  cumulative += d.views;
  return { ...d, cumulative };
});
```

**차트 설정:**
```typescript
<ComposedChart data={chartData}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="date" />
  <YAxis />
  <Tooltip />
  <Legend />
  <Bar dataKey="views" fill="#8884d8" name="일별 조회수" />
  <Line type="monotone" dataKey="cumulative" stroke="#82ca9d" name="누적 조회수" />
</ComposedChart>
```

### 2. Topic Distribution Chart

**컴포넌트:** `src/components/TopicChart.tsx`

**기능:**
- 주제별 영상 개수 파이 차트
- 컬러풀한 색상 구분
- 비율 및 개수 표시
- 레이블 자동 배치

**데이터 처리:**
```typescript
// 주제별 영상 개수 집계
const topicCounts = videos.reduce((acc, v) => {
  const topic = v.topic || '기타';
  acc[topic] = (acc[topic] || 0) + 1;
  return acc;
}, {});

// 파이 차트 데이터 변환
const chartData = Object.keys(topicCounts).map(topic => ({
  name: topic,
  value: topicCounts[topic]
}));
```

**색상 팔레트:**
```typescript
const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042',
  '#8884D8', '#82CA9D', '#FFC658', '#FF6B9D'
];
```

### 3. Video Table

**컴포넌트:** `src/components/VideoTable.tsx`

**기능:**
- 정렬 가능한 컬럼
- 페이지네이션 (10개/페이지)
- 제목 클릭 → YouTube 링크
- 반응형 레이아웃
- 스켈레톤 로딩

**컬럼 정의:**
```typescript
const columns = [
  { key: 'topic', label: '주제', sortable: true },
  { key: 'title', label: '제목', sortable: true },
  { key: 'presenter', label: '발표자', sortable: false },
  { key: 'views', label: '조회수', sortable: true },
  { key: 'likes', label: '좋아요', sortable: true },
  { key: 'upload_date', label: '업로드일', sortable: true },
  { key: 'duration', label: '길이', sortable: true }
];
```

**페이지네이션:**
```typescript
const itemsPerPage = 10;
const totalPages = Math.ceil(videos.length / itemsPerPage);
const startIndex = (currentPage - 1) * itemsPerPage;
const endIndex = startIndex + itemsPerPage;
const currentVideos = videos.slice(startIndex, endIndex);
```

### 4. Metrics Cards

**컴포넌트:** `src/components/MetricsCard.tsx`

**구조:**
```typescript
interface MetricsCardProps {
  title: string;
  value: string | ReactNode;
  icon: LucideIcon;
  description?: string;
  infoTooltip?: string;
}
```

**스타일:**
- 그라데이션 배경
- 아이콘 표시
- 툴팁 지원
- 반응형 그리드

**사용 예:**
```typescript
<MetricsCard
  title="총 구독자 수"
  value={formatMetric(1000000)}
  icon={Users}
  description="채널 구독자"
  infoTooltip="YouTube API 특성상 정확하지 않을 수 있습니다"
/>
```

### 5. Loading States

#### 5.1 Skeleton Card
```typescript
// src/components/SkeletonCard.tsx
```
- 로딩 중 플레이스홀더
- 애니메이션 효과
- 콘텐츠 크기와 동일한 레이아웃

#### 5.2 Global Busy Overlay
```typescript
// src/components/GlobalBusyOverlay.tsx
```
- 전체 화면 오버레이
- 진행률 표시
- 현재/전체 개수 표시
- 배경 블러 효과
- 스크롤 잠금

---

## 🔐 인증 및 보안

### 인증 플로우

#### 1. 회원가입
```typescript
// src/components/AuthCard.tsx
```
1. 이메일/비밀번호 입력
2. Supabase Auth 회원가입 API 호출
3. 이메일 인증 메일 발송 (선택)
4. 자동 로그인 또는 로그인 페이지 리다이렉트

#### 2. 로그인
```typescript
// src/hooks/useAuth.ts
```
1. 이메일/비밀번호 입력
2. Supabase Auth 로그인 API 호출
3. JWT 토큰 발급
4. 세션 저장 (localStorage)
5. 사용자 정보 로드

#### 3. 세션 관리
```typescript
// src/lib/supabaseClient.ts
```
- Supabase 클라이언트 싱글톤
- 자동 토큰 갱신
- 세션 만료 시 로그아웃

#### 4. 비밀번호 재설정
```typescript
// src/pages/ResetPassword.tsx
```
1. 이메일 입력
2. 재설정 링크 발송
3. 링크 클릭 시 새 비밀번호 설정
4. 자동 로그인

### Row-Level Security (RLS)

#### user_settings 테이블
```sql
-- 본인 데이터만 조회
CREATE POLICY "Users can view own settings"
ON public.user_settings
FOR SELECT
USING (auth.uid() = user_id);

-- 본인 데이터만 수정
CREATE POLICY "Users can update own settings"
ON public.user_settings
FOR UPDATE
USING (auth.uid() = user_id);
```

#### profiles 테이블
```sql
-- 본인 프로필만 조회
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);
```

### API 키 관리

**주의사항:**
- YouTube API 키는 user_settings에 평문 저장
- Supabase Anon Key는 클라이언트에 노출 가능 (RLS로 보호)
- Service Role Key는 Edge Function 환경변수로만 사용

**권장 사항:**
- API 키 정기적으로 교체
- 할당량 모니터링
- 사용량 제한 설정

---

## 🚀 성능 최적화

### 1. React Query 캐싱

```typescript
// src/hooks/useChannelBundle.ts
```

**캐싱 전략:**
- `staleTime`: 5분
- `cacheTime`: 30분
- 자동 백그라운드 갱신

### 2. 페이지네이션

**영상 테이블:**
- 10개/페이지
- 클라이언트 사이드 페이지네이션
- 가상 스크롤 미적용 (추후 개선 가능)

**API 요청:**
- YouTube API: 50개/요청
- Supabase: 1000개/요청 (기본)

### 3. 배치 처리

```typescript
// Edge Function - fetchVideosStats()
```

**YouTube API 배치:**
```typescript
// 영상 ID를 50개씩 묶어서 요청
const chunks = [];
for (let i = 0; i < videoIds.length; i += 50) {
  chunks.push(videoIds.slice(i, i + 50));
}

// 병렬 처리
for (const chunk of chunks) {
  const url = `${YT_BASE}/videos?id=${chunk.join(',')}`;
  // ...
}
```

### 4. 스켈레톤 UI

```typescript
// src/components/SkeletonCard.tsx
```

- 데이터 로딩 중 즉시 레이아웃 표시
- 사용자 체감 속도 향상
- Layout Shift 방지

### 5. 코드 스플리팅

```typescript
// vite.config.ts
```

- React 컴포넌트 자동 코드 스플리팅
- Dynamic Import 지원
- 라우트 기반 청킹

---

## 🧪 개발 환경 설정

### 환경 변수

#### Frontend (.env)
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...
```

#### Edge Function (Supabase Secrets)
```
YOUTUBE_API_KEY=AIza...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
```

### 로컬 개발

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview
```

### Supabase 로컬 개발

```bash
# Supabase CLI 설치
npm install -g supabase

# 로컬 Supabase 시작
supabase start

# 마이그레이션 적용
supabase db push

# Edge Function 배포
supabase functions deploy sync-new-videos
```

---

## 📈 향후 개선 사항

### 기능 추가
- [ ] 다중 채널 비교 기능
- [ ] 경쟁사 분석
- [ ] 영상 댓글 감정 분석
- [ ] AI 기반 제목/섬네일 추천
- [ ] 영상 업로드 스케줄 최적화 제안

### 성능 개선
- [ ] 가상 스크롤 (react-window)
- [ ] 서버 사이드 페이지네이션
- [ ] 이미지 레이지 로딩
- [ ] PWA 지원
- [ ] 오프라인 모드

### UX 개선
- [ ] 드래그 앤 드롭 파일 업로드
- [ ] 커스텀 대시보드 위젯
- [ ] 데이터 내보내기 (CSV, PDF)
- [ ] 모바일 앱 (React Native)
- [ ] 다국어 확장 (일본어, 중국어 등)

### 보안 강화
- [ ] API 키 암호화
- [ ] 2FA 인증
- [ ] 감사 로그
- [ ] Rate Limiting
- [ ] CORS 정책 강화

---

## 📚 참고 문서

### 외부 API 문서
- [YouTube Data API v3](https://developers.google.com/youtube/v3)
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

### 라이브러리 문서
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Recharts](https://recharts.org/)
- [React Query](https://tanstack.com/query/latest)

### 프로젝트 문서
- [README.md](./README.md)
- [Supabase Migrations](./supabase/migrations/)
- [Edge Functions](./supabase/functions/)

---

## 📝 버전 히스토리

### v1.0.0 (현재)
- ✅ 기본 채널 분석 기능
- ✅ 대시보드 및 시각화
- ✅ 사용자 인증 및 설정
- ✅ YouTube Shorts 분류
- ✅ 다크/라이트 테마
- ✅ 한국어/영어 지원

### 계획 중
- v1.1.0: 다중 채널 비교
- v1.2.0: 댓글 감정 분석
- v2.0.0: AI 추천 시스템

---

**작성일:** 2025-11-03
**문서 버전:** 1.0
**프로젝트:** YouTuber Analyzer Pro
