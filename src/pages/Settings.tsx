import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { GeneralForm } from '@/components/settings/GeneralForm';
import { ChannelForm } from '@/components/settings/ChannelForm';
import { ApiForm } from '@/components/settings/ApiForm';
import { AccountPanel } from '@/components/settings/AccountPanel';
import { UsagePanel } from '@/components/settings/UsagePanel';
import { ConnectForm } from '@/components/settings/ConnectForm';

export default function Settings() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'general');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
    localStorage.setItem('last_settings_tab', value);
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">설정</h1>
        <p className="text-muted-foreground mt-1">계정 및 애플리케이션 설정을 관리하세요.</p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 h-auto">
          <TabsTrigger value="general" className="text-xs sm:text-sm py-2">General</TabsTrigger>
          <TabsTrigger value="channel" className="text-xs sm:text-sm py-2">Channel</TabsTrigger>
          <TabsTrigger value="api" className="text-xs sm:text-sm py-2">API</TabsTrigger>
          <TabsTrigger value="account" className="text-xs sm:text-sm py-2">Account</TabsTrigger>
          <TabsTrigger value="usage" className="text-xs sm:text-sm py-2">Usage</TabsTrigger>
          <TabsTrigger value="connect" className="text-xs sm:text-sm py-2">Connect</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card className="p-6">
            <GeneralForm />
          </Card>
        </TabsContent>

        <TabsContent value="channel" className="space-y-4">
          <Card className="p-6">
            <ChannelForm />
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card className="p-6">
            <ApiForm />
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-4">
          <Card className="p-6">
            <AccountPanel />
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card className="p-6">
            <UsagePanel />
          </Card>
        </TabsContent>

        <TabsContent value="connect" className="space-y-4">
          <Card className="p-6">
            <ConnectForm />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
