import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { YouTubeVideo } from "@/lib/youtubeApi";
import { formatMMDD, yTicks200kTo2M, yTickLabel, formatInt } from "@/utils/format";
import { pickColor } from "@/lib/charts/palette";
import { Button } from "@/components/ui/button";

interface ViewsChartProps {
  videos: YouTubeVideo[];
}

export const ViewsChart = ({ videos }: ViewsChartProps) => {
  const [videoFilter, setVideoFilter] = useState<'all' | 'long' | 'short'>('all');

  // duration을 초 단위로 변환하는 함수
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

  const chartData = filteredVideos
    .sort((a, b) => new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime())
    .map((video) => ({
      date: video.uploadDate,
      views: video.views,
      title: video.title.length > 30 ? video.title.substring(0, 30) + "..." : video.title,
    }));

  if (videos.length === 0) {
    return (
      <Card className="bg-gradient-card border-border shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            조회수 추이
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">데이터가 없습니다.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card border-border shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="section-title flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            조회수 추이
          </CardTitle>
          <div className="flex gap-1">
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
        </div>
        <p className="text-sm text-muted-foreground mt-1">최근 30개 영상의 조회수를 표시합니다</p>
      </CardHeader>
      <CardContent className="chart-root">
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="chart-grid" stroke="var(--chart-grid)" opacity={0.6} />
            <XAxis
              dataKey="date"
              tickFormatter={formatMMDD}
              minTickGap={20}
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <YAxis
              domain={[0, 2_000_000]}
              ticks={yTicks200kTo2M}
              tickFormatter={yTickLabel}
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
              labelFormatter={(v) => `업로드: ${formatMMDD(v as string)}`}
              formatter={(value: number) => [formatInt(value), "조회수"]}
            />
            <Bar dataKey="views" barSize={6} radius={[3, 3, 0, 0]} fill={pickColor(0)} opacity={0.3} />
            <Line type="monotone" dataKey="views" stroke={pickColor(1)} strokeWidth={2.5} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
