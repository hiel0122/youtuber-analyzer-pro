import { useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
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

  // duration을 초 단위로 변환 (TopVideosChart와 동일한 로직)
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

  // 디버깅: 필터 변경 시 로그
  useEffect(() => {
    console.log('🎬 Filter changed:', videoFilter);
    console.log('📹 Total videos:', videos.length);
    
    const samples = videos.slice(0, 5).map(v => ({
      title: v.title?.substring(0, 30),
      duration: v.duration,
      seconds: parseDuration(v.duration || '')
    }));
    console.log('📊 Sample durations:', samples);
  }, [videoFilter, videos]);
  
  if (loading) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // 필터링된 영상 (TopVideosChart와 동일한 조건)
  const filteredVideos = videos.filter(video => {
    if (videoFilter === 'all') return true;
    const durationInSeconds = parseDuration(video.duration || '');
    if (videoFilter === 'short') return durationInSeconds < 60;
    if (videoFilter === 'long') return durationInSeconds >= 60;
    return true;
  });

  console.log('✅ Filtered videos:', filteredVideos.length);

  // 최근 30개 영상만 표시
  const recentVideos = [...filteredVideos]
    .sort((a, b) => {
      const dateA = new Date(a.upload_date || 0);
      const dateB = new Date(b.upload_date || 0);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(-30);

  console.log('📈 Chart data points:', recentVideos.length);

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

  // 데이터가 없을 때 처리
  if (filteredVideos.length === 0) {
    return (
      <div className="space-y-3">
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
        <div className="h-[300px] flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p className="text-lg">
              {videoFilter === 'short' && '숏폼 영상이 없습니다'}
              {videoFilter === 'long' && '롱폼 영상이 없습니다'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
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
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 60, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
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
          
          {/* 왼쪽 Y축 - 조회수 */}
          <YAxis 
            yAxisId="left"
            stroke="#8b5cf6"
            tick={{ fill: '#8b5cf6', fontSize: 11 }}
            axisLine={{ stroke: '#8b5cf6' }}
            tickLine={{ stroke: '#8b5cf6' }}
            tickFormatter={(value) => {
              if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
              if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
              return value;
            }}
          />
          
          {/* 오른쪽 Y축 - 좋아요 */}
          <YAxis 
            yAxisId="right"
            orientation="right"
            stroke="#10b981"
            tick={{ fill: '#10b981', fontSize: 11 }}
            axisLine={{ stroke: '#10b981' }}
            tickLine={{ stroke: '#10b981' }}
            tickFormatter={(value) => {
              if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
              if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
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
            formatter={(value) => {
              if (value === '조회수') return <span style={{ color: '#8b5cf6' }}>조회수 (좌)</span>;
              if (value === '좋아요') return <span style={{ color: '#10b981' }}>좋아요 (우)</span>;
              return value;
            }}
          />
          
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="views" 
            stroke="#8b5cf6"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }}
            fill="url(#colorViews)"
            name="조회수"
            animationDuration={1000}
            animationEasing="ease-in-out"
            isAnimationActive={true}
            animationBegin={0}
          />
          
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="likes" 
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
            fill="url(#colorLikes)"
            name="좋아요"
            animationDuration={1000}
            animationEasing="ease-in-out"
            isAnimationActive={true}
            animationBegin={0}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ViewsTrend;
