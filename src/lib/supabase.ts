import { supabase } from './supabaseClient';

export { supabase };

export const tables = {
  prompts: () => supabase.from('prompts'),
};
