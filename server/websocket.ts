import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

interface WSClient {
  ws: WebSocket;
  address?: string;
}

export class BlockchainWebSocketServer {
  private wss: WebSocketServer;
  private clients: Map<string, WSClient> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws'
    });

    this.wss.on('connection', (ws: WebSocket) => {
      const clientId = Math.random().toString(36).substring(7);
      this.clients.set(clientId, { ws });

      console.log(`[WebSocket] Client connected: ${clientId}`);

      ws.on('message', (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(clientId, message);
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error);
        }
      });

      ws.on('close', () => {
        console.log(`[WebSocket] Client disconnected: ${clientId}`);
        this.clients.delete(clientId);
      });

      ws.on('error', (error) => {
        console.error(`[WebSocket] Error for client ${clientId}:`, error);
      });

      ws.send(JSON.stringify({
        type: 'connected',
        clientId,
        timestamp: new Date().toISOString()
      }));
    });
  }

  private handleMessage(clientId: string, message: any) {
    const client = this.clients.get(clientId);
    if (!client) return;

    switch (message.type) {
      case 'subscribe':
        if (message.address) {
          client.address = message.address.toLowerCase();
          console.log(`[WebSocket] Client ${clientId} subscribed to ${message.address}`);
        }
        break;

      case 'unsubscribe':
        client.address = undefined;
        console.log(`[WebSocket] Client ${clientId} unsubscribed`);
        break;

      case 'ping':
        client.ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
        break;

      default:
        console.log(`[WebSocket] Unknown message type: ${message.type}`);
    }
  }

  public broadcastToAddress(address: string, event: any) {
    let sentCount = 0;
    const normalizedAddress = address.toLowerCase();
    this.clients.forEach((client, clientId) => {
      if (client.address === normalizedAddress && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(event));
        sentCount++;
      }
    });
    if (sentCount > 0) {
      console.log(`[WebSocket] Broadcast to ${address}: ${event.type} (${sentCount} clients)`);
    }
  }

  public broadcast(event: any) {
    let sentCount = 0;
    this.clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(event));
        sentCount++;
      }
    });
    console.log(`[WebSocket] Broadcast to all: ${event.type} (${sentCount} clients)`);
  }

  public notifyTransaction(address: string, transaction: any) {
    this.broadcastToAddress(address, {
      type: 'transaction',
      data: transaction,
      timestamp: new Date().toISOString()
    });
  }

  public notifyMarketplaceListing(listing: any) {
    this.broadcast({
      type: 'marketplace_listing',
      data: listing,
      timestamp: new Date().toISOString()
    });
  }

  public notifyMarketplacePurchase(purchase: any) {
    this.broadcast({
      type: 'marketplace_purchase',
      data: purchase,
      timestamp: new Date().toISOString()
    });
  }

  public notifyStablecoinMint(address: string, amount: string, txHash: string) {
    this.broadcastToAddress(address, {
      type: 'stablecoin_mint',
      data: { address, amount, txHash },
      timestamp: new Date().toISOString()
    });
  }

  public notifyStablecoinBurn(address: string, amount: string, txHash: string) {
    this.broadcastToAddress(address, {
      type: 'stablecoin_burn',
      data: { address, amount, txHash },
      timestamp: new Date().toISOString()
    });
  }

  public notifyCrossBorderPayment(address: string, payment: any) {
    this.broadcastToAddress(address, {
      type: 'cross_border_payment',
      data: payment,
      timestamp: new Date().toISOString()
    });
  }
}
