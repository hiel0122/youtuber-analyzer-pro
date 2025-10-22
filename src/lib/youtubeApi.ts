export interface YouTubeVideo {
  videoId: string;
  title: string;
  topic: string;
  presenter: string;
  views: number;
  likes: number;
  dislikes: number;
  uploadDate: string;
  duration: string;
  url: string;
}

const getYouTubeApiKey = () => {
  return localStorage.getItem('ya_youtube_key') || '';
};

export const setYouTubeApiKey = (key: string) => {
  localStorage.setItem('ya_youtube_key', key);
};

export const hasYouTubeApiKey = () => {
  return !!localStorage.getItem('ya_youtube_key');
};

const YT_BASE = 'https://www.googleapis.com/youtube/v3';

export async function resolveChannelId(input: string): Promise<string | null> {
  const apiKey = getYouTubeApiKey();
  const v = input.trim();

  // 1) Already a channel ID (UC...)
  const mUC = v.match(/(UC[0-9A-Za-z_-]{22})/);
  if (mUC) return mUC[1];

  // 2) Handle (@handle) or URL with handle
  const mHandle = v.match(/@([a-zA-Z0-9._-]+)/);
  if (mHandle) {
    const url = `${YT_BASE}/search?part=snippet&type=channel&q=%40${mHandle[1]}&maxResults=1&key=${apiKey}`;
    const res = await fetch(url);
    const json = await res.json();
    const item = json?.items?.[0];
    return item?.snippet?.channelId ?? null;
  }

  // 3) Legacy /channel/ URL
  const mChan = v.match(/\/channel\/(UC[0-9A-Za-z_-]{22})/);
  if (mChan) return mChan[1];

  // 4) Last resort: search query
  const url = `${YT_BASE}/search?part=snippet&type=channel&q=${encodeURIComponent(v)}&maxResults=1&key=${apiKey}`;
  const res = await fetch(url);
  const json = await res.json();
  const item = json?.items?.[0];
  return item?.snippet?.channelId ?? null;
}

export type ChannelStats = {
  channelId: string;
  title: string;
  viewCount: number;
  subscriberCount: number | null;
  hiddenSubscriberCount: boolean;
};

export async function fetchChannelStats(input: string): Promise<ChannelStats | null> {
  const apiKey = getYouTubeApiKey();
  const channelId = await resolveChannelId(input);
  if (!channelId) return null;

  const url = `${YT_BASE}/channels?part=snippet,statistics&id=${channelId}&key=${apiKey}`;
  const res = await fetch(url);
  const json = await res.json();
  const item = json?.items?.[0];
  if (!item) return null;

  const s = item.statistics || {};
  const hidden = !!s.hiddenSubscriberCount;

  return {
    channelId,
    title: item.snippet?.title ?? '',
    viewCount: Number(s.viewCount ?? 0),
    subscriberCount: hidden ? null : Number(s.subscriberCount ?? 0),
    hiddenSubscriberCount: hidden,
  };
}

export const testYouTubeConnection = async (key: string): Promise<boolean> => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=@youtube&key=${key}`
    );
    return response.ok;
  } catch {
    return false;
  }
};

const CATEGORY_MAP: Record<string, string> = {
  '1': '영화/애니메이션',
  '2': '자동차/교통',
  '10': '음악',
  '15': '애완동물/동물',
  '17': '스포츠',
  '19': '여행/이벤트',
  '20': '게임',
  '22': '인물/블로그',
  '23': '코미디',
  '24': '엔터테인먼트',
  '25': '뉴스/정치',
  '26': '노하우/스타일',
  '27': '교육',
  '28': '과학/기술',
  '29': '비영리/사회운동'
};

const extractChannelId = async (url: string, apiKey: string): Promise<string | null> => {
  // Direct channel ID format
  const channelMatch = url.match(/youtube\.com\/channel\/(UC[\w-]+)/);
  if (channelMatch) return channelMatch[1];

  // Handle format
  const handleMatch = url.match(/youtube\.com\/@([\w-]+)/);
  if (handleMatch) {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=@${handleMatch[1]}&key=${apiKey}`
    );
    const data = await response.json();
    return data.items?.[0]?.id || null;
  }

  // Custom URL format
  const customMatch = url.match(/youtube\.com\/c\/([\w-]+)/);
  if (customMatch) {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${customMatch[1]}&key=${apiKey}`
    );
    const data = await response.json();
    return data.items?.[0]?.id?.channelId || null;
  }

  return null;
};

const parseDuration = (duration: string): string => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return '0:00';

  const hours = (match[1] || '').replace('H', '');
  const minutes = (match[2] || '').replace('M', '');
  const seconds = (match[3] || '').replace('S', '');

  if (hours) {
    return `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
  }
  return `${minutes || '0'}:${seconds.padStart(2, '0')}`;
};

const extractPresenter = (title: string): string => {
  // Simple heuristic: look for names in quotes or after common keywords
  const patterns = [
    /"([^"]+)"/,
    /with ([A-Z][a-z]+ [A-Z][a-z]+)/,
    /feat\. ([A-Z][a-z]+ [A-Z][a-z]+)/
  ];

  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) return match[1];
  }

  return '미정';
};

