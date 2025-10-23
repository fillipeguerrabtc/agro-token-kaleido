import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatsCard } from '@/components/StatsCard';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Building2, TrendingUp, Coins, Plus, Wheat, FileText, Calendar } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';

export default function Originator() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { wallet } = useWallet();
  const [assetType, setAssetType] = useState('');
  const [tokenName, setTokenName] = useState('');
  const [value, setValue] = useState('');
  const [maturityDate, setMaturityDate] = useState('');
  const [description, setDescription] = useState('');

  const { data: tokens = [], isLoading } = useQuery({
    queryKey: ['/api/agrotokens'],
    enabled: !!wallet,
  });

  const createTokenMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!wallet) throw new Error(t('wallet.no_wallet_error'));
      return await apiRequest('POST', '/api/agrotokens', data);
    },
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: t('originator.success'),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/agrotokens'] });
      setAssetType('');
      setTokenName('');
      setValue('');
      setMaturityDate('');
      setDescription('');
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleCreate = () => {
    if (!assetType || !tokenName || !value || !maturityDate) {
      toast({
        title: t('common.error'),
        description: t('originator.fill_fields'),
        variant: 'destructive',
      });
      return;
    }

    createTokenMutation.mutate({
      assetType,
      name: tokenName,
      value,
      maturityDate,
      description,
      ownerAddress: wallet?.address,
    });
  };

  if (!wallet) {
    return (
      <div className="p-6 lg:p-8">
        <Card>
          <CardHeader>
            <CardTitle>{t('originator.title')}</CardTitle>
            <CardDescription>{t('wallet.no_wallet')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t('originator.connect_wallet_desc')}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalValue = tokens.reduce((sum: number, token: any) => sum + parseFloat(token.value || 0), 0);

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2" data-testid="heading-originator">
          {t('originator.title')}
        </h1>
        <p className="text-muted-foreground">{t('originator.subtitle')}</p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <StatsCard
          title={t('originator.total_value')}
          value={`R$ ${totalValue.toLocaleString('pt-BR')}`}
          icon={TrendingUp}
        />
        <StatsCard
          title={t('originator.total_tokens')}
          value={tokens.length.toString()}
          icon={Coins}
        />
        <StatsCard
          title={t('originator.success_rate')}
          value="100%"
          icon={Building2}
        />
      </div>

      {/* Create Token Form */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {t('originator.create_token')}
          </CardTitle>
          <CardDescription>
            Tokenize ativos agrícolas na blockchain Sepolia
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="asset-type">{t('originator.asset_type')} *</Label>
              <Select value={assetType} onValueChange={setAssetType}>
                <SelectTrigger id="asset-type" data-testid="select-asset-type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cpr" data-testid="option-cpr">
                    🌾 {t('originator.asset_types.cpr')}
                  </SelectItem>
                  <SelectItem value="receivable" data-testid="option-receivable">
                    💰 {t('originator.asset_types.receivable')}
                  </SelectItem>
                  <SelectItem value="harvest" data-testid="option-harvest">
                    📋 {t('originator.asset_types.harvest')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="token-name">{t('originator.token_name')} *</Label>
              <Input
                id="token-name"
                placeholder="Ex: Safra Soja 2024/25"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                data-testid="input-token-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">{t('originator.value')} *</Label>
              <Input
                id="value"
                type="number"
                placeholder="100000.00"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                data-testid="input-value"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maturity">{t('originator.maturity_date')} *</Label>
              <Input
                id="maturity"
                type="date"
                value={maturityDate}
                onChange={(e) => setMaturityDate(e.target.value)}
                data-testid="input-maturity-date"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('originator.description')}</Label>
            <Textarea
              id="description"
              placeholder="Descrição detalhada do ativo agrícola..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px]"
              data-testid="textarea-description"
            />
          </div>

          <Button
            onClick={handleCreate}
            disabled={createTokenMutation.isPending}
            size="lg"
            className="w-full"
            data-testid="button-create-token"
          >
            {createTokenMutation.isPending ? t('originator.creating') : t('originator.create')}
          </Button>
        </CardContent>
      </Card>

      {/* My Tokens */}
      <div>
        <h2 className="text-xl font-semibold mb-4">{t('originator.my_tokens')}</h2>
        {isLoading ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">{t('common.loading')}</p>
            </CardContent>
          </Card>
        ) : tokens.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                Você ainda não criou nenhum AgroToken
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tokens.map((token: any, index: number) => {
              const Icon = token.assetType === 'cpr' ? Wheat : token.assetType === 'receivable' ? Coins : FileText;
              return (
                <Card key={token.id} className="hover-elevate" data-testid={`token-card-${index}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[hsl(252,95%,62%)] to-[hsl(270,85%,65%)] flex items-center justify-center">
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{token.name}</CardTitle>
                          <p className="text-xs text-muted-foreground font-mono mt-1">
                            ID: {token.tokenId?.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {token.assetType?.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Valor:</span>
                      <span className="font-semibold">R$ {parseFloat(token.value).toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Vencimento:</span>
                      <span className="font-mono text-xs">
                        {new Date(token.maturityDate).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    {token.txHash && (
                      <a
                        href={`https://sepolia.etherscan.io/tx/${token.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        Ver no Etherscan →
                      </a>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
