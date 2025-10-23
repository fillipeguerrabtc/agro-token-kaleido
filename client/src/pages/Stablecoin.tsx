import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatsCard } from '@/components/StatsCard';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/contexts/WalletContext';
import { Coins, TrendingUp, ArrowDownToLine, ArrowUpFromLine, Send } from 'lucide-react';

export default function Stablecoin() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { wallet } = useWallet();
  const [mintAmount, setMintAmount] = useState('');
  const [burnAmount, setBurnAmount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferTo, setTransferTo] = useState('');

  const { data: stats } = useQuery({
    queryKey: ['/api/stablecoin/stats'],
  });

  const mintMutation = useMutation({
    mutationFn: async (amount: string) => {
      if (!wallet) throw new Error(t('wallet.no_wallet_error'));
      return await apiRequest('POST', '/api/stablecoin/mint', { amount, address: wallet.address });
    },
    onSuccess: () => {
      toast({ title: t('common.success'), description: t('stablecoin.mint_success') });
      queryClient.invalidateQueries({ queryKey: ['/api/stablecoin/stats'] });
      setMintAmount('');
    },
    onError: (error: any) => {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    },
  });

  const burnMutation = useMutation({
    mutationFn: async (amount: string) => {
      if (!wallet) throw new Error(t('wallet.no_wallet_error'));
      return await apiRequest('POST', '/api/stablecoin/burn', { amount, address: wallet.address });
    },
    onSuccess: () => {
      toast({ title: t('common.success'), description: t('stablecoin.burn_success') });
      queryClient.invalidateQueries({ queryKey: ['/api/stablecoin/stats'] });
      setBurnAmount('');
    },
    onError: (error: any) => {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    },
  });

  const transferMutation = useMutation({
    mutationFn: async (data: { amount: string; to: string }) => {
      if (!wallet) throw new Error(t('wallet.no_wallet_error'));
      return await apiRequest('POST', '/api/stablecoin/transfer', { ...data, from: wallet.address });
    },
    onSuccess: () => {
      toast({ title: t('common.success'), description: t('stablecoin.transfer_success') });
      setTransferAmount('');
      setTransferTo('');
    },
    onError: (error: any) => {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    },
  });

  if (!wallet) {
    return (
      <div className="p-6 lg:p-8">
        <Card>
          <CardHeader>
            <CardTitle>{t('stablecoin.title')}</CardTitle>
            <CardDescription>{t('wallet.no_wallet')}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2" data-testid="heading-stablecoin">
          {t('stablecoin.title')}
        </h1>
        <p className="text-muted-foreground">{t('stablecoin.subtitle')}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatsCard
          title={t('stablecoin.total_supply')}
          value={`${stats?.totalSupply || '0'} BRLx`}
          icon={Coins}
        />
        <StatsCard
          title={t('stablecoin.your_balance')}
          value={`${wallet.brlxBalance} BRLx`}
          icon={TrendingUp}
        />
        <StatsCard
          title={t('stablecoin.holders')}
          value={stats?.holders || '0'}
          icon={ArrowUpFromLine}
        />
      </div>

      <Tabs defaultValue="mint" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="mint" data-testid="tab-mint">
            <ArrowUpFromLine className="h-4 w-4 mr-2" />
            {t('stablecoin.mint')}
          </TabsTrigger>
          <TabsTrigger value="burn" data-testid="tab-burn">
            <ArrowDownToLine className="h-4 w-4 mr-2" />
            {t('stablecoin.burn')}
          </TabsTrigger>
          <TabsTrigger value="transfer" data-testid="tab-transfer">
            <Send className="h-4 w-4 mr-2" />
            {t('stablecoin.transfer')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mint" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('stablecoin.mint_brlx')}</CardTitle>
              <CardDescription>{t('stablecoin.mint_desc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mint-amount">{t('stablecoin.amount')} (BRLx)</Label>
                <Input
                  id="mint-amount"
                  type="number"
                  placeholder="1000.00"
                  value={mintAmount}
                  onChange={(e) => setMintAmount(e.target.value)}
                  data-testid="input-mint-amount"
                />
              </div>
              <Button
                onClick={() => mintMutation.mutate(mintAmount)}
                disabled={mintMutation.isPending || !mintAmount}
                className="w-full"
                data-testid="button-mint"
              >
                {mintMutation.isPending ? t('stablecoin.minting') : t('stablecoin.mint_brlx')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="burn" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('stablecoin.burn_brlx')}</CardTitle>
              <CardDescription>{t('stablecoin.burn_desc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="burn-amount">{t('stablecoin.amount')} (BRLx)</Label>
                <Input
                  id="burn-amount"
                  type="number"
                  placeholder="500.00"
                  value={burnAmount}
                  onChange={(e) => setBurnAmount(e.target.value)}
                  data-testid="input-burn-amount"
                />
              </div>
              <Button
                onClick={() => burnMutation.mutate(burnAmount)}
                disabled={burnMutation.isPending || !burnAmount}
                className="w-full"
                variant="destructive"
                data-testid="button-burn"
              >
                {burnMutation.isPending ? t('stablecoin.burning') : t('stablecoin.burn_brlx')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transfer" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('stablecoin.transfer_brlx')}</CardTitle>
              <CardDescription>{t('stablecoin.transfer_desc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="transfer-to">{t('stablecoin.recipient')}</Label>
                <Input
                  id="transfer-to"
                  placeholder="0x..."
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                  className="font-mono"
                  data-testid="input-transfer-to"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transfer-amount">{t('stablecoin.amount')} (BRLx)</Label>
                <Input
                  id="transfer-amount"
                  type="number"
                  placeholder="250.00"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  data-testid="input-transfer-amount"
                />
              </div>
              <Button
                onClick={() => transferMutation.mutate({ amount: transferAmount, to: transferTo })}
                disabled={transferMutation.isPending || !transferAmount || !transferTo}
                className="w-full"
                data-testid="button-transfer"
              >
                {transferMutation.isPending ? t('stablecoin.transferring') : t('stablecoin.transfer_brlx')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
