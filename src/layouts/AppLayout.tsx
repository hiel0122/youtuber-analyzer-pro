import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { RightActivity } from '@/components/RightActivity';
import { AnalysisLogsProvider } from '@/contexts/AnalysisLogsContext';
import { useAuth } from '@/hooks/useAuth';

export function AppLayout() {
  const { user } = useAuth();

  return (
    <AnalysisLogsProvider userId={user?.id}>
      <div className="flex h-screen overflow-hidden bg-[#0a0a0a]">
        {/* 좌측 사이드바 */}
        <Sidebar />
        
        {/* 중앙 메인 영역 */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* 상단 헤더 */}
          <Topbar />
          
          {/* 메인 콘텐츠 영역과 우측 Activity */}
          <div className="flex-1 flex overflow-hidden">
            <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
              <Outlet />
            </main>
            
            {/* 우측 Activity 추가 */}
            <RightActivity />
          </div>
        </div>
      </div>
    </AnalysisLogsProvider>
  );
}
