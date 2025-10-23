import { ethers } from 'ethers';
import { Alchemy, Network } from 'alchemy-sdk';
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.SESSION_SECRET || '';
const ALGORITHM = 'aes-256-gcm';

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 32) {
  throw new Error('SESSION_SECRET environment variable is required for secure key encryption (min 32 characters)');
}

// Validate and extract Alchemy API key
const rawAlchemyKey = process.env.ALCHEMY_API_KEY || '';
let alchemyApiKey = rawAlchemyKey;

// If the key already contains a URL, extract just the key portion
if (rawAlchemyKey.includes('https://') || rawAlchemyKey.includes('http://')) {
  const urlMatch = rawAlchemyKey.match(/\/v2\/([^\/\s]+)/);
  if (urlMatch) {
    alchemyApiKey = urlMatch[1];
    console.log('[Blockchain] Extracted API key from URL format');
  }
}

// Initialize Alchemy
const alchemyConfig = {
  apiKey: alchemyApiKey,
  network: Network.ETH_SEPOLIA,
};

export const alchemy = new Alchemy(alchemyConfig);

// Sepolia RPC provider
export const provider = new ethers.JsonRpcProvider(
  `https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}`
);

// Encryption utilities for private keys
export function encryptPrivateKey(privateKey: string): string {
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(privateKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decryptPrivateKey(encryptedData: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// Get ETH balance
export async function getEthBalance(address: string): Promise<string> {
  try {
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error('Error getting ETH balance:', error);
    return '0';
  }
}

// Get ERC-20 token balance (for BRLx)
export async function getTokenBalance(
  tokenAddress: string,
  walletAddress: string
): Promise<string> {
  try {
    // ERC-20 ABI for balanceOf
    const abi = ['function balanceOf(address) view returns (uint256)'];
    const contract = new ethers.Contract(tokenAddress, abi, provider);
    const balance = await contract.balanceOf(walletAddress);
    return ethers.formatUnits(balance, 18);
  } catch (error) {
    console.error('Error getting token balance:', error);
    return '0';
  }
}

// Validate Ethereum address
export function isValidAddress(address: string): boolean {
  return ethers.isAddress(address);
}

// Create wallet from private key
export function getWalletFromPrivateKey(privateKey: string): ethers.Wallet {
  return new ethers.Wallet(privateKey, provider);
}

// Get transaction history from Alchemy
export async function getTransactionHistory(address: string) {
  try {
    const history = await alchemy.core.getAssetTransfers({
      fromAddress: address,
      category: ['external' as any, 'erc20' as any, 'erc721' as any],
      maxCount: 50,
    });
    
    const received = await alchemy.core.getAssetTransfers({
      toAddress: address,
      category: ['external' as any, 'erc20' as any, 'erc721' as any],
      maxCount: 50,
    });
    
    return [...history.transfers, ...received.transfers];
  } catch (error) {
    console.error('Error getting transaction history:', error);
    return [];
  }
}

// Smart contract addresses (replace with your deployed contracts or use mock for demo)
export const CONTRACTS = {
  // To deploy: see DEPLOY_CONTRACTS.md
  // After deploying, update these addresses
  BRLX_TOKEN: process.env.BRLX_TOKEN_ADDRESS || '0x0000000000000000000000000000000000000001',
  AGROTOKEN_NFT: process.env.AGROTOKEN_NFT_ADDRESS || '0x0000000000000000000000000000000000000002',
};

// Contract ABIs
export const BRLX_ABI = [
  'function mint(address to, uint256 amount) external',
  'function burn(uint256 amount) external',
  'function transfer(address to, uint256 amount) external returns (bool)',
  'function balanceOf(address account) external view returns (uint256)',
  'function totalSupply() external view returns (uint256)',
];

export const AGROTOKEN_ABI = [
  'function mintAgroToken(address recipient, string assetType, uint256 value, uint256 maturityDate, string metadataURI, string metadata) external returns (uint256)',
  'function getAssetData(uint256 tokenId) external view returns (tuple(string assetType, uint256 value, uint256 maturityDate, string metadata))',
  'function ownerOf(uint256 tokenId) external view returns (address)',
  'function totalSupply() external view returns (uint256)',
  'function transferFrom(address from, address to, uint256 tokenId) external',
  'function approve(address to, uint256 tokenId) external',
];

// Real blockchain functions (will use actual contracts when deployed)
const USE_REAL_BLOCKCHAIN = Boolean(process.env.BRLX_TOKEN_ADDRESS && process.env.AGROTOKEN_NFT_ADDRESS);

export async function mintBRLx(
  amount: string,
  toAddress: string,
  wallet: ethers.Wallet
): Promise<string> {
  if (!USE_REAL_BLOCKCHAIN) {
    // Mock mode - generate fake tx hash
    console.log('[MOCK] Minting BRLx:', amount, 'to', toAddress);
    return '0x' + crypto.randomBytes(32).toString('hex');
  }
  
  try {
    const contract = new ethers.Contract(CONTRACTS.BRLX_TOKEN, BRLX_ABI, wallet);
    const amountWei = ethers.parseUnits(amount, 18);
    const tx = await contract.mint(toAddress, amountWei);
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error('Error minting BRLx:', error);
    throw new Error('Failed to mint BRLx on blockchain');
  }
}

export async function burnBRLx(
  amount: string,
  wallet: ethers.Wallet
): Promise<string> {
  if (!USE_REAL_BLOCKCHAIN) {
    console.log('[MOCK] Burning BRLx:', amount);
    return '0x' + crypto.randomBytes(32).toString('hex');
  }
  
  try {
    const contract = new ethers.Contract(CONTRACTS.BRLX_TOKEN, BRLX_ABI, wallet);
    const amountWei = ethers.parseUnits(amount, 18);
    const tx = await contract.burn(amountWei);
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error('Error burning BRLx:', error);
    throw new Error('Failed to burn BRLx on blockchain');
  }
}

export async function transferBRLx(
  amount: string,
  to: string,
  wallet: ethers.Wallet
): Promise<string> {
  if (!USE_REAL_BLOCKCHAIN) {
    console.log('[MOCK] Transferring BRLx:', amount, 'to', to);
    return '0x' + crypto.randomBytes(32).toString('hex');
  }
  
  try {
    const contract = new ethers.Contract(CONTRACTS.BRLX_TOKEN, BRLX_ABI, wallet);
    const amountWei = ethers.parseUnits(amount, 18);
    const tx = await contract.transfer(to, amountWei);
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error('Error transferring BRLx:', error);
    throw new Error('Failed to transfer BRLx on blockchain');
  }
}

export async function createAgroToken(
  tokenData: {
    assetType: string;
    name: string;
    value: string;
    maturityDate: Date;
    description: string;
  },
  wallet: ethers.Wallet
): Promise<{ tokenId: string; txHash: string; contractAddress: string }> {
  if (!USE_REAL_BLOCKCHAIN) {
    console.log('[MOCK] Creating AgroToken:', tokenData);
    const tokenId = crypto.randomBytes(16).toString('hex');
    const txHash = '0x' + crypto.randomBytes(32).toString('hex');
    return {
      tokenId,
      txHash,
      contractAddress: CONTRACTS.AGROTOKEN_NFT,
    };
  }
  
  try {
    const contract = new ethers.Contract(CONTRACTS.AGROTOKEN_NFT, AGROTOKEN_ABI, wallet);
    
    const valueInCents = Math.floor(parseFloat(tokenData.value) * 100);
    const maturityTimestamp = Math.floor(tokenData.maturityDate.getTime() / 1000);
    const metadataURI = `ipfs://agrotoken/${tokenData.assetType}/${Date.now()}`;
    const metadata = JSON.stringify({
      name: tokenData.name,
      description: tokenData.description,
      assetType: tokenData.assetType,
      value: tokenData.value,
    });
    
    const tx = await contract.mintAgroToken(
      wallet.address,
      tokenData.assetType,
      valueInCents,
      maturityTimestamp,
      metadataURI,
      metadata
    );
    
    const receipt = await tx.wait();
    
    // Extract tokenId from events
    const event = receipt.logs.find((log: any) => log.fragment?.name === 'TokenMinted');
    const tokenId = event?.args?.tokenId?.toString() || crypto.randomBytes(16).toString('hex');
    
    return {
      tokenId,
      txHash: tx.hash,
      contractAddress: CONTRACTS.AGROTOKEN_NFT,
    };
  } catch (error) {
    console.error('Error creating AgroToken:', error);
    throw new Error('Failed to create AgroToken on blockchain');
  }
}

export async function transferAgroToken(
  tokenId: string,
  fromAddress: string,
  toAddress: string,
  wallet: ethers.Wallet
): Promise<string> {
  if (!USE_REAL_BLOCKCHAIN) {
    console.log('[MOCK] Transferring AgroToken:', tokenId, 'from', fromAddress, 'to', toAddress);
    return '0x' + crypto.randomBytes(32).toString('hex');
  }
  
  try {
    const contract = new ethers.Contract(CONTRACTS.AGROTOKEN_NFT, AGROTOKEN_ABI, wallet);
    const tx = await contract.transferFrom(fromAddress, toAddress, tokenId);
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error('Error transferring AgroToken:', error);
    throw new Error('Failed to transfer AgroToken NFT on blockchain');
  }
}

// Sync transactions from Alchemy for a given address
export async function syncTransactionsFromBlockchain(address: string): Promise<any[]> {
  try {
    const transfers = await alchemy.core.getAssetTransfers({
      fromAddress: address,
      category: ['external' as any, 'erc20' as any, 'erc721' as any, 'erc1155' as any],
      maxCount: 100,
    });
    
    const received = await alchemy.core.getAssetTransfers({
      toAddress: address,
      category: ['external' as any, 'erc20' as any, 'erc721' as any, 'erc1155' as any],
      maxCount: 100,
    });
    
    const allTransfers = [...transfers.transfers, ...received.transfers];
    
    return allTransfers.map((transfer: any) => ({
      txHash: transfer.hash,
      fromAddress: transfer.from,
      toAddress: transfer.to,
      value: transfer.value?.toString() || '0',
      asset: transfer.asset || 'ETH',
      category: transfer.category,
      blockNum: transfer.blockNum,
      timestamp: new Date(),
    }));
  } catch (error) {
    console.error('Error syncing transactions:', error);
    return [];
  }
}
