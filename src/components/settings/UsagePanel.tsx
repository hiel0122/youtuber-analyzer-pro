import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, BarChart3, Video, Database } from 'lucide-react';

export function UsagePanel() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [videosScanned, setVideosScanned] = useState(0);
  const [apiCalls, setApiCalls] = useState(0);

  useEffect(() => {
    loadUsage();
  }, [user]);

  const loadUsage = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('usage_videos_scanned, usage_api_calls_youtube')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setVideosScanned(data.usage_videos_scanned || 0);
        setApiCalls(data.usage_api_calls_youtube || 0);
      }
    } catch (error) {
      console.error('Failed to load usage:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">사용량</h3>
        <p className="text-sm text-muted-foreground mb-6">
          API 사용량 및 분석 통계를 확인하세요.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">분석한 영상</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{videosScanned.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              누적 분석 영상 수
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">YouTube API 호출</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apiCalls.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              이번 달 API 호출 수
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">데이터 사용량</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">N/A</div>
            <p className="text-xs text-muted-foreground">
              DB 저장 행 수
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-semibold">사용량 추이</h4>
        <div className="h-[200px] flex items-center justify-center border border-dashed rounded-lg">
          <p className="text-sm text-muted-foreground">차트 영역 (구현 예정)</p>
        </div>
      </div>
    </div>
  );
}
