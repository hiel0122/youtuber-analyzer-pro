import { useAnalysisLogs } from '@/contexts/AnalysisLogsContext';
import { Video } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

export function RightActivity() {
  const { logs: historyItems } = useAnalysisLogs();

  return (
    <aside className="w-80 border-l border-border bg-background overflow-y-auto p-6 space-y-6 hidden xl:block">
      {/* Recent Activity */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">최근 활동</h3>
          <button className="text-xs text-primary hover:text-primary/80">
            View all →
          </button>
        </div>
        <div className="space-y-4">
          {historyItems.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              최근 활동이 없습니다
            </p>
          ) : (
            historyItems.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Video className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {log.channel_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {log.video_count?.toLocaleString('ko-KR')}개 영상 분석 완료
                  </p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(log.analyzed_at || log.created_at), { 
                    locale: ko,
                    addSuffix: true 
                  })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}
