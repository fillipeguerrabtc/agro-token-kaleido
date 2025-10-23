import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/StatsCard';
import { Badge } from '@/components/ui/badge';
import { useWallet } from '@/contexts/WalletContext';
import { Wallet2, TrendingUp, Activity, Coins, ExternalLink } from 'lucide-react';

export default function Investor() {
  const { t } = useTranslation();
  const { wallet } = useWallet();

  const { data: portfolio = [], isLoading } = useQuery({
    queryKey: ['/api/portfolio', wallet?.address],
    enabled: !!wallet,
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['/api/transactions', wallet?.address],
    enabled: !!wallet,
  });

  if (!wallet) {
    return (
      <div className="p-6 lg:p-8">
        <Card>
          <CardHeader>
            <CardTitle>{t('investor.title')}</CardTitle>
            <CardDescription>{t('wallet.no_wallet')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t('investor.connect_wallet_desc')}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalValue = portfolio.reduce((sum: number, item: any) => sum + parseFloat(item.value || 0), 0);

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2" data-testid="heading-investor">
          {t('investor.title')}
        </h1>
        <p className="text-muted-foreground">{t('investor.subtitle')}</p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <StatsCard
          title={t('investor.total_value')}
          value={`R$ ${totalValue.toLocaleString('pt-BR')}`}
          icon={TrendingUp}
        />
        <StatsCard
          title={t('investor.agro_tokens')}
          value={portfolio.length.toString()}
          icon={Coins}
        />
        <StatsCard
          title={t('wallet.brlx_balance')}
          value={wallet.brlxBalance}
          icon={Wallet2}
        />
      </div>

      {/* Portfolio */}
      <div>
        <h2 className="text-xl font-semibold mb-4">{t('investor.portfolio')}</h2>
        {isLoading ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">{t('common.loading')}</p>
            </CardContent>
          </Card>
        ) : portfolio.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                {t('investor.no_tokens')}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {portfolio.map((item: any, index: number) => (
              <Card key={item.id} className="hover-elevate" data-testid={`portfolio-item-${index}`}>
                <CardHeader>
                  <CardTitle className="text-base">{item.name}</CardTitle>
                  <CardDescription className="font-mono text-xs">
                    {item.tokenId}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t('investor.value')}:</span>
                    <span className="font-semibold">R$ {parseFloat(item.value).toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t('investor.type')}:</span>
                    <Badge variant="outline">{item.assetType}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t('investor.maturity')}:</span>
                    <span className="text-sm font-mono">
                      {new Date(item.maturityDate).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">{t('investor.transactions')}</h2>
        <Card>
          <CardContent className="p-0">
            {transactions.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                {t('transactions.no_transactions')}
              </div>
            ) : (
              <div className="divide-y">
                {transactions.slice(0, 5).map((tx: any, index: number) => (
                  <div
                    key={tx.id}
                    className="p-4 hover-elevate flex items-center justify-between"
                    data-testid={`transaction-${index}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Activity className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{tx.type}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {tx.txHash?.slice(0, 10)}...{tx.txHash?.slice(-8)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">{tx.value}</p>
                      <a
                        href={`https://sepolia.etherscan.io/tx/${tx.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                      >
                        Etherscan <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
