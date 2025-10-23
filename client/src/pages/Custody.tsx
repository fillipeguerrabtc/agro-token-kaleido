import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { StatsCard } from '@/components/StatsCard';
import {
  Flame,
  Snowflake,
  Shield,
  Server,
  Lock,
  Key,
  CheckCircle2,
  Activity,
  Cloud,
} from 'lucide-react';

export default function Custody() {
  const { t } = useTranslation();
  const [hotWalletName, setHotWalletName] = useState('');
  const [coldWalletName, setColdWalletName] = useState('');

  // Mock data
  const hotWallets = [
    {
      nameKey: 'custody.primary_hot',
      address: '0x742d...c3a8',
      balance: '125,000 BRLx',
      lastOpValue: '2',
      lastOpUnit: 'custody.min_ago',
    },
    {
      nameKey: 'custody.secondary_hot',
      address: '0x8a1f...d2b9',
      balance: '87,500 BRLx',
      lastOpValue: '15',
      lastOpUnit: 'custody.min_ago',
    },
  ];

  const coldWallets = [
    {
      nameKey: 'custody.treasury_vault',
      address: '0x1c4e...f7a3',
      balance: '2,500,000 BRLx',
      lastOpValue: '3',
      lastOpUnit: 'custody.days_ago',
    },
    {
      nameKey: 'custody.reserve_vault',
      address: '0x9b2d...e8c1',
      balance: '1,800,000 BRLx',
      lastOpValue: '5',
      lastOpUnit: 'custody.days_ago',
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2" data-testid="heading-custody">
          {t('custody.title')}
        </h1>
        <p className="text-muted-foreground">{t('custody.subtitle')}</p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <StatsCard
          title={t('custody.total_assets')}
          value="R$ 4.5M"
          subtitle={t('custody.in_custody')}
          icon={Shield}
        />
        <StatsCard
          title={t('custody.hot_wallets')}
          value="2"
          subtitle={t('custody.hot_subtitle')}
          icon={Flame}
        />
        <StatsCard
          title={t('custody.cold_wallets')}
          value="2"
          subtitle={t('custody.cold_subtitle')}
          icon={Snowflake}
        />
      </div>

      {/* Custody Tabs */}
      <Tabs defaultValue="hot" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="hot" data-testid="tab-hot-custody">
            <Flame className="h-4 w-4 mr-2" />
            {t('custody.hot_custody')}
          </TabsTrigger>
          <TabsTrigger value="cold" data-testid="tab-cold-custody">
            <Snowflake className="h-4 w-4 mr-2" />
            {t('custody.cold_custody')}
          </TabsTrigger>
        </TabsList>

        {/* Hot Custody */}
        <TabsContent value="hot" className="space-y-6 mt-6">
          <Card className="border-2 border-orange-500/20 bg-orange-500/5">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-orange-500" />
                    {t('custody.hot_custody')}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {t('custody.hot_desc')}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="bg-chart-3/10 text-chart-3 border-chart-3">
                  <Activity className="h-3 w-3 mr-1" />
                  {t('custody.online')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Security Features */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-background">
                  <Cloud className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">{t('custody.cloud_hsm')}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('custody.fips_140_2')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-background">
                  <Lock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">{t('custody.aws_nitro')}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('custody.confidential_computing')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-background">
                  <CheckCircle2 className="h-5 w-5 text-chart-3 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">AES-256</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('custody.encryption')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Hot Wallets List */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">{t('custody.active_sessions')}</h4>
                {hotWallets.map((wallet, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover-elevate"
                    data-testid={`hot-wallet-${index}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-orange-500" />
                        <span className="font-medium">{t(wallet.nameKey)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground font-mono mt-1">
                        {wallet.address}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{wallet.balance}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('custody.last_operation')}: {wallet.lastOpValue} {t(wallet.lastOpUnit)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Create Hot Wallet */}
              <div className="border-t pt-6">
                <Label htmlFor="hot-wallet-name" className="mb-2 block">
                  {t('custody.create_hot_wallet')}
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="hot-wallet-name"
                    placeholder={t('custody.wallet_name')}
                    value={hotWalletName}
                    onChange={(e) => setHotWalletName(e.target.value)}
                    data-testid="input-hot-wallet-name"
                  />
                  <Button data-testid="button-create-hot-wallet">
                    {t('custody.create_hot_wallet')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cold Custody */}
        <TabsContent value="cold" className="space-y-6 mt-6">
          <Card className="border-2 border-blue-500/20 bg-blue-500/5">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Snowflake className="h-5 w-5 text-blue-500" />
                    {t('custody.cold_custody')}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {t('custody.cold_desc')}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500">
                  <Lock className="h-3 w-3 mr-1" />
                  {t('custody.secured')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Security Features */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-background">
                  <Server className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">{t('custody.physical_hsm')}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('custody.fips_140_3')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-background">
                  <Shield className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">{t('custody.air_gapped')}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('custody.network_isolated')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-background">
                  <Key className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">{t('custody.multi_sig')}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('custody.threshold')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Cold Wallets List */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">{t('custody.secure_vaults')}</h4>
                {coldWallets.map((wallet, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover-elevate"
                    data-testid={`cold-wallet-${index}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">{t(wallet.nameKey)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground font-mono mt-1">
                        {wallet.address}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{wallet.balance}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('custody.last_operation')}: {wallet.lastOpValue} {t(wallet.lastOpUnit)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Create Cold Wallet */}
              <div className="border-t pt-6">
                <Label htmlFor="cold-wallet-name" className="mb-2 block">
                  {t('custody.create_cold_wallet')}
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="cold-wallet-name"
                    placeholder={t('custody.wallet_name')}
                    value={coldWalletName}
                    onChange={(e) => setColdWalletName(e.target.value)}
                    data-testid="input-cold-wallet-name"
                  />
                  <Button data-testid="button-create-cold-wallet">
                    {t('custody.create_cold_wallet')}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  ⚠️ Cold wallet creation requires multi-party approval and physical HSM ceremony
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AWS Integration Info */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Cloud className="h-5 w-5 text-primary" />
            {t('custody.confidential_computing')} AWS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-sm mb-2">AWS Nitro Enclaves</h4>
              <p className="text-sm text-muted-foreground">
                Isolated compute environments with cryptographic attestation for hot custody operations.
                All key operations run in tamper-proof enclaves with verifiable execution.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-2">CloudHSM Integration</h4>
              <p className="text-sm text-muted-foreground">
                FIPS 140-2 Level 3 validated hardware security modules managed by AWS with automatic
                key rotation and audit logging for compliance.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
