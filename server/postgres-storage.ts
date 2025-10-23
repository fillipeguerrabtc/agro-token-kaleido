import { eq, desc, sql, or, and } from 'drizzle-orm';
import { db } from './db';
import {
  wallets,
  agroTokens,
  stablecoinTransactions,
  governanceWhitelists,
  transactionHistory,
  custodyWallets,
  custodyApprovals,
  crossBorderPayments,
  marketplaceListings,
  marketplaceOrders,
  type Wallet,
  type InsertWallet,
  type AgroToken,
  type InsertAgroToken,
  type StablecoinTransaction,
  type InsertStablecoinTransaction,
  type GovernanceWhitelist,
  type InsertGovernanceWhitelist,
  type TransactionHistory,
  type InsertTransactionHistory,
  type CustodyWallet,
  type InsertCustodyWallet,
  type CustodyApproval,
  type InsertCustodyApproval,
  type CrossBorderPayment,
  type InsertCrossBorderPayment,
  type MarketplaceListing,
  type InsertMarketplaceListing,
  type MarketplaceOrder,
  type InsertMarketplaceOrder,
} from '@shared/schema';
import { type IStorage } from './storage';

export class PostgresStorage implements IStorage {
  constructor() {
    // Initialize mock data asynchronously
    this.initializeMockData().catch(console.error);
  }

  private async initializeMockData() {
    // Check if data already exists
    const existing = await this.getAllAgroTokens();
    if (existing.length > 0) {
      return; // Data already initialized
    }

    // Mock whitelists
    const mockOwnerAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0c3a8';
    
    try {
      await this.createWhitelistEntry({
        address: mockOwnerAddress,
        status: 'active',
        complianceLevel: 'institutional',
      });
      
      await this.createWhitelistEntry({
        address: '0x8a1f2F7d4B9C8e5A3D2C1B0A9F8E7D6C5B4A3C2B',
        status: 'active',
        complianceLevel: 'verified',
      });
    } catch (error) {
      // Ignore if already exists
    }

    // Mock AgroTokens for marketplace
    const maturityDate1 = new Date();
    maturityDate1.setMonth(maturityDate1.getMonth() + 6);
    const maturityDate2 = new Date();
    maturityDate2.setMonth(maturityDate2.getMonth() + 9);
    const maturityDate3 = new Date();
    maturityDate3.setMonth(maturityDate3.getMonth() + 12);

    const mockAgroTokens = [
      {
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
      },
      {
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
      },
      {
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
      },
    ];

    // Create AgroTokens and marketplace listings
    for (const tokenData of mockAgroTokens) {
      const token = await this.createAgroToken(tokenData);
      
      // Create marketplace listing
      await this.createMarketplaceListing({
        agroTokenId: token.id,
        tokenId: token.tokenId,
        contractAddress: token.contractAddress,
        sellerAddress: token.ownerAddress,
        price: (parseFloat(token.value) * 0.95).toFixed(2), // 5% discount
        status: 'active',
        txHash: null,
      });
    }
  }

  // Wallet operations
  async getWallet(address: string): Promise<Wallet | undefined> {
    const result = await db.select().from(wallets).where(sql`LOWER(${wallets.address}) = LOWER(${address})`).limit(1);
    return result[0];
  }

  async getWalletByAddress(address: string): Promise<Wallet | undefined> {
    return this.getWallet(address);
  }

  async createWallet(wallet: InsertWallet): Promise<Wallet> {
    const result = await db.insert(wallets).values(wallet).returning();
    return result[0];
  }

  async getAllWallets(): Promise<Wallet[]> {
    return db.select().from(wallets);
  }

  // AgroToken operations
  async getAgroToken(id: string): Promise<AgroToken | undefined> {
    const result = await db.select().from(agroTokens).where(eq(agroTokens.id, id)).limit(1);
    return result[0];
  }

  async getAgroTokensByOwner(ownerAddress: string): Promise<AgroToken[]> {
    return db.select().from(agroTokens).where(sql`LOWER(${agroTokens.ownerAddress}) = LOWER(${ownerAddress})`);
  }

