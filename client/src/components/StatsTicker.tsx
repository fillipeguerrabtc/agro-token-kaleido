import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { TrendingUp, Wallet, ShoppingBag, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PlatformStats {
  totalWallets: number;
  totalAgroTokens: number;
  activeListings: number;
  marketplaceVolume: number;
  transactions24h: number;
  brlxSupply: number;
  tvl: number;
}

export function StatsTicker() {
  const { t } = useTranslation();
  const [animateKey, setAnimateKey] = useState(0);

  const { data: stats, isLoading } = useQuery<PlatformStats>({
    queryKey: ['/api/platform/stats'],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Trigger animation when data changes
  useEffect(() => {
    if (stats) {
      setAnimateKey(prev => prev + 1);
    }
  }, [stats]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  if (isLoading || !stats) {
    return (
      <div className="grid md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="text-center space-y-2">
            <div className="h-12 w-32 mx-auto animate-shimmer rounded" />
            <div className="h-4 w-24 mx-auto animate-shimmer rounded" />
          </div>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      icon: TrendingUp,
      label: t('stats.tvl'),
      value: formatCurrency(stats.tvl),
      color: 'from-[hsl(252,95%,62%)] to-[hsl(270,85%,65%)]',
    },
    {
      icon: ShoppingBag,
      label: t('stats.marketplace_volume'),
      value: formatCurrency(stats.marketplaceVolume),
      color: 'from-[hsl(142,70%,45%)] to-[hsl(152,65%,50%)]',
    },
    {
      icon: Wallet,
      label: t('stats.active_wallets'),
      value: formatNumber(stats.totalWallets),
      color: 'from-[hsl(38,92%,50%)] to-[hsl(45,90%,55%)]',
    },
    {
      icon: Activity,
      label: t('stats.transactions_24h'),
      value: formatNumber(stats.transactions24h),
      color: 'from-[hsl(200,95%,45%)] to-[hsl(210,90%,50%)]',
    },
  ];

  return (
    <div className="grid md:grid-cols-4 gap-6" data-testid="stats-ticker">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <div
            key={index}
            className="text-center group"
            data-testid={`stat-item-${index}`}
          >
            <div className="flex items-center justify-center mb-3">
              <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
            </div>
            <div
              key={animateKey}
              className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-2 animate-number-roll"
              data-testid={`stat-value-${index}`}
            >
              {item.value}
            </div>
            <div className="text-sm text-muted-foreground font-medium">
              {item.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
