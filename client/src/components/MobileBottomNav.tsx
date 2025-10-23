import { Home, FileText, Wallet, TrendingUp, Menu } from 'lucide-react';
import { useLocation, Link } from 'wouter';
import { cn } from '@/lib/utils';
import { useDevice } from '@/contexts/DeviceContext';
import { useTranslation } from 'react-i18next';

export function MobileBottomNav() {
  const [location] = useLocation();
  const { isMobile } = useDevice();
  const { t } = useTranslation();

  if (!isMobile) return null;

  const navItems = [
    { path: '/', icon: Home, label: t('nav.home') },
    { path: '/marketplace', icon: TrendingUp, label: t('nav.marketplace') },
    { path: '/stablecoin', icon: Wallet, label: 'BRLx' },
    { path: '/transactions', icon: FileText, label: t('nav.transactions') },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
      data-testid="mobile-bottom-nav"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[60px]",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              data-testid={`nav-${item.path.slice(1) || 'home'}`}
            >
              <Icon className={cn("h-5 w-5", isActive && "fill-primary/20")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