  async createAgroToken(token: InsertAgroToken): Promise<AgroToken> {
    const result = await db.insert(agroTokens).values(token).returning();
    return result[0];
  }

  async getAllAgroTokens(): Promise<AgroToken[]> {
    return db.select().from(agroTokens).orderBy(desc(agroTokens.createdAt));
  }

  async updateAgroTokenOwner(id: string, newOwner: string): Promise<AgroToken | undefined> {
    const result = await db
      .update(agroTokens)
      .set({ ownerAddress: newOwner })
      .where(eq(agroTokens.id, id))
      .returning();
    return result[0];
  }

  // Stablecoin operations
  async createStablecoinTransaction(tx: InsertStablecoinTransaction): Promise<StablecoinTransaction> {
    const result = await db.insert(stablecoinTransactions).values(tx).returning();
    return result[0];
  }

  async getStablecoinTransactions(address?: string): Promise<StablecoinTransaction[]> {
    if (address) {
      return db
        .select()
        .from(stablecoinTransactions)
        .where(
          or(
            sql`LOWER(${stablecoinTransactions.fromAddress}) = LOWER(${address})`,
            sql`LOWER(${stablecoinTransactions.toAddress}) = LOWER(${address})`
          )
        )
        .orderBy(desc(stablecoinTransactions.createdAt));
    }
    return db.select().from(stablecoinTransactions).orderBy(desc(stablecoinTransactions.createdAt));
  }

  // Governance operations
  async getGovernanceWhitelist(address: string): Promise<GovernanceWhitelist | undefined> {
    const result = await db
      .select()
      .from(governanceWhitelists)
      .where(sql`LOWER(${governanceWhitelists.address}) = LOWER(${address})`)
      .limit(1);
    return result[0];
  }

  async getAllWhitelists(): Promise<GovernanceWhitelist[]> {
    return db.select().from(governanceWhitelists);
  }

  async createWhitelistEntry(entry: InsertGovernanceWhitelist): Promise<GovernanceWhitelist> {
    const result = await db.insert(governanceWhitelists).values(entry).returning();
    return result[0];
  }

  // Transaction history
  async createTransaction(tx: InsertTransactionHistory): Promise<TransactionHistory> {
    try {
      const result = await db.insert(transactionHistory).values(tx).returning();
      return result[0];
    } catch (error: any) {
      // If duplicate txHash, ignore
      if (error.code === '23505') {
        const existing = await db
          .select()
          .from(transactionHistory)
          .where(eq(transactionHistory.txHash, tx.txHash))
          .limit(1);
        return existing[0];
      }
      throw error;
    }
  }

  async getTransactionsByAddress(address: string): Promise<TransactionHistory[]> {
    return db
      .select()
      .from(transactionHistory)
      .where(
        or(
          sql`LOWER(${transactionHistory.fromAddress}) = LOWER(${address})`,
          sql`LOWER(${transactionHistory.toAddress}) = LOWER(${address})`
        )
      )
      .orderBy(desc(transactionHistory.timestamp));
  }

  async getAllTransactions(): Promise<TransactionHistory[]> {
    return db.select().from(transactionHistory).orderBy(desc(transactionHistory.timestamp));
  }

  // Custody operations
  async getCustodyWallet(id: string): Promise<CustodyWallet | undefined> {
    const result = await db.select().from(custodyWallets).where(eq(custodyWallets.id, id)).limit(1);
    return result[0];
  }

  async getCustodyWalletsByType(type: string): Promise<CustodyWallet[]> {
    return db.select().from(custodyWallets).where(eq(custodyWallets.type, type));
  }

  async createCustodyWallet(wallet: InsertCustodyWallet): Promise<CustodyWallet> {
    const result = await db.insert(custodyWallets).values(wallet).returning();
    return result[0];
  }

  async getAllCustodyWallets(): Promise<CustodyWallet[]> {
    return db.select().from(custodyWallets);
  }

