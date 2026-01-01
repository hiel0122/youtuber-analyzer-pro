import { useState, useMemo } from 'react';
import { Search, RotateCcw, Heart, FolderOpen, FileText } from 'lucide-react';
import { PromptFilters } from '@/components/PromptFilters';
import { PromptCard } from '@/components/PromptCard';
import type { Prompt } from '@/types/prompt';

// Mock data for demonstration
const MOCK_PROMPTS: Prompt[] = [
  {
    id: '1',
    title: '블로그 글 작성 도우미',
    description: 'SEO 최적화된 블로그 글을 작성하는 데 도움이 되는 프롬프트입니다. 키워드, 톤, 길이를 지정하면 최적의 글 구조를 제안합니다.',
    content: 'You are a professional blog writer...',
    model: 'ChatGPT',
    category: '일반',
    form: 'natural',
    tags: ['블로그', 'SEO', '글쓰기', '마케팅'],
    likes: 142,
    views: 1520,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    user_id: 'user1',
    author_name: '김작성'
  },
  {
    id: '2',
    title: '미드저니 풍경 이미지 생성',
    description: '환상적인 풍경 이미지를 생성하기 위한 미드저니 프롬프트 템플릿입니다.',
    content: 'A breathtaking landscape...',
    model: 'Midjourney',
    category: '이미지',
    form: 'query',
    tags: ['풍경', '아트', '이미지생성'],
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    likes: 89,
    views: 890,
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    user_id: 'user2',
    author_name: '이미지'
  },
  {
    id: '3',
    title: 'React 컴포넌트 생성기',
    description: 'TypeScript와 Tailwind CSS를 사용하는 React 컴포넌트를 빠르게 생성합니다.',
    content: 'Create a React component...',
    model: 'Claude',
    category: '코딩',
    form: 'json',
    tags: ['React', 'TypeScript', 'Tailwind', '프론트엔드', '컴포넌트'],
    likes: 256,
    views: 2340,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    user_id: 'user3',
    author_name: '박코딩'
  },
  {
    id: '4',
    title: 'Suno AI 로파이 음악 생성',
    description: '편안한 로파이 힙합 음악을 생성하기 위한 Suno AI 프롬프트입니다.',
    content: 'lofi hip hop, chill beats...',
    model: 'Suno',
    category: '음악',
    form: 'natural',
    tags: ['로파이', '음악', '힙합', '릴렉스'],
    likes: 78,
    views: 650,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    user_id: 'user4',
    author_name: '최음악'
  },
  {
    id: '5',
    title: 'Grok 실시간 뉴스 분석',
    description: '최신 뉴스를 분석하고 인사이트를 추출하는 Grok 프롬프트입니다.',
    content: 'Analyze the following news...',
    model: 'Grok',
    category: '일반',
    form: 'natural',
    tags: ['뉴스', '분석', '인사이트'],
    likes: 45,
    views: 380,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    user_id: 'user5',
    author_name: '정분석'
  },
  {
    id: '6',
    title: 'DALL-E 캐릭터 디자인',
    description: '게임이나 애니메이션용 캐릭터를 디자인하는 DALL-E 프롬프트입니다.',
    content: 'A character design...',
    model: 'DALL-E',
    category: '이미지',
    form: 'query',
    tags: ['캐릭터', '디자인', '게임', '애니메이션'],
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400',
    likes: 167,
    views: 1890,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    user_id: 'user6',
    author_name: '한디자인'
  }
];

export default function PromptRepository() {
  const [prompts] = useState<Prompt[]>(MOCK_PROMPTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModel, setSelectedModel] = useState('전체');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedForm, setSelectedForm] = useState('전체');
  const [sortBy, setSortBy] = useState<'latest' | 'oldest'>('latest');
  const [isLoading] = useState(false);

  const filteredPrompts = useMemo(() => {
    let result = [...prompts];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Model filter
    if (selectedModel !== '전체') {
      result = result.filter(p => p.model === selectedModel);
    }

    // Category filter
    if (selectedCategory !== '전체') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Form filter
    if (selectedForm !== '전체') {
      const formMap: Record<string, string> = {
        '자연어': 'natural',
        'Query': 'query',
        'JSON': 'json'
      };
      result = result.filter(p => p.form === formMap[selectedForm]);
    }

    // Sort
    result.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortBy === 'latest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [prompts, searchQuery, selectedModel, selectedCategory, selectedForm, sortBy]);

  const handleReset = () => {
    setSearchQuery('');
    setSelectedModel('전체');
    setSelectedCategory('전체');
    setSelectedForm('전체');
    setSortBy('latest');
  };

  const handleLike = (promptId: string) => {
    console.log('Liked prompt:', promptId);
  };

  const totalLikes = prompts.reduce((sum, p) => sum + p.likes, 0);
  const uniqueCategories = new Set(prompts.map(p => p.category)).size;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            AI 프롬프트 컬렉션
          </h1>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="프롬프트 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8">
            <div className="flex items-center gap-2 text-gray-600">
              <FileText className="w-5 h-5 text-blue-500" />
              <span className="font-semibold">{prompts.length}</span>
              <span>프롬프트</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <FolderOpen className="w-5 h-5 text-purple-500" />
              <span className="font-semibold">{uniqueCategories}</span>
              <span>카테고리</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Heart className="w-5 h-5 text-red-500" />
              <span className="font-semibold">{totalLikes.toLocaleString()}</span>
              <span>좋아요</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <PromptFilters
            selectedModel={selectedModel}
            selectedCategory={selectedCategory}
            selectedForm={selectedForm}
            onModelChange={setSelectedModel}
            onCategoryChange={setSelectedCategory}
            onFormChange={setSelectedForm}
          />
        </div>

        {/* Sort Bar */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-gray-600 font-medium">
            {filteredPrompts.length}개의 프롬프트
          </span>
          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'latest' | 'oldest')}
              className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="latest">최신순</option>
              <option value="oldest">오래된순</option>
            </select>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              초기화
            </button>
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredPrompts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                onLike={handleLike}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-gray-400 mb-4">
              <FileText className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              프롬프트가 없습니다
            </h3>
            <p className="text-gray-500">
              검색 조건을 변경하거나 필터를 초기화해 보세요.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
