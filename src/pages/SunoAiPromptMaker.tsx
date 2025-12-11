import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Music, Guitar, Cloud, Gauge, ScrollText, Wand2, Copy, Check, Sparkles, Loader2, FileUp, Dice5, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// ============================================================
// Data Definitions
// ============================================================

const tempoData = [
  { name: 'Grave', desc: 'Very Slow, Heavy, Solemn (<40 BPM)', value: 'Grave (Very Slow, <40 BPM)' },
  { name: 'Largo', desc: 'Slow, Broad, Dignified (40-60 BPM)', value: 'Largo (Slow, 40-60 BPM)' },
  { name: 'Adagio', desc: 'Slow & Expressive, at ease (66-76 BPM)', value: 'Adagio (Slow & Expressive, 66-76 BPM)' },
  { name: 'Andante', desc: 'Walking Pace, Moderate (76-108 BPM)', value: 'Andante (Walking Pace, 76-108 BPM)' },
  { name: 'Moderato', desc: 'Medium, Moderate speed (108-120 BPM)', value: 'Moderato (Medium, 108-120 BPM)' },
  { name: 'Allegretto', desc: 'Moderately Fast, Light (112-120 BPM)', value: 'Allegretto (Moderately Fast, 112-120 BPM)' },
  { name: 'Allegro', desc: 'Fast, Quick, Bright (120-168 BPM)', value: 'Allegro (Fast, 120-168 BPM)' },
  { name: 'Vivace', desc: 'Lively & Fast (168-176 BPM)', value: 'Vivace (Lively & Fast, 168-176 BPM)' },
  { name: 'Presto', desc: 'Very Fast, Rapid (168-200 BPM)', value: 'Presto (Very Fast, 168-200 BPM)' }
];

