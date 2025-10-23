import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Wallet schema - stores imported Sepolia wallets
export const wallets = pgTable("wallets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  address: text("address").notNull().unique(),
  name: text("name").notNull(),
  encryptedPrivateKey: text("encrypted_private_key").notNull(), // Encrypted for security
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWalletSchema = createInsertSchema(wallets).omit({
  id: true,
  createdAt: true,
});

export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type Wallet = typeof wallets.$inferSelect;

// AgroToken schema - represents tokenized agricultural assets
export const agroTokens = pgTable("agro_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tokenId: text("token_id").notNull().unique(), // On-chain token ID
  contractAddress: text("contract_address").notNull(),
  name: text("name").notNull(),
  assetType: text("asset_type").notNull(), // CPR, Receivable, Harvest Contract
  value: decimal("value", { precision: 18, scale: 2 }).notNull(), // Value in BRL
  maturityDate: timestamp("maturity_date").notNull(),
  description: text("description"),
  metadata: jsonb("metadata"), // Additional asset details
  ownerAddress: text("owner_address").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  txHash: text("tx_hash"), // Creation transaction hash
});

export const insertAgroTokenSchema = createInsertSchema(agroTokens).omit({
  id: true,
  createdAt: true,
});

export type InsertAgroToken = z.infer<typeof insertAgroTokenSchema>;
export type AgroToken = typeof agroTokens.$inferSelect;

// BRLx Stablecoin transactions
export const stablecoinTransactions = pgTable("stablecoin_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // mint, burn, transfer
  fromAddress: text("from_address"),
  toAddress: text("to_address"),
  amount: decimal("amount", { precision: 18, scale: 2 }).notNull(),
  txHash: text("tx_hash").notNull().unique(),
  status: text("status").notNull().default("pending"), // pending, confirmed, failed
  createdAt: timestamp("created_at").defaultNow().notNull(),
  confirmedAt: timestamp("confirmed_at"),
});

export const insertStablecoinTransactionSchema = createInsertSchema(stablecoinTransactions).omit({
  id: true,
  createdAt: true,
});

export type InsertStablecoinTransaction = z.infer<typeof insertStablecoinTransactionSchema>;
export type StablecoinTransaction = typeof stablecoinTransactions.$inferSelect;

// Kaleido Governance (mocked) - whitelists and compliance
export const governanceWhitelists = pgTable("governance_whitelists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  address: text("address").notNull().unique(),
  status: text("status").notNull().default("active"), // active, suspended, revoked
  complianceLevel: text("compliance_level").notNull(), // basic, verified, institutional
  addedAt: timestamp("added_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertGovernanceWhitelistSchema = createInsertSchema(governanceWhitelists).omit({
  id: true,
  addedAt: true,
  updatedAt: true,
});

export type InsertGovernanceWhitelist = z.infer<typeof insertGovernanceWhitelistSchema>;
export type GovernanceWhitelist = typeof governanceWhitelists.$inferSelect;

// Transaction history - all blockchain transactions
export const transactionHistory = pgTable("transaction_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  txHash: text("tx_hash").notNull().unique(),
  fromAddress: text("from_address"),
  toAddress: text("to_address"),
  type: text("type").notNull(), // token_mint, token_transfer, stablecoin_mint, etc.
  value: text("value"),
  blockNumber: integer("block_number"),
  timestamp: timestamp("timestamp").notNull(),
  status: text("status").notNull().default("pending"),
  gasUsed: text("gas_used"),
  metadata: jsonb("metadata"),
});

export const insertTransactionHistorySchema = createInsertSchema(transactionHistory).omit({
  id: true,
});

export type InsertTransactionHistory = z.infer<typeof insertTransactionHistorySchema>;
export type TransactionHistory = typeof transactionHistory.$inferSelect;

// Custody Wallets - Hot and Cold wallets
export const custodyWallets = pgTable("custody_wallets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  address: text("address").notNull().unique(),
  type: text("type").notNull(), // hot, cold
  balance: decimal("balance", { precision: 18, scale: 2 }).notNull().default("0"),
  securityLevel: text("security_level").notNull(), // fips_140_2, fips_140_3
  hsmType: text("hsm_type").notNull(), // cloud_hsm, physical_hsm
  status: text("status").notNull().default("active"), // active, locked, archived
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastOperation: timestamp("last_operation"),
});

export const insertCustodyWalletSchema = createInsertSchema(custodyWallets).omit({
  id: true,
  createdAt: true,
});

export type InsertCustodyWallet = z.infer<typeof insertCustodyWalletSchema>;
export type CustodyWallet = typeof custodyWallets.$inferSelect;

