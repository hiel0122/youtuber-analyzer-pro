-- Fix security issues identified in security scan

-- ========================================
-- 1. ENABLE RLS ON TABLES WITHOUT PROTECTION
-- ========================================

-- Enable RLS on channel_upload_stats
ALTER TABLE public.channel_upload_stats ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated read access
CREATE POLICY "authenticated_read_channel_stats"
ON public.channel_upload_stats FOR SELECT
TO authenticated
USING (true);

-- ========================================
-- 2. FIX OVERLY PERMISSIVE RLS POLICIES
-- ========================================

-- Drop and recreate channel_daily_views policies with proper authentication
DROP POLICY IF EXISTS "p_channel_daily_views_all" ON public.channel_daily_views;

CREATE POLICY "authenticated_read_channel_daily_views"
ON public.channel_daily_views FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "authenticated_write_channel_daily_views"
ON public.channel_daily_views FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "authenticated_update_channel_daily_views"
ON public.channel_daily_views FOR UPDATE
TO authenticated
USING (true);

-- Drop and recreate channel_kpis policies with proper authentication
DROP POLICY IF EXISTS "p_channel_kpis_all" ON public.channel_kpis;

CREATE POLICY "authenticated_read_channel_kpis"
ON public.channel_kpis FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "authenticated_write_channel_kpis"
ON public.channel_kpis FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "authenticated_update_channel_kpis"
ON public.channel_kpis FOR UPDATE
TO authenticated
USING (true);

-- Drop and recreate channel_topic_counts policies with proper authentication
DROP POLICY IF EXISTS "p_channel_topic_counts_all" ON public.channel_topic_counts;

CREATE POLICY "authenticated_read_channel_topic_counts"
ON public.channel_topic_counts FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "authenticated_write_channel_topic_counts"
ON public.channel_topic_counts FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "authenticated_update_channel_topic_counts"
ON public.channel_topic_counts FOR UPDATE
TO authenticated
USING (true);

-- ========================================
-- 3. RESTRICT PROFILES TABLE ACCESS TO PREVENT EMAIL EXPOSURE
-- ========================================

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "profiles admin all" ON public.profiles;
DROP POLICY IF EXISTS "profiles self all" ON public.profiles;
DROP POLICY IF EXISTS "profiles self read" ON public.profiles;
DROP POLICY IF EXISTS "profiles self update" ON public.profiles;
DROP POLICY IF EXISTS "profiles self upsert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_self" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_self" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_self" ON public.profiles;
DROP POLICY IF EXISTS "read_active_profiles_only" ON public.profiles;
DROP POLICY IF EXISTS "self_update_profile" ON public.profiles;

-- Create new restrictive policies (users can only access their own profile)
CREATE POLICY "users_select_own_profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "users_insert_own_profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own_profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ========================================
-- 4. FIX FUNCTION SEARCH PATHS FOR SECURITY
-- ========================================

-- Fix to_seconds function
CREATE OR REPLACE FUNCTION public.to_seconds(t text)
RETURNS integer
LANGUAGE sql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
  select
    case
      when t ~ '^\d+:\d{2}:\d{2}$' then
        split_part(t,':',1)::int*3600
      + split_part(t,':',2)::int*60
      + split_part(t,':',3)::int
      when t ~ '^\d+:\d{2}$' then
        split_part(t,':',1)::int*60
      + split_part(t,':',2)::int
      when t ~ '^\d+$' then t::int
      else null
    end;
$$;

-- Fix parse_duration_seconds function
CREATE OR REPLACE FUNCTION public.parse_duration_seconds(t text)
RETURNS integer
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
declare parts text[]; h int := 0; m int := 0; s int := 0;
begin
  if t is null or trim(t) = '' then return 0; end if;
  parts := string_to_array(t, ':');
  if array_length(parts,1) = 3 then
    h := parts[1]::int; m := parts[2]::int; s := parts[3]::int;
  elsif array_length(parts,1) = 2 then
    m := parts[1]::int; s := parts[2]::int;
  else
    s := parts[1]::int;
  end if;
  return h*3600 + m*60 + s;
end;
$$;

-- Fix resolve_channel_key function
CREATE OR REPLACE FUNCTION public.resolve_channel_key(p_input text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
declare
  v text := trim(p_input);
begin
  return v;
end;
$$;

-- Fix snapshot_video function
CREATE OR REPLACE FUNCTION public.snapshot_video(
  p_channel_id text,
  p_video_id text,
  p_title text,
  p_url text,
  p_view_count bigint,
  p_like_count bigint,
  p_comment_count bigint,
  p_snap_date date DEFAULT CURRENT_DATE
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
begin
  -- (a) youtube_videos meta upsert
  insert into public.youtube_videos (video_id, channel_id, title, url)
  values (p_video_id, p_channel_id, p_title, p_url)
  on conflict (video_id) do update
    set channel_id = excluded.channel_id,
        title      = excluded.title,
        url        = excluded.url;

  -- (b) video_snapshots daily upsert
  insert into public.video_snapshots
        (video_id, snapshot_date, view_count, like_count, comment_count, created_at)
  values (p_video_id, p_snap_date, p_view_count, p_like_count, p_comment_count, now())
  on conflict (video_id, snapshot_date) do update
    set view_count    = excluded.view_count,
        like_count    = excluded.like_count,
        comment_count = excluded.comment_count,
        created_at    = excluded.created_at;
end;
$$;

-- Fix upsert_channel_stats function
CREATE OR REPLACE FUNCTION public.upsert_channel_stats(
  p_channel_input text,
  p_title text,
  p_subscribers bigint,
  p_views bigint,
  p_hidden boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
declare
  v_id text := public.resolve_channel_key(p_channel_input);
begin
  insert into public.channels
    (id, title, subscriber_count, view_count, hidden_subscriber, updated_at)
  values
    (v_id, p_title, coalesce(p_subscribers,0), coalesce(p_views,0), coalesce(p_hidden,false), now())
  on conflict (id) do update
  set title             = excluded.title,
      subscriber_count  = excluded.subscriber_count,
      view_count        = excluded.view_count,
      hidden_subscriber = excluded.hidden_subscriber,
      updated_at        = now();
end;
$$;

-- Fix upsert_videos function
CREATE OR REPLACE FUNCTION public.upsert_videos(p_rows jsonb)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
declare
  r jsonb;
  n int := 0;
begin
  if p_rows is null or jsonb_typeof(p_rows) <> 'array' then
    return 0;
  end if;

  for r in select * from jsonb_array_elements(p_rows)
  loop
    insert into public.youtube_videos
      (video_id, channel_id, topic, title, presenter, views, likes, dislikes, upload_date, duration, url, comments, created_at)
    values
      (
        r->>'video_id',
        r->>'channel_id',
        nullif(r->>'topic',''),
        r->>'title',
        nullif(r->>'presenter',''),
        nullif(r->>'views','0')::bigint,
        nullif(r->>'likes','')::bigint,
        nullif(r->>'dislikes','')::bigint,
        (r->>'upload_date')::date,
        r->>'duration',
        r->>'url',
        coalesce(nullif(r->>'comments','')::bigint, 0),
        now()
      )
    on conflict (video_id) do update set
      title   = excluded.title,
      views   = excluded.views,
      likes   = excluded.likes,
      dislikes= excluded.dislikes,
      duration= excluded.duration,
      url     = excluded.url,
      comments= excluded.comments;

    n := n + 1;
  end loop;

  return n;
end;
$$;