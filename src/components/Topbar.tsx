import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AuthCard } from './AuthCard';

export function Topbar() {
  const { user } = useAuth();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  return (
    <>
      <div className="h-16 border-b sticky top-0 z-40 bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/60" style={{ borderColor: 'var(--border)' }}>
        <div className="h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold" style={{ color: 'var(--ink)' }}>
              YouTube Analytics
            </h1>
          </div>
          {/* Theme switcher removed – fixed Default theme */}
        </div>
      </div>

      <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <AuthCard onSuccess={() => setAuthDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
