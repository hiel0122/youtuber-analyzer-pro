import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

interface MetricsCardProps {
  title: string;
  value: string | number | React.ReactNode;
  icon?: LucideIcon;
  description?: string;
  tooltip?: string;
  infoTooltip?: string;
}

export const MetricsCard = ({ title, value, icon: Icon, description, tooltip, infoTooltip }: MetricsCardProps) => {
  return (
    <Card className="bg-gradient-card border-border shadow-card hover:shadow-glow transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="stat-title text-xs md:text-sm font-medium flex items-center gap-1.5">
          <span className="flex items-center gap-1.5">
            {title}
            {infoTooltip && (
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 p-0 hover:bg-white/5 rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      aria-label={`${title} 안내`}
                    >
                      <Info className="h-3.5 w-3.5 text-muted-foreground/70" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent 
                    role="tooltip"
                    className="max-w-[280px] text-xs leading-5"
                  >
                    {infoTooltip}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </span>
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground/70 hover:text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </CardTitle>
        {Icon && <Icon className="h-4 w-4 text-primary" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl md:text-3xl font-bold text-foreground">
          {value}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};
