import {
  type Wallet, type InsertWallet,
  type AgroToken, type InsertAgroToken,
  type StablecoinTransaction, type InsertStablecoinTransaction,
  type GovernanceWhitelist, type InsertGovernanceWhitelist,
  type TransactionHistory, type InsertTransactionHistory,
  type CustodyWallet, type InsertCustodyWallet,
  type CustodyApproval, type InsertCustodyApproval,
  type CrossBorderPayment, type InsertCrossBorderPayment,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Wallet operations
  getWallet(address: string): Promise<Wallet | undefined>;
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  getAllWallets(): Promise<Wallet[]>;
  
  // AgroToken operations
  getAgroToken(id: string): Promise<AgroToken | undefined>;
  getAgroTokensByOwner(ownerAddress: string): Promise<AgroToken[]>;
  createAgroToken(token: InsertAgroToken): Promise<AgroToken>;
  getAllAgroTokens(): Promise<AgroToken[]>;
  
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

  constructor() {
    this.wallets = new Map();
    this.agroTokens = new Map();
    this.stablecoinTxs = new Map();
    this.whitelists = new Map();
    this.transactions = new Map();
    this.custodyWallets = new Map();
    this.custodyApprovals = new Map();
    this.crossBorderPayments = new Map();
    
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
  }

  // Wallet operations
  async getWallet(address: string): Promise<Wallet | undefined> {
    return Array.from(this.wallets.values()).find(w => w.address === address);
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
      t => t.ownerAddress === ownerAddress
    );
  }

  async createAgroToken(insertToken: InsertAgroToken): Promise<AgroToken> {
    const id = randomUUID();
    const token: AgroToken = {
      ...insertToken,
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
}

export const storage = new MemStorage();
