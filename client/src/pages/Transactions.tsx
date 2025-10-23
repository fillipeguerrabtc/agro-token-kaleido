import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ExternalLink, Search, RefreshCcw } from 'lucide-react';
import { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';

export default function Transactions() {
  const { t } = useTranslation();
  const { wallet } = useWallet();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: transactions = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/transactions/all'],
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: 'outline' as const, text: t('transactions.pending') },
      confirmed: { variant: 'default' as const, text: t('transactions.confirmed') },
      failed: { variant: 'destructive' as const, text: t('transactions.failed') },
    };
    const config = variants[status as keyof typeof variants] || variants.pending;
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const filteredTransactions = transactions.filter((tx: any) =>
    tx.txHash?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.fromAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.toAddress?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2" data-testid="heading-transactions">
            {t('transactions.title')}
          </h1>
          <p className="text-muted-foreground">{t('transactions.subtitle')}</p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => refetch()}
          data-testid="button-refresh-transactions"
        >
          <RefreshCcw className="h-4 w-4" />
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>On-Chain Transactions</CardTitle>
              <CardDescription>
                Sincronizado da rede Sepolia via Alchemy
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por hash ou endereço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
                data-testid="input-search-transactions"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('common.loading')}
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'Nenhuma transação encontrada' : t('transactions.no_transactions')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('transactions.hash')}</TableHead>
                    <TableHead>{t('transactions.type')}</TableHead>
                    <TableHead>{t('transactions.from')}</TableHead>
                    <TableHead>{t('transactions.to')}</TableHead>
                    <TableHead>{t('transactions.value')}</TableHead>
                    <TableHead>{t('transactions.status')}</TableHead>
                    <TableHead>{t('transactions.time')}</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((tx: any, index: number) => (
                    <TableRow key={tx.id} data-testid={`transaction-row-${index}`}>
                      <TableCell className="font-mono text-xs">
                        {tx.txHash?.slice(0, 8)}...{tx.txHash?.slice(-6)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{tx.type}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {tx.fromAddress ? `${tx.fromAddress.slice(0, 6)}...${tx.fromAddress.slice(-4)}` : '-'}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {tx.toAddress ? `${tx.toAddress.slice(0, 6)}...${tx.toAddress.slice(-4)}` : '-'}
                      </TableCell>
                      <TableCell className="font-medium">{tx.value || '-'}</TableCell>
                      <TableCell>{getStatusBadge(tx.status)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(tx.timestamp).toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <a
                          href={`https://sepolia.etherscan.io/tx/${tx.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline text-xs"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
