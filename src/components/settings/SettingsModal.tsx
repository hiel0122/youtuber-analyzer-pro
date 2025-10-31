import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import { GeneralForm } from './GeneralForm';
import { ChannelForm } from './ChannelForm';
import { ApiForm } from './ApiForm';
import { AccountPanel } from './AccountPanel';
import { UsagePanel } from './UsagePanel';
import { Settings, Globe, Youtube, Key, User, BarChart3 } from 'lucide-react';

type Tab = 'general' | 'channel' | 'api' | 'account' | 'usage';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: Tab;
}

export function SettingsModal({ open, onOpenChange, defaultTab = 'general' }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab);
  const { t } = useI18n();

  const tabs = [
    { id: 'general' as const, label: t('settings.tabs.general'), icon: Globe },
    { id: 'channel' as const, label: t('settings.tabs.channel'), icon: Youtube },
    { id: 'api' as const, label: t('settings.tabs.api'), icon: Key },
    { id: 'account' as const, label: t('settings.tabs.account'), icon: User },
    { id: 'usage' as const, label: t('settings.tabs.usage'), icon: BarChart3 },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[85vh] p-0">
        <div className="flex h-full">
          {/* Left Sidebar - Vertical Tabs */}
          <div className="w-48 border-r bg-muted/30 p-4">
            <DialogHeader className="mb-6 px-2">
              <DialogTitle className="flex items-center gap-2 text-lg">
                <Settings className="w-5 h-5" />
                {t('settings.title')}
              </DialogTitle>
            </DialogHeader>
            
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 p-6">
              {activeTab === 'general' && <GeneralForm />}
              {activeTab === 'channel' && <ChannelForm />}
              {activeTab === 'api' && <ApiForm />}
              {activeTab === 'account' && <AccountPanel />}
              {activeTab === 'usage' && <UsagePanel />}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
