import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Footer() {
  const [open, setOpen] = useState<"privacy" | "tos" | null>(null);

  return (
    <>
      <footer className="border-t border-border bg-card/30 mt-12">
        <div className="mx-auto w-full max-w-screen-xl px-4 py-6">
          {/* 간단 고지 2줄 */}
          <p className="text-xs text-muted-foreground">
            Data via YouTube API • © All content belongs to the respective owners.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            This service is not affiliated with, endorsed, or sponsored by YouTube or Google.
          </p>

          {/* 링크 */}
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <button
              className="underline underline-offset-4 hover:text-foreground transition-colors"
              onClick={() => setOpen("privacy")}
            >
              Privacy Policy
            </button>
            <button
              className="underline underline-offset-4 hover:text-foreground transition-colors"
              onClick={() => setOpen("tos")}
            >
              Terms of Service
            </button>
            <a
              href="mailto:support@yourdomain.com"
              className="underline underline-offset-4 hover:text-foreground transition-colors"
            >
              Contact
            </a>
          </div>

          {/* 하단 보조 라벨 */}
          <p className="mt-4 text-[11px] text-muted-foreground/60">
            Powered by Supabase • Lovable
          </p>
        </div>
      </footer>

      {/* Privacy Modal */}
      <Dialog open={open === "privacy"} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Privacy Policy</DialogTitle>
          </DialogHeader>
          <div className="prose prose-sm prose-invert max-w-none text-sm leading-6 space-y-4">
            <p>
              We process publicly available YouTube channel and video metadata to provide aggregated
              analytics and visualizations. We do not collect end-user personal accounts or private
              YouTube data in the current version.
            </p>
            <p>
              We do not host or redistribute video or thumbnail media; we only reference links
              provided by YouTube. If source content is removed or set to private, our records are
              hidden or deleted during the next synchronization.
            </p>
            <p>
              Data is transmitted over TLS and stored on encrypted databases where available. We do
              not sell API access or raw API data. For questions or data concerns, contact:
              support@yourdomain.com
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* ToS Modal */}
      <Dialog open={open === "tos"} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Terms of Service</DialogTitle>
          </DialogHeader>
          <div className="prose prose-sm prose-invert max-w-none text-sm leading-6 space-y-4">
            <p>
              You may not use this service to infringe third-party rights or to resell API access or
              raw datasets. The service charges for value-added features (analytics, visualizations)
              and not for API data itself.
            </p>
            <p>
              The service is provided "as is," and metrics may vary due to API policy or quota changes.
              We are not affiliated with YouTube or Google.
            </p>
            <p>
              By using this service, you agree to comply with YouTube's Terms of Service and API
              policies. We reserve the right to modify or discontinue the service at any time.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
