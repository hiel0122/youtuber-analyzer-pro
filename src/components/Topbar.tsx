import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AuthCard } from './AuthCard';
import { Settings } from 'lucide-react';

export function Topbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  const handleSettingsClick = () => {
    if (user) {
      navigate('/settings');
    } else {
      setAuthDialogOpen(true);
    }
  };

  return (
    <>
      <div className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              YouTube Analytics
            </h1>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleSettingsClick}
            className="rounded-full"
            aria-label="설정"
          >
            <Settings className="h-5 w-5" />
          </Button>
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
