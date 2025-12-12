import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  videoData?: {
    title?: string;
    channelName?: string;
    views?: number;
    likes?: number;
    upload_date?: string;
    duration?: string;
    topic?: string;
  };
}

export function CustomTooltip({ active, payload, videoData }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const data = payload[0].payload;
  const video = videoData || data;

  // 숫자 포맷팅
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  // 날짜 포맷팅
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: ko });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-popover border border-border rounded-lg shadow-lg p-4 max-w-xs text-popover-foreground">
      {/* 영상 제목 */}
      {video.title && (
        <div className="font-semibold text-sm text-foreground mb-2 line-clamp-2">
          {video.title}
        </div>
      )}

      {/* 채널명 */}
      {video.channelName && (
        <div className="text-xs text-gray-600 dark:text-gray-400 mb-3">
          {video.channelName}
        </div>
      )}

      {/* 구분선 */}
      <div className="border-t border-border my-2" />

      {/* 통계 정보 */}
      <div className="space-y-1.5">
        {/* 조회수 */}
        {video.views !== undefined && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">조회수</span>
            <span className="font-semibold text-foreground">
              {formatNumber(video.views)}
            </span>
          </div>
        )}

        {/* 좋아요 */}
        {video.likes !== undefined && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">좋아요</span>
            <span className="font-semibold text-foreground">
              {formatNumber(video.likes)}
            </span>
          </div>
        )}

        {/* 업로드 날짜 */}
        {video.upload_date && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-400">업로드</span>
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {formatDate(video.upload_date)}
            </span>
          </div>
        )}

        {/* 재생시간 */}
        {video.duration && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-400">재생시간</span>
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {video.duration}
            </span>
          </div>
        )}

        {/* 주제 */}
        {video.topic && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-400">주제</span>
            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs font-medium">
              {video.topic}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
