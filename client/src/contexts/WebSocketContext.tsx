import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from './WalletContext';

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
              title: 'Nova Transação',
              description: `Transação recebida: ${message.data.txHash?.slice(0, 10)}...`,
            });
            break;

          case 'marketplace_listing':
            toast({
              title: 'Novo AgroToken no Marketplace',
              description: `${message.data.agroToken?.name || 'Token'} listado por R$ ${message.data.price}`,
            });
            break;

          case 'marketplace_purchase':
            toast({
              title: 'Compra Confirmada',
              description: `AgroToken adquirido com sucesso!`,
            });
            break;

          case 'stablecoin_mint':
            toast({
              title: 'BRLx Mintado',
              description: `R$ ${message.data.amount} BRLx adicionados à sua carteira`,
            });
            break;

          case 'stablecoin_burn':
            toast({
              title: 'BRLx Queimado',
              description: `R$ ${message.data.amount} BRLx removidos da sua carteira`,
            });
            break;

          case 'cross_border_payment':
            toast({
              title: 'Pagamento Internacional',
              description: `Pagamento de R$ ${message.data.amountBRL} processado`,
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
