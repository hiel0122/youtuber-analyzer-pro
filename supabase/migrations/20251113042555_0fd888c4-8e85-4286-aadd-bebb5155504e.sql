-- Incremental comment tracking schema

-- Channel metadata and cumulative comment total
CREATE TABLE IF NOT EXISTS yta_channels (
  channel_id text PRIMARY KEY,
  title text,
  uploads_playlist_id text,
  comments_total bigint DEFAULT 0 NOT NULL,
  last_full_scan_at timestamptz,
  last_delta_scan_at timestamptz,
  last_video_published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Per-channel video snapshots (latest commentCount)
CREATE TABLE IF NOT EXISTS yta_channel_videos (
  channel_id text NOT NULL,
  video_id text NOT NULL,
  published_at timestamptz,
  comment_count bigint DEFAULT 0 NOT NULL,
  etag text,
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY(channel_id, video_id)
);

CREATE INDEX IF NOT EXISTS idx_yta_channel_videos_pub 
  ON yta_channel_videos(channel_id, published_at DESC);

-- Analysis run logs
CREATE TABLE IF NOT EXISTS yta_analysis_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  channel_id text NOT NULL,
  run_type text CHECK (run_type IN ('full','delta')) NOT NULL,
  started_at timestamptz DEFAULT now(),
  finished_at timestamptz,
  added_videos int DEFAULT 0,
  touched_videos int DEFAULT 0,
  comments_delta bigint DEFAULT 0,
  total_comments_after bigint DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_yta_runs_channel 
  ON yta_analysis_runs(channel_id, started_at DESC);

-- Enable RLS
ALTER TABLE yta_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE yta_channel_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE yta_analysis_runs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "public_read_yta_channels" ON yta_channels;
DROP POLICY IF EXISTS "public_read_yta_channel_videos" ON yta_channel_videos;
DROP POLICY IF EXISTS "users_manage_own_runs" ON yta_analysis_runs;
DROP POLICY IF EXISTS "service_role_yta_channels" ON yta_channels;
DROP POLICY IF EXISTS "service_role_yta_channel_videos" ON yta_channel_videos;
DROP POLICY IF EXISTS "auth_write_yta_channels" ON yta_channels;
DROP POLICY IF EXISTS "auth_write_yta_channel_videos" ON yta_channel_videos;

-- Public read access for channels and videos
CREATE POLICY "public_read_yta_channels" ON yta_channels FOR SELECT USING (true);
CREATE POLICY "public_read_yta_channel_videos" ON yta_channel_videos FOR SELECT USING (true);

-- Users can insert/update their own analysis runs
CREATE POLICY "users_manage_own_runs" ON yta_analysis_runs 
  FOR ALL USING (auth.uid() = user_id);

-- Service role can write to all tables
CREATE POLICY "service_role_yta_channels" ON yta_channels 
  FOR ALL USING (auth.role() = 'service_role');
  
CREATE POLICY "service_role_yta_channel_videos" ON yta_channel_videos 
  FOR ALL USING (auth.role() = 'service_role');

-- Allow authenticated users to write channels/videos (for client-side analysis)
CREATE POLICY "auth_write_yta_channels" ON yta_channels 
  FOR ALL USING (auth.uid() IS NOT NULL);
  
CREATE POLICY "auth_write_yta_channel_videos" ON yta_channel_videos 
  FOR ALL USING (auth.uid() IS NOT NULL);