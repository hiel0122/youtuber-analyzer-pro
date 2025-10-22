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
        className="flex-1 h-12 bg-secondary border-border"
        disabled={loading}
      />
      <Button
        type="submit"
        disabled={loading}
        className="h-12 px-8 bg-gradient-primary hover:opacity-90 shadow-glow"
      >
        <Search className="mr-2 h-5 w-5" />
        {loading ? '분석 중...' : '분석하기'}
      </Button>
    </form>
  );
};
