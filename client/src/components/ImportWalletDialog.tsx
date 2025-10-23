import { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

type ImportWalletDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ImportWalletDialog({ open, onOpenChange }: ImportWalletDialogProps) {
  const { setWallet } = useWallet();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [privateKey, setPrivateKey] = useState('');

  const importMutation = useMutation({
    mutationFn: async (data: { name: string; privateKey: string }) => {
      const response = await apiRequest('POST', '/api/wallet/import', data);
      return response.json();
    },
    onSuccess: (data) => {
      setWallet({
        address: data.address,
        name: data.name,
        ethBalance: data.ethBalance,
        brlxBalance: data.brlxBalance,
      });
      toast({
        title: t('common.success'),
        description: t('wallet.connected'),
      });
      onOpenChange(false);
      setName('');
      setPrivateKey('');
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || 'Failed to import wallet',
        variant: 'destructive',
      });
    },
  });

  const handleImport = () => {
    if (!name || !privateKey) {
      toast({
        title: t('common.error'),
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }
    importMutation.mutate({ name, privateKey });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle data-testid="dialog-title-import-wallet">
            {t('wallet.import_title')}
          </DialogTitle>
          <DialogDescription>{t('wallet.import_desc')}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="wallet-name">{t('wallet.name')}</Label>
            <Input
              id="wallet-name"
              placeholder="My Sepolia Wallet"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="input-wallet-name"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="private-key">{t('wallet.private_key')}</Label>
            <Input
              id="private-key"
              type="password"
              placeholder="0x..."
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              className="font-mono text-sm"
              data-testid="input-private-key"
            />
            <p className="text-xs text-muted-foreground">
              ⚠️ Sua chave privada será criptografada e armazenada com segurança
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="button-cancel-import"
          >
            {t('wallet.cancel')}
          </Button>
          <Button
            onClick={handleImport}
            disabled={importMutation.isPending}
            data-testid="button-confirm-import"
          >
            {importMutation.isPending ? t('common.loading') : t('wallet.import_btn')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
