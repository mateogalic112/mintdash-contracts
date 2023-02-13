// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.17;

import "erc721a-upgradeable/contracts/ERC721AUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/common/ERC2981Upgradeable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "operator-filter-registry/src/upgradeable/DefaultOperatorFiltererUpgradeable.sol";

import { PublicMintStage, AllowlistMintStage } from "../lib/ERC721DropStructs.sol";
import { IERC721DropImplementation } from "../interface/IERC721DropImplementation.sol";

contract ERC721DropImplementation is 
    ERC721AUpgradeable, 
    ERC2981Upgradeable, 
    DefaultOperatorFiltererUpgradeable, 
    OwnableUpgradeable,
    IERC721DropImplementation
{
    PublicMintStage public publicMintStage;
    AllowlistMintStage public allowlistMintStage;

    uint256 public maxSupply;
    string public baseURI;
    bytes32 public provenanceHash;
    address public payoutAddress;

    bool public operatorFiltererEnabled;

    uint256 internal constant PUBLIC_STAGE_INDEX = 0;
    uint256 internal constant ALLOWLIST_STAGE_INDEX = 1;

    function initialize(
        string memory _name,
        string memory _symbol
    ) initializerERC721A initializer external 
    {
        __ERC721A_init(_name, _symbol);
        __Ownable_init();
        __ERC2981_init();
        __DefaultOperatorFilterer_init();
    }

    function mintPublic(uint256 quantity) 
        external 
        payable 
    {
        // Ensure that public mint stage is active
        _checkStageActive(publicMintStage.startTime, publicMintStage.endTime);

        // Ensure correct mint quantity
        _checkMintQuantity(quantity, publicMintStage.mintLimitPerWallet);

         // Ensure enough ETH is provided
        _checkFunds(msg.value, quantity, publicMintStage.mintPrice);

        _mintBase(msg.sender, quantity, PUBLIC_STAGE_INDEX);
    }

    function mintAllowlist(uint256 quantity, bytes32[] calldata merkleProof) 
        external
        payable
    {
        // Ensure that allowlist mint stage is active
        _checkStageActive(allowlistMintStage.startTime, allowlistMintStage.endTime);

         // Ensure correct mint quantity
        _checkMintQuantity(quantity, allowlistMintStage.mintLimitPerWallet);

        // Ensure enough ETH is provided
        _checkFunds(msg.value, quantity, allowlistMintStage.mintPrice);

        if (!MerkleProof.verifyCalldata(merkleProof, allowlistMintStage.merkleRoot, keccak256(abi.encodePacked(msg.sender)))){
            revert InvalidProof();
        }

        _mintBase(msg.sender, quantity, ALLOWLIST_STAGE_INDEX);
    }

    function burn(uint256 tokenId) external {
        _burn(tokenId, true);
    }

    function airdrop(address[] calldata to, uint64[] calldata quantity)
        external
        onlyOwner
    {
        address[] memory recipients = to;

        for (uint64 i = 0; i < recipients.length; ) {
            _mint(recipients[i], quantity[i]);

            unchecked {
                ++i;
            }
        }

        if (_totalMinted() > maxSupply) {
            revert MintQuantityExceedsMaxSupply();
        } 
    }

    function amountMinted(address user) external view returns (uint64) {
        return _getAux(user);
    }

    function updatePublicMintStage(PublicMintStage calldata publicMintStageData) 
        external 
        onlyOwner 
    {
        publicMintStage = publicMintStageData;

        emit PublicMintStageUpdated(publicMintStageData);
    }

    function updateAllowlistMintStage(AllowlistMintStage calldata allowlistMintStageData) 
        external 
        onlyOwner 
    {
        allowlistMintStage = allowlistMintStageData;

        emit AllowlistMintStageUpdated(allowlistMintStageData);
    }

    function updateMaxSupply(uint256 newMaxSupply) 
        external 
        onlyOwner
    {
        // Ensure the max supply does not exceed the maximum value of uint64.
        if (newMaxSupply > 2**64 - 1) {
            revert CannotExceedMaxSupplyOfUint64();
        }

        maxSupply = newMaxSupply;

        emit MaxSupplyUpdated(newMaxSupply);
    }

    function updateOperatorFilterer(bool enabled) 
        external 
        onlyOwner
    {
        operatorFiltererEnabled = enabled;

        emit OperatorFiltererEnabledUpdated(enabled);
    }

    function updateBaseURI(string calldata newUri) 
        external
        onlyOwner 
    {
        baseURI = newUri;

        if (totalSupply() != 0) {
            emit BatchMetadataUpdate(1, _nextTokenId() - 1);
        }

        emit BaseURIUpdated(newUri);
    }

    function updateRoyalties(address receiver, uint96 feeNumerator)
        external
        onlyOwner
    {
        _setDefaultRoyalty(receiver, feeNumerator);

        emit RoyaltiesUpdated(receiver, feeNumerator);
    }

    function updateProvenanceHash(bytes32 newProvenanceHash) 
        external
        onlyOwner 
    {
        // Ensure mint did not start
        if (_totalMinted() > 0) {
            revert ProvenanceHashCannotBeUpdatedAfterMintStarted();
        }

        provenanceHash = newProvenanceHash;

        emit ProvenanceHashUpdated(newProvenanceHash);
    }

    function updatePayoutAddress(address newPayoutAddress)
        external
        onlyOwner 
    {
        payoutAddress = newPayoutAddress;
    }

    function withdrawAllFunds() 
        external 
        onlyOwner 
    {
        if(address(this).balance == 0){
            revert NothingToWithdraw();
        }

        if(payoutAddress == address(0)){
            revert InvalidPayoutAddress();
        }

        payable(payoutAddress).transfer(address(this).balance);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC2981Upgradeable, ERC721AUpgradeable)
        returns (bool)
    {
        return
            ERC721AUpgradeable.supportsInterface(interfaceId) ||
            ERC2981Upgradeable.supportsInterface(interfaceId);
    }
    
    function setApprovalForAll(address operator, bool approved) 
        public 
        override 
    {
        super.setApprovalForAll(operator, approved);
    }

    function approve(address operator, uint256 tokenId) 
        public 
        payable 
        override 
    {

        if(operatorFiltererEnabled){
         _checkFilterOperator(msg.sender);
        }
        super.approve(operator, tokenId);
    }

    function transferFrom(address from, address to, uint256 tokenId) 
        public 
        payable 
        override 
    {
        if (from != msg.sender && operatorFiltererEnabled) {
            _checkFilterOperator(msg.sender);
        }
        super.transferFrom(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId) 
        public 
        payable 
        override  
    {
         if (from != msg.sender && operatorFiltererEnabled) {
            _checkFilterOperator(msg.sender);
        }
        super.safeTransferFrom(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data)
        payable 
        public
        override
    {
         if (from != msg.sender && operatorFiltererEnabled) {
            _checkFilterOperator(msg.sender);
        }
        super.safeTransferFrom(from, to, tokenId, data);
    }

    function _mintBase(address recipient, uint256 quantity, uint256 mintStageIndex)
        internal
    {
        uint256 balanceAfterMint = _getAux(recipient) + quantity;

        _setAux(recipient, uint64(balanceAfterMint));
        _safeMint(recipient, quantity);

        emit Minted(recipient, quantity, mintStageIndex);
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function _startTokenId() internal pure override returns (uint256) {
        return 1;
    }
    
    function _checkFunds(uint256 funds, uint256 quantity, uint256 tokenPrice) internal pure {
        // Ensure enough ETH is sent
        if (funds < tokenPrice * quantity) {
            revert IncorrectFundsProvided();
        }
    }

    function _checkMintQuantity(uint256 quantity, uint256 walletLimit) internal view {
        // Ensure max supply is not exceeded
        if (_totalMinted() + quantity > maxSupply){
            revert MintQuantityExceedsMaxSupply();
        }

        // Ensure wallet limit is not exceeded
        uint256 balanceAfterMint = _getAux(msg.sender) + quantity;
        if (balanceAfterMint > walletLimit){
             revert MintQuantityExceedsWalletLimit();
        }
    }

    function _checkStageActive(uint256 startTime, uint256 endTime) 
        internal 
        view 
    {
        if (
            _cast(block.timestamp < startTime) |
                _cast(block.timestamp > endTime) ==
            1
        ) {
            revert StageNotActive(block.timestamp, startTime, endTime);
        }
    }

    function _cast(bool b) internal pure returns (uint256 u) {
        assembly {
            u := b
        }
    }
}
