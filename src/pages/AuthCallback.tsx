import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    handleCallback();
  }, []);

  async function handleCallback() {
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
      
      if (error) {
        toast.error('인증에 실패했습니다.');
        console.error('Auth callback error:', error);
      } else {
        toast.success('로그인되었습니다.');
      }
    } catch (error) {
      toast.error('인증 처리 중 오류가 발생했습니다.');
      console.error('Callback error:', error);
    } finally {
      navigate('/');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">인증 처리 중...</p>
      </div>
    </div>
  );
}
