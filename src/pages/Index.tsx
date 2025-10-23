import { useState, useEffect } from "react";
import { ChannelInput } from "@/components/ChannelInput";
import { MetricsCard } from "@/components/MetricsCard";
import { VideoTable } from "@/components/VideoTable";
import { TopicChart } from "@/components/TopicChart";
import { SettingsModal } from "@/components/SettingsModal";
import { YouTubeVideo } from "@/lib/youtubeApi";
import { VideoRow, SyncResponse, UploadFrequency } from "@/lib/types";
import { getSupabaseClient, hasSupabaseCredentials } from "@/lib/supabaseClient";
import { syncNewVideos, syncQuickCheck } from "@/lib/edge";
import { fetchAllVideosByChannel } from "@/lib/supabasePaging";
import { Video, Eye, Calendar, Users } from "lucide-react";
import { toast } from "sonner";
import { formatInt } from "@/utils/format";
import { Badge } from "@/components/ui/badge";
import { useSync } from "@/hooks/useSync";
import SyncProgress from "@/components/SyncProgress";
import QuantityQuality from "@/components/QuantityQuality";
import ViewsTrend from "@/components/ViewsTrend";
import SkeletonCard from "@/components/SkeletonCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [showResyncDialog, setShowResyncDialog] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string>("");
  const { isSyncing, progress: syncProgress, currentCount, totalCount, error: syncError, startSync } = useSync();

  const loadVideos = async (channelId: string) => {
    console.log('🔍 Loading videos for channel:', channelId);
    setLoading(true);
    try {
      // 전체 로드 (페이지네이션으로 1000개 제한 해제)
      const { data: allVideos, count: totalCount } = await fetchAllVideosByChannel<any>(
        channelId,
        "*",
        "upload_date",
        false
      );

      console.log('📊 Total videos in DB:', totalCount);
      console.log('✅ All videos loaded:', allVideos.length);

      const mappedVideos: YouTubeVideo[] = allVideos.map((v: any) => ({
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

      const mappedRows: VideoRow[] = allVideos.map((v: any) => ({
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
    } catch (error) {
      console.error("❌ Load videos error:", error);
    } finally {
      setLoading(false);
    }
  };

  const performSync = async (url: string, fullSync: boolean, knownChannelId?: string) => {
    try {
      console.log('🚀 Starting performSync:', { url, fullSync, knownChannelId });

      // 동기화 시작 (useSync의 startSync가 Edge Function 호출 포함)
      const result = await startSync(url, fullSync);
      console.log('📦 Sync result:', result);
      
      // channelId 확인
      const channelId = knownChannelId || result?.channelId;
      if (!channelId) throw new Error("채널 ID를 확인할 수 없습니다.");
      
      console.log('✅ Using channelId:', channelId);
      setCurrentChannelId(channelId);

      // ✅ uploadFrequency 설정 추가!
      if (result?.uploadFrequency) {
        console.log('📊 Setting uploadFrequency:', result.uploadFrequency);
        setUploadFrequency(result.uploadFrequency);
      } else {
        console.warn('⚠️ No uploadFrequency in result');
      }

      // 채널 통계 갱신
      const supabase = getSupabaseClient();
      const { data: channelData } = await supabase
        .from("youtube_channels")
        .select("subscriber_count, total_views, channel_name, total_videos")
        .eq("channel_id", channelId)
        .maybeSingle();

      console.log('📈 Channel data:', channelData);

      if (channelData) {
        setChannelStats({
          subscriberCount: channelData.subscriber_count || 0,
          totalViews: channelData.total_views || 0,
          hiddenSubscriber: false,
        });
      }

      // 영상 목록 로드
      await loadVideos(channelId);

      // 실제 개수 확인
      const { count: actualCount } = await supabase
        .from("youtube_videos")
        .select("video_id", { count: "exact", head: true })
        .eq("channel_id", channelId);

      console.log('✅ Total videos in DB:', actualCount);

      // 성공 메시지
      const insertedCount = result?.inserted_or_updated || actualCount || 0;
      if (fullSync) {
        toast.success(`✅ 전체 분석 완료: ${insertedCount}개 영상`);
      } else if (insertedCount > 0) {
        toast.success(`✅ 분석 완료: ${insertedCount}개의 새 영상 추가`);
      } else {
        toast.success(`✅ 분석 완료: 새 영상이 없습니다`);
      }
    } catch (error: any) {
      console.error("❌ Sync error:", error);
      toast.error(error.message || "동기화 중 오류가 발생했습니다");
    }
  };

  const handleAnalyze = async (url: string) => {
    try {
      if (!hasSupabaseCredentials()) {
        toast.error("Settings에서 Supabase URL/Anon Key를 설정하세요");
        return;
      }

      console.log('🔍 Analyzing:', url);

      // 채널 존재 확인 & 기존 개수 체크 (quickCheck 사용)
      const { channelId, totalVideos } = await syncQuickCheck(url);
      console.log('📡 QuickCheck result:', { channelId, totalVideos });

      const supabase = getSupabaseClient();
      const { count: existingCount } = await supabase
        .from("youtube_videos")
        .select("video_id", { count: "exact", head: true })
        .eq("channel_id", channelId);

      console.log('📊 Existing videos for channelId', channelId, ':', existingCount);

      if (existingCount && existingCount > 10) {
        // 재분석 - 다이얼로그 표시
        setPendingUrl(url);
        setShowResyncDialog(true);
        return;
      }

      // 최초 분석 - 바로 실행
      console.log('🆕 First time analysis - full sync');
      await performSync(url, true, channelId);

    } catch (error: any) {
      console.error("❌ Analysis error:", error);
      toast.error(error.message || "채널 분석 중 오류가 발생했습니다");
    }
  };

  const handleResyncConfirm = async (incrementalOnly: boolean) => {
    setShowResyncDialog(false);
    const fullSync = !incrementalOnly;
    
    if (fullSync) {
      toast.info("전체 재분석을 시작합니다...");
    } else {
      toast.info("새로운 영상만 확인합니다...");
    }

    // quickCheck로 channelId 먼저 가져오기
    try {
      const { channelId } = await syncQuickCheck(pendingUrl);
      await performSync(pendingUrl, fullSync, channelId);
    } catch (error: any) {
      console.error("Resync error:", error);
      toast.error(error.message || "재분석 중 오류가 발생했습니다");
    }
    setPendingUrl("");
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

  // 통합 스켈레톤 상태: 동기화 중이거나 데이터 로딩 중일 때
  const isLoading = loading || isSyncing;
  const isSkeleton = loading || isSyncing;

  return (
    <div className="min-h-screen bg-background">
      <SettingsModal />

      {/* 재분석 확인 다이얼로그 */}
      <AlertDialog open={showResyncDialog} onOpenChange={setShowResyncDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>이미 분석한 채널입니다</AlertDialogTitle>
            <AlertDialogDescription>
              새로운 데이터만 분석하시겠습니까?
              <br />
              <span className="text-xs text-muted-foreground mt-2 block">
                • 예: 최근 업로드된 영상만 추가 (빠름)
                <br />
                • 아니오: 모든 영상 재분석 (느림, API 할당량 소모)
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => handleResyncConfirm(false)}>
              아니오 (전체 재분석)
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => handleResyncConfirm(true)}>
              예 (새 영상만)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
              <SyncProgress 
                progress={syncProgress} 
                error={!!syncError}
                currentCount={currentCount}
                totalCount={totalCount}
              />
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
            <ViewsTrend videos={videoRows} loading={isSkeleton} />
            <TopicChart videos={videos} loading={isSkeleton} />
          </div>
        </section>

        {/* Video Table */}
        <VideoTable videos={videos} loading={isSkeleton} />

        {/* Footer */}
        <footer className="text-center mt-12 text-muted-foreground text-sm">Powered by Supabase + Lovable</footer>
      </div>
    </div>
  );
};

export default Index;
