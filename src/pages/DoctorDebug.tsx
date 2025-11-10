import { useEffect, useState } from "react";
import { runDoctor, MIGRATION_SQL, resolveSupabaseContext, DoctorReport } from "@/lib/doctor";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function DoctorDebugPage() {
  const [report, setReport] = useState<DoctorReport | null>(null);
  const [loading, setLoading] = useState(true);
  const ctx = resolveSupabaseContext();

  useEffect(() => {
    (async () => {
      try {
        const r = await runDoctor();
        setReport(r);
        if (!r.table.exists) toast.error("user_settings 테이블을 찾을 수 없습니다.");
        else if (!r.rls.canUpsertOwn) toast.warn("RLS/업서트 권한을 확인하세요.");
      } catch (e: any) {
        toast.error(e?.message || "진단 실패");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const copySQL = () => {
    navigator.clipboard.writeText(MIGRATION_SQL);
    toast.success("SQL 복사됨");
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <h1 className="text-2xl font-bold mb-6">진단 실행 중...</h1>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">YouTube Analyzer — Doctor</h1>

      <Card className="p-4">
        <h2 className="font-semibold mb-2">Supabase 연결</h2>
        <div className="space-y-1 text-sm">
          <p>URL: <code className="bg-muted px-2 py-0.5 rounded">{ctx.url || "(미설정)"}</code></p>
          <p>Anon (tail): <code className="bg-muted px-2 py-0.5 rounded">{report?.supabase?.anonTail || "unknown"}</code></p>
          <p>Source: <code className="bg-muted px-2 py-0.5 rounded">{report?.supabase?.source}</code></p>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Auth</h3>
          <div className="space-y-1 text-sm">
            <p>userId: <code className="bg-muted px-2 py-0.5 rounded">{report?.auth?.userId || "null"}</code></p>
            <p>ok: <span className={report?.auth?.ok ? "text-green-400" : "text-red-400"}>{String(report?.auth?.ok)}</span></p>
            {report?.auth?.error && <p className="text-destructive">{report.auth.error}</p>}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-2">Table/RLS</h3>
          <div className="space-y-1 text-sm">
            <p>user_settings 존재: <span className={report?.table?.exists ? "text-green-400" : "text-red-400"}>{String(report?.table?.exists)}</span></p>
            {report?.table?.error && <p className="text-destructive">{report.table.error}</p>}
            <p>canSelectOwn: <span className={report?.rls?.canSelectOwn ? "text-green-400" : "text-red-400"}>{String(report?.rls?.canSelectOwn)}</span></p>
            <p>canUpsertOwn: <span className={report?.rls?.canUpsertOwn ? "text-green-400" : "text-red-400"}>{String(report?.rls?.canUpsertOwn)}</span></p>
            {report?.rls?.error && <p className="text-destructive text-xs mt-1">{report.rls.error}</p>}
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="font-semibold mb-2">수정용 SQL</h3>
        <textarea 
          className="w-full h-48 bg-muted p-3 rounded font-mono text-xs" 
          readOnly 
          value={MIGRATION_SQL}
        />
        <div className="mt-3 flex gap-2">
          <Button onClick={copySQL} variant="secondary" size="sm">
            Copy SQL
          </Button>
          <Button 
            onClick={() => window.open("https://supabase.com/dashboard", "_blank")} 
            variant="secondary" 
            size="sm"
          >
            Open Supabase
          </Button>
        </div>
      </Card>

      <p className="text-sm text-muted-foreground">
        스키마 변경 후 Supabase API 페이지에서 "Reload/Refresh"로 REST 스키마 캐시를 새로고침하세요.
      </p>
    </div>
  );
}
