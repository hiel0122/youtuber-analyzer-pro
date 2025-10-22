import { createClient } from '@supabase/supabase-js';

// These will be set via the settings modal
let supabaseUrl = localStorage.getItem('ya_supabase_url') || '';
let supabaseKey = localStorage.getItem('ya_supabase_anon') || '';

export const getSupabaseClient = () => {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials not configured. Please set them in Settings.');
  }
  return createClient(supabaseUrl, supabaseKey);
};

export const setSupabaseCredentials = (url: string, key: string) => {
  localStorage.setItem('ya_supabase_url', url);
  localStorage.setItem('ya_supabase_anon', key);
  supabaseUrl = url;
  supabaseKey = key;
};

export const hasSupabaseCredentials = () => {
  return !!(localStorage.getItem('ya_supabase_url') && localStorage.getItem('ya_supabase_anon'));
};

export const testSupabaseConnection = async (url: string, key: string): Promise<boolean> => {
  try {
    const testClient = createClient(url, key);
    const { error } = await testClient.from('youtube_videos').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
};
