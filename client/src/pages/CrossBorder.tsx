import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWallet } from '@/contexts/WalletContext';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Globe, TrendingUp, Send, ExternalLink, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Schema will use default messages - we'll validate in the component
const crossBorderSchema = z.object({
  amountBRL: z.string().min(1),
  recipientEmail: z.string().email(),
  recipientCountry: z.string().min(1),
  destinationCurrency: z.string().min(1),
  liquidationPartner: z.string().min(1),
});

type CrossBorderForm = z.infer<typeof crossBorderSchema>;

export default function CrossBorder() {
  const { t } = useTranslation();
  const { wallet } = useWallet();
  const { toast } = useToast();

  // Fetch real-time exchange rates
  const { data: exchangeRates, isLoading: ratesLoading, isError: ratesError, refetch: refetchRates } = useQuery<Record<'USD' | 'EUR' | 'GBP', number>>({
    queryKey: ['/api/crossborder/rates'],
    refetchInterval: 60000, // Refresh every minute
    retry: 3,
  });

  const form = useForm<CrossBorderForm>({
    resolver: zodResolver(crossBorderSchema),
    defaultValues: {
      amountBRL: '',
      recipientEmail: '',
      recipientCountry: 'US',
      destinationCurrency: 'USD',
      liquidationPartner: 'circle',
    },
  });

  const watchAmount = form.watch('amountBRL');
  const watchCurrency = form.watch('destinationCurrency');
  
  const currentRate = exchangeRates?.[watchCurrency as keyof typeof exchangeRates] || 0;
  const convertedAmount = watchAmount && currentRate
    ? (parseFloat(watchAmount) / currentRate).toFixed(2)
    : '0.00';
  
  const fees = watchAmount ? (parseFloat(watchAmount) * 0.015).toFixed(2) : '0.00';

  // Fetch payment history
  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['/api/crossborder', wallet?.address],
    enabled: !!wallet?.address,
  });

  const createPaymentMutation = useMutation({
    mutationFn: async (data: CrossBorderForm) => {
      if (!wallet?.address) throw new Error(t('wallet.no_wallet_error'));
      
      const rate = exchangeRates?.[data.destinationCurrency as keyof typeof exchangeRates];
      if (!rate) throw new Error('Exchange rate not available');
      
      const response = await apiRequest('POST', '/api/crossborder', {
        ...data,
        fromAddress: wallet.address,
        exchangeRate: rate,
        fees,
      });
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crossborder'] });
      toast({
        title: t('crossborder.success'),
        description: t('crossborder.successDesc'),
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: t('crossborder.error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: CrossBorderForm) => {
    createPaymentMutation.mutate(data);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'failed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (!wallet) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {t('crossborder.title')}
            </CardTitle>
            <CardDescription>{t('crossborder.connectWallet')}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (ratesLoading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {t('crossborder.title')}
            </CardTitle>
            <CardDescription>{t('common.loading')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
              <span>Loading real-time exchange rates...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (ratesError || !exchangeRates) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {t('crossborder.title')}
            </CardTitle>
            <CardDescription>{t('common.error')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-destructive">
              <XCircle className="h-4 w-4" />
              <span>Failed to load exchange rates. Please try again.</span>
            </div>
            <Button onClick={() => refetchRates()} variant="outline" data-testid="button-retry-rates">
              <TrendingUp className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[hsl(252,95%,62%)] to-[hsl(270,85%,65%)] bg-clip-text text-transparent">
          {t('crossborder.title')}
        </h1>
        <p className="text-muted-foreground mt-1">{t('crossborder.subtitle')}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{t('crossborder.volume24h')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 2,847,392</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600">+12.5%</span> vs yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{t('crossborder.avgFee')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.5%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('crossborder.lowerThanBanks')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{t('crossborder.avgTime')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">~45 min</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('crossborder.poweredBy')}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="send" className="space-y-4">
        <TabsList>
          <TabsTrigger value="send" data-testid="tab-send">
            <Send className="h-4 w-4 mr-2" />
            {t('crossborder.sendMoney')}
          </TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-history">
            <Clock className="h-4 w-4 mr-2" />
            {t('crossborder.history')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('crossborder.newPayment')}</CardTitle>
              <CardDescription>{t('crossborder.paymentDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="amountBRL"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('crossborder.amountBRL')}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            data-testid="input-amount"
                          />
                        </FormControl>
                        <FormDescription>
                          {t('crossborder.amountDesc')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="recipientCountry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('crossborder.country')}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-country">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="US">United States</SelectItem>
                              <SelectItem value="EU">European Union</SelectItem>
                              <SelectItem value="GB">United Kingdom</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="destinationCurrency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('crossborder.currency')}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-currency">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="USD">USD - US Dollar</SelectItem>
                              <SelectItem value="EUR">EUR - Euro</SelectItem>
                              <SelectItem value="GBP">GBP - British Pound</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="recipientEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('crossborder.recipientEmail')}</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="recipient@example.com"
                            {...field}
                            data-testid="input-email"
                          />
                        </FormControl>
                        <FormDescription>
                          {t('crossborder.emailDesc')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="liquidationPartner"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('crossborder.partner')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-partner">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="circle">Circle (USDC)</SelectItem>
                            <SelectItem value="ubyx">Ubyx Network</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {t('crossborder.partnerDesc')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <div className="space-y-2 bg-muted/50 p-4 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('crossborder.youSend')}</span>
                      <span className="font-medium">R$ {watchAmount || '0.00'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('crossborder.fees')}</span>
                      <span className="font-medium">R$ {fees}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('crossborder.exchangeRate')}</span>
                      <span className="font-medium">
                        1 {watchCurrency} = R$ {exchangeRates[watchCurrency as keyof typeof exchangeRates]?.toFixed(2)}
                      </span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-semibold">
                      <span>{t('crossborder.recipientGets')}</span>
                      <span className="text-lg">
                        {watchCurrency} {convertedAmount}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createPaymentMutation.isPending}
                    data-testid="button-send-payment"
                  >
                    {createPaymentMutation.isPending ? t('common.processing') : t('crossborder.sendPayment')}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('crossborder.paymentHistory')}</CardTitle>
              <CardDescription>{t('crossborder.historyDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  {t('common.loading')}
                </div>
              ) : payments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {t('crossborder.noPayments')}
                </div>
              ) : (
                <div className="space-y-4">
                  {payments.map((payment: any) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
                      data-testid={`payment-${payment.id}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-muted">
                          {getStatusIcon(payment.status)}
                        </div>
                        <div>
                          <div className="font-medium">{payment.recipientEmail}</div>
                          <div className="text-sm text-muted-foreground">
                            {payment.recipientCountry} • {payment.destinationCurrency}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(payment.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">R$ {payment.amountBRL}</div>
                        <div className="text-sm text-muted-foreground">
                          {payment.destinationCurrency} {payment.amountReceived}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={getStatusBadgeVariant(payment.status)}>
                            {payment.status}
                          </Badge>
                          {payment.brlxTxHash && (
                            <a
                              href={`https://sepolia.etherscan.io/tx/${payment.brlxTxHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                              data-testid={`link-explorer-${payment.id}`}
                            >
                              <ExternalLink className="h-3 w-3" />
                              {t('crossborder.viewOnEtherscan')}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
