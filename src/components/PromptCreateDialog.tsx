import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createPrompt } from '@/lib/api/prompts';
import { useToast } from '@/hooks/use-toast';

const CATEGORIES = ['일반', '이미지', '코딩', '음악', '영상'];
const MODELS = [
  'ChatGPT', 'Gemini', 'Claude', 'Grok', 'Copilot',
  'Perplexity', 'Suno', 'Midjourney', 'DALL-E', 'Runway', 'Sora'
];
const FORMS = [
  { value: 'natural', label: '자연어' },
  { value: 'query', label: 'Query' },
  { value: 'json', label: 'JSON' },
];

interface PromptCreateDialogProps {
  onSuccess?: () => void;
}

export function PromptCreateDialog({ onSuccess }: PromptCreateDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    category: '',
    model: '',
    form: 'natural' as 'natural' | 'query' | 'json',
    title: '',
    description: '',
    content: '',
    tags: '',
  });

  const resetForm = () => {
    setFormData({
      category: '',
      model: '',
      form: 'natural',
      title: '',
      description: '',
      content: '',
      tags: '',
    });
  };

  const handleSubmit = async () => {
    // 필수 필드 검증
    if (!formData.category || !formData.model || !formData.title || !formData.content) {
      toast({
        title: '입력 오류',
        description: '카테고리, 모델, 제목, 내용은 필수입니다.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      await createPrompt({
        category: formData.category,
        model: formData.model,
        form: formData.form,
        title: formData.title,
        description: formData.description || formData.title,
        content: formData.content,
        tags: tagsArray,
        user_id: '', // Supabase RLS에서 처리
      });

      toast({
        title: '성공',
        description: '프롬프트가 추가되었습니다.',
      });

      resetForm();
      setOpen(false);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to create prompt:', error);
      toast({
        title: '오류',
        description: '프롬프트 추가에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          프롬프트 생성
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">새 프롬프트 추가</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 카테고리 선택 */}
          <div className="space-y-2">
            <Label htmlFor="category">카테고리 *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 모델 선택 */}
          <div className="space-y-2">
            <Label htmlFor="model">모델 *</Label>
            <Select
              value={formData.model}
              onValueChange={(value) => setFormData(prev => ({ ...prev, model: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="모델 선택" />
              </SelectTrigger>
              <SelectContent>
                {MODELS.map((model) => (
                  <SelectItem key={model} value={model}>{model}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 폼 선택 */}
          <div className="space-y-2">
            <Label htmlFor="form">폼</Label>
            <Select
              value={formData.form}
              onValueChange={(value) => setFormData(prev => ({ ...prev, form: value as 'natural' | 'query' | 'json' }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="폼 선택" />
              </SelectTrigger>
              <SelectContent>
                {FORMS.map((form) => (
                  <SelectItem key={form.value} value={form.value}>{form.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 제목 */}
          <div className="space-y-2">
            <Label htmlFor="title">제목 *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="프롬프트 제목을 입력하세요"
            />
          </div>

          {/* 설명 */}
          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="프롬프트에 대한 간단한 설명"
            />
          </div>

          {/* 내용 */}
          <div className="space-y-2">
            <Label htmlFor="content">프롬프트 내용 *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="프롬프트 내용을 입력하세요..."
              className="min-h-[150px]"
            />
          </div>

          {/* 태그 */}
          <div className="space-y-2">
            <Label htmlFor="tags">태그</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="태그를 쉼표로 구분하여 입력 (예: AI, 코딩, 생산성)"
            />
          </div>
        </div>

        {/* 버튼 영역 */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => {
              resetForm();
              setOpen(false);
            }}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? '추가 중...' : '추가'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
