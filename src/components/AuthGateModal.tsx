import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { AuthCard } from './AuthCard';

interface AuthGateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthGateModal({ open, onOpenChange }: AuthGateModalProps) {
  const [showAuthCard, setShowAuthCard] = useState(false);

  if (showAuthCard) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <AuthCard onSuccess={() => {
            setShowAuthCard(false);
            onOpenChange(false);
          }} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <div className="text-center space-y-6 py-4">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">
              회원가입 후, 이용가능합니다.
            </h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => setShowAuthCard(true)}
              className="flex-1"
              size="lg"
            >
              회원가입하기
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              variant="secondary"
              className="flex-1"
              size="lg"
            >
              둘러보기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
