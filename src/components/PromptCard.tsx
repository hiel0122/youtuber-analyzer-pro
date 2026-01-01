import { useState } from 'react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Prompt } from '@/types/prompt';

interface PromptCardProps {
  prompt: Prompt;
  onLike?: (promptId: string) => void;
}

const MODEL_COLORS: Record<string, string> = {
  'Grok': 'bg-blue-500 text-white',
  'ChatGPT': 'bg-green-500 text-white',
  'Claude': 'bg-purple-500 text-white',
  'Gemini': 'bg-amber-500 text-white',
  'Copilot': 'bg-sky-500 text-white',
  'Perplexity': 'bg-teal-500 text-white',
  'Suno': 'bg-pink-500 text-white',
  'Midjourney': 'bg-indigo-500 text-white',
  'DALL-E': 'bg-rose-500 text-white',
  'Runway': 'bg-orange-500 text-white',
  'Sora': 'bg-cyan-500 text-white',
};

const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 60) {
    return '방금 전';
  } else if (diffHours < 24) {
    return `${diffHours}시간 전`;
  } else if (diffDays < 7) {
    return `${diffDays}일 전`;
  } else {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
};

export function PromptCard({ prompt, onLike }: PromptCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike?.(prompt.id);
  };

  const displayTags = prompt.tags.slice(0, 3);
  const remainingTags = prompt.tags.length - 3;

  const modelColorClass = MODEL_COLORS[prompt.model] || 'bg-gray-500 text-white';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Image Area */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        {prompt.imageUrl ? (
          <img
            src={prompt.imageUrl}
            alt={prompt.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <span className="text-gray-400 text-sm">No Image</span>
          </div>
        )}
        
        {/* Model Badge */}
        <div className={cn(
          "absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold",
          modelColorClass
        )}>
          {prompt.model}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
          {prompt.title}
        </h3>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {displayTags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
            >
              #{tag}
            </span>
          ))}
          {remainingTags > 0 && (
            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full font-medium">
              +{remainingTags}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm line-clamp-2">
          {prompt.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-400">
            {getRelativeTime(prompt.created_at)}
          </span>
          
          <button
            onClick={handleLike}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-colors"
          >
            <Heart
              className={cn(
                "w-4 h-4 transition-all duration-200",
                isLiked && "fill-red-500 text-red-500"
              )}
            />
            <span className={cn(isLiked && "text-red-500")}>
              {prompt.likes + (isLiked ? 1 : 0)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