const genres = [
  { name: 'K-Pop (Dance)', desc: '화려한 퍼포먼스 중심의 한국 아이돌 댄스곡', example: 'Hype Boy (NewJeans), I AM (IVE)', defaultTempo: 6, related: ['Pop', 'EDM (House)', 'Trap'] },
  { name: 'Pop', desc: '대중적이고 트렌디한 멜로디의 팝', example: 'Seven (정국), Dynamite (BTS)', defaultTempo: 4, related: ['K-Pop (Dance)', 'R&B (Soul)', 'Synthwave'] },
  { name: 'City Pop (Seoul)', desc: '한국적 감성이 더해진 세련된 도심의 밤 분위기', example: '보라빛 밤 (선미), 서울의 잠 못 이루는 밤', defaultTempo: 4, related: ['City Pop (Tokyo)', 'R&B (Soul)', 'Indie Pop'] },
  { name: 'City Pop (Tokyo)', desc: '80년대 일본 도심의 밤, 네온과 야경의 감성', example: 'Plastic Love (竹内まりや)', defaultTempo: 4, related: ['City Pop (Seoul)', 'Funk', 'Synthwave'] },
  { name: 'EDM (House)', desc: '클럽에서 춤추기 좋은 일렉트로닉 비트', example: 'Animals (Martin Garrix)', defaultTempo: 6, related: ['Tropical House', 'Trap', 'K-Pop (Dance)'] },
  { name: 'Tropical House', desc: '여름 해변의 시원하고 밝은 분위기', example: 'Lean On (Major Lazer)', defaultTempo: 5, related: ['EDM (House)', 'Pop', 'Latin Pop'] },
  { name: 'R&B (Soul)', desc: '감성적이고 그루비한 소울풀 사운드', example: 'Blinding Lights (The Weeknd)', defaultTempo: 4, related: ['Pop', 'Neo-Soul', 'Gospel'] },
  { name: 'Neo-Soul', desc: '현대적으로 재해석된 소울, 재즈의 감성', example: "I'm Still Standing (D'Angelo)", defaultTempo: 3, related: ['R&B (Soul)', 'Jazz', 'Gospel'] },
  { name: 'Gospel', desc: '영적 감동과 희망을 전하는 음악', example: 'Amazing Grace', defaultTempo: 3, related: ['CCM', 'R&B (Soul)', 'Neo-Soul'] },
  { name: 'CCM', desc: '현대 기독교 음악, 찬양과 경배', example: '주의 이름 높이며 (마커스)', defaultTempo: 4, related: ['Gospel', 'Worship', 'Pop Ballad'] },
  { name: 'Worship', desc: '예배와 경배에 적합한 경건한 사운드', example: 'How Great Is Our God (Chris Tomlin)', defaultTempo: 3, related: ['CCM', 'Gospel', 'Acoustic'] },
  { name: 'Hip-Hop', desc: '리드미컬한 랩과 비트 중심의 음악', example: 'HUMBLE (Kendrick Lamar)', defaultTempo: 5, related: ['Trap', 'R&B (Soul)', 'K-Pop (Dance)'] },
  { name: 'Trap', desc: '강렬한 베이스와 하이햇 롤의 현대적 힙합', example: 'Goosebumps (Travis Scott)', defaultTempo: 6, related: ['Hip-Hop', 'EDM (House)', 'K-Pop (Dance)'] },
  { name: 'Rock', desc: '기타 중심의 파워풀한 사운드', example: 'Bohemian Rhapsody (Queen)', defaultTempo: 5, related: ['Alternative', 'Metal', 'Indie Rock'] },
  { name: 'Alternative', desc: '비주류적, 실험적 록 사운드', example: 'Creep (Radiohead)', defaultTempo: 4, related: ['Rock', 'Indie Rock', 'Grunge'] },
  { name: 'Indie Pop', desc: '독립적이고 개성 있는 팝 사운드', example: 'Electric Feel (MGMT)', defaultTempo: 4, related: ['Alternative', 'Pop', 'City Pop (Seoul)'] },
  { name: 'Indie Rock', desc: '인디 레이블의 독창적인 록 사운드', example: 'Mr. Brightside (The Killers)', defaultTempo: 5, related: ['Alternative', 'Rock', 'Indie Pop'] },
  { name: 'Jazz', desc: '즉흥 연주와 복잡한 화성의 세련된 음악', example: 'Take Five (Dave Brubeck)', defaultTempo: 4, related: ['Neo-Soul', 'Bossa Nova', 'Lo-Fi'] },
  { name: 'Lo-Fi', desc: '편안하고 몽환적인 비트, 공부/휴식용', example: 'Lo-Fi Hip Hop Radio', defaultTempo: 3, related: ['Jazz', 'Chill', 'Ambient'] },
  { name: 'Acoustic', desc: '어쿠스틱 악기 중심의 따뜻한 사운드', example: 'Tears in Heaven (Eric Clapton)', defaultTempo: 3, related: ['Folk', 'Singer-Songwriter', 'Pop Ballad'] },
  { name: 'Folk', desc: '전통적 선율과 스토리텔링 중심', example: 'Blowin in the Wind (Bob Dylan)', defaultTempo: 3, related: ['Acoustic', 'Singer-Songwriter', 'Country'] },
  { name: 'Country', desc: '미국 남부의 정서가 담긴 컨트리 사운드', example: 'Jolene (Dolly Parton)', defaultTempo: 4, related: ['Folk', 'Acoustic', 'Bluegrass'] },
  { name: 'Latin Pop', desc: '라틴 리듬과 팝의 결합', example: 'Despacito (Luis Fonsi)', defaultTempo: 5, related: ['Pop', 'Reggaeton', 'Tropical House'] },
  { name: 'Reggaeton', desc: '라틴 아메리카의 어반 비트', example: 'Dákiti (Bad Bunny)', defaultTempo: 5, related: ['Latin Pop', 'Hip-Hop', 'Dancehall'] },
  { name: 'Funk', desc: '그루비하고 리드미컬한 펑키 사운드', example: 'Uptown Funk (Bruno Mars)', defaultTempo: 5, related: ['R&B (Soul)', 'Disco', 'City Pop (Tokyo)'] },
  { name: 'Disco', desc: '70년대 댄스 플로어의 화려한 사운드', example: 'Stayin Alive (Bee Gees)', defaultTempo: 5, related: ['Funk', 'Pop', 'Synthwave'] },
  { name: 'Synthwave', desc: '80년대 신스 사운드의 레트로 퓨처리즘', example: 'Blinding Lights (The Weeknd)', defaultTempo: 5, related: ['Pop', 'Disco', 'City Pop (Tokyo)'] },
  { name: 'Classical', desc: '오케스트라와 클래식 악기의 품격', example: 'Canon in D (Pachelbel)', defaultTempo: 3, related: ['Orchestral', 'Ambient', 'Cinematic'] },
  { name: 'Orchestral', desc: '웅장한 오케스트라 사운드', example: 'Star Wars Theme (John Williams)', defaultTempo: 4, related: ['Classical', 'Cinematic', 'Epic'] },
  { name: 'Cinematic', desc: '영화 OST 같은 드라마틱한 사운드', example: 'Time (Hans Zimmer)', defaultTempo: 3, related: ['Orchestral', 'Epic', 'Ambient'] },
  { name: 'Ambient', desc: '공간감 있는 몽환적 배경 음악', example: 'Music for Airports (Brian Eno)', defaultTempo: 2, related: ['Lo-Fi', 'Chill', 'Classical'] },
  { name: 'Chill', desc: '편안하고 느긋한 분위기의 음악', example: 'Sunset Lover (Petit Biscuit)', defaultTempo: 3, related: ['Lo-Fi', 'Ambient', 'Tropical House'] },
  { name: 'Pop Ballad', desc: '감성적인 팝 발라드', example: 'All of Me (John Legend)', defaultTempo: 2, related: ['Acoustic', 'R&B (Soul)', 'CCM'] },
];

