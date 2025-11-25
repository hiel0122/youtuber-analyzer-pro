import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Copy } from "lucide-react";
import { YouTubeVideo } from "@/lib/youtubeApi";
import { formatInt } from "@/utils/format";
import { toast } from "sonner";

interface VideoTableProps {
  videos: YouTubeVideo[];
  loading?: boolean;
}

export const VideoTable = ({ videos, loading }: VideoTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(videos.length / pageSize);

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("링크를 복사했어요");
    } catch (error) {
      toast.error("복사에 실패했어요");
    }
  };

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
    <div>
      <div className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead className="text-center whitespace-nowrap font-semibold text-foreground">주제</TableHead>
              <TableHead className="text-center whitespace-nowrap min-w-[300px] font-semibold text-foreground">제목</TableHead>
              <TableHead className="text-center whitespace-nowrap font-semibold text-foreground">조회수</TableHead>
              <TableHead className="text-center whitespace-nowrap font-semibold text-foreground">좋아요</TableHead>
              <TableHead className="text-center whitespace-nowrap font-semibold text-foreground">업로드 날짜</TableHead>
              <TableHead className="text-center whitespace-nowrap font-semibold text-foreground">영상 길이</TableHead>
              <TableHead className="text-center whitespace-nowrap font-semibold text-foreground">링크</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(10)].map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell colSpan={7} className="py-4">
                    <div className="h-6 bg-muted/50 rounded animate-pulse" />
                  </TableCell>
                </TableRow>
              ))
            ) : videos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">
                  데이터가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              currentVideos.map((video) => (
                <TableRow key={video.videoId} className="hover:bg-secondary/30 transition-colors">
                  <TableCell className="text-center whitespace-nowrap text-foreground">{video.topic}</TableCell>
                  <TableCell className="max-w-[400px] truncate text-foreground" title={video.title}>
                    {video.title}
                  </TableCell>
                  <TableCell className="text-center whitespace-nowrap text-foreground font-medium">{formatInt(video.views)}</TableCell>
                  <TableCell className="text-center whitespace-nowrap text-foreground font-medium">{formatInt(video.likes)}</TableCell>
                  <TableCell className="text-center whitespace-nowrap text-foreground">{video.uploadDate}</TableCell>
                  <TableCell className="text-center whitespace-nowrap text-foreground">{video.duration}</TableCell>
                  <TableCell className="text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      <a
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 transition-colors underline decoration-dotted"
                      >
                        보기
                      </a>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleCopyLink(video.url)}
                        aria-label="링크 복사"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {videos.length > pageSize && (
        <>
          <div className="flex items-center justify-center gap-2 p-6 border-t border-[#27272a] bg-[#0a0a0a]">
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

          {/* Pagination hint */}
          <div className="px-6 py-4 border-t border-[#27272a] bg-[#0a0a0a]">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing {startIdx + 1}-{Math.min(endIdx, videos.length)} of {videos.length.toLocaleString('ko-KR')} videos
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
