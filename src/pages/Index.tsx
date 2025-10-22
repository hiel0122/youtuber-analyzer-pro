import { useState } from 'react';
import { ChannelInput } from '@/components/ChannelInput';
import { MetricsCard } from '@/components/MetricsCard';
import { VideoTable } from '@/components/VideoTable';
import { ViewsChart } from '@/components/ViewsChart';
import { TopicChart } from '@/components/TopicChart';
import { SettingsModal } from '@/components/SettingsModal';
import { fetchChannelVideos, YouTubeVideo, fetchChannelStats } from '@/lib/youtubeApi';
import { getSupabaseClient, hasSupabaseCredentials } from '@/lib/supabaseClient';
import { Video, Eye, ThumbsUp, Calendar, Users, Clock, Zap, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { formatInt } from '@/utils/format';
import { Badge } from '@/components/ui/badge';

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
      // First, fetch channel stats and upsert to Supabase
      if (hasSupabaseCredentials()) {
        try {
          const stats = await fetchChannelStats(url);
          if (!stats) {
            toast.error('채널을 찾을 수 없습니다');
            return;
          }

          const supabase = getSupabaseClient();
          
          // Call RPC to upsert channel stats
          const { error: rpcError } = await supabase.rpc('upsert_channel_stats', {
            p_channel_input: url,
            p_title: stats.title,
            p_subscribers: stats.subscriberCount,
            p_views: stats.viewCount,
            p_hidden: stats.hiddenSubscriberCount,
          });

          if (rpcError) {
            console.error('RPC error:', rpcError);
            toast.error('채널 통계 저장 중 오류가 발생했습니다');
          } else {
            // Fetch updated channel data
            const { data: channelData } = await supabase
              .from('channels')
              .select('subscriber_count, view_count, hidden_subscriber')
              .eq('id', url)
              .single();

            if (channelData) {
              setChannelStats({
                subscriberCount: channelData.hidden_subscriber ? 0 : (channelData.subscriber_count || 0),
                totalViews: channelData.view_count || 0,
                hiddenSubscriber: channelData.hidden_subscriber || false,
              });
            }
          }
        } catch (error) {
          console.error('Channel stats error:', error);
          toast.error('채널 통계 조회 중 오류가 발생했습니다');
        }
      }

      // Then fetch videos
      const fetchedVideos = await fetchChannelVideos(url, (current, total) => {
        setProgress({ current, total });
      });
      
      setVideos(fetchedVideos);

      // Save videos to Supabase if configured
      if (hasSupabaseCredentials()) {
        try {
          const supabase = getSupabaseClient();
          
          // Upsert videos (update if exists, insert if not)
          const { error } = await supabase
            .from('youtube_videos')
            .upsert(
              fetchedVideos.map(video => ({
                video_id: video.videoId,
                channel_id: url,
                title: video.title,
                topic: video.topic,
                presenter: video.presenter,
                views: video.views,
                likes: video.likes,
                dislikes: video.dislikes,
                upload_date: video.uploadDate,
                duration: video.duration,
                url: video.url
              })),
              { onConflict: 'video_id' }
            );

          if (error) {
            console.error('Supabase error:', error);
            toast.error('데이터 저장 중 오류가 발생했습니다');
          } else {
            toast.success(`${fetchedVideos.length}개의 영상을 분석했습니다`);
          }
        } catch (error) {
          console.error('Supabase error:', error);
          toast.error('Supabase 연결 오류');
        }
      } else {
        toast.success(`${fetchedVideos.length}개의 영상을 분석했습니다`);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('채널 분석 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  // Basic metrics
  const totalVideos = videos.length;
  const totalViews = videos.reduce((sum, v) => sum + v.views, 0);
  const avgViews = videos.length > 0 ? Math.round(totalViews / videos.length) : 0;
  const avgLikes = videos.length > 0 
    ? Math.round(videos.reduce((sum, v) => sum + v.likes, 0) / videos.length)
    : 0;
  const latestUpload = videos.length > 0
    ? videos.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())[0].uploadDate
    : '없음';

  // Quality metrics (longform/shortform based on duration)
  const parseDurationToSeconds = (duration: string): number => {
    const parts = duration.split(':').map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return 0;
  };

  const longformCount = videos.filter(v => parseDurationToSeconds(v.duration) >= 60).length;
  const shortformCount = videos.filter(v => parseDurationToSeconds(v.duration) < 60).length;
  
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
          <p className="text-muted-foreground text-lg">
            유튜브 채널의 영상 데이터를 분석하고 시각화하세요
          </p>
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
                    <Badge variant="secondary" className="text-xs">숨김</Badge>
                  )}
                </div>
              }
              icon={Users}
              description="채널 구독자"
            />
            <MetricsCard
              title="총 영상 수"
              value={formatInt(totalVideos)}
              icon={Video}
              description="분석된 영상"
            />
            <MetricsCard
              title="총 조회수"
              value={formatInt(channelTotalViews || totalViews)}
              icon={Eye}
              description="전체 조회수"
            />
            <MetricsCard
              title="최근 업로드"
              value={latestUpload}
              icon={Calendar}
              description="마지막 업로드일"
            />
          </div>
        </section>

        {/* Quality Section */}
        <section className="mb-12">
          <h3 className="text-sm font-semibold mb-3 text-foreground">Quality</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricsCard
              title="롱폼 개수(≥60s)"
              value={formatInt(longformCount)}
              icon={Clock}
              description="60초 이상"
            />
            <MetricsCard
              title="숏폼 개수(≤60s)"
              value={formatInt(shortformCount)}
              icon={Zap}
              description="60초 미만"
            />
            <MetricsCard
              title="평균 조회수"
              value={formatInt(avgViews)}
              icon={TrendingUp}
              description="영상당 평균"
            />
            <MetricsCard
              title="평균 좋아요"
              value={formatInt(avgLikes)}
              icon={ThumbsUp}
              description="영상당 평균"
            />
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
        <footer className="text-center mt-12 text-muted-foreground text-sm">
          Powered by Supabase + Lovable
        </footer>
      </div>
    </div>
  );
};

export default Index;
