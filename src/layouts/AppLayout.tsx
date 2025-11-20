import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { AnalysisLogsProvider } from '@/contexts/AnalysisLogsContext';
import { useAuth } from '@/hooks/useAuth';

export function AppLayout() {
  const { user } = useAuth();

  return (
    <AnalysisLogsProvider userId={user?.id}>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </AnalysisLogsProvider>
  );
}
