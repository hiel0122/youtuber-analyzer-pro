/**
 * 채널 주제 태그 스마트 분석
 * - TF-IDF 기반 키워드 추출
 * - 롱폼/숏폼 자동 판별
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

// ============================================================
// 불용어 리스트
// ============================================================

const koreanStopWords = [
  '있는', '하는', '되는', '이런', '저런', '그런', '있다', '없다', '합니다', '입니다',
  '그리고', '하지만', '그래서', '그러나', '또한', '따라서', '이번', '저번', '다음',
  '오늘', '어제', '내일', '요즘', '최근', '지금', '이제', '우리', '너희', '저희',
  '진짜', '정말', '완전', '너무', '아주', '매우', '되게', '엄청', '대박', '실화',
  '영상', '동영상', '비디오', '채널', '구독', '좋아요', '알림', '설정', '공유',
  '처음', '마지막', '결국', '드디어', '갑자기', '당연히', '확실히', '솔직히'
];

const englishStopWords = [
  'the', 'is', 'at', 'which', 'on', 'and', 'or', 'but', 'for', 'with',
  'this', 'that', 'from', 'to', 'in', 'by', 'of', 'as', 'are', 'was',
  'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
  'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can',
  'video', 'channel', 'subscribe', 'like', 'share', 'comment', 'watch',
  'new', 'best', 'top', 'first', 'last', 'all', 'any', 'some', 'every'
];

// ============================================================
// 카테고리 패턴 (13개로 축소)
// ============================================================

const CATEGORY_PATTERNS: Record<string, string[]> = {
  '스마트폰': ['스마트폰', '갤럭시', '아이폰', '폰', 'iphone', 'galaxy', 'phone', 'smartphone'],
  '노트북': ['노트북', '맥북', '랩탑', 'macbook', 'laptop', '컴퓨터', 'pc'],
  '가전': ['가전', '청소기', '세탁기', '냉장고', '에어컨', '가전제품', '전자제품'],
  '이어폰': ['이어폰', '에어팟', '헤드폰', '버즈', 'airpods', 'earbuds', '헤드셋'],
  '리뷰': ['리뷰', '사용기', '언박싱', '후기', 'review', 'unboxing', '개봉기'],
  '게임': ['게임', '게이밍', '플레이', 'game', 'gaming', '겜', '스팀'],
  '음악': ['음악', 'music', '노래', '뮤직', '곡', '커버', 'cover', 'ccm', '찬양'],
  '교육': ['교육', '강의', '배우기', '학습', '강좌', '공부', '튜토리얼', 'tutorial'],
  '개발': ['개발', '코딩', '프로그래밍', 'coding', 'developer', '개발자', 'programming'],
  '디자인': ['디자인', 'design', '그래픽', 'ui', 'ux', '포토샵', '일러스트'],
  '먹방': ['먹방', '맛집', '음식', '요리', '레시피', '쿡방', 'mukbang', 'asmr'],
  '여행': ['여행', '관광', '투어', 'travel', '해외', '국내', '브이로그', 'vlog'],
  '운동': ['운동', '헬스', '다이어트', '피트니스', 'fitness', '홈트', '웨이트'],
};

// ============================================================
// 유틸리티 함수
// ============================================================

// 한글 명사 추출 (2글자 이상)
function extractKoreanNouns(text: string): string[] {
  const koreanPattern = /[가-힣]{2,}/g;
  const matches = text.match(koreanPattern) || [];
  return matches.filter(word => !koreanStopWords.includes(word));
}

// 영문 키워드 추출 (3글자 이상)
function extractEnglishKeywords(text: string): string[] {
  const englishPattern = /\b[a-zA-Z]{3,}\b/g;
  const matches = text.match(englishPattern) || [];
  return matches.map(w => w.toLowerCase()).filter(word => !englishStopWords.includes(word));
}

// 카테고리 매핑
function mapWordsToCategories(words: string[], frequency: Record<string, number>): string[] {
  const categoryScores: Record<string, number> = {};
  
  Object.entries(CATEGORY_PATTERNS).forEach(([category, patterns]) => {
    let score = 0;
    patterns.forEach(pattern => {
      const patternLower = pattern.toLowerCase();
      words.forEach(word => {
        const wordLower = word.toLowerCase();
        if (wordLower.includes(patternLower) || patternLower.includes(wordLower)) {
          score += frequency[word] || 0;
        }
      });
    });
    if (score > 0) {
      categoryScores[category] = score;
    }
  });

  return Object.entries(categoryScores)
    .sort((a, b) => b[1] - a[1])
    .map(([category]) => category);
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

// ============================================================
// TF-IDF 기반 키워드 추출
// ============================================================

function extractMainKeywords(videos: AnalyzableVideo[]): string[] {
  if (videos.length === 0) return [];

  const totalDocs = videos.length;
  const threshold = 0.15; // 전체 영상의 15% 이상에서 등장해야 유효

  // 1) 각 영상에서 단어 추출
  const docsWords: string[][] = videos.map(video => {
    const title = (video.title || '').toLowerCase();
    const korean = extractKoreanNouns(title);
    const english = extractEnglishKeywords(title);
    return [...korean, ...english];
  });

  // 2) TF 계산 (전체 단어 빈도)
  const tf: Record<string, number> = {};
  docsWords.forEach(words => {
    words.forEach(word => {
      tf[word] = (tf[word] || 0) + 1;
    });
  });

  // 3) DF 계산 (몇 개 문서에 등장하는가)
  const df: Record<string, number> = {};
  docsWords.forEach(words => {
    const uniqueWords = [...new Set(words)];
    uniqueWords.forEach(word => {
      df[word] = (df[word] || 0) + 1;
    });
  });

  // 4) TF-IDF 계산 및 임계값 필터링
  const tfidf: Record<string, number> = {};
  Object.keys(tf).forEach(word => {
    const docFreq = df[word] || 1;
    const docRatio = docFreq / totalDocs;
    
    // 15% 이상 등장하는 단어만 유효
    if (docRatio >= threshold) {
      tfidf[word] = tf[word] * Math.log(totalDocs / docFreq);
    }
  });

  // 5) TF-IDF 점수 기준 상위 키워드 추출
  const topWords = Object.entries(tfidf)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word]) => word);

  // 6) 카테고리 매핑
  const categories = mapWordsToCategories(topWords, tf);

  // 7) 카테고리에 매핑되지 않은 고빈도 키워드 추가
  const result: string[] = [...categories.slice(0, 4)];
  
  // 카테고리가 4개 미만이면 고빈도 키워드로 채우기
  if (result.length < 4) {
    const usedWords = new Set(
      Object.values(CATEGORY_PATTERNS).flat().map(p => p.toLowerCase())
    );
    
    for (const word of topWords) {
      if (result.length >= 4) break;
      const wordLower = word.toLowerCase();
      
      // 이미 카테고리에 포함되거나 너무 짧은 단어 제외
      const isUsed = [...usedWords].some(
        used => wordLower.includes(used) || used.includes(wordLower)
      );
      
      if (!isUsed && word.length >= 2 && !result.includes(word)) {
        result.push(word);
      }
    }
  }

  return result.slice(0, 4);
}

// ============================================================
// 롱폼/숏폼 판별
// ============================================================

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

// ============================================================
// 채널 정체성 분석
// ============================================================

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

// ============================================================
// 업로드 빈도 분석
// ============================================================

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

// ============================================================
// 메인 분석 함수
// ============================================================

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

  // 2. TF-IDF 기반 주요 키워드 추출
  const mainKeywords = extractMainKeywords(videos);

  // 3. 채널 정체성 키워드
  const identity = analyzeChannelIdentity(videos);

  return {
    contentType,
    mainKeywords,
    identity,
  };
}
