import { SectionCard } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { YouTubeVideo } from "@/lib/youtubeApi";
import { formatInt } from "@/utils/format";

import { pickChartColor } from "@/lib/chartColors";

interface TopicChartProps {
  videos: YouTubeVideo[];
  loading?: boolean;
}

const renderLabel = ({ cx, cy, midAngle, outerRadius, percent, name }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 16;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      className="text-xs fill-foreground"
    >
      {name} {Math.round(percent * 100)}%
    </text>
  );
};

export const TopicChart = ({ videos, loading }: TopicChartProps) => {
  const topicCounts = videos.reduce(
    (acc, video) => {
      acc[video.topic] = (acc[video.topic] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const chartData = Object.entries(topicCounts)
    .map(([topic, count]) => ({
      name: topic,
      value: count,
      percentage: ((count / videos.length) * 100).toFixed(1),
    }))
    .sort((a, b) => b.value - a.value);

  if (loading) {
    return (
      <SectionCard title="주제별 분포">
        <div className="h-72 rounded-xl bg-muted/50 animate-pulse" />
      </SectionCard>
    );
  }

  if (videos.length === 0) {
    return (
      <SectionCard title="주제별 분포">
        <div className="h-72 flex items-center justify-center text-muted-foreground">
          <p className="text-sm">데이터가 없습니다.</p>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="주제별 분포">
      <div className="chart-root h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              dataKey="value"
              label={renderLabel}
              labelLine
              minAngle={8}
              paddingAngle={2}
              isAnimationActive={false}
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={pickChartColor(index)} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value: number, name: string) => [formatInt(value), name]}
            />
            <Legend
              verticalAlign="bottom"
              height={24}
              formatter={(value, entry: any) => `${value} (${entry.payload.value})`}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  );
};
