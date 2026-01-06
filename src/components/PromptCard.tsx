import { Heart } from 'lucide-react';
import { useState } from 'react';
import { Prompt } from '@/types/prompt';
import { incrementLikes, decrementLikes } from '@/lib/api/prompts';
import { useToast } from '@/hooks/use-toast';

interface Props {
  prompt: Prompt;
  onLikeChange?: () => void;
}

export default function PromptCard({ prompt, onLikeChange }: Props) {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(prompt.likes || 0);
  const [isLiking, setIsLiking] = useState(false);
  
  const { toast } = useToast();

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지
    
    if (isLiking) return; // 중복 클릭 방지
    
    setIsLiking(true);
    
    try {
      if (isLiked) {
        await decrementLikes(prompt.id);
        setLikes(prev => Math.max(0, prev - 1));
        setIsLiked(false);
      } else {
        await incrementLikes(prompt.id);
        setLikes(prev => prev + 1);
        setIsLiked(true);
      }
      
      // 부모 컴포넌트에 변경 알림
      if (onLikeChange) {
        onLikeChange();
      }
    } catch (error) {
      console.error('Failed to update likes:', error);
      toast({
        title: '오류',
        description: '좋아요 처리에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLiking(false);
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

  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group">
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
          <button
            onClick={handleLike}
            disabled={isLiking}
            className="flex items-center gap-1 text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-50"
          >
            <Heart
              className={`w-4 h-4 transition-all ${isLiked ? 'fill-red-500 text-red-500' : ''}`}
            />
            <span className={`text-sm ${isLiked ? 'text-red-500' : ''}`}>
              {likes}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
