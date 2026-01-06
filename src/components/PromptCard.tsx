import { Copy } from 'lucide-react';
import { useState } from 'react';
import { Prompt } from '@/types/prompt';
import { incrementCopyCount } from '@/lib/api/prompts';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Props {
  prompt: Prompt;
  onCopyCountChange?: () => void;
}

export default function PromptCard({ prompt, onCopyCountChange }: Props) {
  const [copyCount, setCopyCount] = useState(prompt.copy_count || 0);
  const [isCopying, setIsCopying] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { toast } = useToast();

  const handleCopy = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    if (isCopying) return;
    
    setIsCopying(true);
    
    try {
      await navigator.clipboard.writeText(prompt.content);
      await incrementCopyCount(prompt.id);
      setCopyCount(prev => prev + 1);
      
      toast({
        title: '복사 완료',
        description: '클립보드에 복사되었습니다.',
      });
      
      if (onCopyCountChange) {
        onCopyCountChange();
      }
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: '오류',
        description: '복사에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsCopying(false);
    }
  };

  const modelColors: Record<string, string> = {
    'Grok': 'bg-blue-500',
    'ChatGPT': 'bg-green-500',
    'Claude': 'bg-purple-500',
    'Gemini': 'bg-orange-500',
    'Perplexity': 'bg-indigo-500',
    'Suno': 'bg-pink-500',
    'Nanobanana': 'bg-amber-500',
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return '방금 전';
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}일 전`;
    return date.toLocaleDateString('ko-KR');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <div 
        onClick={() => setIsModalOpen(true)}
        className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
      >
        {/* 이미지 영역 */}
        {prompt.imageUrl ? (
          <div className="h-48 overflow-hidden">
            <img
              src={prompt.imageUrl}
              alt={prompt.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        ) : (
          <div className="h-48 bg-muted flex items-center justify-center">
            <span className="text-4xl">📝</span>
          </div>
        )}

        {/* 컨텐츠 영역 */}
        <div className="p-4 space-y-3">
          {/* 모델 배지 */}
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-white text-xs font-medium ${modelColors[prompt.model] || 'bg-gray-500'}`}
            >
              {prompt.model}
            </span>
          </div>

          {/* 제목 */}
          <h3 className="font-bold text-card-foreground text-lg line-clamp-1">
            {prompt.title}
          </h3>

          {/* 태그 */}
          <div className="flex flex-wrap gap-1.5">
            {prompt.tags && prompt.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {prompt.tags && prompt.tags.length > 3 && (
              <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-medium">
                +{prompt.tags.length - 3}
              </span>
            )}
          </div>

          {/* 설명 */}
          <p className="text-muted-foreground text-sm line-clamp-2">
            {prompt.description}
          </p>

          {/* 푸터 */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-xs text-muted-foreground">
              {formatTimeAgo(prompt.created_at)}
            </span>
          </div>
        </div>
      </div>

      {/* 상세 모달 */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="space-y-4">
            <DialogTitle className="text-2xl font-bold pr-8">{prompt.title}</DialogTitle>
            
            {/* 배지들 */}
            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-full text-white text-xs font-medium ${modelColors[prompt.model] || 'bg-gray-500'}`}>
                {prompt.model}
              </span>
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-xs font-medium">
                {prompt.category}
              </span>
              <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                {prompt.form === 'natural' ? '자연어' : prompt.form === 'query' ? 'Query' : 'JSON'}
              </span>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 py-4">
            {/* 설명 */}
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-2">설명</h4>
              <p className="text-foreground">{prompt.description}</p>
            </div>

            {/* 프롬프트 내용 */}
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-2">프롬프트</h4>
              <div className="bg-muted rounded-lg p-4 max-h-[200px] overflow-y-auto">
                <pre className="text-sm text-foreground whitespace-pre-wrap font-mono">
                  {prompt.content}
                </pre>
              </div>
            </div>

            {/* 태그 */}
            {prompt.tags && prompt.tags.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-2">태그</h4>
                <div className="flex flex-wrap gap-2">
                  {prompt.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 복사 횟수 및 날짜 */}
            <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t border-border">
              <div className="flex items-center gap-1">
                <Copy className="w-4 h-4" />
                <span>복사 {copyCount}회</span>
              </div>
              <span>{formatDate(prompt.created_at)}</span>
            </div>
          </div>

          {/* 버튼 영역 */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              닫기
            </Button>
            <Button onClick={handleCopy} disabled={isCopying} className="gap-2">
              <Copy className="w-4 h-4" />
              복사
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
