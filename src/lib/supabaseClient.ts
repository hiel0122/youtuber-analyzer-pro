import { createClient } from '@supabase/supabase-js';

// These will be set via the settings modal
let supabaseUrl = localStorage.getItem('supabase_url') || '';
let supabaseKey = localStorage.getItem('supabase_key') || '';

export const getSupabaseClient = () => {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials not configured. Please set them in Settings.');
  }
  return createClient(supabaseUrl, supabaseKey);
};

export const setSupabaseCredentials = (url: string, key: string) => {
  localStorage.setItem('supabase_url', url);
  localStorage.setItem('supabase_key', key);
  supabaseUrl = url;
  supabaseKey = key;
};

export const hasSupabaseCredentials = () => {
  return !!(localStorage.getItem('supabase_url') && localStorage.getItem('supabase_key'));
};
