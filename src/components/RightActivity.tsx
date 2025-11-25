import { useAnalysisLogs } from '@/contexts/AnalysisLogsContext';
import { Video } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

export function RightActivity() {
  const { logs: historyItems } = useAnalysisLogs();

  return (
    <aside className="w-80 border-l border-[#27272a] bg-[#0a0a0a] overflow-y-auto p-6 space-y-6 hidden xl:block">
      {/* Recent Activity */}
      <div className="bg-[#141414] rounded-xl p-6 border border-[#27272a]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">최근 활동</h3>
          <button className="text-xs text-blue-500 hover:text-blue-400">
            View all →
          </button>
        </div>
        <div className="space-y-4">
          {historyItems.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              최근 활동이 없습니다
            </p>
          ) : (
            historyItems.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <Video className="w-4 h-4 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {log.channel_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {log.video_count?.toLocaleString('ko-KR')}개 영상 분석 완료
                  </p>
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap">
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
