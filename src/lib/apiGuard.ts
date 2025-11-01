import { supabase } from './supabase';

export interface ApiKeys {
  api_supabase_url: string | null;
  api_supabase_anon_key: string | null;
  api_youtube_key: string | null;
  api_youtube_analytics_key: string | null;
}

export async function checkRequiredApis(userId: string): Promise<{ valid: boolean; missing: string[] }> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('api_supabase_url, api_supabase_anon_key, api_youtube_key, api_youtube_analytics_key')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) {
    return {
      valid: false,
      missing: ['Youtube Data API', 'Youtube Analytics API', 'Supabase URL', 'Supabase Anon Key']
    };
  }

  const missing: string[] = [];
  const settings = data as any;
  
  if (!settings.api_youtube_key) {
    missing.push('Youtube Data API');
  }
  
  if (!settings.api_youtube_analytics_key) {
    missing.push('Youtube Analytics API');
  }
  
  if (!settings.api_supabase_url) {
    missing.push('Supabase URL');
  }
  
  if (!settings.api_supabase_anon_key) {
    missing.push('Supabase Anon Key');
  }

  return {
    valid: missing.length === 0,
    missing
  };
}
