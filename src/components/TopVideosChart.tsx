import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useTheme } from 'next-themes';
import { formatInt } from '@/utils/format';

interface TopVideosChartProps {
  videos: any[];
  loading?: boolean;
  compact?: boolean;
}

export function TopVideosChart({ videos, loading, compact = false }: TopVideosChartProps) {
  const { theme } = useTheme();
  
  if (loading) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // 상위 10개 영상
  const topVideos = [...videos]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 10);

  const chartData = topVideos.map((video, index) => ({
    name: `#${index + 1}`,
    title: video.title.length > 20 ? video.title.substring(0, 20) + '...' : video.title,
    views: video.views || 0,
  }));

  return (
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
          cursor={{ 
            fill: theme === 'dark' ? '#27272a50' : '#f3f4f650' 
          }}
          formatter={(value: any) => [formatInt(value), '조회수']}
        />
        
        <Bar 
          dataKey="views" 
          fill="url(#barGradient)"
          radius={[6, 6, 0, 0]}
          animationDuration={1200}
          animationEasing="ease-out"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default TopVideosChart;
