-- user_settings 테이블 확장 (암호화 컬럼 추가)
DO $$ 
BEGIN
  -- supabase_url_enc 컬럼 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_settings' 
    AND column_name = 'supabase_url_enc'
  ) THEN
    ALTER TABLE public.user_settings ADD COLUMN supabase_url_enc text;
  END IF;

  -- supabase_anon_enc 컬럼 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_settings' 
    AND column_name = 'supabase_anon_enc'
  ) THEN
    ALTER TABLE public.user_settings ADD COLUMN supabase_anon_enc text;
  END IF;

  -- yt_data_api_enc 컬럼 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_settings' 
    AND column_name = 'yt_data_api_enc'
  ) THEN
    ALTER TABLE public.user_settings ADD COLUMN yt_data_api_enc text;
  END IF;

  -- yt_analytics_api_enc 컬럼 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_settings' 
    AND column_name = 'yt_analytics_api_enc'
  ) THEN
    ALTER TABLE public.user_settings ADD COLUMN yt_analytics_api_enc text;
  END IF;

  -- competitor_channels 컬럼 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_settings' 
    AND column_name = 'competitor_channels'
  ) THEN
    ALTER TABLE public.user_settings ADD COLUMN competitor_channels jsonb DEFAULT '[]'::jsonb;
  END IF;

  -- default_range 컬럼 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_settings' 
    AND column_name = 'default_range'
  ) THEN
    ALTER TABLE public.user_settings ADD COLUMN default_range text DEFAULT '30d';
  END IF;

  -- display_name 컬럼 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_settings' 
    AND column_name = 'display_name'
  ) THEN
    ALTER TABLE public.user_settings ADD COLUMN display_name text;
  END IF;

  -- avatar_url 컬럼 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_settings' 
    AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE public.user_settings ADD COLUMN avatar_url text;
  END IF;

  -- credits_total 컬럼 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_settings' 
    AND column_name = 'credits_total'
  ) THEN
    ALTER TABLE public.user_settings ADD COLUMN credits_total integer DEFAULT 1000;
  END IF;

  -- credits_used 컬럼 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_settings' 
    AND column_name = 'credits_used'
  ) THEN
    ALTER TABLE public.user_settings ADD COLUMN credits_used integer DEFAULT 0;
  END IF;
END $$;

-- usage_stats 테이블 생성 (일별 사용량 추적)
CREATE TABLE IF NOT EXISTS public.usage_stats (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  day date NOT NULL,
  analyzed_channels integer DEFAULT 0,
  data_api_calls integer DEFAULT 0,
  analytics_api_calls integer DEFAULT 0,
  data_save integer DEFAULT 0,
  PRIMARY KEY (user_id, day)
);

-- RLS 활성화
ALTER TABLE public.usage_stats ENABLE ROW LEVEL SECURITY;

-- usage_stats RLS 정책
DROP POLICY IF EXISTS "usage_stats_owner_all" ON public.usage_stats;
CREATE POLICY "usage_stats_owner_all"
ON public.usage_stats FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);