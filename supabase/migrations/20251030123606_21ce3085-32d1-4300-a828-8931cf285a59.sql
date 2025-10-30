-- Create user_settings table for centralized user preferences
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- General settings
  general_language TEXT DEFAULT 'ko',
  general_theme TEXT DEFAULT 'dark',
  general_timezone TEXT DEFAULT 'Asia/Seoul',
  general_date_format TEXT DEFAULT 'YYYY-MM-DD',
  
  -- Channel settings
  channel_default_url TEXT,
  channel_range_days INTEGER DEFAULT 90,
  channel_include_shorts BOOLEAN DEFAULT true,
  
  -- API settings (sensitive data)
  api_supabase_url TEXT,
  api_supabase_anon_key TEXT,
  api_youtube_key TEXT,
  
  -- Connect settings
  connect_ga_id TEXT,
  connect_slack_webhook TEXT,
  connect_discord_webhook TEXT,
  
  -- Usage tracking
  usage_videos_scanned INTEGER DEFAULT 0,
  usage_api_calls_youtube INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own settings
CREATE POLICY "Users can view own settings"
ON public.user_settings
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own settings
CREATE POLICY "Users can insert own settings"
ON public.user_settings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own settings
CREATE POLICY "Users can update own settings"
ON public.user_settings
FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_user_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_settings_updated_at
BEFORE UPDATE ON public.user_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_user_settings_updated_at();