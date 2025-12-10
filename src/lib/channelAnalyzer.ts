/**
 * 채널 주제 태그 스마트 분석
 * - 롱폼/숏폼 자동 판별
 * - 주요 키워드 추출
 * - 채널 정체성 분석
 */

export interface ChannelTags {
  contentType: string;      // 롱폼/숏폼/혼합
  mainKeywords: string[];   // 주요 키워드 (최대 4개)
  identity: string[];       // 채널 정체성 (최대 2개)
}

export interface AnalyzableVideo {
  title?: string | null;
  duration?: string | null;
  views?: number | null;
  likes?: number | null;
  upload_date?: string | null;
}

// duration 문자열을 초로 변환
function parseDurationToSeconds(duration?: string | null): number {
  if (!duration) return 0;
  const parts = duration.split(':').map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return parts[0] || 0;
}

// 1. 롱폼/숏폼 판별
function analyzeContentType(videos: AnalyzableVideo[]): string {
  let longFormCount = 0;
  let shortFormCount = 0;

  videos.forEach(video => {
    const seconds = parseDurationToSeconds(video.duration);
    if (seconds <= 0) return;

    // 60초 기준: 숏폼 vs 롱폼
    if (seconds < 60) {
      shortFormCount++;
    } else {
      longFormCount++;
    }
  });

  const totalCount = longFormCount + shortFormCount;
  if (totalCount === 0) return '';

  const shortFormRatio = shortFormCount / totalCount;

  if (shortFormRatio >= 0.8) {
    return '숏폼 중심';
  } else if (shortFormRatio <= 0.2) {
    return '롱폼 중심';
  } else {
    return '롱폼+숏폼 혼합';
  }
}

// 2. 주요 키워드 추출
function extractMainKeywords(videos: AnalyzableVideo[]): string[] {
  // 모든 영상 제목 수집
  const allTitles = videos.map(v => v.title || '').join(' ').toLowerCase();

  // 키워드 매핑 (한글 → 정제된 키워드)
  const keywordMap: Record<string, string[]> = {
    // IT/테크
    'IT': ['아이티', 'it', '테크', '기술', '디지털'],
    '스마트폰': ['스마트폰', '갤럭시', '아이폰', '휴대폰', '폰', 'iphone', 'galaxy', 'phone'],
    '노트북': ['노트북', '맥북', '랩탑', '컴퓨터', 'macbook', 'laptop'],
    '태블릿': ['태블릿', '아이패드', '갤럭시탭', 'ipad', 'tablet'],
    '가전': ['가전', '청소기', '세탁기', '냉장고', '에어컨', '가전제품'],
    '이어폰': ['이어폰', '에어팟', '헤드폰', '버즈', 'airpods', 'earbuds'],
    
    // 리뷰/사용기
    '리뷰': ['리뷰', '사용기', '개봉기', '언박싱', '후기', 'review', 'unboxing'],
    '비교': ['비교', 'vs', '차이점', '비교분석', '대결'],
    '추천': ['추천', '베스트', 'top', '순위', '랭킹'],
    
    // 교육/정보
    '교육': ['교육', '강의', '배우기', '학습', '공부', '강좌'],
    '팁': ['팁', '노하우', '방법', '하는법', '활용', 'tip', 'how'],
    '뉴스': ['뉴스', '소식', '발표', '공개', '출시', 'news'],
    
    // 엔터테인먼트
    '게임': ['게임', '게이밍', '플레이', '스팀', 'game', 'gaming'],
    '음악': ['음악', 'ccm', '찬양', '워십', 'live', '라이브', 'music'],
    '브이로그': ['브이로그', 'vlog', '일상', '데일리'],
    '먹방': ['먹방', '맛집', '음식', '요리', '레시피'],
    
    // 전문 분야
    '개발': ['개발', '코딩', '프로그래밍', '앱', '웹', 'coding', 'developer'],
    '디자인': ['디자인', 'ui', 'ux', '그래픽', 'design'],
    '마케팅': ['마케팅', '광고', '브랜딩', 'marketing'],
    
    // 기타
    '여행': ['여행', '관광', '투어', '해외', 'travel'],
    '패션': ['패션', '스타일', '코디', '옷', 'fashion'],
    '뷰티': ['뷰티', '메이크업', '화장', '스킨케어', 'beauty'],
    '운동': ['운동', '헬스', '다이어트', '피트니스', 'fitness'],
    '자동차': ['자동차', '차량', '드라이브', '시승', 'car'],
  };

  // 키워드 빈도 계산
  const keywordFrequency: Record<string, number> = {};

  Object.entries(keywordMap).forEach(([keyword, patterns]) => {
    let count = 0;
    patterns.forEach(pattern => {
      const regex = new RegExp(pattern, 'gi');
      const matches = allTitles.match(regex);
      count += matches ? matches.length : 0;
    });
    
    if (count > 0) {
      keywordFrequency[keyword] = count;
    }
  });

  // 빈도순 정렬하여 상위 4개 추출
  const sortedKeywords = Object.entries(keywordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([keyword]) => keyword);

  return sortedKeywords;
}

