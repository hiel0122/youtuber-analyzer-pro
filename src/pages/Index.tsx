import { useState, useEffect } from "react";
import { ChannelInput } from "@/components/ChannelInput";
import { MetricsCard } from "@/components/MetricsCard";
import { VideoTable } from "@/components/VideoTable";
import { TopicChart } from "@/components/TopicChart";
import { SettingsModal } from "@/components/SettingsModal";
import { YouTubeVideo } from "@/lib/youtubeApi";
import { VideoRow, SyncResponse, UploadFrequency } from "@/lib/types";
import { getSupabaseClient, hasSupabaseCredentials } from "@/lib/supabaseClient";
import { syncNewVideos } from "@/lib/edge";
import { Video, Eye, Calendar, Users } from "lucide-react";
import { toast } from "sonner";
import { formatInt } from "@/utils/format";
import { Badge } from "@/components/ui/badge";
import { useSync } from "@/hooks/useSync";
import SyncProgress from "@/components/SyncProgress";
import QuantityQuality from "@/components/QuantityQuality";
import ViewsTrend from "@/components/ViewsTrend";
import SkeletonCard from "@/components/SkeletonCard";

const Index = () => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [videoRows, setVideoRows] = useState<VideoRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [channelStats, setChannelStats] = useState<{
    subscriberCount: number;
    totalViews: number;
    hiddenSubscriber: boolean;
  } | null>(null);
  const [currentChannelId, setCurrentChannelId] = useState<string>("");
  const [uploadFrequency, setUploadFrequency] = useState<UploadFrequency | undefined>(undefined);
  const { isSyncing, progress: syncProgress, error: syncError, startSync } = useSync();

  const loadVideos = async (channelId: string) => {
    console.log('🔍 Loading videos for channel:', channelId);
    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { data: videosData, error: videosError } = await supabase
        .from("youtube_videos")
        .select("*")
        .eq("channel_id", channelId)
        .order("upload_date", { ascending: false });

      if (videosError) {
        console.error("❌ Videos fetch error:", videosError);
      } else {
        console.log('✅ Videos loaded:', videosData?.length || 0);
        const mappedVideos: YouTubeVideo[] = (videosData || []).map((v: any) => ({
          videoId: v.video_id,
          title: v.title,
          topic: v.topic || "",
          presenter: v.presenter || "",
          views: v.views || 0,
          likes: v.likes || 0,
          dislikes: v.dislikes || 0,
          uploadDate: v.upload_date,
          duration: v.duration || "0:00",
          url: v.url,
        }));
        setVideos(mappedVideos);

        const mappedRows: VideoRow[] = (videosData || []).map((v: any) => ({
          id: v.id,
          channel_id: v.channel_id,
          topic: v.topic,
          title: v.title,
          presenter: v.presenter,
          views: v.views,
          likes: v.likes,
          upload_date: v.upload_date,
          duration: v.duration,
          url: v.url,
        }));
        setVideoRows(mappedRows);
      }
    } catch (error) {
      console.error("Load videos error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (url: string) => {
    try {
      if (!hasSupabaseCredentials()) {
        toast.error("Settings에서 Supabase URL/Anon Key를 설정하세요");
        return;
      }

      await startSync(url);

      // Sync videos and get actual channel ID
      const result = await syncNewVideos(url);
      const actualChannelId = result.channelId;
      
      console.log('📡 Sync complete:', {
        channelId: actualChannelId,
        inserted: result.inserted_or_updated,
        mode: (result as any).mode
      });

      setCurrentChannelId(actualChannelId);

      // ✅ 업로드 빈도 통계 저장
      if (result.uploadFrequency) {
        setUploadFrequency(result.uploadFrequency);
      }

      // Refresh channel stats from database using actual channel ID
      const supabase = getSupabaseClient();
      const { data: channelData, error: channelError } = await supabase
        .from("youtube_channels")
        .select("subscriber_count, total_views, channel_name")
        .eq("channel_id", actualChannelId)
        .maybeSingle();

      if (!channelError && channelData) {
        setChannelStats({
          subscriberCount: channelData.subscriber_count || 0,
          totalViews: channelData.total_views || 0,
          hiddenSubscriber: false,
        });
      }

      // Load all videos using actual channel ID
      await loadVideos(actualChannelId);

      const insertedCount = result.inserted_or_updated || 0;
      if (insertedCount > 0) {
        toast.success(`✅ 분석 완료: ${insertedCount}개의 새 영상을 발견했습니다`);
      } else {
        toast.success(`✅ 분석 완료: 새 영상이 없습니다`);
      }
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast.error(error.message || "채널 분석 중 오류가 발생했습니다");
    }
  };

  useEffect(() => {
    if (!isSyncing && currentChannelId) {
      loadVideos(currentChannelId);
    }
  }, [isSyncing]);

  // Basic metrics
  const totalVideos = videos.length;
  const totalViews = videos.reduce((sum, v) => sum + v.views, 0);
  const latestUpload =
    videos.length > 0
      ? videos.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())[0].uploadDate
      : "없음";

  // Use channel stats from state
  const subscriberCount = channelStats?.subscriberCount || 0;
  const channelTotalViews = channelStats?.totalViews || 0;
  const hiddenSubscriber = channelStats?.hiddenSubscriber || false;

  const isLoading = loading || isSyncing;

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
          <ChannelInput onAnalyze={handleAnalyze} loading={isLoading} />

          {/* Sync Progress Bar */}
          {isSyncing && (
            <div className="w-full max-w-3xl mt-4">
              <div className="flex flex-col gap-2">
                <div className="text-sm text-muted-foreground">동기화 중...</div>
                <SyncProgress progress={syncProgress} error={!!syncError} />
              </div>
            </div>
          )}

          {syncError && <div className="text-destructive text-sm mt-2">{syncError}</div>}
        </div>

        {/* Quantity Section */}
        <section className="mb-8">
          <h3 className="text-sm font-semibold mb-3 text-foreground">Quantity</h3>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <SkeletonCard key={`qty-${i}`} className="h-32" />
              ))}
            </div>
          ) : (
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
          )}
        </section>

        {/* Quality Section - 2 Rows */}
        <section className="mb-12">
          <QuantityQuality videos={videoRows} loading={isLoading} uploadFrequency={uploadFrequency} />
        </section>

        {/* Views Trend & Topic Chart - Side by Side */}
        <section className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ViewsTrend videos={videoRows} loading={isLoading} />
            <TopicChart videos={videos} loading={isLoading} />
          </div>
        </section>

        {/* Video Table */}
        <VideoTable videos={videos} loading={isLoading} />

        {/* Footer */}
        <footer className="text-center mt-12 text-muted-foreground text-sm">Powered by Supabase + Lovable</footer>
      </div>
    </div>
  );
};

export default Index;
