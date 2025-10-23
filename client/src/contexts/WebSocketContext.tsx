import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from './WalletContext';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ArrowRight, ExternalLink, Eye } from 'lucide-react';

interface WebSocketEvent {
  type: string;
  data: any;
  timestamp: string;
}

interface WebSocketContextType {
  isConnected: boolean;
  lastEvent: WebSocketEvent | null;
  sendMessage: (message: any) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<WebSocketEvent | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();
  const { wallet } = useWallet();
  const { t } = useTranslation();

  const connect = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    console.log('[WebSocket] Connecting to:', wsUrl);

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[WebSocket] Connected');
      setIsConnected(true);

      if (wallet?.address) {
        ws.send(JSON.stringify({
          type: 'subscribe',
          address: wallet.address
        }));
      }

      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, 30000);

      ws.addEventListener('close', () => {
        clearInterval(pingInterval);
      });
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        setLastEvent(message);

        switch (message.type) {
          case 'transaction':
            toast({
              title: '✅ ' + t('notifications.new_transaction'),
              description: `${message.data.txHash?.slice(0, 16)}...`,
              action: message.data.txHash ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.open(`https://sepolia.etherscan.io/tx/${message.data.txHash}`, '_blank')}
                  className="gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  Etherscan
                </Button>
              ) : undefined,
            });
            break;

          case 'marketplace_listing':
            toast({
              title: '🏪 ' + t('notifications.new_marketplace_listing'),
              description: `${message.data.agroToken?.name || 'Token'} - R$ ${new Intl.NumberFormat('pt-BR').format(message.data.price)}`,
              action: (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.location.href = '/marketplace'}
                  className="gap-1"
                >
                  <Eye className="h-3 w-3" />
                  {t('notifications.view_marketplace')}
                </Button>
              ),
            });
            break;

          case 'marketplace_purchase':
            toast({
              title: '🎉 ' + t('notifications.purchase_confirmed'),
              description: t('notifications.agrotoken_acquired'),
              action: (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.location.href = '/investor'}
                  className="gap-1"
                >
                  <ArrowRight className="h-3 w-3" />
                  {t('notifications.view_portfolio')}
                </Button>
              ),
            });
            break;

          case 'stablecoin_mint':
            toast({
              title: '💰 ' + t('notifications.brlx_minted'),
              description: `R$ ${new Intl.NumberFormat('pt-BR').format(message.data.amount)} BRLx ${t('notifications.added_to_wallet')}`,
              action: (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.location.href = '/marketplace'}
                  className="gap-1"
                >
                  <ArrowRight className="h-3 w-3" />
                  {t('notifications.invest_marketplace')}
                </Button>
              ),
            });
            break;

          case 'stablecoin_burn':
            toast({
              title: '🔥 ' + t('notifications.brlx_burned'),
              description: `R$ ${new Intl.NumberFormat('pt-BR').format(message.data.amount)} BRLx ${t('notifications.removed_from_wallet')}`,
            });
            break;

          case 'cross_border_payment':
            toast({
              title: '🌍 ' + t('notifications.international_payment'),
              description: `R$ ${new Intl.NumberFormat('pt-BR').format(message.data.amountBRL)} → ${message.data.destinationCurrency}`,
              action: message.data.txHash ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.open(`https://sepolia.etherscan.io/tx/${message.data.txHash}`, '_blank')}
                  className="gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  {t('notifications.view_transaction')}
                </Button>
              ) : undefined,
            });
            break;

          case 'connected':
            console.log('[WebSocket] Connection acknowledged:', message.clientId);
            break;

          case 'pong':
            break;

          default:
            console.log('[WebSocket] Unknown event type:', message.type);
        }
      } catch (error) {
        console.error('[WebSocket] Failed to parse message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('[WebSocket] Error:', error);
    };

    ws.onclose = () => {
      console.log('[WebSocket] Disconnected');
      setIsConnected(false);

      reconnectTimeoutRef.current = setTimeout(() => {
        console.log('[WebSocket] Reconnecting...');
        connect();
      }, 3000);
    };
  };

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (isConnected && wsRef.current && wallet?.address) {
      wsRef.current.send(JSON.stringify({
        type: 'subscribe',
        address: wallet.address
      }));
    }
  }, [wallet?.address, isConnected]);

  const sendMessage = (message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  return (
    <WebSocketContext.Provider value={{ isConnected, lastEvent, sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}
