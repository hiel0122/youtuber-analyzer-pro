import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { YouTubeVideo } from '@/lib/youtubeApi';

interface VideoTableProps {
  videos: YouTubeVideo[];
}

export const VideoTable = ({ videos }: VideoTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(videos.length / pageSize);

  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const currentVideos = videos.slice(startIdx, endIdx);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
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
                currentVideos.map((video) => (
                  <TableRow key={video.videoId} className="hover:bg-secondary/30 transition-colors">
                    <TableCell className="font-medium">{video.topic}</TableCell>
                    <TableCell className="max-w-[400px] truncate" title={video.title}>
                      {video.title}
                    </TableCell>
                    <TableCell>{video.presenter}</TableCell>
                    <TableCell className="text-right">{formatNumber(video.views)}</TableCell>
                    <TableCell className="text-right">{formatNumber(video.likes)}</TableCell>
                    <TableCell className="text-right">
                      {video.dislikes !== null ? formatNumber(video.dislikes) : '미공개'}
                    </TableCell>
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

        {videos.length > pageSize && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {getPageNumbers().map((page, idx) =>
              typeof page === 'number' ? (
                <Button
                  key={idx}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setCurrentPage(page)}
                  className={currentPage === page ? 'bg-primary' : ''}
                >
                  {page}
                </Button>
              ) : (
                <span key={idx} className="px-2 text-muted-foreground">
                  {page}
                </span>
              )
            )}

            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
