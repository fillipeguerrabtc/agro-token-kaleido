import { CheckCircle2, Circle, Clock, Loader2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TimelineStatus = 'pending' | 'processing' | 'confirmed' | 'failed';

interface TimelineStep {
  label: string;
  status: 'complete' | 'current' | 'upcoming' | 'failed';
  timestamp?: string;
  description?: string;
}

interface TransactionTimelineProps {
  steps: TimelineStep[];
  className?: string;
  compact?: boolean;
}

export function TransactionTimeline({ steps, className, compact = false }: TransactionTimelineProps) {
  return (
    <div className={cn('space-y-0', className)} data-testid="transaction-timeline">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        
        return (
          <div key={index} className="relative">
            {/* Connector line */}
            {!isLast && (
              <div
                className={cn(
                  'absolute left-4 top-8 w-0.5 h-full -ml-px',
                  step.status === 'complete' ? 'bg-primary' : 'bg-border'
                )}
                aria-hidden="true"
              />
            )}

            {/* Step */}
            <div className={cn('flex items-start gap-3', !isLast && 'pb-8')}>
              {/* Icon */}
              <div className="relative flex-shrink-0">
                {step.status === 'complete' && (
                  <CheckCircle2 
                    className="h-8 w-8 text-primary" 
                    data-testid={`timeline-icon-complete-${index}`}
                  />
                )}
                {step.status === 'current' && (
                  <div className="relative">
                    <Loader2 
                      className="h-8 w-8 text-primary animate-spin" 
                      data-testid={`timeline-icon-current-${index}`}
                    />
                    <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse" />
                  </div>
                )}
                {step.status === 'upcoming' && (
                  <Circle 
                    className="h-8 w-8 text-muted-foreground/40" 
                    data-testid={`timeline-icon-upcoming-${index}`}
                  />
                )}
                {step.status === 'failed' && (
                  <XCircle 
                    className="h-8 w-8 text-destructive" 
                    data-testid={`timeline-icon-failed-${index}`}
                  />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pt-0.5">
                <div className="flex items-center justify-between">
                  <h4
                    className={cn(
                      'font-semibold',
                      step.status === 'complete' && 'text-foreground',
                      step.status === 'current' && 'text-primary',
                      step.status === 'upcoming' && 'text-muted-foreground',
                      step.status === 'failed' && 'text-destructive'
                    )}
                    data-testid={`timeline-label-${index}`}
                  >
                    {step.label}
                  </h4>
                  {step.timestamp && !compact && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {step.timestamp}
                    </span>
                  )}
                </div>
                {step.description && !compact && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Helper function to create timeline steps from transaction status
export function createTransactionSteps(
  status: TimelineStatus,
  labels: { pending: string; processing: string; confirmed: string },
  timestamps?: { pending?: string; processing?: string; confirmed?: string }
): TimelineStep[] {
  const steps: TimelineStep[] = [
    {
      label: labels.pending,
      status: 'complete',
      timestamp: timestamps?.pending,
    },
  ];

  if (status === 'pending') {
    steps.push({
      label: labels.processing,
      status: 'upcoming',
    });
    steps.push({
      label: labels.confirmed,
      status: 'upcoming',
    });
  } else if (status === 'processing') {
    steps.push({
      label: labels.processing,
      status: 'current',
      timestamp: timestamps?.processing,
    });
    steps.push({
      label: labels.confirmed,
      status: 'upcoming',
    });
  } else if (status === 'confirmed') {
    steps.push({
      label: labels.processing,
      status: 'complete',
      timestamp: timestamps?.processing,
    });
    steps.push({
      label: labels.confirmed,
      status: 'complete',
      timestamp: timestamps?.confirmed,
    });
  } else if (status === 'failed') {
    steps.push({
      label: labels.processing,
      status: 'failed',
      timestamp: timestamps?.processing,
    });
    steps.push({
      label: labels.confirmed,
      status: 'upcoming',
    });
  }

  return steps;
}