const moods = [
  { name: 'Emotional', desc: '감정을 깊게 자극하는 호소력 짙은', example: '눈의 꽃 (박효신)', tempoModifier: -1, related: ['Sentimental', 'Sad', 'Melancholy'] },
  { name: 'Sentimental', desc: '감성적이고 조금은 센치한', example: '비 (폴킴), 가을 밤 떠난 너', tempoModifier: -1, related: ['Emotional', 'Nostalgic', 'Lonely'] },
  { name: 'Nostalgic', desc: '과거를 회상하는 그리운 느낌', example: '어린 왕자 (려욱)', tempoModifier: -1, related: ['Sentimental', 'Melancholy', 'Dreamy'] },
  { name: 'Melancholy', desc: '쓸쓸하고 우울한 분위기', example: '사랑은 늘 도망가 (임영웅)', tempoModifier: -2, related: ['Sad', 'Lonely', 'Emotional'] },
  { name: 'Sad', desc: '슬프고 눈물 나는', example: '거짓말이라도 해서 널 보고싶어', tempoModifier: -2, related: ['Melancholy', 'Lonely', 'Emotional'] },
  { name: 'Lonely', desc: '외롭고 쓸쓸한 감정', example: 'Lonely (2NE1)', tempoModifier: -1, related: ['Sad', 'Melancholy', 'Sentimental'] },
  { name: 'Hopeful', desc: '희망적이고 밝은 미래를 바라보는', example: 'A Whole New World', tempoModifier: 0, related: ['Uplifting', 'Optimistic', 'Warm'] },
  { name: 'Uplifting', desc: '기분을 고양시키는 활력 있는', example: 'Happy (Pharrell Williams)', tempoModifier: 1, related: ['Hopeful', 'Energetic', 'Happy'] },
  { name: 'Energetic', desc: '에너지 넘치고 활발한', example: 'Cant Stop the Feeling (Justin Timberlake)', tempoModifier: 2, related: ['Uplifting', 'Happy', 'Exciting'] },
  { name: 'Happy', desc: '행복하고 즐거운 기분', example: 'Good Time (Owl City)', tempoModifier: 1, related: ['Energetic', 'Uplifting', 'Refreshing'] },
  { name: 'Exciting', desc: '흥분되고 설레는 느낌', example: 'Thunder (Imagine Dragons)', tempoModifier: 2, related: ['Energetic', 'Intense', 'Epic'] },
  { name: 'Dreamy', desc: '몽환적이고 꿈결 같은', example: '밤편지 (IU)', tempoModifier: -1, related: ['Nostalgic', 'Romantic', 'Ethereal'] },
  { name: 'Romantic', desc: '로맨틱하고 사랑스러운', example: 'Thinking Out Loud (Ed Sheeran)', tempoModifier: 0, related: ['Dreamy', 'Warm', 'Sentimental'] },
  { name: 'Warm', desc: '따뜻하고 포근한 느낌', example: 'Perfect (Ed Sheeran)', tempoModifier: 0, related: ['Romantic', 'Hopeful', 'Cute'] },
  { name: 'Cute', desc: '귀엽고 사랑스러운', example: 'Cupid (FIFTY FIFTY)', tempoModifier: 0, related: ['Happy', 'Warm', 'Funny'] },
  { name: 'Funny', desc: '재미있고 유쾌한', example: 'Gangnam Style (PSY)', tempoModifier: 1, related: ['Happy', 'Cute', 'Energetic'] },
  { name: 'Refreshing', desc: '상쾌하고 청량한', example: 'Love Dive (IVE)', tempoModifier: 1, related: ['Happy', 'Energetic', 'Uplifting'] },
  { name: 'Calm', desc: '평화롭고 고요한', example: 'River Flows in You (Yiruma)', tempoModifier: -2, related: ['Peaceful', 'Relaxed', 'Ambient'] },
  { name: 'Peaceful', desc: '평온하고 안정적인', example: 'Gymnopédie No.1 (Satie)', tempoModifier: -2, related: ['Calm', 'Relaxed', 'Spiritual'] },
  { name: 'Relaxed', desc: '편안하고 느긋한', example: 'Sunday Morning (Maroon 5)', tempoModifier: -1, related: ['Calm', 'Peaceful', 'Chill'] },
  { name: 'Spiritual', desc: '영적이고 초월적인 느낌', example: 'Oceans (Hillsong United)', tempoModifier: -1, related: ['Peaceful', 'Ethereal', 'Sacred'] },
  { name: 'Sacred', desc: '신성하고 경건한', example: 'How Great Thou Art', tempoModifier: -1, related: ['Spiritual', 'Peaceful', 'Ethereal'] },
  { name: 'Ethereal', desc: '천상의, 신비로운', example: 'Only Time (Enya)', tempoModifier: -1, related: ['Dreamy', 'Spiritual', 'Ambient'] },
  { name: 'Dark', desc: '어둡고 음울한 분위기', example: 'In the End (Linkin Park)', tempoModifier: 0, related: ['Intense', 'Mysterious', 'Melancholy'] },
  { name: 'Mysterious', desc: '신비롭고 미스터리한', example: 'Stranger Things Theme', tempoModifier: 0, related: ['Dark', 'Ethereal', 'Tense'] },
  { name: 'Tense', desc: '긴장감 있는', example: 'Inception Theme (Hans Zimmer)', tempoModifier: 0, related: ['Mysterious', 'Intense', 'Dramatic'] },
  { name: 'Intense', desc: '강렬하고 격렬한', example: 'Believer (Imagine Dragons)', tempoModifier: 1, related: ['Exciting', 'Tense', 'Epic'] },
  { name: 'Epic', desc: '장대하고 웅장한', example: 'He is a Pirate (Hans Zimmer)', tempoModifier: 1, related: ['Intense', 'Dramatic', 'Cinematic'] },
  { name: 'Dramatic', desc: '극적이고 드라마틱한', example: 'My Heart Will Go On (Celine Dion)', tempoModifier: 0, related: ['Epic', 'Emotional', 'Cinematic'] },
  { name: 'Optimistic', desc: '낙관적이고 긍정적인', example: 'Dont Worry Be Happy (Bobby McFerrin)', tempoModifier: 1, related: ['Hopeful', 'Happy', 'Uplifting'] },
];

