import { useState, useEffect } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import PromptCard from '@/components/PromptCard';
import { PromptFilters } from '@/components/PromptFilters';
import { PromptCreateDialog } from '@/components/PromptCreateDialog';
import type { Prompt, PromptFilters as Filters } from '@/types/prompt';
import { getPrompts, getStats } from '@/lib/api/prompts';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function PromptRepository() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModel, setSelectedModel] = useState('전체');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedForm, setSelectedForm] = useState('전체');
  const [sortBy, setSortBy] = useState<'latest' | 'oldest'>('latest');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPrompts: 0,
    categories: 0,
    likes: 0,
  });

  const { toast } = useToast();

  // 데이터 로드
  useEffect(() => {
    loadPrompts();
    loadStats();
  }, [selectedModel, selectedCategory, selectedForm, searchQuery, sortBy]);

  const loadPrompts = async () => {
    setIsLoading(true);
    try {
      const filters: Filters = {
        model: selectedModel,
        category: selectedCategory,
        form: selectedForm,
        search: searchQuery,
      };

      const { data } = await getPrompts(filters, sortBy);
      setPrompts(data);
    } catch (error) {
      console.error('Failed to load prompts:', error);
      toast({
        title: '오류',
        description: '프롬프트를 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleReset = () => {
    setSelectedCategory('전체');
    setSelectedModel('전체');
    setSelectedForm('전체');
    setSearchQuery('');
    setSortBy('latest');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* 헤더 */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            AI 프롬프트 컬렉션
          </h1>

          {/* 검색창 */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="프롬프트 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg rounded-2xl border-2 border-border focus:border-primary shadow-sm bg-card text-foreground"
              />
            </div>
          </div>

          {/* 통계 카드 */}
          <div className="flex justify-center gap-8 mb-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{stats.totalPrompts}</p>
              <p className="text-sm text-muted-foreground">프롬프트</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.categories}</p>
              <p className="text-sm text-muted-foreground">카테고리</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-red-500 dark:text-red-400">{stats.likes}</p>
              <p className="text-sm text-muted-foreground">좋아요</p>
            </div>
          </div>
        </div>

        {/* 필터 섹션 */}
        <PromptFilters
          selectedModel={selectedModel}
          selectedCategory={selectedCategory}
          selectedForm={selectedForm}
          onModelChange={setSelectedModel}
          onCategoryChange={setSelectedCategory}
          onFormChange={setSelectedForm}
        />

        {/* 정렬 및 초기화 */}
        <div className="flex items-center justify-between mt-6 mb-6">
          <span className="text-muted-foreground font-medium">
            {prompts.length}개의 프롬프트
          </span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <button
                onClick={() => setSortBy('latest')}
                className={cn(
                  "px-3 py-1.5 rounded-md transition-colors",
                  sortBy === 'latest' 
                    ? "text-primary font-semibold" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                최신순
              </button>
              <span className="text-muted-foreground">/</span>
              <button
                onClick={() => setSortBy('oldest')}
                className={cn(
                  "px-3 py-1.5 rounded-md transition-colors",
                  sortBy === 'oldest' 
                    ? "text-primary font-semibold" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                오래된순
              </button>
            </div>
            <Button variant="destructive" onClick={handleReset} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              초기화
            </Button>
            <PromptCreateDialog onSuccess={() => {
              loadPrompts();
              loadStats();
            }} />
          </div>
        </div>

        {/* 프롬프트 그리드 */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">프롬프트를 불러오는 중...</p>
          </div>
        ) : prompts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-foreground mb-2">프롬프트가 없습니다.</p>
            <p className="text-muted-foreground">첫 번째 프롬프트를 추가해보세요!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {prompts.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
