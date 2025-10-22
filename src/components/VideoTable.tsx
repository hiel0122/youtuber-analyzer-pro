import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';
import { YouTubeVideo } from '@/lib/youtubeApi';

interface VideoTableProps {
  videos: YouTubeVideo[];
}

export const VideoTable = ({ videos }: VideoTableProps) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  return (
    <Card className="bg-gradient-card border-border shadow-card">
      <CardHeader>
        <CardTitle>채널 영상 목록</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50">
                <TableHead className="w-[100px]">주제</TableHead>
                <TableHead className="min-w-[300px]">제목</TableHead>
                <TableHead>출연자</TableHead>
                <TableHead className="text-right">조회수</TableHead>
                <TableHead className="text-right">좋아요</TableHead>
                <TableHead className="text-right">싫어요</TableHead>
                <TableHead>업로드 날짜</TableHead>
                <TableHead>영상 길이</TableHead>
                <TableHead className="w-[50px]">링크</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                    채널 URL을 입력하고 분석하기를 클릭하세요
                  </TableCell>
                </TableRow>
              ) : (
                videos.map((video, index) => (
                  <TableRow key={video.videoId} className="hover:bg-secondary/30 transition-colors">
                    <TableCell className="font-medium">{video.topic}</TableCell>
                    <TableCell className="max-w-[400px] truncate" title={video.title}>
                      {video.title}
                    </TableCell>
                    <TableCell>{video.presenter}</TableCell>
                    <TableCell className="text-right">{formatNumber(video.views)}</TableCell>
                    <TableCell className="text-right">{formatNumber(video.likes)}</TableCell>
                    <TableCell className="text-right">{formatNumber(video.dislikes)}</TableCell>
                    <TableCell>{video.uploadDate}</TableCell>
                    <TableCell>{video.duration}</TableCell>
                    <TableCell>
                      <a
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
