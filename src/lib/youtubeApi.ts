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
