import { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut } from 'lucide-react';
import { ImportWalletDialog } from './ImportWalletDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from 'react-i18next';

export function WalletButton() {
  const { wallet, disconnect } = useWallet();
  const { t } = useTranslation();
  const [showImportDialog, setShowImportDialog] = useState(false);

  if (!wallet || !wallet.address) {
    return (
      <>
        <Button onClick={() => setShowImportDialog(true)} data-testid="button-import-wallet">
          <Wallet className="h-4 w-4 mr-2" />
          {t('wallet.import')}
        </Button>
        <ImportWalletDialog open={showImportDialog} onOpenChange={setShowImportDialog} />
      </>
    );
  }

  const shortAddress = `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" data-testid="button-wallet-connected">
          <Wallet className="h-4 w-4 mr-2" />
          {shortAddress}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="px-2 py-2">
          <p className="text-sm font-medium" data-testid="text-wallet-name">{wallet.name}</p>
          <p className="text-xs text-muted-foreground font-mono" data-testid="text-wallet-address">
            {wallet.address}
          </p>
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('wallet.eth_balance')}:</span>
              <span className="font-medium font-mono" data-testid="text-eth-balance">
                {wallet.ethBalance} ETH
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('wallet.brlx_balance')}:</span>
              <span className="font-medium font-mono" data-testid="text-brlx-balance">
                {wallet.brlxBalance} BRLx
              </span>
            </div>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={disconnect} data-testid="menu-item-disconnect">
          <LogOut className="h-4 w-4 mr-2" />
          Desconectar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
