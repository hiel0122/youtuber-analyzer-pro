import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useTheme } from 'next-themes';
import { formatInt } from '@/utils/format';

interface ViewsTrendProps {
  videos: any[];
  loading?: boolean;
  channelTotalViews: number;
}

export function ViewsTrend({ videos, loading, channelTotalViews }: ViewsTrendProps) {
  const { theme } = useTheme();
  
  if (loading) {
    return (
      <div className="h-[350px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // 최근 30개 영상만 표시
  const recentVideos = videos
    .sort((a, b) => new Date(b.upload_date).getTime() - new Date(a.upload_date).getTime())
    .slice(0, 30);

  const chartData = recentVideos.map((video, index) => ({
    name: `#${recentVideos.length - index}`,
    date: new Date(video.upload_date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
    views: video.views || 0,
    likes: video.likes || 0,
  })).reverse();

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
          stroke="#27272a" 
          vertical={false}
        />
        
        <XAxis 
          dataKey="date" 
          stroke="#71717a"
          tick={{ fill: '#71717a', fontSize: 11 }}
          axisLine={{ stroke: '#27272a' }}
          tickLine={{ stroke: '#27272a' }}
        />
        
        <YAxis 
          stroke="#71717a"
          tick={{ fill: '#71717a', fontSize: 11 }}
          axisLine={{ stroke: '#27272a' }}
          tickLine={{ stroke: '#27272a' }}
          tickFormatter={(value) => formatInt(value)}
        />
        
        <Tooltip
          contentStyle={{
            backgroundColor: theme === 'dark' ? '#18181b' : '#ffffff',
            border: `1px solid ${theme === 'dark' ? '#27272a' : '#e5e7eb'}`,
            borderRadius: '8px',
            color: theme === 'dark' ? '#fafafa' : '#0a0a0a'
          }}
          labelStyle={{ 
            color: theme === 'dark' ? '#fafafa' : '#0a0a0a', 
            marginBottom: '4px' 
          }}
          itemStyle={{ 
            color: theme === 'dark' ? '#fafafa' : '#0a0a0a'
          }}
        />
        
        <Legend 
          wrapperStyle={{ paddingTop: '20px' }}
          iconType="circle"
        />
        
        <Line 
          type="monotone" 
          dataKey="views" 
          stroke="#3b82f6"
          strokeWidth={3}
          dot={false}
          activeDot={{ r: 6, fill: '#3b82f6' }}
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
          activeDot={{ r: 5, fill: '#10b981' }}
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
