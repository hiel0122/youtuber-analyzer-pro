import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { formatInt } from '@/utils/format';

interface TopVideosChartProps {
  videos: any[];
  loading?: boolean;
  compact?: boolean;
}

export function TopVideosChart({ videos, loading, compact = false }: TopVideosChartProps) {
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
          stroke="#27272a" 
          vertical={false} 
        />
        
        <XAxis 
          dataKey="name" 
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
            backgroundColor: '#18181b',
            border: '1px solid #27272a',
            borderRadius: '8px',
            color: '#fafafa'
          }}
          labelStyle={{ color: '#fafafa', marginBottom: '4px' }}
          cursor={{ fill: '#27272a50' }}
          formatter={(value: any) => [formatInt(value), '조회수']}
        />
        
        <Bar 
          dataKey="views" 
          fill="url(#barGradient)"
          radius={[6, 6, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default TopVideosChart;
