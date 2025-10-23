import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface KaleidoGradientProps {
  className?: string;
  variant?: 'default' | 'mobile' | 'hero';
}

export function KaleidoGradient({ className, variant = 'default' }: KaleidoGradientProps = {}) {
  if (variant === 'mobile') {
    return (
      <div className={cn("absolute inset-0 -z-10 overflow-hidden pointer-events-none", className)}>
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-br from-[hsl(252,95%,62%)] via-[hsl(270,85%,65%)] to-[hsl(270,85%,65%)] opacity-90 dark:opacity-80" />
      </div>
    );
  }

  if (variant === 'hero') {
    return (
      <div className={cn("absolute inset-0 -z-10 overflow-hidden pointer-events-none", className)}>
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(252,95%,62%)] via-[hsl(260,90%,64%)] to-[hsl(270,85%,65%)] opacity-95 dark:opacity-90" />
      </div>
    );
  }

  return (
    <div className={cn("absolute inset-0 -z-10 overflow-hidden pointer-events-none", className)}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-br from-[hsl(252,95%,62%)] via-[hsl(270,85%,65%)] to-transparent opacity-20 dark:opacity-10 blur-3xl" />
      <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-gradient-to-l from-[hsl(270,85%,65%)] to-transparent opacity-15 dark:opacity-10 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-[hsl(252,95%,62%)] to-transparent opacity-15 dark:opacity-10 blur-3xl" />
    </div>
  );
}

export function MobileGradientHeader({ children }: { children: ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-b-3xl md:rounded-none">
      <KaleidoGradient variant="mobile" />
      <div className="relative z-10 p-4 pb-6 text-white">
        {children}
      </div>
    </div>
  );
}
