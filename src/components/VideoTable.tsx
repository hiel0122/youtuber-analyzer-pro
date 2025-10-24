import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { YouTubeVideo } from "@/lib/youtubeApi";
import { formatInt } from "@/utils/format";

interface VideoTableProps {
  videos: YouTubeVideo[];
  loading?: boolean;
}

export const VideoTable = ({ videos, loading }: VideoTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(videos.length / pageSize);

  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const currentVideos = videos.slice(startIdx, endIdx);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
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
                <TableHead className="text-center whitespace-nowrap">주제</TableHead>
                <TableHead className="text-center whitespace-nowrap min-w-[300px]">제목</TableHead>
                <TableHead className="text-center whitespace-nowrap">출연자</TableHead>
                <TableHead className="text-center whitespace-nowrap">조회수</TableHead>
                <TableHead className="text-center whitespace-nowrap">좋아요</TableHead>
                <TableHead className="text-center whitespace-nowrap">업로드 날짜</TableHead>
                <TableHead className="text-center whitespace-nowrap">영상 길이</TableHead>
                <TableHead className="text-center whitespace-nowrap">링크</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(10)].map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell colSpan={8} className="py-4">
                      <div className="h-6 bg-muted/50 rounded animate-pulse" />
                    </TableCell>
                  </TableRow>
                ))
              ) : videos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-8">
                    데이터가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                currentVideos.map((video) => (
                  <TableRow key={video.videoId} className="hover:bg-secondary/30 transition-colors">
                    <TableCell className="text-center whitespace-nowrap">{video.topic}</TableCell>
                    <TableCell className="max-w-[400px] truncate" title={video.title}>
                      {video.title}
                    </TableCell>
                    <TableCell className="text-center whitespace-nowrap">{video.presenter}</TableCell>
                    <TableCell className="text-center whitespace-nowrap">{formatInt(video.views)}</TableCell>
                    <TableCell className="text-center whitespace-nowrap">{formatInt(video.likes)}</TableCell>
                    <TableCell className="text-center whitespace-nowrap">{video.uploadDate}</TableCell>
                    <TableCell className="text-center whitespace-nowrap">{video.duration}</TableCell>
                    <TableCell className="text-center whitespace-nowrap">
                      <a
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 transition-colors underline decoration-dotted"
                      >
                        열기
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
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {getPageNumbers().map((page, idx) =>
              typeof page === "number" ? (
                <Button
                  key={idx}
                  variant={currentPage === page ? "default" : "outline"}
                  size="icon"
                  onClick={() => setCurrentPage(page)}
                  className={currentPage === page ? "bg-primary" : ""}
                >
                  {page}
                </Button>
              ) : (
                <span key={idx} className="px-2 text-muted-foreground">
                  {page}
                </span>
              ),
            )}

            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
