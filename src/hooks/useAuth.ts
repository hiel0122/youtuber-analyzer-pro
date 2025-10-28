import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Defer profile sync with setTimeout
        if (session?.user) {
          setTimeout(() => {
            syncProfile(session.user);
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, session, loading };
}

async function syncProfile(user: User) {
  try {
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!existing) {
      await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email,
        display_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        updated_at: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Profile sync error:', error);
  }
}
