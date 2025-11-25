import { useState, useEffect } from "react";
import { ChannelInput } from "@/components/ChannelInput";
import { MetricsCard } from "@/components/MetricsCard";
import { VideoTable } from "@/components/VideoTable";
import TopVideosChart from "@/components/TopVideosChart";
import { YouTubeVideo } from "@/lib/youtubeApi";
import { VideoRow, SyncResponse, UploadFrequency, SubscriptionRates, CommentStats } from "@/lib/types";
import { getSupabaseClient, hasSupabaseCredentials } from "@/lib/supabaseClient";
import { ensureApiConfiguredDetailed } from "@/lib/settings/actions";
import { toast } from "@/lib/toast";
import { syncNewVideos, syncQuickCheck } from "@/lib/edge";
import { fetchAllVideosByChannel } from "@/lib/supabasePaging";
import { Video, Eye, Calendar, Users, Plus, Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatInt } from "@/utils/format";
import { formatMetric } from "@/utils/formatMetric";
import { useDataContext } from "@/contexts/DataContext";
import { Badge } from "@/components/ui/badge";
import { useSync } from "@/hooks/useSync";
import SyncProgress from "@/components/SyncProgress";
import QuantityQuality from "@/components/QuantityQuality";
import ViewsTrend from "@/components/ViewsTrend";
import SkeletonCard from "@/components/SkeletonCard";
import GlobalBusyOverlay from "@/components/GlobalBusyOverlay";
import { useBodyLock } from "@/hooks/useBodyLock";
import { cn } from "@/lib/utils";
import { SectionCard } from "@/components/ui/card";
import Footer from "@/components/Footer";
import ChannelSummary from "@/components/ChannelSummary";
import { useChannelBundle } from "@/hooks/useChannelBundle";
import { useAuth } from "@/hooks/useAuth";
import { useAnalysisLogs } from "@/contexts/AnalysisLogsContext";
import type { AnalysisLog } from "@/contexts/AnalysisLogsContext";
import { AuthGateModal } from "@/components/AuthGateModal";
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
  const { user } = useAuth();
  const { addOptimistic, commitInsert, refreshLogs } = useAnalysisLogs();
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [videoRows, setVideoRows] = useState<VideoRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [channelStats, setChannelStats] = useState<{
    subscriberCount: number;
    totalViews: number;
    hiddenSubscriber: boolean;
  } | null>(null);
  const [currentChannelId, setCurrentChannelId] = useState<string>("");
  const [currentChannelName, setCurrentChannelName] = useState<string>("");
  const [uploadFrequency, setUploadFrequency] = useState<UploadFrequency | undefined>(undefined);
  const [subscriptionRates, setSubscriptionRates] = useState<SubscriptionRates | undefined>(undefined);
  const [commentStats, setCommentStats] = useState<CommentStats | undefined>(undefined);
  const [showResyncDialog, setShowResyncDialog] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string>("");
  const [isHydrating, setIsHydrating] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const { isSyncing, progress: syncProgress, currentCount, totalCount, startTime: syncStartTime, error: syncError, startSync } = useSync();
  
  // DataContext for global isLoaded/hasData state
  const { isLoaded, hasData, setIsLoaded, setHasData } = useDataContext();

  // Summary 데이터 훅
  const { loading: loadingSummary, channelName: summaryChannelName, videos: summaryVideos, uploadFrequency: summaryUploadFreq } = useChannelBundle(currentChannelId);

  // 전역 busy 상태
  const isBusy = isSyncing || isHydrating;

  // 스크롤 잠금
  useBodyLock(isBusy);

  const loadVideos = async (channelId: string) => {
    console.log("🔍 Loading videos for channel:", channelId);
    setLoading(true);
    try {
      // 전체 로드 (페이지네이션으로 1000개 제한 해제)
      const { data: allVideos, count: totalCount } = await fetchAllVideosByChannel<any>(
        channelId,
        "*",
        "upload_date",
        false,
      );

      console.log("📊 Total videos in DB:", totalCount);
      console.log("✅ All videos loaded:", allVideos.length);

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
        thumbnail_url: v.thumbnail_url,
        video_id: v.video_id,
      }));
      setVideoRows(mappedRows);

      // Update data context
      setIsLoaded(true);
      setHasData(allVideos.length > 0);
    } catch (error) {
      console.error("❌ Load videos error:", error);
    } finally {
      setLoading(false);
    }
  };

  const hydrateAll = async (channelId: string) => {
    setIsHydrating(true);
    try {
      await loadVideos(channelId);
    } finally {
      setIsHydrating(false);
    }
  };

  const performSync = async (url: string, fullSync: boolean, knownChannelId?: string, optimisticId?: string): Promise<{ channelId: string; canonicalUrl?: string }> => {
    let finish: (() => void) | undefined;
    const supabaseClient = getSupabaseClient();

    try {
      console.log("🚀 Starting performSync:", { url, fullSync, knownChannelId });

      // ✅ 1. 동기화 시작
      const syncResult = await startSync(url, fullSync);
      finish = syncResult?.finish;
      console.log("📦 Sync result:", syncResult);

      // channelId 확인
      const channelId = knownChannelId || syncResult?.channelId;
      if (!channelId) throw new Error("채널 ID를 확인할 수 없습니다.");

      console.log("✅ Using channelId:", channelId);
      setCurrentChannelId(channelId);

      // ✅ 2. 재분석인지 확인 (기존 로그가 있는지)
      let existingLogId: string | number | null = null;
      if (user?.id && channelId) {
        const { data: existingLog } = await supabaseClient
          .from('analysis_logs')
          .select('id')
          .eq('user_id', user.id)
          .eq('channel_id', channelId)
          .maybeSingle();
        
        if (existingLog) {
          existingLogId = existingLog.id;
          console.log('📝 Found existing log, will update:', existingLogId);
        }
      }

      // ✅ 3. 재분석일 경우 기존 영상 데이터 삭제
      if (existingLogId && channelId) {
        console.log('🗑️ Deleting old video data for re-analysis');
        await supabaseClient
          .from('youtube_videos')
          .delete()
          .eq('channel_id', channelId);
      }

      // ✅ uploadFrequency 설정
      if (syncResult?.uploadFrequency) {
        console.log("📊 Setting uploadFrequency:", syncResult.uploadFrequency);
        setUploadFrequency(syncResult.uploadFrequency);
      } else {
        console.warn("⚠️ No uploadFrequency in result");
      }

      // ✅ subscriptionRates 설정
      if (syncResult?.subscriptionRates) {
        console.log("📊 Setting subscriptionRates:", syncResult.subscriptionRates);
        setSubscriptionRates(syncResult.subscriptionRates);
      }

      // 채널 통계 갱신
      const { data: channelData } = await supabaseClient
        .from("youtube_channels")
        .select("subscriber_count, total_views, channel_name, total_videos")
        .eq("channel_id", channelId)
        .maybeSingle();

      console.log("📈 Channel data:", channelData);

      if (channelData) {
        const channel = channelData as any;
        setChannelStats({
          subscriberCount: channel.subscriber_count || 0,
          totalViews: channel.total_views || 0,
          hiddenSubscriber: false,
        });
        setCurrentChannelName(channel.channel_name || "");
      }

      // 📝 Incremental comment tracking
      try {
        console.log("💬 Starting comment scan...");
        const { fullScanComments, deltaScanComments, logRun } = await import('@/lib/youtube/delta');
        const { fetchCommentStats } = await import('@/lib/stats/comments');
        
        // Get YouTube Data API key
        const settings = await supabaseClient.from('user_settings').select('api_youtube_key').eq('user_id', user?.id).maybeSingle();
        const apiKey = (settings?.data as any)?.api_youtube_key || localStorage.getItem('ya_youtube_key') || '';
        
        if (apiKey) {
          // Check if this channel has been scanned before
          const { data: existingVideos } = await supabaseClient
            .from('yta_channel_videos')
            .select('video_id', { count: 'exact', head: true })
            .eq('channel_id', channelId);

          let commentResult;
          if ((existingVideos?.length ?? 0) === 0) {
            // First scan: full
            console.log("💬 Full comment scan");
            commentResult = await fullScanComments(supabaseClient, apiKey, channelId);
            await logRun(supabaseClient, user?.id, channelId, 'full', {
              added: commentResult.added,
              touched: commentResult.touched,
              commentsDelta: commentResult.commentsDelta,
              totalAfter: commentResult.totalAfter
            });
          } else {
            // Subsequent scans: delta + backfill
            console.log("💬 Delta comment scan with backfill");
            commentResult = await deltaScanComments(supabaseClient, apiKey, channelId, 200);
            await logRun(supabaseClient, user?.id, channelId, 'delta', {
              added: commentResult.added,
              touched: commentResult.touched,
              commentsDelta: commentResult.commentsDelta,
              totalAfter: commentResult.totalAfter
            });
          }

          // Update commentStats from DB aggregation
          const stats = await fetchCommentStats(supabaseClient, channelId);
          setCommentStats({
            total: stats.total,
            maxPerVideo: stats.max,
            minPerVideo: stats.min,
            avgPerVideo: stats.avg
          });

          console.log("✅ Comment scan completed:", commentResult);
        }
      } catch (commentError: any) {
        console.warn("⚠️ Comment scan failed:", commentError);
        // Continue with normal flow even if comment scan fails
      }

      // 모든 데이터 로딩 (병렬)
      await hydrateAll(channelId);

      // 실제 개수 확인
      const { count: actualCount } = await supabaseClient
        .from("youtube_videos")
        .select("video_id", { count: "exact", head: true })
        .eq("channel_id", channelId);

      console.log("✅ Total videos in DB:", actualCount);

      // 성공 메시지
      const insertedCount = syncResult?.inserted_or_updated || actualCount || 0;
      if (fullSync) {
        toast.success(`전체 분석 완료: ${insertedCount}개 영상`);
      } else if (insertedCount > 0) {
        toast.success(`분석 완료: ${insertedCount}개의 새 영상 추가`);
      } else {
        toast.success(`분석 완료: 새 영상이 없습니다`);
      }

      // ✅ 스냅샷 데이터 준비 (로그와 함께 저장)
      let snapshotData: any = null;
      if (user?.id) {
        try {
          // 현재 분석된 모든 영상 데이터 가져오기
          const { data: currentVideos } = await supabaseClient
            .from('youtube_videos')
            .select('*')
            .eq('channel_id', channelId)
            .order('upload_date', { ascending: false });

          snapshotData = {
            channelId,
            channelName: channelData?.channel_name || currentChannelName,
            channelStats: {
              subscriberCount: channelData?.subscriber_count || 0,
              totalViews: channelData?.total_views || 0,
              hiddenSubscriber: false,
            },
            uploadFrequency,
            subscriptionRates,
            commentStats,
            videos: currentVideos || [],
            analyzedAt: new Date().toISOString(),
            videoCount: currentVideos?.length || 0,
          };

          console.log('✅ Snapshot prepared with', currentVideos?.length || 0, 'videos');
        } catch (snapshotError) {
          console.warn('⚠️ Failed to prepare snapshot:', snapshotError);
        }
      }

      // ✅ 로그 저장 또는 업데이트 (스냅샷 포함)
      if (user?.id && snapshotData) {
        if (existingLogId) {
          // 기존 로그 업데이트
          console.log('🔄 Updating existing log:', existingLogId);
          await supabaseClient
            .from('analysis_logs')
            .update({
              video_count: snapshotData.videoCount,
              analyzed_at: new Date().toISOString(),
              snapshot_data: snapshotData,
              channel_name: channelData?.channel_name || currentChannelName,
              channel_url: url,
            })
            .eq('id', Number(existingLogId));
          
          toast.success('분석 로그가 업데이트되었습니다.');
        } else if (optimisticId) {
          // 새 로그 생성
          console.log('✨ Creating new log');
          await commitInsert(
            channelData?.channel_name || url, 
            optimisticId,
            { 
              channel_id: channelId, 
              channel_url: url,
              video_count: snapshotData.videoCount,
              snapshot_data: snapshotData,
            }
          );
        }
        
        // 로그 새로고침
        await refreshLogs();
      }

      // ✅ 모든 데이터 로딩이 완료된 후 동기화 상태 종료
      finish?.();

      return { channelId, canonicalUrl: url };
    } catch (error: any) {
      console.error("❌ Sync error:", error);
      toast.error(error.message || "동기화 중 오류가 발생했습니다");
      // 에러 시에도 finish 호출
      finish?.();
      throw error;
    }
  };

  const handleAnalyze = async (url: string) => {
    // Check if user is logged in
    if (!user) {
      setShowAuthGate(true);
      return;
    }

    try {
      // API 설정 검증 (필수 3종만)
      const supabase = getSupabaseClient();
      const { ok, missing } = await ensureApiConfiguredDetailed(supabase);
      if (!ok) {
        const miss = [
          missing.supabaseUrl ? "Supabase URL" : null,
          missing.supabaseAnon ? "Supabase Anon Key" : null,
          missing.ytDataApi ? "YouTube Data API" : null,
        ].filter(Boolean).join(", ");
        toast.error(`다음 필수 항목을 설정해 주세요: ${miss}`);
        return;
      }

      console.log("🔍 Analyzing:", url);

      // 채널 존재 확인 & 기존 개수 체크 (quickCheck 사용)
      const { channelId, totalVideos } = await syncQuickCheck(url);
      console.log("📡 QuickCheck result:", { channelId, totalVideos });

      const { count: existingCount } = await supabase
        .from("youtube_videos")
        .select("video_id", { count: "exact", head: true })
        .eq("channel_id", channelId);

      console.log("📊 Existing videos for channelId", channelId, ":", existingCount);

      if (existingCount && existingCount > 10) {
        // 재분석 - 다이얼로그 표시
        setPendingUrl(url);
        setShowResyncDialog(true);
        return;
      }

      // 최초 분석 - 바로 실행
      console.log("🆕 First time analysis - full sync");
      const optimisticId = addOptimistic(url.trim(), { channel_id: channelId, channel_url: url });
      await performSync(url, true, channelId, optimisticId);
    } catch (error: any) {
      console.error("❌ Analysis error:", error);
      toast.error(error.message || "분석 중 오류가 발생했습니다");
    }
  };

  const handleResyncConfirm = async (deltaOnly: boolean) => {
    setShowResyncDialog(false);
    if (!pendingUrl) return;

    try {
      const supabase = getSupabaseClient();
      const { channelId } = await syncQuickCheck(pendingUrl);
      
      const optimisticId = addOptimistic(pendingUrl.trim(), { channel_id: channelId, channel_url: pendingUrl });
      
      if (deltaOnly) {
        console.log("🔄 Delta sync (new videos only)");
        await performSync(pendingUrl, false, channelId, optimisticId);
      } else {
        console.log("🔁 Full resync (all videos)");
        await performSync(pendingUrl, true, channelId, optimisticId);
      }
    } catch (error: any) {
      console.error("❌ Resync error:", error);
      toast.error(error.message || "재분석 중 오류가 발생했습니다");
    } finally {
      setPendingUrl("");
    }
  };

  const handleHistoryClick = async (log: AnalysisLog) => {
    if (!user) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    try {
      console.log('[HISTORY] Loading log:', log);

      // ✅ 로그에 저장된 스냅샷 데이터 사용
      if (log.snapshot_data) {
        const snapshot = log.snapshot_data as any;
        
        console.log('[HISTORY] Using log snapshot with', snapshot.videos?.length || 0, 'videos from', snapshot.analyzedAt);
        
        // 상태 복원
        if (snapshot.channelId) setCurrentChannelId(snapshot.channelId);
        if (snapshot.channelName) setCurrentChannelName(snapshot.channelName);
        if (snapshot.channelStats) setChannelStats(snapshot.channelStats);
        if (snapshot.uploadFrequency) setUploadFrequency(snapshot.uploadFrequency);
        if (snapshot.subscriptionRates) setSubscriptionRates(snapshot.subscriptionRates);
        if (snapshot.commentStats) setCommentStats(snapshot.commentStats);
        
        // ✅ 스냅샷에 저장된 영상 데이터 직접 사용
        if (snapshot.videos && snapshot.videos.length > 0) {
          const mappedVideos: YouTubeVideo[] = snapshot.videos.map((v: any) => ({
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

          const mappedRows: VideoRow[] = snapshot.videos.map((v: any) => ({
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
            thumbnail_url: v.thumbnail_url,
            video_id: v.video_id,
          }));
          setVideoRows(mappedRows);
        } else {
          // 영상이 없는 경우 빈 배열
          setVideos([]);
          setVideoRows([]);
        }
        
        setIsLoaded(true);
        setHasData(snapshot.videos && snapshot.videos.length > 0);
        
        const analyzedDate = snapshot.analyzedAt 
          ? new Date(snapshot.analyzedAt).toLocaleDateString('ko-KR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })
          : '';
        toast.success(`${analyzedDate} 분석 데이터 (${snapshot.videos?.length || 0}개 영상)`);
      } else {
        // 스냅샷이 없는 구 버전 로그
        console.log('[HISTORY] No snapshot in log, re-analyzing');
        toast.info('이전 버전 로그입니다. 재분석을 시작합니다.');
        const url = log.channel_url || log.channel_name;
        const optimisticId = addOptimistic(url, { 
          channel_id: log.channel_id || undefined, 
          channel_url: log.channel_url || undefined 
        });
        await performSync(url, true, log.channel_id || undefined, optimisticId);
      }
    } catch (error: any) {
      console.error("❌ History load error:", error);
      toast.error("데이터를 불러오지 못했습니다.");
    }
  };

  // Listen for history item clicks
  useEffect(() => {
    const handleLoadFromHistory = async (event: CustomEvent<{ log: AnalysisLog }>) => {
      await handleHistoryClick(event.detail.log);
    };

    window.addEventListener('loadAnalysisFromHistory', handleLoadFromHistory as EventListener);
    return () => {
      window.removeEventListener('loadAnalysisFromHistory', handleLoadFromHistory as EventListener);
    };
  }, [user]);

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
  const isLoading = loading || isBusy;
  const isSkeleton = isBusy;

  return (
    <div className="min-h-screen bg-background relative">
      {/* 전역 블러 오버레이 */}
      <GlobalBusyOverlay
        open={isBusy}
        message="분석 중입니다..."
        progress={syncProgress}
        currentCount={currentCount}
        totalCount={totalCount}
        startTime={syncStartTime}
      />

      {/* 실제 컨텐츠: isBusy일 때 흐림 + 클릭 차단 */}
      <div
        className={cn("transition duration-200", isBusy ? "blur-sm pointer-events-none select-none" : "")}
        aria-busy={isBusy}
      >
        {/* Auth Gate Modal */}
        <AuthGateModal open={showAuthGate} onOpenChange={setShowAuthGate} />

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
                  <br />• 아니오: 모든 영상 재분석 (느림, API 할당량 소모)
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => handleResyncConfirm(false)}>아니오 (전체 재분석)</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleResyncConfirm(true)}>예 (새 영상만)</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6 w-full min-w-0">
            {/* 페이지 헤더 */}
            <div className="flex flex-col gap-4">
              {/* 상단: 제목 + 설명 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-white tracking-tight">
                    Dashboard
                  </h1>
                  <p className="text-sm text-gray-400 mt-1">
                    유튜브 채널의 상세 데이터를 분석하고 시각화합니다
                  </p>
                </div>
                
                {/* 액션 버튼 그룹 */}
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                  <Button 
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600 gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    New Analysis
                  </Button>
                </div>
              </div>

              {/* 채널 입력 카드 */}
              <div className="bg-[#141414] rounded-xl p-6 border border-[#27272a]">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-gray-400" />
                    <h2 className="text-lg font-semibold text-white">채널 분석</h2>
                  </div>
                  <ChannelInput onAnalyze={handleAnalyze} loading={isLoading} />
                </div>
              </div>
            </div>

            {/* Channel Summary */}
            <section className="mb-8">
            <SectionCard title="Summary">
              <ChannelSummary 
                channelId={currentChannelId}
                channelName={summaryChannelName || currentChannelName}
                videos={summaryVideos as any}
                uploadFrequency={summaryUploadFreq as any}
              />
              {loadingSummary && (
                <div className="mt-2 text-sm text-muted-foreground">요약 데이터를 불러오는 중…</div>
              )}
            </SectionCard>
          </section>

          {/* Quantity Section */}
          <section className="mb-8">
            <SectionCard title="Quantity">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricsCard
                  title="총 구독자 수"
                  value={
                    <div className="flex items-center gap-2">
                      <span>
                        {formatMetric(subscriberCount, {
                          showPlus: true,
                          isLoaded,
                          hasData
                        })}
                      </span>
                      {hiddenSubscriber && (
                        <Badge variant="secondary" className="text-xs">
                          숨김
                        </Badge>
                      )}
                    </div>
                  }
                  icon={Users}
                  description="채널 구독자"
                  infoTooltip="YouTube API 특성상 대형 채널의 구독자 수는 반올림/비공개 등으로 정확치 않을 수 있습니다."
                />
                <MetricsCard 
                  title="총 영상 수" 
                  value={formatMetric(totalVideos, { isLoaded, hasData })} 
                  icon={Video} 
                  description="분석된 영상" 
                />
                <MetricsCard
                  title="총 조회수"
                  value={formatMetric(channelTotalViews || totalViews, { isLoaded, hasData })}
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
            </SectionCard>
          </section>

          {/* Quality Section - 5 Rows */}
          <section className="mb-12">
            <QuantityQuality 
              videos={videoRows} 
              loading={false} 
              uploadFrequency={uploadFrequency}
              subscriptionRates={subscriptionRates}
              commentStats={commentStats}
              isLoaded={isLoaded}
              hasData={hasData}
            />
          </section>

          {/* Views Trend & Top Videos Chart - Side by Side */}
          <section className="mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ViewsTrend 
                videos={videoRows} 
                loading={isSkeleton}
                channelTotalViews={channelStats?.totalViews}
              />
              <TopVideosChart 
                videos={videos} 
                loading={isSkeleton}
                channelTotalViews={channelStats?.totalViews}
              />
            </div>
          </section>

            {/* Video Table */}
            <VideoTable videos={videos} loading={isSkeleton} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
