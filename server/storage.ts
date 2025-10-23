import {
  type Wallet, type InsertWallet,
  type AgroToken, type InsertAgroToken,
  type StablecoinTransaction, type InsertStablecoinTransaction,
  type GovernanceWhitelist, type InsertGovernanceWhitelist,
  type TransactionHistory, type InsertTransactionHistory,
  type CustodyWallet, type InsertCustodyWallet,
  type CustodyApproval, type InsertCustodyApproval,
  type CrossBorderPayment, type InsertCrossBorderPayment,
  type MarketplaceListing, type InsertMarketplaceListing,
  type MarketplaceOrder, type InsertMarketplaceOrder,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Wallet operations
  getWallet(address: string): Promise<Wallet | undefined>;
  getWalletByAddress(address: string): Promise<Wallet | undefined>;
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  getAllWallets(): Promise<Wallet[]>;
  
  // AgroToken operations
  getAgroToken(id: string): Promise<AgroToken | undefined>;
  getAgroTokensByOwner(ownerAddress: string): Promise<AgroToken[]>;
  createAgroToken(token: InsertAgroToken): Promise<AgroToken>;
  getAllAgroTokens(): Promise<AgroToken[]>;
  updateAgroTokenOwner(id: string, newOwner: string): Promise<AgroToken | undefined>;
  
  // Stablecoin operations
  createStablecoinTransaction(tx: InsertStablecoinTransaction): Promise<StablecoinTransaction>;
  getStablecoinTransactions(address?: string): Promise<StablecoinTransaction[]>;
  
  // Governance operations
  getGovernanceWhitelist(address: string): Promise<GovernanceWhitelist | undefined>;
  getAllWhitelists(): Promise<GovernanceWhitelist[]>;
  createWhitelistEntry(entry: InsertGovernanceWhitelist): Promise<GovernanceWhitelist>;
  
  // Transaction history
  createTransaction(tx: InsertTransactionHistory): Promise<TransactionHistory>;
  getTransactionsByAddress(address: string): Promise<TransactionHistory[]>;
  getAllTransactions(): Promise<TransactionHistory[]>;
  
  // Custody operations
  getCustodyWallet(id: string): Promise<CustodyWallet | undefined>;
  getCustodyWalletsByType(type: string): Promise<CustodyWallet[]>;
  createCustodyWallet(wallet: InsertCustodyWallet): Promise<CustodyWallet>;
  getAllCustodyWallets(): Promise<CustodyWallet[]>;
  
  // Custody approvals
  getCustodyApproval(id: string): Promise<CustodyApproval | undefined>;
  getPendingApprovals(): Promise<CustodyApproval[]>;
  createCustodyApproval(approval: InsertCustodyApproval): Promise<CustodyApproval>;
  updateApprovalStatus(id: string, status: string, currentApprovals: number): Promise<CustodyApproval | undefined>;
  
  // Cross-border payments
  createCrossBorderPayment(payment: InsertCrossBorderPayment): Promise<CrossBorderPayment>;
  getCrossBorderPaymentsByAddress(address: string): Promise<CrossBorderPayment[]>;
  getAllCrossBorderPayments(): Promise<CrossBorderPayment[]>;
  updateCrossBorderPaymentStatus(id: string, status: string, txHash?: string, partnerTxId?: string): Promise<CrossBorderPayment | undefined>;
  
  // Marketplace operations
  getActiveMarketplaceListings(): Promise<any[]>;
  getMarketplaceListingsBySeller(sellerAddress: string): Promise<MarketplaceListing[]>;
  getMarketplaceListingById(id: string): Promise<MarketplaceListing | undefined>;
  createMarketplaceListing(listing: InsertMarketplaceListing): Promise<MarketplaceListing>;
  updateMarketplaceListingStatus(id: string, status: string, txHash?: string): Promise<MarketplaceListing | undefined>;
  createMarketplaceOrder(order: InsertMarketplaceOrder): Promise<MarketplaceOrder>;
}

export class MemStorage implements IStorage {
  private wallets: Map<string, Wallet>;
  private agroTokens: Map<string, AgroToken>;
  private stablecoinTxs: Map<string, StablecoinTransaction>;
  private whitelists: Map<string, GovernanceWhitelist>;
  private transactions: Map<string, TransactionHistory>;
  private custodyWallets: Map<string, CustodyWallet>;
  private custodyApprovals: Map<string, CustodyApproval>;
  private crossBorderPayments: Map<string, CrossBorderPayment>;
  private marketplaceListings: Map<string, MarketplaceListing>;
  private marketplaceOrders: Map<string, MarketplaceOrder>;