// 3. 채널 정체성 분석
function analyzeChannelIdentity(videos: AnalyzableVideo[]): string[] {
  const identity: string[] = [];

  if (videos.length === 0) return identity;

  // 업로드 빈도 분석
  const uploadFrequency = analyzeUploadFrequency(videos);
  if (uploadFrequency === 'high') {
    identity.push('활발한 업로드');
  } else if (uploadFrequency === 'very-high') {
    identity.push('매일 업로드');
  }

  // 평균 조회수 분석
  const videosWithViews = videos.filter(v => (v.views || 0) > 0);
  if (videosWithViews.length > 0) {
    const avgViews = videosWithViews.reduce((sum, v) => sum + (v.views || 0), 0) / videosWithViews.length;
    if (avgViews >= 100000) {
      identity.push('인기 채널');
    } else if (avgViews >= 10000) {
      identity.push('성장 중');
    }
  }

  // 좋아요 비율 분석 (engagement rate)
  const videosWithStats = videos.filter(v => (v.views || 0) > 0 && (v.likes || 0) >= 0);
  if (videosWithStats.length > 0) {
    const totalViews = videosWithStats.reduce((sum, v) => sum + (v.views || 0), 0);
    const totalLikes = videosWithStats.reduce((sum, v) => sum + (v.likes || 0), 0);
    const engagementRate = (totalLikes / totalViews) * 100;

    if (engagementRate >= 5) {
      identity.push('높은 참여도');
    }
  }

  // 최대 2개만 반환
  return identity.slice(0, 2);
}

// 업로드 빈도 분석
function analyzeUploadFrequency(videos: AnalyzableVideo[]): 'very-high' | 'high' | 'medium' | 'low' {
  if (videos.length < 2) return 'low';

  // 최신 영상과 가장 오래된 영상의 날짜 차이 계산
  const dates = videos
    .map(v => new Date(v.upload_date || ''))
    .filter(d => !isNaN(d.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());

  if (dates.length < 2) return 'low';

  const oldestDate = dates[0];
  const newestDate = dates[dates.length - 1];
  const daysDiff = Math.max(1, Math.floor(
    (newestDate.getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24)
  ));

  // 일평균 업로드 수
  const avgUploadsPerDay = videos.length / daysDiff;

  if (avgUploadsPerDay >= 2) {
    return 'very-high';  // 하루 2개 이상
  } else if (avgUploadsPerDay >= 1) {
    return 'high';  // 하루 1개 이상
  } else if (avgUploadsPerDay >= 0.2) {
    return 'medium'; // 5일에 1개 이상
  } else {
    return 'low';
  }
}

// 메인 분석 함수
export function analyzeChannelTags(videos: AnalyzableVideo[]): ChannelTags {
  if (videos.length === 0) {
    return {
      contentType: '',
      mainKeywords: [],
      identity: [],
    };
  }

  // 1. 롱폼/숏폼 판별
  const contentType = analyzeContentType(videos);

  // 2. 주요 키워드 추출
  const mainKeywords = extractMainKeywords(videos);

  // 3. 채널 정체성 키워드
  const identity = analyzeChannelIdentity(videos);

  return {
    contentType,
    mainKeywords,
    identity,
  };
}
