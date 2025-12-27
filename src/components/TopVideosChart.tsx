import { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useTheme } from 'next-themes';
import { formatInt } from '@/utils/format';
import { CustomTooltip } from './CustomTooltip';
import { Button } from '@/components/ui/button';

interface Video {
  title?: string;
  views?: number;
  likes?: number;
  upload_date?: string;
  duration?: string;
  topic?: string;
  channel_name?: string;
}

interface TopVideosChartProps {
  videos: Video[];
  loading?: boolean;
  compact?: boolean;
  showFilter?: boolean;
}

export function TopVideosChart({ videos, loading, compact = false, showFilter = false }: TopVideosChartProps) {
  const { theme } = useTheme();
  const [videoFilter, setVideoFilter] = useState<'all' | 'long' | 'short'>('all');

  // duration을 초 단위로 변환
  const parseDuration = (duration: string): number => {
    if (!duration) return 0;
    // PT 형식 (PT1M30S) 처리
    const ptMatch = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (ptMatch) {
      const hours = parseInt(ptMatch[1] || '0');
      const minutes = parseInt(ptMatch[2] || '0');
      const seconds = parseInt(ptMatch[3] || '0');
      return hours * 3600 + minutes * 60 + seconds;
    }
    // HH:MM:SS 또는 MM:SS 형식 처리
    const parts = duration.split(':').map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return parseInt(duration) || 0;
  };

  // 필터링된 영상
  const filteredVideos = videos.filter(video => {
    if (videoFilter === 'all') return true;
    const durationInSeconds = parseDuration(video.duration || '');
    if (videoFilter === 'short') return durationInSeconds < 60;
    if (videoFilter === 'long') return durationInSeconds >= 60;
    return true;
  });
  
  if (loading) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // 상위 10개 영상 (필터링 적용)
  const topVideos = [...filteredVideos]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 10);

  const chartData = topVideos.map((video, index) => ({
    name: `#${index + 1}`,
    title: video.title && video.title.length > 20 ? video.title.substring(0, 20) + '...' : video.title || `영상 ${index + 1}`,
    views: video.views || 0,
    // 원본 영상 데이터 포함
    videoData: {
      title: video.title,
      channelName: video.channel_name,
      views: video.views,
      likes: video.likes,
      upload_date: video.upload_date,
      duration: video.duration,
      topic: video.topic,
    },
  }));

  return (
    <div className="space-y-3">
      {showFilter && (
        <div className="flex justify-end gap-1">
          <Button
            variant={videoFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setVideoFilter('all')}
            className="h-7 text-xs px-2"
          >
            전체
          </Button>
          <Button
            variant={videoFilter === 'long' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setVideoFilter('long')}
            className="h-7 text-xs px-2"
          >
            롱폼
          </Button>
          <Button
            variant={videoFilter === 'short' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setVideoFilter('short')}
            className="h-7 text-xs px-2"
          >
            숏폼
          </Button>
        </div>
      )}
      <ResponsiveContainer width="100%" height={compact ? 250 : 300}>
      <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
        
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke={theme === 'dark' ? '#262626' : '#e5e5e5'} 
          vertical={false} 
        />
        
        <XAxis 
          dataKey="name" 
          stroke={theme === 'dark' ? '#737373' : '#737373'}
          tick={{ fill: theme === 'dark' ? '#a3a3a3' : '#737373', fontSize: 11 }}
          axisLine={{ stroke: theme === 'dark' ? '#262626' : '#e5e5e5' }}
          tickLine={{ stroke: theme === 'dark' ? '#262626' : '#e5e5e5' }}
        />
        
        <YAxis 
          stroke={theme === 'dark' ? '#737373' : '#737373'}
          tick={{ fill: theme === 'dark' ? '#a3a3a3' : '#737373', fontSize: 11 }}
          axisLine={{ stroke: theme === 'dark' ? '#262626' : '#e5e5e5' }}
          tickLine={{ stroke: theme === 'dark' ? '#262626' : '#e5e5e5' }}
          tickFormatter={(value) => formatInt(value)}
        />
        
        <Tooltip
          content={({ active, payload }) => (
            <CustomTooltip
              active={active}
              payload={payload}
              videoData={payload?.[0]?.payload?.videoData}
            />
          )}
          cursor={{ fill: theme === 'dark' ? '#27272a50' : '#f3f4f650' }}
        />
        
        <Bar 
          dataKey="views" 
          fill="url(#barGradient)"
          radius={[6, 6, 0, 0]}
          maxBarSize={60}
          animationDuration={1000}
          animationEasing="ease-in-out"
          isAnimationActive={true}
          animationBegin={0}
        />
      </BarChart>
    </ResponsiveContainer>
    </div>
  );
}

export default TopVideosChart;
