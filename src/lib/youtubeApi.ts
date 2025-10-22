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
  return localStorage.getItem('youtube_api_key') || '';
};

export const setYouTubeApiKey = (key: string) => {
  localStorage.setItem('youtube_api_key', key);
};

export const hasYouTubeApiKey = () => {
  return !!localStorage.getItem('youtube_api_key');
};

const extractChannelId = (url: string): string | null => {
  // Handle different YouTube URL formats
  const patterns = [
    /youtube\.com\/channel\/([\w-]+)/,
    /youtube\.com\/@([\w-]+)/,
    /youtube\.com\/c\/([\w-]+)/,
    /youtube\.com\/user\/([\w-]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
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

export const fetchChannelVideos = async (channelUrl: string): Promise<YouTubeVideo[]> => {
  const apiKey = getYouTubeApiKey();
  if (!apiKey) {
    throw new Error('YouTube API key not configured');
  }

  const channelId = extractChannelId(channelUrl);
  if (!channelId) {
    throw new Error('Invalid YouTube channel URL');
  }

  try {
    // First, get channel details to find uploads playlist
    let searchUrl = '';
    if (channelUrl.includes('/@')) {
      // Handle @username format
      searchUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&forHandle=${channelId}&key=${apiKey}`;
    } else {
      searchUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`;
    }

    const channelResponse = await fetch(searchUrl);
    const channelData = await channelResponse.json();

    if (!channelData.items || channelData.items.length === 0) {
      throw new Error('Channel not found');
    }

    const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;

    // Get videos from uploads playlist
    const playlistResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=50&key=${apiKey}`
    );
    const playlistData = await playlistResponse.json();

    if (!playlistData.items) {
      throw new Error('No videos found');
    }

    const videoIds = playlistData.items.map((item: any) => item.snippet.resourceId.videoId).join(',');

    // Get video statistics and details
    const videosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${apiKey}`
    );
    const videosData = await videosResponse.json();

    return videosData.items.map((video: any) => ({
      videoId: video.id,
      title: video.snippet.title,
      topic: video.snippet.categoryId === '28' ? '과학/기술' : '일반',
      presenter: extractPresenter(video.snippet.title),
      views: parseInt(video.statistics.viewCount || '0'),
      likes: parseInt(video.statistics.likeCount || '0'),
      dislikes: parseInt(video.statistics.dislikeCount || '0'),
      uploadDate: new Date(video.snippet.publishedAt).toISOString().split('T')[0],
      duration: parseDuration(video.contentDetails.duration),
      url: `https://www.youtube.com/watch?v=${video.id}`
    }));
  } catch (error) {
    console.error('Error fetching YouTube data:', error);
    throw error;
  }
};
