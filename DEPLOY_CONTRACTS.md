# Deploy de Smart Contracts na Sepolia

## Pré-requisitos

1. Carteira com ETH Sepolia (obter faucet em: https://sepoliafaucet.com/)
2. Node.js e npm instalados
3. Hardhat instalado

## Opção 1: Deploy Manual via Remix

### Passo 1: Preparar Contratos

Os contratos estão em `server/contracts/`:
- `BRLxToken.sol` - Stablecoin ERC-20
- `AgroTokenNFT.sol` - NFTs de ativos agrícolas

### Passo 2: Deploy no Remix

1. Acesse https://remix.ethereum.org/
2. Crie novos arquivos e cole o código dos contratos
3. Compile os contratos (Solidity 0.8.20)
4. Conecte sua carteira MetaMask na rede Sepolia
5. Deploy `BRLxToken.sol`
6. Deploy `AgroTokenNFT.sol`
7. **IMPORTANTE**: Anote os endereços dos contratos deployados

### Passo 3: Configurar Endereços na Aplicação

Após o deploy, edite `server/blockchain.ts` e substitua:

\`\`\`typescript
export const MOCK_CONTRACTS = {
  BRLX_TOKEN: '0xSEU_ENDERECO_BRLX_AQUI',
  AGROTOKEN_NFT: '0xSEU_ENDERECO_AGRO_AQUI',
};
\`\`\`

## Opção 2: Usar Contratos Já Deployados (Demo)

Se preferir testar rapidamente, você pode usar ETH transfers diretamente na Sepolia.
A plataforma sincronizará automaticamente todas as transações via Alchemy.

## Testando a Integração

1. Importe uma carteira Sepolia com saldo ETH
2. A plataforma sincronizará automaticamente:
   - Saldo de ETH
   - Histórico de transações
   - Transfers de tokens (se os contratos forem deployados)

## Faucets Sepolia

- https://sepoliafaucet.com/
- https://www.alchemy.com/faucets/ethereum-sepolia
- https://faucets.chain.link/sepolia

## Próximos Passos

Após deployar os contratos:

1. Atualizar `MOCK_CONTRACTS` em `server/blockchain.ts`
2. Reiniciar a aplicação
3. Testar criação de AgroTokens
4. Testar mint/burn/transfer de BRLx
5. Verificar transações no Sepolia Etherscan

## Suporte

Para dúvidas sobre o deploy:
- Documentação Remix: https://remix-ide.readthedocs.io/
- Documentação OpenZeppelin: https://docs.openzeppelin.com/
- Faucets Sepolia: https://sepoliafaucet.com/
