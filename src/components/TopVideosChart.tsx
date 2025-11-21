import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { YouTubeVideo } from "@/lib/youtubeApi";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { formatInt } from "@/utils/format";

interface TopVideosChartProps {
  videos: YouTubeVideo[];
  loading?: boolean;
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

export default function TopVideosChart({ videos, loading }: TopVideosChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>조회수 순위</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full h-[300px]" />
        </CardContent>
      </Card>
    );
  }

  // 조회수 기준 상위 10개 영상만 선택
  const topVideos = [...videos]
    .sort((a, b) => b.views - a.views)
    .slice(0, 10)
    .map((video, index) => ({
      name: video.title.length > 30 
        ? video.title.substring(0, 30) + '...' 
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
      <Card>
        <CardHeader>
          <CardTitle>조회수 순위</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">분석할 영상이 없습니다</p>
        </CardContent>
      </Card>
    );
  }

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

  // 커스텀 레전드
  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-col gap-1 mt-4 max-h-[200px] overflow-y-auto">
        {payload.map((entry: any, index: number) => (
          <div 
            key={`legend-${index}`} 
            className="flex items-center gap-2 text-xs hover:bg-accent rounded px-2 py-1 cursor-pointer"
          >
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="font-medium text-muted-foreground">{entry.payload.rank}위</span>
            <span className="truncate flex-1">{entry.payload.name}</span>
            <span className="text-muted-foreground font-medium">
              {formatInt(entry.payload.views)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          조회수 순위
          <span className="text-sm font-normal text-muted-foreground">
            (Top 10)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={topVideos}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              innerRadius={60}
              fill="#8884d8"
              dataKey="views"
              animationBegin={0}
              animationDuration={800}
            >
              {topVideos.map((entry, index) => (
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
              height={220}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
