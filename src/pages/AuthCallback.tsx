import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Status = 'loading' | 'ok' | 'recovery' | 'error';

export default function AuthCallback() {
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    let unsub = () => {};
    let redirected = false;

    const redirectTo = (fallback = '/') => {
      if (redirected) return;
      redirected = true;
      try {
        const url = new URL(window.location.href);
        const nextParam = url.searchParams.get('next') || url.searchParams.get('redirect');
        const stored = sessionStorage.getItem('post_auth_redirect') || undefined;
        const dest = nextParam || stored || fallback;

        window.history.replaceState(null, '', `${window.location.origin}/auth/callback`);
        sessionStorage.removeItem('post_auth_redirect');
        window.location.replace(dest);
      } catch {
        window.location.replace(fallback);
      }
    };

    (async () => {
      try {
        const href = window.location.href;
        const url = new URL(href);

        const code = url.searchParams.get('code');
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(href);
          if (error) throw error;
        }

        await supabase.auth.getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'PASSWORD_RECOVERY') {
            setStatus('recovery');
            window.history.replaceState(null, '', `${window.location.origin}/auth/callback`);
            window.location.replace('/reset-password');
            return;
          }
          if (event === 'SIGNED_IN' || session) {
            setStatus('ok');
            redirectTo('/');
          }
        });
        unsub = () => subscription.unsubscribe();

        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setStatus('ok');
          redirectTo('/');
          return;
        }

        const explicitErr = url.searchParams.get('error_description') || url.searchParams.get('error');
        if (explicitErr) throw new Error(explicitErr);

        throw new Error('Authentication could not be established.');
      } catch (e) {
        console.error('[auth-callback]', e);
        setStatus('error');
        try { window.history.replaceState(null, '', `${window.location.origin}/auth/callback`); } catch {}
      }
    })();

    return () => unsub();
  }, []);

  return (
    <main className="flex min-h-[60vh] items-center justify-center p-8">
      <div className="text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">로그인 처리 중...</p>
          </>
        )}
        {status === 'recovery' && <p className="text-muted-foreground">비밀번호 재설정 페이지로 이동합니다...</p>}
        {status === 'ok' && <p className="text-muted-foreground">로그인되었습니다. 이동 중...</p>}
        {status === 'error' && (
          <div className="space-y-4">
            <p className="text-muted-foreground">인증에 실패했습니다. 새로운 링크를 요청해 주세요.</p>
            <button
              onClick={() => window.location.replace('/')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              홈으로 돌아가기
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