const SunoAiPromptMaker = () => {
  // ============================================================
  // State Management
  // ============================================================
  
  const [userApiKey, setUserApiKey] = useState(
    localStorage.getItem('gemini_api_key') || ''
  );
  const [showSettings, setShowSettings] = useState(false);
  
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [tempoIndex, setTempoIndex] = useState(4);
  const [recommendedTempoIndex, setRecommendedTempoIndex] = useState(4);
  const [isRecommendedTempo, setIsRecommendedTempo] = useState(true);
  const [tempoFeedback, setTempoFeedback] = useState({ 
    label: '✨ AI 추천', 
    type: 'recommend' 
  });

  const [refText, setRefText] = useState('');
  const [refLink, setRefLink] = useState('');

  const [parsedResult, setParsedResult] = useState({
    bibleVerses: '',
    lyrics: '',
    styles: '',
    excludeStyles: '',
    advancedOptions: '',
    title: ''
  });

  const [copiedFields, setCopiedFields] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [guideLine, setGuideLine] = useState(`[핵심 작사 지침]
1. 가사는 청자가 공감할 수 있는 스토리텔링 구조를 가질 것.
2. 후렴구(Hook)는 반복적이고 중독성 있게 구성할 것.
3. 추상적인 표현보다는 구체적인 시각적 묘사를 사용할 것.
4. Verse-PreChorus-Chorus-Bridge 구조를 명확히 할 것.`);

  // ============================================================
  // Computed Values
  // ============================================================

  const relatedGenres = useMemo(() => {
    if (selectedGenres.length >= 3) return [];
    const related = new Set<string>();
    selectedGenres.forEach(name => {
      const genre = genres.find(g => g.name === name);
      if (genre?.related) genre.related.forEach(r => related.add(r));
    });
    return Array.from(related).filter(r => !selectedGenres.includes(r));
  }, [selectedGenres]);

  const relatedMoods = useMemo(() => {
    if (selectedMoods.length >= 3) return [];
    const related = new Set<string>();
    selectedMoods.forEach(name => {
      const mood = moods.find(m => m.name === name);
      if (mood?.related) mood.related.forEach(r => related.add(r));
    });
    return Array.from(related).filter(r => !selectedMoods.includes(r));
  }, [selectedMoods]);

  // ============================================================
  // Effects
  // ============================================================

  // API 키 저장
  const saveApiKey = () => {
    localStorage.setItem('gemini_api_key', userApiKey);
    setShowSettings(false);
    toast.success("API 키가 저장되었습니다!");
  };

  // 템포 자동 추천 로직
  useEffect(() => {
    if (selectedGenres.length === 0 && selectedMoods.length === 0) {
      setRecommendedTempoIndex(4);
      return;
    }

    let totalTempo = 0;
    let count = 0;

    selectedGenres.forEach(name => {
      const g = genres.find(item => item.name === name);
      if (g) {
        totalTempo += g.defaultTempo;
        count++;
      }
    });

    let moodModifierSum = 0;
    selectedMoods.forEach(name => {
      const m = moods.find(item => item.name === name);
      if (m) {
        moodModifierSum += m.tempoModifier;
      }
    });

    const avgMoodModifier = selectedMoods.length > 0 
      ? moodModifierSum / selectedMoods.length 
      : 0;
    const baseAvgTempo = count > 0 ? totalTempo / count : 4;

    let recommended = Math.round(baseAvgTempo + avgMoodModifier);
    recommended = Math.max(0, Math.min(8, recommended));

    setRecommendedTempoIndex(recommended);

    if (isRecommendedTempo) {
      setTempoIndex(recommended);
    }
  }, [selectedGenres, selectedMoods, isRecommendedTempo]);

  // 템포 피드백 상태 업데이트
  useEffect(() => {
    const diff = Math.abs(tempoIndex - recommendedTempoIndex);
    if (selectedGenres.length === 0 && selectedMoods.length === 0) {
      setTempoFeedback({ label: '', type: 'none' });
      return;
    }
    if (diff === 0) {
      setTempoFeedback({ label: '✨ AI 추천', type: 'recommend' });
    } else if (diff <= 2) {
      setTempoFeedback({ label: '🧪 실험적', type: 'experimental' });
    } else {
      setTempoFeedback({ label: '⚠️ 권장하지 않음', type: 'warning' });
    }
  }, [tempoIndex, recommendedTempoIndex, selectedGenres, selectedMoods]);

  // ============================================================
  // Handlers
  // ============================================================

  const handleTempoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTempoIndex = Number(e.target.value);
    setTempoIndex(newTempoIndex);
    setIsRecommendedTempo(newTempoIndex === recommendedTempoIndex);

    if (selectedGenres.length === 0 && selectedMoods.length === 0) {
      const matchedGenres = genres
        .map(g => ({ ...g, diff: Math.abs(g.defaultTempo - newTempoIndex) }))
        .sort((a, b) => a.diff - b.diff)
        .slice(0, 2)
        .map(g => g.name);

      let targetModifier = 0;
      if (newTempoIndex <= 2) targetModifier = -1;
      else if (newTempoIndex >= 6) targetModifier = 1;

      const matchedMoods = moods
        .filter(m => m.tempoModifier === targetModifier)
        .sort(() => 0.5 - Math.random())
        .slice(0, 2)
        .map(m => m.name);

      setSelectedGenres(matchedGenres);
      setSelectedMoods(matchedMoods);
    }
  };

  const handleRandomize = () => {
    const shuffledGenres = [...genres].sort(() => 0.5 - Math.random());
    const randomGenreCount = Math.floor(Math.random() * 2) + 1;
    const randomGenres = shuffledGenres.slice(0, randomGenreCount).map(g => g.name);

    const shuffledMoods = [...moods].sort(() => 0.5 - Math.random());
    const randomMoodCount = Math.floor(Math.random() * 2) + 1;
    const randomMoods = shuffledMoods.slice(0, randomMoodCount).map(m => m.name);

    setSelectedGenres(randomGenres);
    setSelectedMoods(randomMoods);
    setIsRecommendedTempo(true);
    setRefText('');
    setRefLink('');

    toast.success('랜덤 설정이 적용되었습니다!');
  };

  const toggleGenre = (name: string) => {
    setSelectedGenres(prev => {
      if (prev.includes(name)) return prev.filter(g => g !== name);
      if (prev.length >= 3) {
        toast.error('장르는 최대 3개까지 선택할 수 있습니다.');
        return prev;
      }
      return [...prev, name];
    });
  };

  const toggleMood = (name: string) => {
    setSelectedMoods(prev => {
      if (prev.includes(name)) return prev.filter(m => m !== name);
      if (prev.length >= 3) {
        toast.error('분위기는 최대 3개까지 선택할 수 있습니다.');
        return prev;
      }
      return [...prev, name];
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setGuideLine(prev => 
        prev + `\n\n[Uploaded Guide: ${file.name}]\n` + content
      );
      toast.success('가이드 파일이 업로드되었습니다!');
    };
    reader.readAsText(file);
  };

  const callGeminiApi = useCallback(async (promptText: string) => {
    if (!userApiKey) {
      toast.error('API 키를 먼저 설정해주세요.');
      return "API 키가 설정되지 않았습니다.";
    }

    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${userApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: promptText }] }]
            })
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || 
               "결과를 생성하지 못했습니다.";
      } catch (error) {
        retryCount++;
        if (retryCount === maxRetries) {
          return "API 호출 중 오류가 발생했습니다. 키가 올바른지 확인해주세요.";
        }
        await new Promise(resolve => 
          setTimeout(resolve, 1000 * Math.pow(2, retryCount))
        );
      }
    }
    return "API 호출에 실패했습니다.";
  }, [userApiKey]);

  const buildPrompt = useCallback(() => {
    const selectedTempo = tempoData[tempoIndex].value;
    const genresStr = selectedGenres.length > 0 
      ? selectedGenres.join(', ') 
      : 'N/A';
    const moodsStr = selectedMoods.length > 0 
      ? selectedMoods.join(', ') 
      : 'N/A';

    return `
### Role
당신은 전문 작사/작곡가이자 음악 프로듀서입니다.

### Song Meta Data
- **Genre:** ${genresStr}
- **Mood:** ${moodsStr}
- **Tempo:** ${selectedTempo}
- **Reference Text:** ${refText || 'N/A'}
- **Reference Link:** ${refLink || 'N/A'}

### User Guidelines
${guideLine}

### Request
1. Title
2. Bible Verses (Korean, 1-2 verses relevant to theme)
3. Lyrics (Korean, English mix allowed)
4. Styles (comma separated tags)
5. Exclude Styles (comma separated tags)
6. Advanced Options

### Output Format
---
[Bible Verses]
(content)
---
[Lyrics]
(content)
---
[Styles]
(content)
---
[Exclude Styles]
(content)
---
[Advanced Options]
(content)
---
[Title]
(content)
---
    `.trim();
  }, [selectedGenres, selectedMoods, tempoIndex, refText, refLink, guideLine]);

  const parseGeminiResult = useCallback((result: string) => {
    const sections = {
      bibleVerses: '',
      lyrics: '',
      styles: '',
      excludeStyles: '',
      advancedOptions: '',
      title: ''
    };

    const patterns: Record<string, RegExp> = {
      bibleVerses: /\[Bible Verses\]\s*([\s\S]*?)(?=---|\n\[)/i,
      title: /\[Title\]\s*([\s\S]*?)(?=---|\n\[|$)/i,
      lyrics: /\[Lyrics\]\s*([\s\S]*?)(?=---|\n\[)/i,
      styles: /\[Styles\]\s*([\s\S]*?)(?=---|\n\[)/i,
      excludeStyles: /\[Exclude Styles\]\s*([\s\S]*?)(?=---|\n\[)/i,
      advancedOptions: /\[Advanced Options\]\s*([\s\S]*?)(?=---|\n\[|$)/i,
    };

    for (const key in patterns) {
      const match = result.match(patterns[key]);
      if (match && match[1]) {
        let content = match[1].trim();
        if (key === 'lyrics') {
          content = content.replace(/\*\*/g, '').replace(/\*/g, '');
        }
        sections[key as keyof typeof sections] = content;
      }
    }

    return sections;
  }, []);

  const handleGenerateWithAI = useCallback(async () => {
    if (!userApiKey) {
      toast.error('API 키를 먼저 설정해주세요.');
      setShowSettings(true);
      return;
    }

    setIsLoading(true);
    setParsedResult({
      bibleVerses: '',
      lyrics: '',
      styles: '',
      excludeStyles: '',
      advancedOptions: '',
      title: ''
    });

    const prompt = buildPrompt();
    const result = await callGeminiApi(prompt);

    if (result.startsWith("⚠️") || result.startsWith("API")) {
      setParsedResult(prev => ({ ...prev, lyrics: result }));
      toast.error('AI 생성에 실패했습니다.');
    } else {
      const parsed = parseGeminiResult(result);
      setParsedResult(parsed);
      toast.success('AI 생성이 완료되었습니다!');
    }

    setIsLoading(false);
  }, [buildPrompt, callGeminiApi, parseGeminiResult, userApiKey]);

  const handleEnhanceGuide = useCallback(async () => {
    if (!guideLine.trim()) {
      toast.error('가이드 내용을 입력해주세요.');
      return;
    }

    setIsEnhancing(true);
    const prompt = `Refine this music production guideline for better AI understanding:\n${guideLine}`;
    const enhancedText = await callGeminiApi(prompt);
    setGuideLine(enhancedText);
    setIsEnhancing(false);
    toast.success('가이드가 개선되었습니다!');
  }, [guideLine, callGeminiApi]);

  const copyToClipboard = useCallback((field: string, text: string) => {
    if (!text) return;

    navigator.clipboard.writeText(text).then(() => {
      setCopiedFields(prev => ({ ...prev, [field]: true }));
      toast.success('클립보드에 복사되었습니다!');
      setTimeout(() => {
        setCopiedFields(prev => ({ ...prev, [field]: false }));
      }, 2000);
    }).catch(err => {
      console.error('Unable to copy', err);
      toast.error('복사에 실패했습니다.');
    });
  }, []);

  // ============================================================
  // Components
  // ============================================================

  const ResultCard = ({ 
    title, 
    content, 
    field, 
    copyable = true, 
    icon: Icon 
  }: {
    title: string;
    content: string;
    field: string;
    copyable?: boolean;
    icon: React.ElementType;
  }) => (
    <div className="bg-card rounded-xl p-5 border border-border">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
          <Icon className="w-4 h-4 text-primary" />
          {title}
        </h3>
        {copyable && content && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(field, content)}
            className="h-8"
          >
            {copiedFields[field] ? (
              <>
                <Check className="w-3 h-3 mr-1" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </>
            )}
          </Button>
        )}
      </div>
      <div className="bg-background/50 rounded-lg p-4 text-sm font-mono whitespace-pre-wrap min-h-[100px] max-h-[400px] overflow-y-auto text-foreground">
        {content || (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-60">
            <Sparkles className="w-5 h-5 mb-2" />
            <span className="text-xs">Ready to generate...</span>
          </div>
        )}
      </div>
    </div>
  );

  // ============================================================
  // Main Render
  // ============================================================

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 text-foreground">
            <Music className="w-8 h-8 text-primary" />
            Suno AI Prompt Maker
          </h1>
          <p className="text-muted-foreground mt-2">
            AI 기반 음악 작사/작곡 도우미
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setShowSettings(true)}
          className="gap-2"
        >
          <Settings className="w-4 h-4" />
          API 설정
        </Button>
      </div>

      {/* API Key Modal */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>API 설정</DialogTitle>
            <DialogDescription>
              Google Gemini API 키를 입력해주세요.{' '}
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                무료 키 발급받기
              </a>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="password"
              value={userApiKey}
              onChange={(e) => setUserApiKey(e.target.value)}
              placeholder="AIza..."
            />
            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setShowSettings(false)}
              >
                취소
              </Button>
              <Button onClick={saveApiKey}>
                저장
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel */}
        <div className="space-y-6">
          {/* Genre Selector */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                <Guitar className="w-5 h-5 text-primary" />
                장르 선택
              </h3>
              <span className="text-xs text-muted-foreground">
                {selectedGenres.length}/3
              </span>
            </div>
            
            {/* Selected Genres */}
            {selectedGenres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedGenres.map(name => (
                  <Button
                    key={name}
                    variant="default"
                    size="sm"
                    onClick={() => toggleGenre(name)}
                    className="text-xs"
                  >
                    {name} ✕
                  </Button>
                ))}
              </div>
            )}

            {/* Related Genres */}
            {relatedGenres.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-muted-foreground mb-2">추천 장르</p>
                <div className="flex flex-wrap gap-2">
                  {relatedGenres.slice(0, 6).map(name => (
                    <Button
                      key={name}
                      variant="outline"
                      size="sm"
                      onClick={() => toggleGenre(name)}
                      className="text-xs border-primary/50 text-primary hover:bg-primary/10"
                    >
                      + {name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            {/* All Genre Tags */}
            <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto">
              {genres.map(genre => (
                <Button
                  key={genre.name}
                  variant={selectedGenres.includes(genre.name) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleGenre(genre.name)}
                  disabled={!selectedGenres.includes(genre.name) && selectedGenres.length >= 3}
                  className="text-xs"
                  title={genre.desc}
                >
                  {genre.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Mood Selector */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                <Cloud className="w-5 h-5 text-primary" />
                분위기 선택
              </h3>
              <span className="text-xs text-muted-foreground">
                {selectedMoods.length}/3
              </span>
            </div>
            
            {/* Selected Moods */}
            {selectedMoods.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedMoods.map(name => (
                  <Button
                    key={name}
                    variant="default"
                    size="sm"
                    onClick={() => toggleMood(name)}
                    className="text-xs"
                  >
                    {name} ✕
                  </Button>
                ))}
              </div>
            )}

            {/* Related Moods */}
            {relatedMoods.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-muted-foreground mb-2">추천 분위기</p>
                <div className="flex flex-wrap gap-2">
                  {relatedMoods.slice(0, 6).map(name => (
                    <Button
                      key={name}
                      variant="outline"
                      size="sm"
                      onClick={() => toggleMood(name)}
                      className="text-xs border-primary/50 text-primary hover:bg-primary/10"
                    >
                      + {name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            {/* All Mood Tags */}
            <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto">
              {moods.map(mood => (
                <Button
                  key={mood.name}
                  variant={selectedMoods.includes(mood.name) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleMood(mood.name)}
                  disabled={!selectedMoods.includes(mood.name) && selectedMoods.length >= 3}
                  className="text-xs"
                  title={mood.desc}
                >
                  {mood.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Tempo Selector */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-foreground">
              <Gauge className="w-5 h-5 text-primary" />
              템포
            </h3>
            
            <input
              type="range"
              min="0"
              max={tempoData.length - 1}
              step="1"
              value={tempoIndex}
              onChange={handleTempoChange}
              className="w-full mb-4 accent-primary"
            />
            
            <div className="bg-background/50 rounded-lg p-4 text-center">
              <div className="text-lg font-bold text-primary mb-1">
                {tempoData[tempoIndex].name}
              </div>
              <div className="text-xs text-muted-foreground">
                {tempoData[tempoIndex].desc}
              </div>
              {tempoFeedback.label && (
                <div className={`text-xs mt-2 inline-block px-2 py-1 rounded ${
                  tempoFeedback.type === 'recommend' 
                    ? 'bg-green-500/20 text-green-500'
                    : tempoFeedback.type === 'experimental'
                    ? 'bg-amber-500/20 text-amber-500'
                    : 'bg-red-500/20 text-red-500'
                }`}>
                  {tempoFeedback.label}
                </div>
              )}
            </div>
          </div>

          {/* Reference */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-foreground">
              <ScrollText className="w-5 h-5 text-primary" />
              레퍼런스
            </h3>
            <div className="space-y-3">
              <Input
                placeholder="스타일 설명 (예: Dreamy Synthpop)"
                value={refText}
                onChange={(e) => setRefText(e.target.value)}
              />
              <Input
                placeholder="링크 (YouTube, SoundCloud...)"
                value={refLink}
                onChange={(e) => setRefLink(e.target.value)}
              />
            </div>
          </div>

          {/* Guideline */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                <ScrollText className="w-5 h-5 text-primary" />
                작사 가이드
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FileUp className="w-3 h-3 mr-1" />
                  업로드
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".txt,.md"
                  onChange={handleFileUpload}
                />
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleEnhanceGuide}
                  disabled={isEnhancing || !userApiKey}
                >
                  {isEnhancing ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Wand2 className="w-3 h-3 mr-1" />
                  )}
                  AI 개선
                </Button>
              </div>
            </div>
            <Textarea
              value={guideLine}
              onChange={(e) => setGuideLine(e.target.value)}
              className="min-h-[150px] font-mono text-xs"
              placeholder="작사 가이드를 입력하세요..."
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleRandomize}
            >
              <Dice5 className="w-4 h-4 mr-2" />
              랜덤 설정
            </Button>
            <Button
              className="w-full"
              onClick={handleGenerateWithAI}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI로 생성하기
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right Panel - Results */}
        <div className="space-y-6">
          {isLoading && (
            <div className="bg-card rounded-xl p-8 border border-border flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <p className="text-lg font-semibold text-foreground">AI 생성 중...</p>
              <p className="text-sm text-muted-foreground mt-2">
                최상의 결과를 위해 분석하고 있습니다.
              </p>
            </div>
          )}

          {!isLoading && (
            <>
              <ResultCard
                title="성경 구절"
                content={parsedResult.bibleVerses}
                field="bibleVerses"
                icon={ScrollText}
              />
              <ResultCard
                title="가사"
                content={parsedResult.lyrics}
                field="lyrics"
                icon={Music}
              />
              <div className="grid grid-cols-2 gap-4">
                <ResultCard
                  title="스타일"
                  content={parsedResult.styles}
                  field="styles"
                  icon={Guitar}
                />
                <ResultCard
                  title="제외 스타일"
                  content={parsedResult.excludeStyles}
                  field="excludeStyles"
                  icon={Guitar}
                />
              </div>
              <ResultCard
                title="고급 옵션"
                content={parsedResult.advancedOptions}
                field="advancedOptions"
                icon={Wand2}
                copyable={false}
              />
              <ResultCard
                title="제목"
                content={parsedResult.title}
                field="title"
                icon={Music}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SunoAiPromptMaker;