export async function getUploadsPlaylistId(channelId: string): Promise<string | null> {
  const apiKey = getYouTubeApiKey();
  const url = `${YT_BASE}/channels?part=contentDetails&id=${channelId}&key=${apiKey}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const item = data?.items?.[0];
    return item?.contentDetails?.relatedPlaylists?.uploads || null;
  } catch {
    return null;
  }
}

export function iso8601ToHMS(iso?: string): string {
  if (!iso) return "";
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  const h = Number(m?.[1] || 0);
  const min = Number(m?.[2] || 0);
  const s = Number(m?.[3] || 0);
  const pad = (x: number) => x.toString().padStart(2, "0");
  return h ? `${h}:${pad(min)}:${pad(s)}` : `${min}:${pad(s)}`;
}

/**
 * 업로드 플레이리스트에서 새 영상만 수집
 * sinceISO가 제공되면 그 이후의 영상만 반환하고, 과거 시점이 나오면 페이지네이션을 중단한다.
 */
export async function listNewUploads(
  uploadsPlaylistId: string,
  sinceISO?: string
): Promise<Array<{ videoId: string; title: string; publishedAt: string }>> {
  const apiKey = getYouTubeApiKey();
  const endpoint = `${YT_BASE}/playlistItems`;
  const items: Array<{ videoId: string; title: string; publishedAt: string }> = [];
  let pageToken = "";
  let keep = true;

  while (keep) {
    const url = new URL(endpoint);
    url.searchParams.set("part", "contentDetails,snippet");
    url.searchParams.set("playlistId", uploadsPlaylistId);
    url.searchParams.set("maxResults", "50");
    if (pageToken) url.searchParams.set("pageToken", pageToken);
    url.searchParams.set("key", apiKey);

    try {
      const res = await fetch(url.toString());
      const data = await res.json();
      
      for (const it of data?.items ?? []) {
        const vid = it?.contentDetails?.videoId;
        const publishedAt = it?.contentDetails?.videoPublishedAt || it?.snippet?.publishedAt;
        if (!vid || !publishedAt) continue;

        if (sinceISO && new Date(publishedAt) <= new Date(sinceISO)) {
          keep = false;
          break;
        }
        items.push({ videoId: vid, title: it?.snippet?.title ?? "", publishedAt });
      }

      pageToken = data?.nextPageToken ?? "";
      if (!pageToken) break;
    } catch {
      break;
    }
  }

  return items; // 최신→오래된 순서 유지
}

/**
 * videos.list로 통계/길이/제목을 묶음 조회(50개 배치)
 */
export async function fetchVideosStats(
  videoIds: string[]
): Promise<Array<{ id: string; title: string; duration: string; viewCount: number; likeCount?: number }>> {
  if (videoIds.length === 0) return [];
  const apiKey = getYouTubeApiKey();
  const endpoint = `${YT_BASE}/videos`;
  const chunks: string[][] = [];
  for (let i = 0; i < videoIds.length; i += 50) chunks.push(videoIds.slice(i, i + 50));

  const out: Array<{ id: string; title: string; duration: string; viewCount: number; likeCount?: number }> = [];
  for (const chunk of chunks) {
    const url = `${endpoint}?part=snippet,contentDetails,statistics&id=${chunk.join(",")}&key=${apiKey}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      for (const v of data?.items ?? []) {
        out.push({
          id: v.id,
          title: v?.snippet?.title ?? "",
          duration: iso8601ToHMS(v?.contentDetails?.duration),
          viewCount: Number(v?.statistics?.viewCount ?? 0),
          likeCount: v?.statistics?.likeCount ? Number(v.statistics.likeCount) : undefined,
        });
      }
    } catch {
      // 배치 실패 시 계속 진행
      continue;
    }
  }
  return out;
}

export const fetchChannelVideos = async (
  channelUrl: string,
  onProgress?: (current: number, total: number) => void
): Promise<YouTubeVideo[]> => {
  const apiKey = getYouTubeApiKey();
  if (!apiKey) {
    throw new Error('YouTube API key not configured');
  }

  const channelId = await extractChannelId(channelUrl, apiKey);
  if (!channelId) {
    throw new Error('Invalid YouTube channel URL');
  }

  try {
    // Get channel details
    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`
    );
    const channelData = await channelResponse.json();

    if (!channelData.items || channelData.items.length === 0) {
      throw new Error('Channel not found');
    }

    const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;
    const allVideos: YouTubeVideo[] = [];
    let pageToken = '';
    let totalFetched = 0;

    // Fetch all videos with pagination
    do {
      const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=50&key=${apiKey}${pageToken ? `&pageToken=${pageToken}` : ''}`;
      const playlistResponse = await fetch(playlistUrl);
      const playlistData = await playlistResponse.json();

      if (!playlistData.items || playlistData.items.length === 0) break;

      const videoIds = playlistData.items.map((item: any) => item.snippet.resourceId.videoId).join(',');

      // Get video details in batches
      const videosResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${apiKey}`
      );
      const videosData = await videosResponse.json();

      const batchVideos = videosData.items.map((video: any) => ({
        videoId: video.id,
        title: video.snippet.title,
        topic: CATEGORY_MAP[video.snippet.categoryId] || '기타',
        presenter: extractPresenter(video.snippet.title),
        views: parseInt(video.statistics.viewCount || '0'),
        likes: parseInt(video.statistics.likeCount || '0'),
        dislikes: null, // YouTube API doesn't provide dislikes anymore
        uploadDate: new Date(video.snippet.publishedAt).toISOString().split('T')[0],
        duration: parseDuration(video.contentDetails.duration),
        url: `https://www.youtube.com/watch?v=${video.id}`
      }));

      allVideos.push(...batchVideos);
      totalFetched += batchVideos.length;
      
      if (onProgress) {
        onProgress(totalFetched, playlistData.pageInfo?.totalResults || totalFetched);
      }

      pageToken = playlistData.nextPageToken;
    } while (pageToken);

    return allVideos;
  } catch (error) {
    console.error('Error fetching YouTube data:', error);
    throw error;
  }
};
