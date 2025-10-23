import { Loader2 } from "lucide-react";
import SyncProgress from "@/components/SyncProgress";

type Props = {
  open: boolean;
  message?: string;
  progress?: number;
  currentCount?: number;
  totalCount?: number;
};

export default function GlobalBusyOverlay({
  open,
  message = "분석 중입니다...",
  progress = 0,
  currentCount = 0,
  totalCount = 0,
}: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] backdrop-blur-sm bg-background/60"
      role="alertdialog"
      aria-modal="true"
      aria-label="분석 진행 중"
    >
      <div className="h-full w-full flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border bg-card/85 shadow-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <Loader2 className="size-5 animate-spin" aria-hidden />
            <h2 className="text-lg font-semibold">{message}</h2>
          </div>

          <SyncProgress
            progress={progress}
            currentCount={currentCount}
            totalCount={totalCount}
          />

          <p className="mt-3 text-xs text-muted-foreground">
            분석이 완료될 때까지 화면이 잠시 흐려집니다.
          </p>
        </div>
      </div>
    </div>
  );
}
