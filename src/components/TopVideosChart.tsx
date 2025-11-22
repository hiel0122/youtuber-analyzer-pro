import { SectionCard } from "@/components/ui/card";
import { YouTubeVideo } from "@/lib/youtubeApi";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { formatInt } from "@/utils/format";

interface TopVideosChartProps {
  videos: YouTubeVideo[];
  loading?: boolean;
  channelTotalViews?: number;
}

// 10가지 서로 다른 색상 팔레트 (시각적으로 구분 가능)
const COLORS = [
  '#FF6B6B', // 빨강
  '#4ECDC4', // 청록
  '#45B7D1', // 하늘
  '#FFA07A', // 연어
  '#98D8C8', // 민트
  '#F7DC6F', // 노랑
  '#BB8FCE', // 보라
  '#85C1E2', // 파랑
  '#F8B739', // 주황
  '#52BE80', // 초록
];

export default function TopVideosChart({ videos, loading, channelTotalViews }: TopVideosChartProps) {
  if (loading) {
    return (
      <SectionCard title="조회수 순위">
        <Skeleton className="w-full h-[350px]" />
      </SectionCard>
    );
  }

  // 조회수 기준 상위 10개 영상만 선택
  const topVideos = [...videos]
    .sort((a, b) => b.views - a.views)
    .slice(0, 10)
    .map((video, index) => ({
      name: video.title.length > 60 
        ? video.title.substring(0, 60) + '...' 
        : video.title,
      fullTitle: video.title,
      views: video.views,
      uploadDate: video.uploadDate,
      url: video.url,
      rank: index + 1,
    }));

  // 데이터가 없을 때
  if (topVideos.length === 0) {
    return (
      <SectionCard title="조회수 순위">
        <div className="flex items-center justify-center h-[350px]">
          <p className="text-muted-foreground">분석할 영상이 없습니다</p>
        </div>
      </SectionCard>
    );
  }

  // 전체 채널 조회수 사용 (없으면 상위 10개 합으로 폴백)
  const baselineViews = channelTotalViews && channelTotalViews > 0 
    ? channelTotalViews 
    : topVideos.reduce((sum, video) => sum + video.views, 0);

  // 각 영상에 퍼센트 추가 (전체 채널 조회수 대비)
  const topVideosWithPercent = topVideos.map(video => ({
    ...video,
    percentage: baselineViews > 0 ? ((video.views / baselineViews) * 100).toFixed(1) : '0',
  }));

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg max-w-xs">
          <p className="font-semibold text-sm mb-1">
            {data.rank}위: {data.fullTitle}
          </p>
          <p className="text-xs text-muted-foreground mb-1">
            조회수: <span className="font-medium text-foreground">{formatInt(data.views)}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            업로드: {new Date(data.uploadDate).toLocaleDateString('ko-KR')}
          </p>
        </div>
      );
    }
    return null;
  };

  // 커스텀 레전드 (상위 3개만 표시)
  const CustomLegend = ({ payload }: any) => {
    const topThree = payload.slice(0, 3);
    
    return (
      <div className="flex flex-col gap-1 mt-2">
        {topThree.map((entry: any, index: number) => (
          <div 
            key={`legend-${index}`} 
            className="flex items-center gap-2 text-[0.65rem] hover:bg-accent rounded px-2 py-1 cursor-pointer transition-colors"
          >
            <div 
              className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="font-semibold text-foreground min-w-[1.5rem]">{entry.payload.rank}위</span>
            <span className="truncate flex-1 font-medium leading-tight">{entry.payload.name}</span>
            <span className="text-muted-foreground font-semibold tabular-nums">
              {formatInt(entry.payload.views)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <SectionCard
      title={
        <span className="flex items-center gap-2">
          조회수 순위
          <span className="text-sm font-normal text-muted-foreground">
            (Top 10)
          </span>
        </span>
      }
    >
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={topVideosWithPercent}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ percentage, cx, cy, midAngle, innerRadius, outerRadius }) => {
              const RADIAN = Math.PI / 180;
              const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
              const x = cx + radius * Math.cos(-midAngle * RADIAN);
              const y = cy + radius * Math.sin(-midAngle * RADIAN);
              
              return (
                <text
                  x={x}
                  y={y}
                  fill="white"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="10"
                  fontWeight="600"
                >
                  {`${percentage}%`}
                </text>
              );
            }}
            outerRadius={110}
            innerRadius={70}
            fill="#8884d8"
            dataKey="views"
            animationBegin={0}
            animationDuration={800}
            startAngle={90}
            endAngle={-270}
          >
            {topVideosWithPercent.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]}
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            content={<CustomLegend />}
            verticalAlign="bottom"
            height={80}
          />
        </PieChart>
      </ResponsiveContainer>
    </SectionCard>
  );
}