// Custody Approval Requests - Kaleido governance workflow
export const custodyApprovals = pgTable("custody_approvals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  operationType: text("operation_type").notNull(), // create_wallet, transfer, withdrawal
  walletId: text("wallet_id"),
  walletType: text("wallet_type").notNull(), // hot, cold
  requestedBy: text("requested_by").notNull(),
  amount: decimal("amount", { precision: 18, scale: 2 }),
  destination: text("destination"),
  status: text("status").notNull().default("pending"), // pending, approved, rejected, executed
  requiredApprovals: integer("required_approvals").notNull().default(3),
  currentApprovals: integer("current_approvals").notNull().default(0),
  approvers: jsonb("approvers"), // Array of approver addresses and their decisions
  fireflyWorkflowId: text("firefly_workflow_id"), // Mock Kaleido FireFly ID
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  metadata: jsonb("metadata"),
});

export const insertCustodyApprovalSchema = createInsertSchema(custodyApprovals).omit({
  id: true,
  createdAt: true,
});

export type InsertCustodyApproval = z.infer<typeof insertCustodyApprovalSchema>;
export type CustodyApproval = typeof custodyApprovals.$inferSelect;

// Cross-Border Payments - International transfers using BRLx
export const crossBorderPayments = pgTable("cross_border_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fromAddress: text("from_address").notNull(),
  toAddress: text("to_address"),
  recipientEmail: text("recipient_email").notNull(),
  recipientCountry: text("recipient_country").notNull(), // US, EU, etc.
  amountBRL: decimal("amount_brl", { precision: 18, scale: 2 }).notNull(), // Sent amount
  amountReceived: decimal("amount_received", { precision: 18, scale: 2 }), // Received in destination currency
  destinationCurrency: text("destination_currency").notNull(), // USD, EUR, etc.
  exchangeRate: decimal("exchange_rate", { precision: 18, scale: 6 }).notNull(),
  fees: decimal("fees", { precision: 18, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  brlxTxHash: text("brlx_tx_hash"), // Real BRLx transaction hash on Sepolia
  partnerTxId: text("partner_tx_id"), // Mock Ubyx/Circle transaction ID
  liquidationPartner: text("liquidation_partner").notNull(), // ubyx, circle
  complianceChecked: timestamp("compliance_checked"),
  complianceStatus: text("compliance_status").default("pending"), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  metadata: jsonb("metadata"), // Additional details, AML/KYC data
});

export const insertCrossBorderPaymentSchema = createInsertSchema(crossBorderPayments).omit({
  id: true,
  createdAt: true,
});

export type InsertCrossBorderPayment = z.infer<typeof insertCrossBorderPaymentSchema>;
export type CrossBorderPayment = typeof crossBorderPayments.$inferSelect;

// Marketplace Listings - AgroTokens listed for sale
export const marketplaceListings = pgTable("marketplace_listings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agroTokenId: text("agro_token_id").notNull(), // Reference to agro_tokens table
  tokenId: text("token_id").notNull(), // On-chain token ID
  contractAddress: text("contract_address").notNull(),
  sellerAddress: text("seller_address").notNull(),
  price: decimal("price", { precision: 18, scale: 2 }).notNull(), // Price in BRLx
  status: text("status").notNull().default("active"), // active, sold, cancelled
  listedAt: timestamp("listed_at").defaultNow().notNull(),
  soldAt: timestamp("sold_at"),
  txHash: text("tx_hash"), // Transaction hash if sold
});

export const insertMarketplaceListingSchema = createInsertSchema(marketplaceListings).omit({
  id: true,
  listedAt: true,
});

export type InsertMarketplaceListing = z.infer<typeof insertMarketplaceListingSchema>;
export type MarketplaceListing = typeof marketplaceListings.$inferSelect;

// Marketplace Orders - buy/sell orders
export const marketplaceOrders = pgTable("marketplace_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  listingId: text("listing_id").notNull(),
  buyerAddress: text("buyer_address").notNull(),
  sellerAddress: text("seller_address").notNull(),
  tokenId: text("token_id").notNull(),
  price: decimal("price", { precision: 18, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed, cancelled
  paymentTxHash: text("payment_tx_hash"), // BRLx payment transaction
  transferTxHash: text("transfer_tx_hash"), // NFT transfer transaction
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  metadata: jsonb("metadata"),
});

export const insertMarketplaceOrderSchema = createInsertSchema(marketplaceOrders).omit({
  id: true,
  createdAt: true,
});

export type InsertMarketplaceOrder = z.infer<typeof insertMarketplaceOrderSchema>;
export type MarketplaceOrder = typeof marketplaceOrders.$inferSelect;
