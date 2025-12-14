import { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { formatInt } from '@/utils/format';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CustomTooltip } from './CustomTooltip';

interface Video {
  title?: string;
  upload_date?: string;
  views?: number;
  likes?: number;
  duration?: string;
  topic?: string;
  channel_name?: string;
}

interface ViewsTrendProps {
  videos: Video[];
  loading?: boolean;
  channelTotalViews: number;
}

export function ViewsTrend({ videos, loading, channelTotalViews }: ViewsTrendProps) {
  const { theme } = useTheme();
  const [videoFilter, setVideoFilter] = useState<'all' | 'long' | 'short'>('all');

  const parseDuration = (duration: string): number => {
    if (!duration) return 0;
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    return hours * 3600 + minutes * 60 + seconds;
  };
  
  if (loading) {
    return (
      <div className="h-[350px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // 필터링된 영상
  const filteredVideos = videos.filter(video => {
    if (videoFilter === 'all') return true;
    const durationInSeconds = parseDuration(video.duration || '');
    if (videoFilter === 'short') return durationInSeconds < 60;
    if (videoFilter === 'long') return durationInSeconds >= 60;
    return true;
  });

  // 최근 30개 영상만 표시
  const recentVideos = [...filteredVideos]
    .sort((a, b) => {
      const dateA = new Date(a.upload_date || 0);
      const dateB = new Date(b.upload_date || 0);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(-30);

  const chartData = recentVideos.map((video, index) => ({
    name: video.upload_date 
      ? new Date(video.upload_date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
      : `영상 ${index + 1}`,
    views: video.views || 0,
    likes: video.likes || 0,
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
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
          </linearGradient>
        </defs>
        
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} 
          vertical={false}
        />
        
        <XAxis 
          dataKey="name" 
          stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
          tick={{ fill: theme === 'dark' ? '#9ca3af' : '#6b7280', fontSize: 11 }}
          axisLine={{ stroke: theme === 'dark' ? '#374151' : '#e5e7eb' }}
          tickLine={{ stroke: theme === 'dark' ? '#374151' : '#e5e7eb' }}
        />
        
        <YAxis 
          stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
          tick={{ fill: theme === 'dark' ? '#9ca3af' : '#6b7280', fontSize: 11 }}
          axisLine={{ stroke: theme === 'dark' ? '#374151' : '#e5e7eb' }}
          tickLine={{ stroke: theme === 'dark' ? '#374151' : '#e5e7eb' }}
          tickFormatter={(value) => {
            if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
            if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
            return value;
          }}
        />
        
        <Tooltip
          content={({ active, payload }) => (
            <CustomTooltip
              active={active}
              payload={payload}
              videoData={payload?.[0]?.payload?.videoData}
            />
          )}
          cursor={{ stroke: theme === 'dark' ? '#374151' : '#e5e7eb', strokeWidth: 1 }}
        />
        
        <Legend 
          wrapperStyle={{
            paddingTop: '20px',
            fontSize: '12px',
          }}
          iconType="line"
        />
        
        <Line 
          type="monotone" 
          dataKey="views" 
          stroke="#3b82f6"
          strokeWidth={3}
          dot={false}
          activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
          fill="url(#colorViews)"
          name="조회수"
          animationDuration={1500}
          animationEasing="ease-in-out"
        />
        
        <Line 
          type="monotone" 
          dataKey="likes" 
          stroke="#10b981"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 5, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
          fill="url(#colorLikes)"
          name="좋아요"
          animationDuration={1500}
          animationEasing="ease-in-out"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default ViewsTrend;
