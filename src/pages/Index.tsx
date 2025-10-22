import { useState } from "react";
import { ChannelInput } from "@/components/ChannelInput";
import { MetricsCard } from "@/components/MetricsCard";
import { VideoTable } from "@/components/VideoTable";
import { ViewsChart } from "@/components/ViewsChart";
import { TopicChart } from "@/components/TopicChart";
import { SettingsModal } from "@/components/SettingsModal";
import { YouTubeVideo } from "@/lib/youtubeApi";
import { getSupabaseClient, hasSupabaseCredentials } from "@/lib/supabaseClient";
import { syncNewVideos } from "@/lib/edge";
import { Video, Eye, ThumbsUp, Calendar, Users, Clock, Zap, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { formatInt } from "@/utils/format";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [channelStats, setChannelStats] = useState<{
    subscriberCount: number;
    totalViews: number;
    hiddenSubscriber: boolean;
  } | null>(null);

  const handleAnalyze = async (url: string) => {
    setLoading(true);
    setProgress({ current: 0, total: 0 });

    try {
      if (!hasSupabaseCredentials()) {
        toast.error('Settings에서 Supabase URL/Anon Key를 설정하세요');
        return;
      }

      // Call Edge Function using absolute URL
      const data = await syncNewVideos(url);

      console.log('Edge Function response:', data);

      // Check for error in response
      if (data?.error) {
        throw new Error(data.error);
      }

      const result = data as {
        ok: boolean;
        channelId: string;
        title: string;
        inserted_or_updated?: number;
        inserted?: number;
        newest_uploaded_at?: string;
        message?: string;
      };

      const supabase = getSupabaseClient();

      // Refresh channel stats from database
      const { data: channelData, error: channelError } = await supabase
        .from('channels')
        .select('subscriber_count, view_count, hidden_subscriber')
        .eq('id', result.channelId)
        .maybeSingle();

      if (!channelError && channelData) {
        setChannelStats({
          subscriberCount: channelData.hidden_subscriber ? 0 : channelData.subscriber_count || 0,
          totalViews: channelData.view_count || 0,
          hiddenSubscriber: channelData.hidden_subscriber || false,
        });
      }

      // Refresh videos from database
      const { data: videosData, error: videosError } = await supabase
        .from('youtube_videos')
        .select('*')
        .eq('channel_id', result.channelId)
        .order('upload_date', { ascending: false });

      if (videosError) {
        console.error('Videos fetch error:', videosError);
      } else {
        const mappedVideos: YouTubeVideo[] = (videosData || []).map((v: any) => ({
          videoId: v.video_id,
          title: v.title,
          topic: v.topic || '',
          presenter: v.presenter || '',
          views: v.views || 0,
          likes: v.likes || 0,
          dislikes: v.dislikes || 0,
          uploadDate: v.upload_date,
          duration: v.duration || '0:00',
          url: v.url,
        }));
        setVideos(mappedVideos);
      }

      const insertedCount = result.inserted_or_updated || result.inserted || 0;
      if (insertedCount > 0) {
        toast.success(`✅ 분석 완료: ${insertedCount}개의 새 영상을 발견했습니다`);
      } else {
        toast.success(`✅ 분석 완료: 새 영상이 없습니다`);
      }
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast.error(error.message || '채널 분석 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  // Basic metrics
  const totalVideos = videos.length;
  const totalViews = videos.reduce((sum, v) => sum + v.views, 0);
  const avgViews = videos.length > 0 ? Math.round(totalViews / videos.length) : 0;
  const avgLikes = videos.length > 0 ? Math.round(videos.reduce((sum, v) => sum + v.likes, 0) / videos.length) : 0;
  const latestUpload =
    videos.length > 0
      ? videos.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())[0].uploadDate
      : "없음";

  // Quality metrics (longform/shortform based on duration)
  const parseDurationToSeconds = (duration: string): number => {
    const parts = duration.split(":").map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return 0;
  };

  const longformCount = videos.filter((v) => parseDurationToSeconds(v.duration) >= 60).length;
  const shortformCount = videos.filter((v) => parseDurationToSeconds(v.duration) < 60).length;

  // Use channel stats from state
  const subscriberCount = channelStats?.subscriberCount || 0;
  const channelTotalViews = channelStats?.totalViews || 0;
  const hiddenSubscriber = channelStats?.hiddenSubscriber || false;

  return (
    <div className="min-h-screen bg-background">
      <SettingsModal />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            YouTube Channel Analyzer
          </h1>
          <p className="text-muted-foreground text-lg">유튜브 채널의 영상 데이터를 분석하고 시각화하세요</p>
        </header>

        {/* Channel Input */}
        <div className="flex flex-col items-center mb-12">
          <ChannelInput onAnalyze={handleAnalyze} loading={loading} />
          {loading && progress.total > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              동기화 중... {progress.current}/{progress.total}
            </p>
          )}
        </div>

        {/* Quantity Section */}
        <section className="mb-8">
          <h3 className="text-sm font-semibold mb-3 text-foreground">Quantity</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricsCard
              title="총 구독자 수"
              value={
                <div className="flex items-center gap-2">
                  <span>{formatInt(subscriberCount)}</span>
                  {hiddenSubscriber && (
                    <Badge variant="secondary" className="text-xs">
                      숨김
                    </Badge>
                  )}
                </div>
              }
              icon={Users}
              description="채널 구독자"
            />
            <MetricsCard title="총 영상 수" value={formatInt(totalVideos)} icon={Video} description="분석된 영상" />
            <MetricsCard
              title="총 조회수"
              value={formatInt(channelTotalViews || totalViews)}
              icon={Eye}
              description="전체 조회수"
            />
            <MetricsCard title="최근 업로드" value={latestUpload} icon={Calendar} description="마지막 업로드일" />
          </div>
        </section>

        {/* Quality Section */}
        <section className="mb-12">
          <h3 className="text-sm font-semibold mb-3 text-foreground">Quality</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricsCard title="롱폼 개수" value={formatInt(longformCount)} icon={Clock} description="60초 이상" />
            <MetricsCard title="숏폼 개수" value={formatInt(shortformCount)} icon={Zap} description="60초 미만" />
            <MetricsCard title="평균 조회수" value={formatInt(avgViews)} icon={TrendingUp} description="영상당 평균" />
            <MetricsCard title="평균 좋아요" value={formatInt(avgLikes)} icon={ThumbsUp} description="영상당 평균" />
          </div>
        </section>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <ViewsChart videos={videos} />
          <TopicChart videos={videos} />
        </div>

        {/* Video Table */}
        <VideoTable videos={videos} />

        {/* Footer */}
        <footer className="text-center mt-12 text-muted-foreground text-sm">Powered by Supabase + Lovable</footer>
      </div>
    </div>
  );
};

export default Index;
