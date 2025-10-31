import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, TrendingUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface UsageData {
  used: number;
  allocated: number;
}

interface DailyMetrics {
  date: string;
  analysis_count: number;
  data_api_calls: number;
  analytics_api_calls: number;
  data_save_count: number;
}

export function UsagePanel() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState<UsageData>({ used: 0, allocated: 100 });
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetrics[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadUsage();
  }, [user]);

  const loadUsage = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Load credits
      const { data: creditData, error: creditError } = await supabase
        .from('user_credits')
        .select('used, allocated')
        .eq('user_id', user.id)
        .maybeSingle();

      if (creditError && creditError.code !== 'PGRST116') throw creditError;

      if (creditData) {
        setCredits(creditData);
      }

      // Load daily metrics (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: metricsData, error: metricsError } = await supabase
        .from('usage_daily')
        .select('usage_date, analysis_count, data_api_calls, analytics_api_calls, data_save_count')
        .eq('user_id', user.id)
        .gte('usage_date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('usage_date', { ascending: true });

      if (metricsError) throw metricsError;

      if (metricsData) {
        setDailyMetrics(metricsData.map(m => ({
          date: m.usage_date,
          analysis_count: m.analysis_count,
          data_api_calls: m.data_api_calls,
          analytics_api_calls: m.analytics_api_calls,
          data_save_count: m.data_save_count,
        })));
      }
    } catch (error) {
      console.error('Failed to load usage:', error);
    } finally {
      setLoading(false);
    }
  };

  const creditPercentage = (credits.used / credits.allocated) * 100;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">{t('usage.title')}</h3>
      </div>

      {/* Credit Usage Card with Animation */}
      <Card className="p-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t('usage.credit.label')}</span>
            <span className="text-sm font-bold">
              {credits.used} / {credits.allocated}
            </span>
          </div>
          
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${creditPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      </Card>

      {/* Usage Trend Chart */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            {t('usage.trend.title')}
          </h4>
          <Button variant="outline" size="sm" onClick={() => setShowDetails(true)}>
            {t('usage.trend.details')}
          </Button>
        </div>

        <Card className="p-4">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyMetrics}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
                interval={9}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))' 
                }}
              />
              <Line 
                type="monotone" 
                dataKey="analysis_count" 
                stroke="hsl(var(--primary))" 
                name={t('usage.metrics.analysis')}
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="data_api_calls" 
                stroke="hsl(142, 76%, 36%)" 
                name={t('usage.metrics.dataApi')}
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="analytics_api_calls" 
                stroke="hsl(217, 91%, 60%)" 
                name={t('usage.metrics.analyticsApi')}
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="data_save_count" 
                stroke="hsl(45, 93%, 47%)" 
                name={t('usage.metrics.dataSave')}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{t('usage.trend.details')}</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto max-h-[60vh]">
            <table className="w-full text-sm">
              <thead className="bg-muted sticky top-0">
                <tr>
                  <th className="p-2 text-left">날짜</th>
                  <th className="p-2 text-right">{t('usage.metrics.analysis')}</th>
                  <th className="p-2 text-right">{t('usage.metrics.dataApi')}</th>
                  <th className="p-2 text-right">{t('usage.metrics.analyticsApi')}</th>
                  <th className="p-2 text-right">{t('usage.metrics.dataSave')}</th>
                </tr>
              </thead>
              <tbody>
                {dailyMetrics.map((metric, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-2">{metric.date}</td>
                    <td className="p-2 text-right">{metric.analysis_count}</td>
                    <td className="p-2 text-right">{metric.data_api_calls}</td>
                    <td className="p-2 text-right">{metric.analytics_api_calls}</td>
                    <td className="p-2 text-right">{metric.data_save_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