  constructor() {
    this.wallets = new Map();
    this.agroTokens = new Map();
    this.stablecoinTxs = new Map();
    this.whitelists = new Map();
    this.transactions = new Map();
    this.custodyWallets = new Map();
    this.custodyApprovals = new Map();
    this.crossBorderPayments = new Map();
    this.marketplaceListings = new Map();
    this.marketplaceOrders = new Map();
    
    // Initialize with mock data
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock whitelists
    const mockWhitelists = [
      {
        id: randomUUID(),
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0c3a8',
        status: 'active',
        complianceLevel: 'institutional',
        addedAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        address: '0x8a1f2F7d4B9C8e5A3D2C1B0A9F8E7D6C5B4A3C2B',
        status: 'active',
        complianceLevel: 'verified',
        addedAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    
    mockWhitelists.forEach(w => this.whitelists.set(w.id, w as GovernanceWhitelist));

    // Mock AgroTokens for marketplace
    const mockOwnerAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0c3a8';
    const maturityDate1 = new Date();
    maturityDate1.setMonth(maturityDate1.getMonth() + 6);
    const maturityDate2 = new Date();
    maturityDate2.setMonth(maturityDate2.getMonth() + 9);
    const maturityDate3 = new Date();
    maturityDate3.setMonth(maturityDate3.getMonth() + 12);

    const mockAgroTokens = [
      {
        id: randomUUID(),
        name: 'CPR Soja 2025',
        tokenId: '1001',
        contractAddress: '0xAgroToken123',
        assetType: 'CPR',
        value: '250000',
        maturityDate: maturityDate1,
        description: 'Cédula de Produto Rural - 5000 sacas de soja',
        metadata: { tons: '300', variety: 'transgênica', region: 'MT' },
        ownerAddress: mockOwnerAddress,
        txHash: '0xabc123',
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: 'Recebível Milho Premium',
        tokenId: '1002',
        contractAddress: '0xAgroToken123',
        assetType: 'Receivable',
        value: '180000',
        maturityDate: maturityDate2,
        description: 'Recebível garantido por safra de milho',
        metadata: { tons: '180', variety: 'híbrido', region: 'GO' },
        ownerAddress: mockOwnerAddress,
        txHash: '0xdef456',
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: 'Contrato Café Arábica',
        tokenId: '1003',
        contractAddress: '0xAgroToken123',
        assetType: 'HarvestContract',
        value: '420000',
        maturityDate: maturityDate3,
        description: 'Contrato de safra de café arábica especial',
        metadata: { tons: '50', variety: 'arábica especial', region: 'MG' },
        ownerAddress: mockOwnerAddress,
        txHash: '0xghi789',
        createdAt: new Date(),
      },
    ];

    mockAgroTokens.forEach(t => {
      this.agroTokens.set(t.id, t as AgroToken);
      
      // Create marketplace listing for each token
      const listingId = randomUUID();
      const listing: MarketplaceListing = {
        id: listingId,
        agroTokenId: t.id,
        tokenId: t.tokenId,
        contractAddress: t.contractAddress,
        sellerAddress: t.ownerAddress,
        price: (parseFloat(t.value) * 0.95).toFixed(2), // 5% discount
        status: 'active',
        txHash: null,
        listedAt: new Date(),
        soldAt: null,
      };
      this.marketplaceListings.set(listingId, listing);
    });
  }

  // Wallet operations
  async getWallet(address: string): Promise<Wallet | undefined> {
    return Array.from(this.wallets.values()).find(w => w.address.toLowerCase() === address.toLowerCase());
  }

  async createWallet(insertWallet: InsertWallet): Promise<Wallet> {
    const id = randomUUID();
    const wallet: Wallet = {
      ...insertWallet,
      id,
      createdAt: new Date(),
    };
    this.wallets.set(id, wallet);
    return wallet;
  }

  async getAllWallets(): Promise<Wallet[]> {
    return Array.from(this.wallets.values());
  }

  // AgroToken operations
  async getAgroToken(id: string): Promise<AgroToken | undefined> {
    return this.agroTokens.get(id);
  }

  async getAgroTokensByOwner(ownerAddress: string): Promise<AgroToken[]> {
    return Array.from(this.agroTokens.values()).filter(
      t => t.ownerAddress.toLowerCase() === ownerAddress.toLowerCase()
    );
  }

  async createAgroToken(insertToken: InsertAgroToken): Promise<AgroToken> {
    const id = randomUUID();
    const token: AgroToken = {
      ...insertToken,
      description: insertToken.description ?? null,
      metadata: insertToken.metadata ?? null,
      txHash: insertToken.txHash ?? null,
      id,
      createdAt: new Date(),
    };
    this.agroTokens.set(id, token);
    return token;
  }

  async getAllAgroTokens(): Promise<AgroToken[]> {
    return Array.from(this.agroTokens.values());
  }

  // Stablecoin operations
  async createStablecoinTransaction(insertTx: InsertStablecoinTransaction): Promise<StablecoinTransaction> {
    const id = randomUUID();
    const tx: StablecoinTransaction = {
      ...insertTx,
      status: insertTx.status ?? 'pending',
      fromAddress: insertTx.fromAddress ?? null,
      toAddress: insertTx.toAddress ?? null,
      id,
      createdAt: new Date(),
      confirmedAt: insertTx.status === 'confirmed' ? new Date() : null,
    };
    this.stablecoinTxs.set(id, tx);
    return tx;
  }

  async getStablecoinTransactions(address?: string): Promise<StablecoinTransaction[]> {
    const allTxs = Array.from(this.stablecoinTxs.values());
    if (!address) return allTxs;
    return allTxs.filter(
      tx => tx.fromAddress === address || tx.toAddress === address
    );
  }

  // Governance operations
  async getGovernanceWhitelist(address: string): Promise<GovernanceWhitelist | undefined> {
    return Array.from(this.whitelists.values()).find(w => w.address === address);
  }

  async getAllWhitelists(): Promise<GovernanceWhitelist[]> {
    return Array.from(this.whitelists.values());
  }

  async createWhitelistEntry(insertEntry: InsertGovernanceWhitelist): Promise<GovernanceWhitelist> {
    const id = randomUUID();
    const entry: GovernanceWhitelist = {
      ...insertEntry,
      status: insertEntry.status ?? 'active',
      id,
      addedAt: new Date(),
      updatedAt: new Date(),
    };
    this.whitelists.set(id, entry);
    return entry;
  }

  // Transaction history
  async createTransaction(insertTx: InsertTransactionHistory): Promise<TransactionHistory> {
    const id = randomUUID();
    const tx: TransactionHistory = {
      ...insertTx,
      fromAddress: insertTx.fromAddress ?? null,
      toAddress: insertTx.toAddress ?? null,
      value: insertTx.value ?? null,
      blockNumber: insertTx.blockNumber ?? null,
      status: insertTx.status ?? 'pending',
      gasUsed: insertTx.gasUsed ?? null,
      metadata: insertTx.metadata ?? null,
      id,
    };
    this.transactions.set(id, tx);
    return tx;
  }

  async getTransactionsByAddress(address: string): Promise<TransactionHistory[]> {
    return Array.from(this.transactions.values()).filter(
      tx => tx.fromAddress === address || tx.toAddress === address
    );
  }

  async getAllTransactions(): Promise<TransactionHistory[]> {
    return Array.from(this.transactions.values());
  }

  // Custody operations
  async getCustodyWallet(id: string): Promise<CustodyWallet | undefined> {
    return this.custodyWallets.get(id);
  }

  async getCustodyWalletsByType(type: string): Promise<CustodyWallet[]> {
    return Array.from(this.custodyWallets.values()).filter(w => w.type === type);
  }

  async createCustodyWallet(insertWallet: InsertCustodyWallet): Promise<CustodyWallet> {
    const id = randomUUID();
    const wallet: CustodyWallet = {
      ...insertWallet,
      status: insertWallet.status ?? 'active',
      balance: insertWallet.balance ?? '0',
      id,
      createdAt: new Date(),
      lastOperation: null,
    };
    this.custodyWallets.set(id, wallet);
    return wallet;
  }

  async getAllCustodyWallets(): Promise<CustodyWallet[]> {
    return Array.from(this.custodyWallets.values());
  }

  // Custody approvals
  async getCustodyApproval(id: string): Promise<CustodyApproval | undefined> {
    return this.custodyApprovals.get(id);
  }

  async getPendingApprovals(): Promise<CustodyApproval[]> {
    return Array.from(this.custodyApprovals.values()).filter(a => a.status === 'pending');
  }

  async createCustodyApproval(insertApproval: InsertCustodyApproval): Promise<CustodyApproval> {
    const id = randomUUID();
    const approval: CustodyApproval = {
      ...insertApproval,
      status: insertApproval.status ?? 'pending',
      walletId: insertApproval.walletId ?? null,
      amount: insertApproval.amount ?? null,
      destination: insertApproval.destination ?? null,
      requiredApprovals: insertApproval.requiredApprovals ?? 3,
      currentApprovals: insertApproval.currentApprovals ?? 0,
      approvers: insertApproval.approvers ?? null,
      metadata: insertApproval.metadata ?? null,
      id,
      createdAt: new Date(),
      completedAt: null,
      fireflyWorkflowId: `ff-${randomUUID().slice(0, 8)}`,
    };
    this.custodyApprovals.set(id, approval);
    return approval;
  }

  async updateApprovalStatus(id: string, status: string, currentApprovals: number): Promise<CustodyApproval | undefined> {
    const approval = this.custodyApprovals.get(id);
    if (!approval) return undefined;
    
    const updated: CustodyApproval = {
      ...approval,
      status,
      currentApprovals,
      completedAt: status !== 'pending' ? new Date() : null,
    };
    this.custodyApprovals.set(id, updated);
    return updated;
  }

  // Cross-border payment operations
  async createCrossBorderPayment(insertPayment: InsertCrossBorderPayment): Promise<CrossBorderPayment> {
    const id = randomUUID();
    const payment: CrossBorderPayment = {
      ...insertPayment,
      toAddress: insertPayment.toAddress ?? null,
      amountReceived: insertPayment.amountReceived ?? null,
      status: insertPayment.status ?? 'pending',
      brlxTxHash: insertPayment.brlxTxHash ?? null,
      partnerTxId: insertPayment.partnerTxId ?? null,
      complianceChecked: insertPayment.complianceChecked ?? null,
      complianceStatus: insertPayment.complianceStatus ?? 'pending',
      metadata: insertPayment.metadata ?? null,
      id,
      createdAt: new Date(),
      completedAt: null,
    };
    this.crossBorderPayments.set(id, payment);
    return payment;
  }

  async getCrossBorderPaymentsByAddress(address: string): Promise<CrossBorderPayment[]> {
    return Array.from(this.crossBorderPayments.values()).filter(
      p => p.fromAddress === address || p.toAddress === address
    );
  }

  async getAllCrossBorderPayments(): Promise<CrossBorderPayment[]> {
    return Array.from(this.crossBorderPayments.values());
  }

  async updateCrossBorderPaymentStatus(
    id: string,
    status: string,
    txHash?: string,
    partnerTxId?: string
  ): Promise<CrossBorderPayment | undefined> {
    const payment = this.crossBorderPayments.get(id);
    if (!payment) return undefined;
    
    const updated: CrossBorderPayment = {
      ...payment,
      status,
      brlxTxHash: txHash || payment.brlxTxHash,
      partnerTxId: partnerTxId || payment.partnerTxId,
      completedAt: status === 'completed' ? new Date() : payment.completedAt,
    };
    this.crossBorderPayments.set(id, updated);
    return updated;
  }

  async getWalletByAddress(address: string): Promise<Wallet | undefined> {
    return Array.from(this.wallets.values()).find(w => w.address.toLowerCase() === address.toLowerCase());
  }

  async updateAgroTokenOwner(id: string, newOwner: string): Promise<AgroToken | undefined> {
    const token = this.agroTokens.get(id);
    if (!token) return undefined;
    const updated: AgroToken = { ...token, ownerAddress: newOwner };
    this.agroTokens.set(id, updated);
    return updated;
  }

  async getActiveMarketplaceListings(): Promise<any[]> {
    const listings = Array.from(this.marketplaceListings.values())
      .filter(l => l.status === 'active');
    
    const enriched = await Promise.all(
      listings.map(async (listing) => {
        const agroToken = await this.getAgroToken(listing.agroTokenId);
        return {
          ...listing,
          agroToken,
        };
      })
    );
    
    return enriched;
  }

  async getMarketplaceListingsBySeller(sellerAddress: string): Promise<MarketplaceListing[]> {
    return Array.from(this.marketplaceListings.values())
      .filter(l => l.sellerAddress === sellerAddress);
  }

  async getMarketplaceListingById(id: string): Promise<MarketplaceListing | undefined> {
    return this.marketplaceListings.get(id);
  }

  async createMarketplaceListing(listing: InsertMarketplaceListing): Promise<MarketplaceListing> {
    const id = randomUUID();
    const created: MarketplaceListing = {
      ...listing,
      status: listing.status ?? 'active',
      txHash: listing.txHash ?? null,
      id,
      listedAt: new Date(),
      soldAt: null,
    };
    this.marketplaceListings.set(id, created);
    return created;
  }

  async updateMarketplaceListingStatus(id: string, status: string, txHash?: string): Promise<MarketplaceListing | undefined> {
    const listing = this.marketplaceListings.get(id);
    if (!listing) return undefined;
    
    const updated: MarketplaceListing = {
      ...listing,
      status,
      txHash: txHash || listing.txHash,
      soldAt: status === 'sold' ? new Date() : listing.soldAt,
    };
    this.marketplaceListings.set(id, updated);
    return updated;
  }

  async createMarketplaceOrder(order: InsertMarketplaceOrder): Promise<MarketplaceOrder> {
    const id = randomUUID();
    const created: MarketplaceOrder = {
      ...order,
      status: order.status ?? 'pending',
      paymentTxHash: order.paymentTxHash ?? null,
      transferTxHash: order.transferTxHash ?? null,
      metadata: order.metadata ?? null,
      id,
      createdAt: new Date(),
      completedAt: order.status === 'completed' ? new Date() : null,
    };
    this.marketplaceOrders.set(id, created);
    return created;
  }
}

// Use PostgreSQL storage for persistence
import { PostgresStorage } from './postgres-storage';
export const storage = new PostgresStorage();