  // Custody approvals
  async getCustodyApproval(id: string): Promise<CustodyApproval | undefined> {
    const result = await db.select().from(custodyApprovals).where(eq(custodyApprovals.id, id)).limit(1);
    return result[0];
  }

  async getPendingApprovals(): Promise<CustodyApproval[]> {
    return db.select().from(custodyApprovals).where(eq(custodyApprovals.status, 'pending'));
  }

  async createCustodyApproval(approval: InsertCustodyApproval): Promise<CustodyApproval> {
    const result = await db.insert(custodyApprovals).values(approval).returning();
    return result[0];
  }

  async updateApprovalStatus(
    id: string,
    status: string,
    currentApprovals: number
  ): Promise<CustodyApproval | undefined> {
    const result = await db
      .update(custodyApprovals)
      .set({ status, currentApprovals })
      .where(eq(custodyApprovals.id, id))
      .returning();
    return result[0];
  }

  // Cross-border payments
  async createCrossBorderPayment(payment: InsertCrossBorderPayment): Promise<CrossBorderPayment> {
    const result = await db.insert(crossBorderPayments).values(payment).returning();
    return result[0];
  }

  async getCrossBorderPaymentsByAddress(address: string): Promise<CrossBorderPayment[]> {
    return db
      .select()
      .from(crossBorderPayments)
      .where(sql`LOWER(${crossBorderPayments.fromAddress}) = LOWER(${address})`)
      .orderBy(desc(crossBorderPayments.createdAt));
  }

  async getAllCrossBorderPayments(): Promise<CrossBorderPayment[]> {
    return db.select().from(crossBorderPayments).orderBy(desc(crossBorderPayments.createdAt));
  }

  async updateCrossBorderPaymentStatus(
    id: string,
    status: string,
    txHash?: string,
    partnerTxId?: string
  ): Promise<CrossBorderPayment | undefined> {
    const result = await db
      .update(crossBorderPayments)
      .set({ status, brlxTxHash: txHash, partnerTxId })
      .where(eq(crossBorderPayments.id, id))
      .returning();
    return result[0];
  }

  // Marketplace operations
  async getActiveMarketplaceListings(): Promise<any[]> {
    const listings = await db
      .select()
      .from(marketplaceListings)
      .where(eq(marketplaceListings.status, 'active'))
      .orderBy(desc(marketplaceListings.listedAt));

    // Join with agroTokens to get full details
    const enrichedListings = await Promise.all(
      listings.map(async (listing) => {
        const token = await this.getAgroToken(listing.agroTokenId);
        return {
          ...listing,
          ...token,
        };
      })
    );

    return enrichedListings;
  }

  async getMarketplaceListingsBySeller(sellerAddress: string): Promise<MarketplaceListing[]> {
    return db
      .select()
      .from(marketplaceListings)
      .where(sql`LOWER(${marketplaceListings.sellerAddress}) = LOWER(${sellerAddress})`)
      .orderBy(desc(marketplaceListings.listedAt));
  }

  async getMarketplaceListingById(id: string): Promise<MarketplaceListing | undefined> {
    const result = await db.select().from(marketplaceListings).where(eq(marketplaceListings.id, id)).limit(1);
    return result[0];
  }

  async createMarketplaceListing(listing: InsertMarketplaceListing): Promise<MarketplaceListing> {
    const result = await db.insert(marketplaceListings).values(listing).returning();
    return result[0];
  }

  async updateMarketplaceListingStatus(
    id: string,
    status: string,
    txHash?: string
  ): Promise<MarketplaceListing | undefined> {
    const result = await db
      .update(marketplaceListings)
      .set({ status, ...(txHash && { transferTxHash: txHash }) })
      .where(eq(marketplaceListings.id, id))
      .returning();
    return result[0];
  }

  async createMarketplaceOrder(order: InsertMarketplaceOrder): Promise<MarketplaceOrder> {
    const result = await db.insert(marketplaceOrders).values(order).returning();
    return result[0];
  }
}
