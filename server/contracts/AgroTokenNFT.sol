// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title AgroToken NFT
 * @dev NFT representando ativos tokenizados do agronegócio (CPRs, Recebíveis, Contratos de Safra)
 */
contract AgroTokenNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct AssetData {
        string assetType; // "cpr", "receivable", "harvest"
        uint256 value; // Valor em BRL (com 2 casas decimais)
        uint256 maturityDate; // Data de vencimento (timestamp)
        string metadata; // JSON metadata adicional
    }

    mapping(uint256 => AssetData) public assets;

    event TokenMinted(
        uint256 indexed tokenId,
        address indexed owner,
        string assetType,
        uint256 value,
        uint256 maturityDate
    );

    constructor() ERC721("AgroToken", "AGRO") Ownable(msg.sender) {}

    /**
     * @dev Mint novo AgroToken
     * @param recipient Endereço do destinatário
     * @param assetType Tipo de ativo ("cpr", "receivable", "harvest")
     * @param value Valor do ativo em BRL (com 2 casas decimais)
     * @param maturityDate Data de vencimento (timestamp)
     * @param metadataURI URI dos metadados JSON
     * @param metadata Metadados adicionais em string
     * @return tokenId ID do token criado
     */
    function mintAgroToken(
        address recipient,
        string memory assetType,
        uint256 value,
        uint256 maturityDate,
        string memory metadataURI,
        string memory metadata
    ) external onlyOwner returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _mint(recipient, newTokenId);
        _setTokenURI(newTokenId, metadataURI);

        assets[newTokenId] = AssetData({
            assetType: assetType,
            value: value,
            maturityDate: maturityDate,
            metadata: metadata
        });

        emit TokenMinted(newTokenId, recipient, assetType, value, maturityDate);

        return newTokenId;
    }

    /**
     * @dev Retorna dados do ativo
     * @param tokenId ID do token
     */
    function getAssetData(uint256 tokenId) external view returns (AssetData memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return assets[tokenId];
    }

    /**
     * @dev Retorna o total de tokens mintados
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIds.current();
    }
}
