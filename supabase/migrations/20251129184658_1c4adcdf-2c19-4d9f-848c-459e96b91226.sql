-- =====================================================
-- Security Fix Migration (Corrected)
-- Addresses: RLS disabled, Security Definer views, Function search paths
-- =====================================================

-- 1. Enable RLS on analysis_video_snapshots table
ALTER TABLE analysis_video_snapshots ENABLE ROW LEVEL SECURITY;

-- Add policy to restrict access based on parent analysis_log ownership
CREATE POLICY "Users can access own video snapshots"
ON analysis_video_snapshots FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM analysis_logs
    WHERE analysis_logs.id = analysis_video_snapshots.analysis_log_id
    AND analysis_logs.user_id = auth.uid()
  )
);

-- 2. Fix Security Definer views by recreating with security_invoker
-- Drop and recreate v_all_videos
DROP VIEW IF EXISTS v_all_videos CASCADE;
CREATE OR REPLACE VIEW v_all_videos
WITH (security_invoker = true) AS
SELECT 
  video_id,
  channel_id,
  title,
  duration_seconds,
  published_at,
  created_at
FROM videos;

-- Drop and recreate v_channel_videos
DROP VIEW IF EXISTS v_channel_videos CASCADE;
CREATE OR REPLACE VIEW v_channel_videos
WITH (security_invoker = true) AS
SELECT DISTINCT
  channel_id,
  video_id
FROM videos
WHERE channel_id IS NOT NULL;

-- Drop and recreate v_latest_video_snapshot
DROP VIEW IF EXISTS v_latest_video_snapshot CASCADE;
CREATE OR REPLACE VIEW v_latest_video_snapshot
WITH (security_invoker = true) AS
SELECT DISTINCT ON (video_id)
  video_id,
  snapshot_date,
  view_count,
  like_count,
  comment_count,
  created_at
FROM video_snapshots
ORDER BY video_id, snapshot_date DESC;

-- Drop and recreate v_video_daily_delta
DROP VIEW IF EXISTS v_video_daily_delta CASCADE;
CREATE OR REPLACE VIEW v_video_daily_delta
WITH (security_invoker = true) AS
SELECT
  video_id,
  snapshot_date,
  view_count - LAG(view_count) OVER (PARTITION BY video_id ORDER BY snapshot_date) AS view_delta,
  like_count - LAG(like_count) OVER (PARTITION BY video_id ORDER BY snapshot_date) AS like_delta,
  comment_count - LAG(comment_count) OVER (PARTITION BY video_id ORDER BY snapshot_date) AS comment_delta
FROM video_snapshots;

-- Drop and recreate v_channel_daily_delta (fixed with CTE)
DROP VIEW IF EXISTS v_channel_daily_delta CASCADE;
CREATE OR REPLACE VIEW v_channel_daily_delta
WITH (security_invoker = true) AS
WITH video_deltas AS (
  SELECT
    vs.video_id,
    vs.snapshot_date,
    vs.view_count - LAG(vs.view_count) OVER (PARTITION BY vs.video_id ORDER BY vs.snapshot_date) AS view_delta,
    vs.like_count - LAG(vs.like_count) OVER (PARTITION BY vs.video_id ORDER BY vs.snapshot_date) AS like_delta,
    vs.comment_count - LAG(vs.comment_count) OVER (PARTITION BY vs.video_id ORDER BY vs.snapshot_date) AS comment_delta
  FROM video_snapshots vs
)
SELECT
  v.channel_id,
  vd.snapshot_date,
  SUM(vd.view_delta) AS view_delta,
  SUM(vd.like_delta) AS like_delta,
  SUM(vd.comment_delta) AS comment_delta
FROM video_deltas vd
JOIN videos v ON vd.video_id = v.video_id
GROUP BY v.channel_id, vd.snapshot_date;

-- Drop and recreate v_channel_comment_stats
DROP VIEW IF EXISTS v_channel_comment_stats CASCADE;
CREATE OR REPLACE VIEW v_channel_comment_stats
WITH (security_invoker = true) AS
SELECT
  v.channel_id,
  COUNT(DISTINCT vs.video_id) AS videos_with_snapshot,
  SUM(vs.comment_count) AS total_comments,
  AVG(vs.comment_count) AS avg_per_video,
  MAX(vs.comment_count) AS max_per_video,
  MIN(vs.comment_count) AS min_per_video
FROM videos v
JOIN video_snapshots vs ON v.video_id = vs.video_id
GROUP BY v.channel_id;

-- 3. Fix function search paths
-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
begin
  insert into public.profiles (id, email, display_name, nickname, tier)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'nickname', ''),
    coalesce(nullif((new.raw_app_meta_data->>'tier'),'')::public.membership_tier, 'free')
  )
  on conflict (id) do nothing;
  return new;
end;
$function$;

-- Fix update_user_settings_updated_at function
CREATE OR REPLACE FUNCTION public.update_user_settings_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix enforce_max_5_competitors function
CREATE OR REPLACE FUNCTION public.enforce_max_5_competitors()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
begin
  if (select count(*) from public.user_competitor_channels where user_id = new.user_id) >= 5 then
    raise exception '최대 5개의 경쟁 채널만 등록할 수 있습니다.';
  end if;
  return new;
end;
$function$;

-- Fix set_updated_at function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

-- Fix touch_channel_last_upload function
CREATE OR REPLACE FUNCTION public.touch_channel_last_upload()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
begin
  if new.channel_id is not null and new.upload_date is not null then
    update public.channels c
       set last_upload_date = greatest(coalesce(c.last_upload_date, new.upload_date), new.upload_date),
           updated_at       = now()
     where c.id = new.channel_id;
  end if;
  return new;
end;
$function$;