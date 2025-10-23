import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { wsServer } from "./index";
import {
  provider,
  getEthBalance,
  getTokenBalance,
  encryptPrivateKey,
  decryptPrivateKey,
  getWalletFromPrivateKey,
  isValidAddress,
  getTransactionHistory,
  mintBRLx,
  burnBRLx,
  transferBRLx,
  createAgroToken,
  transferAgroToken,
  syncTransactionsFromBlockchain,
  CONTRACTS,
} from "./blockchain";
import { randomUUID } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // Sync endpoint - triggers blockchain sync for an address
  app.post("/api/sync/:address", async (req, res) => {
    try {
      const { address } = req.params;
      
      if (!isValidAddress(address)) {
        return res.status(400).json({ error: "Invalid address" });
      }
      
      const blockchainTxs = await syncTransactionsFromBlockchain(address);
      
      let synced = 0;
      for (const tx of blockchainTxs) {
        try {
          await storage.createTransaction({
            txHash: tx.txHash,
            fromAddress: tx.fromAddress,
            toAddress: tx.toAddress,
            type: tx.category,
            value: tx.value,
            blockNumber: parseInt(tx.blockNum, 16),
            timestamp: tx.timestamp,
            status: 'confirmed',
            gasUsed: null,
            metadata: { asset: tx.asset, synced: true },
          });
          synced++;
        } catch (error) {
          // Ignore duplicates
        }
      }
      
      res.json({ synced, total: blockchainTxs.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Wallet endpoints
  app.get("/api/wallets", async (req, res) => {
    try {
      const wallets = await storage.getAllWallets();
      res.json(wallets);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/wallet/import", async (req, res) => {
    try {
      const { name, privateKey } = req.body;
      
      if (!name || !privateKey) {
        return res.status(400).json({ error: "Name and private key required" });
      }

      // Validate and create wallet from private key
      let wallet;
      try {
        wallet = getWalletFromPrivateKey(privateKey);
      } catch (error) {
        return res.status(400).json({ error: "Invalid private key" });
      }

      const address = wallet.address;

      // Check if wallet already exists - if so, return it instead of error
      const existing = await storage.getWallet(address);
      if (existing) {
        // Refresh balances for existing wallet
        const ethBalance = await getEthBalance(address);
        const brlxBalance = await getTokenBalance(CONTRACTS.BRLX_TOKEN, address);
        
        return res.json({
          id: existing.id,
          address: existing.address,
          name: existing.name,
          ethBalance,
          brlxBalance,
          createdAt: existing.createdAt,
        });
      }

      // Get balances for new wallet
      const ethBalance = await getEthBalance(address);
      const brlxBalance = await getTokenBalance(CONTRACTS.BRLX_TOKEN, address);
      
      // Sync existing transactions from blockchain
      try {
        const blockchainTxs = await syncTransactionsFromBlockchain(address);
        for (const tx of blockchainTxs.slice(0, 10)) { // Limit to last 10
          await storage.createTransaction({
            txHash: tx.txHash,
            fromAddress: tx.fromAddress,
            toAddress: tx.toAddress,
            type: tx.category,
            value: tx.value,
            blockNumber: parseInt(tx.blockNum, 16),
            timestamp: tx.timestamp,
            status: 'confirmed',
            gasUsed: null,
            metadata: { asset: tx.asset, synced: true },
          });
        }
      } catch (error) {
        console.error('Error syncing blockchain transactions:', error);
      }

      // Encrypt and store
      const encryptedKey = encryptPrivateKey(privateKey);
      const walletData = await storage.createWallet({
        address,
        name,
        encryptedPrivateKey: encryptedKey,
      });

      res.json({
        address: walletData.address,
        name: walletData.name,
        ethBalance,
        brlxBalance,
      });
    } catch (error: any) {
      console.error('Wallet import error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // AgroToken endpoints
  app.get("/api/agrotokens", async (req, res) => {
    try {
      const tokens = await storage.getAllAgroTokens();
      res.json(tokens);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/agrotokens", async (req, res) => {
    try {
      const { assetType, name, value, maturityDate, description, ownerAddress } = req.body;

      if (!assetType || !name || !value || !maturityDate || !ownerAddress) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Get wallet to create transaction
      const wallet = await storage.getWallet(ownerAddress);
      if (!wallet) {
        return res.status(404).json({ error: "Wallet not found" });
      }

      // Decrypt private key and create wallet instance
      const privateKey = decryptPrivateKey(wallet.encryptedPrivateKey);
      const walletInstance = getWalletFromPrivateKey(privateKey);

      // Create token on blockchain
      const { tokenId, txHash, contractAddress } = await createAgroToken(
        { assetType, name, value, maturityDate: new Date(maturityDate), description },
        walletInstance
      );

      // Store in database
      const token = await storage.createAgroToken({
        tokenId,
        contractAddress,
        name,
        assetType,
        value,
        maturityDate: new Date(maturityDate),
        description,
        metadata: { assetType, originalRequest: req.body },
        ownerAddress,
        txHash,
      });

      // Record transaction
      await storage.createTransaction({
        txHash,
        fromAddress: ownerAddress,
        toAddress: contractAddress,
        type: 'token_mint',
        value: value.toString(),
        blockNumber: null,
        timestamp: new Date(),
        status: 'confirmed',
        gasUsed: null,
        metadata: { tokenId, assetType },
      });

      res.json(token);
    } catch (error: any) {
      console.error('Token creation error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Stablecoin endpoints
  app.get("/api/stablecoin/stats", async (req, res) => {
    try {
      // Mock stats
      const stats = {
        totalSupply: '5000000',
        holders: 127,
        transactions24h: 342,
      };
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/stablecoin/mint", async (req, res) => {
    try {
      const { amount, address } = req.body;

      if (!amount || !address) {
        return res.status(400).json({ error: "Amount and address required" });
      }

      const wallet = await storage.getWallet(address);
      if (!wallet) {
        return res.status(404).json({ error: "Wallet not found" });
      }

      const privateKey = decryptPrivateKey(wallet.encryptedPrivateKey);
      const walletInstance = getWalletFromPrivateKey(privateKey);

      const txHash = await mintBRLx(amount, address, walletInstance);

      const tx = await storage.createStablecoinTransaction({
        type: 'mint',
        fromAddress: null,
        toAddress: address,
        amount,
        txHash,
        status: 'confirmed',
        confirmedAt: new Date(),
      });

      await storage.createTransaction({
        txHash,
        fromAddress: CONTRACTS.BRLX_TOKEN,
        toAddress: address,
        type: 'stablecoin_mint',
        value: amount,
        blockNumber: null,
        timestamp: new Date(),
        status: 'confirmed',
        gasUsed: null,
        metadata: { operation: 'mint' },
      });

      // Notify WebSocket clients
      if (wsServer) {
        wsServer.notifyStablecoinMint(address, amount, txHash);
      }

      res.json(tx);
    } catch (error: any) {
      console.error('Mint error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/stablecoin/burn", async (req, res) => {
    try {
      const { amount, address } = req.body;

      if (!amount || !address) {
        return res.status(400).json({ error: "Amount and address required" });
      }

      const wallet = await storage.getWallet(address);
      if (!wallet) {
        return res.status(404).json({ error: "Wallet not found" });
      }

      const privateKey = decryptPrivateKey(wallet.encryptedPrivateKey);
      const walletInstance = getWalletFromPrivateKey(privateKey);

      const txHash = await burnBRLx(amount, walletInstance);

      const tx = await storage.createStablecoinTransaction({
        type: 'burn',
        fromAddress: address,
        toAddress: null,
        amount,
        txHash,
        status: 'confirmed',
        confirmedAt: new Date(),
      });

      await storage.createTransaction({
        txHash,
        fromAddress: address,
        toAddress: CONTRACTS.BRLX_TOKEN,
        type: 'stablecoin_burn',
        value: amount,
        blockNumber: null,
        timestamp: new Date(),
        status: 'confirmed',
        gasUsed: null,
        metadata: { operation: 'burn' },
      });

      // Notify WebSocket clients
      if (wsServer) {
        wsServer.notifyStablecoinBurn(address, amount, txHash);
      }

      res.json(tx);
    } catch (error: any) {
      console.error('Burn error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/stablecoin/transfer", async (req, res) => {
    try {
      const { amount, from, to } = req.body;

      if (!amount || !from || !to) {
        return res.status(400).json({ error: "Amount, from, and to required" });
      }

      if (!isValidAddress(to)) {
        return res.status(400).json({ error: "Invalid recipient address" });
      }

      const wallet = await storage.getWallet(from);
      if (!wallet) {
        return res.status(404).json({ error: "Wallet not found" });
      }

      const privateKey = decryptPrivateKey(wallet.encryptedPrivateKey);
      const walletInstance = getWalletFromPrivateKey(privateKey);

      const txHash = await transferBRLx(amount, to, walletInstance);

      const tx = await storage.createStablecoinTransaction({
        type: 'transfer',
        fromAddress: from,
        toAddress: to,
        amount,
        txHash,
        status: 'confirmed',
        confirmedAt: new Date(),
      });

      await storage.createTransaction({
        txHash,
        fromAddress: from,
        toAddress: to,
        type: 'stablecoin_transfer',
        value: amount,
        blockNumber: null,
        timestamp: new Date(),
        status: 'confirmed',
        gasUsed: null,
        metadata: { operation: 'transfer' },
      });

      res.json(tx);
    } catch (error: any) {
      console.error('Transfer error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Portfolio endpoint
  app.get("/api/portfolio/:address", async (req, res) => {
    try {
      const { address } = req.params;
      const tokens = await storage.getAgroTokensByOwner(address);
      res.json(tokens);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Transactions endpoints
  app.get("/api/transactions/:address", async (req, res) => {
    try {
      const { address } = req.params;
      const txs = await storage.getTransactionsByAddress(address);
      res.json(txs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/transactions/all", async (req, res) => {
    try {
      const txs = await storage.getAllTransactions();
      res.json(txs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Governance endpoints
  app.get("/api/governance/whitelists", async (req, res) => {
    try {
      const whitelists = await storage.getAllWhitelists();
      res.json(whitelists);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/governance/firefly-workflows", async (req, res) => {
    try {
      // Mock FireFly workflows
      const workflows = [
        {
          id: randomUUID(),
          name: 'Token Approval Workflow',
          description: 'Multi-party approval for high-value token operations',
          fireflyId: 'ff-workflow-' + randomUUID().slice(0, 8),
          status: 'active',
        },
        {
          id: randomUUID(),
          name: 'Custody Transfer Workflow',
          description: 'Cold storage withdrawal approval process',
          fireflyId: 'ff-workflow-' + randomUUID().slice(0, 8),
          status: 'active',
        },
      ];
      res.json(workflows);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Custody endpoints
  app.get("/api/custody/wallets", async (req, res) => {
    try {
      const wallets = await storage.getAllCustodyWallets();
      res.json(wallets);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/custody/wallets", async (req, res) => {
    try {
      const { name, type, securityLevel, hsmType } = req.body;

      if (!name || !type) {
        return res.status(400).json({ error: "Name and type required" });
      }

      // Create approval request for custody wallet creation
      const approval = await storage.createCustodyApproval({
        operationType: 'create_wallet',
        walletType: type,
        requestedBy: 'system',
        amount: null,
        destination: null,
        status: 'pending',
        requiredApprovals: type === 'cold' ? 3 : 1,
        currentApprovals: 0,
        approvers: [],
        metadata: { name, securityLevel, hsmType },
      });

      res.json(approval);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/custody/approvals", async (req, res) => {
    try {
      const approvals = await storage.getPendingApprovals();
      res.json(approvals);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Cross-border payment endpoints
  
  // Get real-time exchange rates
  app.get("/api/crossborder/rates", async (_req, res) => {
    try {
      // Simulate real-time FX rates with slight variance (in production, use real FX API like ExchangeRate-API)
      const baseRates = {
        USD: 5.45,
        EUR: 5.92,
        GBP: 6.87,
      };
      
      // Add small random variance to simulate real-time market changes
      const variance = 0.02; // 2% variance
      const rates = {
        USD: Number((baseRates.USD * (1 + (Math.random() - 0.5) * variance)).toFixed(4)),
        EUR: Number((baseRates.EUR * (1 + (Math.random() - 0.5) * variance)).toFixed(4)),
        GBP: Number((baseRates.GBP * (1 + (Math.random() - 0.5) * variance)).toFixed(4)),
      };
      
      res.json(rates);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.get("/api/crossborder/:address", async (req, res) => {
    try {
      const { address } = req.params;
      const payments = await storage.getCrossBorderPaymentsByAddress(address);
      res.json(payments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/crossborder", async (req, res) => {
    try {
      const {
        amountBRL,
        recipientEmail,
        recipientCountry,
        destinationCurrency,
        fromAddress,
        exchangeRate,
        fees,
        liquidationPartner,
      } = req.body;

      if (!amountBRL || !recipientEmail || !fromAddress) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Get wallet to execute BRLx transaction
      const wallet = await storage.getWallet(fromAddress);
      if (!wallet) {
        return res.status(404).json({ error: "Wallet not found" });
      }

      const privateKey = decryptPrivateKey(wallet.encryptedPrivateKey);
      const walletInstance = getWalletFromPrivateKey(privateKey);

      // Execute REAL BRLx transfer to holding address (simulated for now)
      const holdingAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0c3a8'; // Mock holding address
      const brlxTxHash = await transferBRLx(amountBRL, holdingAddress, walletInstance);

      // Calculate received amount
      const amountReceived = (parseFloat(amountBRL) / parseFloat(exchangeRate)).toFixed(2);

      // Mock partner transaction ID (Ubyx/Circle)
      const partnerTxId = `${liquidationPartner.toUpperCase()}-${randomUUID().slice(0, 8)}`;

      // Create payment record
      const payment = await storage.createCrossBorderPayment({
        fromAddress,
        toAddress: null, // Will be set by partner
        recipientEmail,
        recipientCountry,
        amountBRL,
        amountReceived,
        destinationCurrency,
        exchangeRate,
        fees,
        status: 'processing',
        brlxTxHash,
        partnerTxId,
        liquidationPartner,
        complianceChecked: new Date(),
        complianceStatus: 'approved', // Mock compliance check
        metadata: {
          holding_address: holdingAddress,
          fiat_provider: liquidationPartner,
          exchange_rate_timestamp: new Date().toISOString(),
        },
      });

      // Notify WebSocket clients
      if (wsServer) {
        wsServer.notifyCrossBorderPayment(fromAddress, payment);
      }

      // Simulate async completion (in production, this would be a webhook from partner)
      setTimeout(async () => {
        await storage.updateCrossBorderPaymentStatus(payment.id, 'completed');
        if (wsServer) {
          wsServer.notifyCrossBorderPayment(fromAddress, {
            ...payment,
            status: 'completed',
          });
        }
      }, 5000);

      // Record transaction
      await storage.createTransaction({
        txHash: brlxTxHash,
        fromAddress,
        toAddress: holdingAddress,
        type: 'cross_border_payment',
        value: amountBRL,
        blockNumber: null,
        timestamp: new Date(),
        status: 'confirmed',
        gasUsed: null,
        metadata: {
          payment_id: payment.id,
          destination_currency: destinationCurrency,
          amount_received: amountReceived,
          partner: liquidationPartner,
        },
      });

      res.json(payment);
    } catch (error: any) {
      console.error('Cross-border payment error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Marketplace endpoints
  app.get("/api/marketplace/listings", async (req, res) => {
    try {
      const listings = await storage.getActiveMarketplaceListings();
      res.json(listings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/marketplace/mylistings", async (req, res) => {
    try {
      const { address } = req.query;
      if (!address) {
        return res.status(400).json({ error: "Address required" });
      }
      const listings = await storage.getMarketplaceListingsBySeller(address as string);
      res.json(listings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/marketplace/buy/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { buyerAddress } = req.body;

      if (!buyerAddress) {
        return res.status(400).json({ error: "Buyer address required" });
      }

      const listing = await storage.getMarketplaceListingById(id);
      if (!listing || listing.status !== 'active') {
        return res.status(404).json({ error: "Listing not found or not active" });
      }

      const buyerWallet = await storage.getWalletByAddress(buyerAddress);
      if (!buyerWallet) {
        return res.status(404).json({ error: "Buyer wallet not found" });
      }

      const sellerWallet = await storage.getWalletByAddress(listing.sellerAddress);
      if (!sellerWallet) {
        return res.status(404).json({ error: "Seller wallet not found" });
      }

      const buyerWalletInstance = getWalletFromPrivateKey(
        decryptPrivateKey(buyerWallet.encryptedPrivateKey)
      );

      const paymentTxHash = await transferBRLx(
        listing.price,
        listing.sellerAddress,
        buyerWalletInstance
      );

      const sellerWalletInstance = getWalletFromPrivateKey(
        decryptPrivateKey(sellerWallet.encryptedPrivateKey)
      );

      const transferTxHash = await transferAgroToken(
        listing.tokenId,
        listing.sellerAddress,
        buyerAddress,
        sellerWalletInstance
      );

      const order = await storage.createMarketplaceOrder({
        listingId: listing.id,
        buyerAddress,
        sellerAddress: listing.sellerAddress,
        tokenId: listing.tokenId,
        price: listing.price,
        status: 'completed',
        paymentTxHash,
        transferTxHash,
        completedAt: new Date(),
        metadata: { contractAddress: listing.contractAddress },
      });

      await storage.updateMarketplaceListingStatus(listing.id, 'sold', transferTxHash);
      await storage.updateAgroTokenOwner(listing.agroTokenId, buyerAddress);

      // Notify WebSocket clients
      if (wsServer) {
        wsServer.notifyMarketplacePurchase({
          ...order,
          listing,
        });
        wsServer.notifyTransaction(buyerAddress, {
          type: 'marketplace_purchase',
          txHash: paymentTxHash,
          amount: listing.price,
        });
        wsServer.notifyTransaction(listing.sellerAddress, {
          type: 'marketplace_sale',
          txHash: paymentTxHash,
          amount: listing.price,
        });
      }

      res.json(order);
    } catch (error: any) {
      console.error('Marketplace buy error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
