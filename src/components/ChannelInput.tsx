import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { toast } from 'sonner';

interface ChannelInputProps {
  onAnalyze: (url: string) => Promise<void>;
  loading: boolean;
}

export const ChannelInput = ({ onAnalyze, loading }: ChannelInputProps) => {
  const [url, setUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      toast.error('YouTube 채널 URL을 입력하세요');
      return;
    }
    await onAnalyze(url);
  };

  console.log("SUPABASE_URL?", import.meta.env.VITE_SUPABASE_URL);

  return (
    <form onSubmit={handleSubmit} className="flex gap-4 w-full max-w-3xl">
      <Input
        type="text"
        placeholder="YouTube 채널 URL을 입력하세요 (예: https://www.youtube.com/@channelname)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="flex-1 h-12 bg-white text-neutral-900 placeholder:text-neutral-500 caret-neutral-900 border border-input focus-visible:ring-2 focus-visible:ring-[var(--brand-ink,#1D348F)] focus-visible:ring-offset-0"
        disabled={loading}
      />
      <Button
        type="submit"
        disabled={loading}
        className="btn-primary h-12 px-8 hover:opacity-90 focus-visible:ring-2 ring-primary"
      >
        <Search className="mr-2 h-5 w-5" />
        {loading ? '분석 중...' : '분석하기'}
      </Button>
    </form>
  );
};
