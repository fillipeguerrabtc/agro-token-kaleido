import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileStatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
  onClick?: () => void;
}

export function MobileStatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  className,
  onClick,
}: MobileStatsCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl p-4 bg-card border hover-elevate active-elevate-2",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
      data-testid={`mobile-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground font-medium mb-1">{title}</p>
          <p className="text-2xl font-bold tracking-tight truncate">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
          {trend && trendValue && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={cn(
                  "text-xs font-medium",
                  trend === 'up' && "text-green-600 dark:text-green-400",
                  trend === 'down' && "text-red-600 dark:text-red-400",
                  trend === 'neutral' && "text-muted-foreground"
                )}
              >
                {trendValue}
              </span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="flex-shrink-0">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
