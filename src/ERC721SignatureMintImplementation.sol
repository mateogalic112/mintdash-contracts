// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.18;

import {ERC721AUpgradeable} from "erc721a-upgradeable/contracts/ERC721AUpgradeable.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC2981Upgradeable} from "@openzeppelin/contracts-upgradeable/interfaces/IERC2981Upgradeable.sol";
import {ERC2981Upgradeable} from "@openzeppelin/contracts-upgradeable/token/common/ERC2981Upgradeable.sol";

import {SignedMintParams} from "./lib/DropStructs.sol";

import {AdministratedUpgradeable} from "./core/AdministratedUpgradeable.sol";
import {ERC721ContractMetadata} from "./core/ERC721ContractMetadata.sol";
import {Payout} from "./core/Payout.sol";
import {OperatorFilterToggle} from "./core/OperatorFilterToggle.sol";

import {IERC721SignatureMintImplementation} from "./interface/IERC721SignatureMintImplementation.sol";

contract ERC721SignatureMintImplementation is
    AdministratedUpgradeable,
    ERC721ContractMetadata,
    Payout,
    OperatorFilterToggle,
    IERC721SignatureMintImplementation
{
    using ECDSA for bytes32;

    mapping(bytes32 digest => bool used) private _usedDigests;
    mapping(address signer => bool allowed) public allowedSigners;

    uint256 internal _CHAIN_ID;
    bytes32 internal _SIGNED_MINT_TYPEHASH;
    bytes32 internal _MINT_PARAMS_TYPEHASH;
    bytes32 internal _EIP_712_DOMAIN_TYPEHASH;
    bytes32 internal _NAME_HASH;
    bytes32 internal _VERSION_HASH;
    bytes32 internal _DOMAIN_SEPARATOR;

    function initialize(
        string memory _name,
        string memory _symbol,
        address _administrator
    ) external initializerERC721A initializer {
        __ERC721A_init(_name, _symbol);
        __Administrated_init(_administrator);
        __Payout_init();
        __Ownable_init();
        __ERC2981_init();
        __DefaultOperatorFilterer_init();

        _NAME_HASH = keccak256("ERC721Drop");
        _VERSION_HASH = keccak256("1.0");
        _CHAIN_ID = block.chainid;
        _EIP_712_DOMAIN_TYPEHASH = keccak256(
            "EIP712Domain("
                "string name,"
                "string version,"
                "uint256 chainId,"
                "address verifyingContract"
            ")"
        );
        _MINT_PARAMS_TYPEHASH = keccak256(
           "SignedMintParams("
                "uint80 mintPrice,"
                "uint48 startTime,"
                "uint48 endTime,"
                "uint16 mintLimitPerWallet,"
                "uint40 maxSupplyForStage,"
                "uint256 stageIndex"
            ")"
        );
        _SIGNED_MINT_TYPEHASH = keccak256(
             "SignedMint("
                "address minter,"
                "SignedMintParams mintParams,"
                "uint256 salt"
            ")"
            "SignedMintParams("
                "uint80 mintPrice,"
                "uint48 startTime,"
                "uint48 endTime,"
                "uint16 mintLimitPerWallet,"
                "uint40 maxSupplyForStage,"
                "uint256 stageIndex"
            ")"
        );
        _DOMAIN_SEPARATOR = _deriveDomainSeparator();
    }

    function mintSigned(
        address recipient,
        uint256 quantity,
        SignedMintParams calldata mintParams,
        uint256 salt,
        bytes calldata signature
    ) external payable {
        // Get the minter address. Default to msg.sender.
        address minter = recipient != address(0) ? recipient : msg.sender;

        // Ensure the payer is allowed if not caller
        _checkPayer(minter);

        // Ensure correct mint quantity
        _checkMintQuantity(
            minter,
            quantity,
            mintParams.mintLimitPerWallet,
            mintParams.maxSupplyForStage
        );

        // Ensure that signed mint stage is active
        _checkStageActive(mintParams.startTime, mintParams.endTime);

        // Ensure enough ETH is provided
        _checkFunds(msg.value, quantity, mintParams.mintPrice);

        // Get the digest to verify the EIP-712 signature.
        bytes32 digest = _getDigest(
            minter,
            mintParams,
            salt
        );

        // Ensure the digest has not already been used.
        if (_usedDigests[digest]) {
            revert SignatureAlreadyUsed();
        }

        // Mark the digest as used.
        _usedDigests[digest] = true;

        // Ensure correct signer signed this message.
        _checkSigner(digest, signature);

        // Mint tokens
        _mintBase(minter, quantity, mintParams.stageIndex);
    }

    function updateAllowedSigner(
        address signer,
        bool isAllowed
    ) external onlyOwnerOrAdministrator
    {
        allowedSigners[signer] = isAllowed;

        emit AllowedSignerUpdated(signer, isAllowed);
    }

    function updateConfiguration(
        MultiConfig calldata config
    ) external onlyOwnerOrAdministrator {

        // Update max supply
        if(config.maxSupply > 0) {
            _updateMaxSupply(config.maxSupply);
        }

        // Update base URI
        if(bytes(config.baseURI).length > 0){
            _updateBaseURI(config.baseURI);
        }

        // Update royalties
        if(config.royaltiesReceiver != address(0)){
            _updateRoyalties(config.royaltiesReceiver, config.royaltiesFeeNumerator);
        }

        // Update payout
        if(config.payoutAddress != address(0)){
            _updatePayoutAddress(config.payoutAddress);
        }
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(ERC2981Upgradeable, ERC721AUpgradeable)
        returns (bool)
    {
        return
            interfaceId == type(IERC2981Upgradeable).interfaceId ||
            ERC721AUpgradeable.supportsInterface(interfaceId)||
            super.supportsInterface(interfaceId);
    }

    function setApprovalForAll(
        address operator,
        bool approved
    ) public override {
        if (operatorFiltererEnabled) {
            _checkFilterOperator(operator);
        }
        super.setApprovalForAll(operator, approved);
    }

    function approve(
        address operator,
        uint256 tokenId
    ) public payable override {
        if (operatorFiltererEnabled) {
            _checkFilterOperator(operator);
        }
        super.approve(operator, tokenId);
    }

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public payable override {
        if (from != msg.sender && operatorFiltererEnabled) {
            _checkFilterOperator(msg.sender);
        }
        super.transferFrom(from, to, tokenId);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public payable override {
        if (from != msg.sender && operatorFiltererEnabled) {
            _checkFilterOperator(msg.sender);
        }
        super.safeTransferFrom(from, to, tokenId);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public payable override {
        if (from != msg.sender && operatorFiltererEnabled) {
            _checkFilterOperator(msg.sender);
        }
        super.safeTransferFrom(from, to, tokenId, data);
    }

    function _checkSigner(
        bytes32 digest,
        bytes calldata signature
    ) internal view {
        address recoveredAddress = digest.recover(signature);
        if(!allowedSigners[recoveredAddress]){
            revert InvalidSignature(recoveredAddress);
        }
    }

    function _getDigest(
        address minter,
        SignedMintParams memory mintParams,
        uint256 salt
    ) internal view returns (bytes32) {
        bytes32 mintParamsHashStruct = keccak256(
            abi.encode(
                _MINT_PARAMS_TYPEHASH,
                mintParams.mintPrice,
                mintParams.startTime,
                mintParams.endTime,
                mintParams.mintLimitPerWallet,
                mintParams.maxSupplyForStage,
                mintParams.stageIndex
            )
        );

        return keccak256(
            bytes.concat(
                bytes2(0x1901),
                _domainSeparator(),
                keccak256(
                    abi.encode(
                        _SIGNED_MINT_TYPEHASH,
                        minter,
                        mintParamsHashStruct,
                        salt
                    )
                )
            )
        );
    }

    function _domainSeparator() internal view returns (bytes32) {
        return block.chainid == _CHAIN_ID
            ? _DOMAIN_SEPARATOR
            : _deriveDomainSeparator();
    }

    function _deriveDomainSeparator() internal view returns (bytes32) {
        return keccak256(
            abi.encode(
                _EIP_712_DOMAIN_TYPEHASH,
                _NAME_HASH,
                _VERSION_HASH,
                block.chainid,
                address(this)
            )
        );
    }
}
