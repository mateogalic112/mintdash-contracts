# ERC721DropImplementation









## Methods

### administrator

```solidity
function administrator() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### airdrop

```solidity
function airdrop(address[] to, uint64[] quantity) external nonpayable
```

Mints tokens to addresses.



#### Parameters

| Name | Type | Description |
|---|---|---|
| to | address[] | List of addresses to receive tokens. |
| quantity | uint64[] | List of quantities to assign to each address. |

### allowedPayers

```solidity
function allowedPayers(address payer) external view returns (bool allowed)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| payer | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| allowed | bool | undefined |

### allowedSigners

```solidity
function allowedSigners(address signer) external view returns (bool allowed)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| signer | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| allowed | bool | undefined |

### allowlistMintStages

```solidity
function allowlistMintStages(uint256 allowlistStageId) external view returns (uint80 mintPrice, uint48 startTime, uint48 endTime, uint16 mintLimitPerWallet, uint40 maxSupplyForStage, bytes32 merkleRoot)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| allowlistStageId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| mintPrice | uint80 | undefined |
| startTime | uint48 | undefined |
| endTime | uint48 | undefined |
| mintLimitPerWallet | uint16 | undefined |
| maxSupplyForStage | uint40 | undefined |
| merkleRoot | bytes32 | undefined |

### approve

```solidity
function approve(address operator, uint256 tokenId) external payable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| operator | address | undefined |
| tokenId | uint256 | undefined |

### balanceOf

```solidity
function balanceOf(address owner) external view returns (uint256)
```



*Returns the number of tokens in `owner`&#39;s account.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| owner | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### baseURI

```solidity
function baseURI() external view returns (string)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### burn

```solidity
function burn(uint256 tokenId) external nonpayable
```

Burns a token.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | Id of the token to burn. |

### getAmountMinted

```solidity
function getAmountMinted(address user) external view returns (uint64)
```

Returns number of tokens minted for address.



#### Parameters

| Name | Type | Description |
|---|---|---|
| user | address | The address of user to check minted amount for. |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint64 | undefined |

### getApproved

```solidity
function getApproved(uint256 tokenId) external view returns (address)
```



*Returns the account approved for `tokenId` token. Requirements: - `tokenId` must exist.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### getTokenGatedIsRedeemed

```solidity
function getTokenGatedIsRedeemed(address nftContract, uint256 tokenId) external view returns (bool)
```

Returns if token is redeemed for NFT contract.



#### Parameters

| Name | Type | Description |
|---|---|---|
| nftContract | address | The token gated nft contract. |
| tokenId | uint256 | The token gated token ID to check. |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### initialize

```solidity
function initialize(string _name, string _symbol) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _name | string | undefined |
| _symbol | string | undefined |

### isApprovedForAll

```solidity
function isApprovedForAll(address owner, address operator) external view returns (bool)
```



*Returns if the `operator` is allowed to manage all of the assets of `owner`. See {setApprovalForAll}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| owner | address | undefined |
| operator | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### maxSupply

```solidity
function maxSupply() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### mintAllowlist

```solidity
function mintAllowlist(uint256 allowlistStageId, address recipient, uint256 quantity, bytes32[] merkleProof) external payable
```

Mint an allowlist stage.



#### Parameters

| Name | Type | Description |
|---|---|---|
| allowlistStageId | uint256 | ID of the allowlist stage. |
| recipient | address | Recipient of tokens. |
| quantity | uint256 | Number of tokens to mint. |
| merkleProof | bytes32[] | Valid Merkle proof. |

### mintPublic

```solidity
function mintPublic(address recipient, uint256 quantity) external payable
```

Mint a public stage.



#### Parameters

| Name | Type | Description |
|---|---|---|
| recipient | address | Recipient of tokens. |
| quantity | uint256 | Number of tokens to mint. |

### mintSigned

```solidity
function mintSigned(address recipient, uint256 quantity, SignedMintParams mintParams, uint256 salt, bytes signature) external payable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| recipient | address | undefined |
| quantity | uint256 | undefined |
| mintParams | SignedMintParams | undefined |
| salt | uint256 | undefined |
| signature | bytes | undefined |

### mintTokenGated

```solidity
function mintTokenGated(address recipient, address nftContract, uint256[] tokenIds) external payable
```

Mint a token gated stage.



#### Parameters

| Name | Type | Description |
|---|---|---|
| recipient | address | Recipient of tokens. |
| nftContract | address | NFT collection to redeem for. |
| tokenIds | uint256[] | Token Ids to redeem. |

### name

```solidity
function name() external view returns (string)
```



*Returns the token collection name.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### operatorFiltererEnabled

```solidity
function operatorFiltererEnabled() external view returns (bool)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### owner

```solidity
function owner() external view returns (address)
```



*Returns the address of the current owner.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### ownerOf

```solidity
function ownerOf(uint256 tokenId) external view returns (address)
```



*Returns the owner of the `tokenId` token. Requirements: - `tokenId` must exist.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### payoutAddress

```solidity
function payoutAddress() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### provenanceHash

```solidity
function provenanceHash() external view returns (bytes32)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

### publicMintStage

```solidity
function publicMintStage() external view returns (uint80 mintPrice, uint48 startTime, uint48 endTime, uint16 mintLimitPerWallet)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| mintPrice | uint80 | undefined |
| startTime | uint48 | undefined |
| endTime | uint48 | undefined |
| mintLimitPerWallet | uint16 | undefined |

### renounceAdministration

```solidity
function renounceAdministration() external nonpayable
```






### renounceOwnership

```solidity
function renounceOwnership() external nonpayable
```



*Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is only available to the owner.*


### royaltyInfo

```solidity
function royaltyInfo(uint256 _tokenId, uint256 _salePrice) external view returns (address, uint256)
```



*Returns how much royalty is owed and to whom, based on a sale price that may be denominated in any unit of exchange. The royalty amount is denominated and should be paid in that same unit of exchange.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _tokenId | uint256 | undefined |
| _salePrice | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |
| _1 | uint256 | undefined |

### safeTransferFrom

```solidity
function safeTransferFrom(address from, address to, uint256 tokenId) external payable
```



*Equivalent to `safeTransferFrom(from, to, tokenId, &#39;&#39;)`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address | undefined |
| to | address | undefined |
| tokenId | uint256 | undefined |

### safeTransferFrom

```solidity
function safeTransferFrom(address from, address to, uint256 tokenId, bytes data) external payable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address | undefined |
| to | address | undefined |
| tokenId | uint256 | undefined |
| data | bytes | undefined |

### setApprovalForAll

```solidity
function setApprovalForAll(address operator, bool approved) external nonpayable
```



*Approve or remove `operator` as an operator for the caller. Operators can call {transferFrom} or {safeTransferFrom} for any token owned by the caller. Requirements: - The `operator` cannot be the caller. Emits an {ApprovalForAll} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| operator | address | undefined |
| approved | bool | undefined |

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) external view returns (bool)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| interfaceId | bytes4 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### symbol

```solidity
function symbol() external view returns (string)
```



*Returns the token collection symbol.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### tokenGatedMintStages

```solidity
function tokenGatedMintStages(address nftContract) external view returns (uint80 mintPrice, uint48 startTime, uint48 endTime, uint16 mintLimitPerWallet, uint40 maxSupplyForStage)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| nftContract | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| mintPrice | uint80 | undefined |
| startTime | uint48 | undefined |
| endTime | uint48 | undefined |
| mintLimitPerWallet | uint16 | undefined |
| maxSupplyForStage | uint40 | undefined |

### tokenURI

```solidity
function tokenURI(uint256 tokenId) external view returns (string)
```



*Returns the Uniform Resource Identifier (URI) for `tokenId` token.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### totalSupply

```solidity
function totalSupply() external view returns (uint256)
```



*Returns the total number of tokens in existence. Burned tokens will reduce the count. To get the total number of tokens minted, please see {_totalMinted}.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### transferAdministration

```solidity
function transferAdministration(address newAdmin) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| newAdmin | address | undefined |

### transferFrom

```solidity
function transferFrom(address from, address to, uint256 tokenId) external payable
```



*Transfers `tokenId` from `from` to `to`. Requirements: - `from` cannot be the zero address. - `to` cannot be the zero address. - `tokenId` token must be owned by `from`. - If the caller is not `from`, it must be approved to move this token by either {approve} or {setApprovalForAll}. Emits a {Transfer} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address | undefined |
| to | address | undefined |
| tokenId | uint256 | undefined |

### transferOwnership

```solidity
function transferOwnership(address newOwner) external nonpayable
```



*Transfers ownership of the contract to a new account (`newOwner`). Can only be called by the current owner.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newOwner | address | undefined |

### updateAllowedSigner

```solidity
function updateAllowedSigner(address signer, bool isAllowed) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| signer | address | undefined |
| isAllowed | bool | undefined |

### updateAllowlistMintStage

```solidity
function updateAllowlistMintStage(uint256 allowlistStageId, AllowlistMintStage allowlistMintStageData) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| allowlistStageId | uint256 | undefined |
| allowlistMintStageData | AllowlistMintStage | undefined |

### updateBaseURI

```solidity
function updateBaseURI(string newUri) external nonpayable
```

Updates base URI of the collection.



#### Parameters

| Name | Type | Description |
|---|---|---|
| newUri | string | The new base URI to set. |

### updateConfiguration

```solidity
function updateConfiguration(IERC721DropImplementation.MultiConfig config) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| config | IERC721DropImplementation.MultiConfig | undefined |

### updateMaxSupply

```solidity
function updateMaxSupply(uint256 newMaxSupply) external nonpayable
```

Updates configuration for allowlist mint stage.



#### Parameters

| Name | Type | Description |
|---|---|---|
| newMaxSupply | uint256 | The new max supply to set. |

### updateOperatorFilterer

```solidity
function updateOperatorFilterer(bool enabled) external nonpayable
```

Enabled or disables operator filter for Opensea royalties enforcement.



#### Parameters

| Name | Type | Description |
|---|---|---|
| enabled | bool | If operator filter is enabled. |

### updatePayer

```solidity
function updatePayer(address payer, bool isAllowed) external nonpayable
```

Updates allowed payers.



#### Parameters

| Name | Type | Description |
|---|---|---|
| payer | address | If payer is allowed. |
| isAllowed | bool | undefined |

### updatePayoutAddress

```solidity
function updatePayoutAddress(address newPayoutAddress) external nonpayable
```

Updates payout address



#### Parameters

| Name | Type | Description |
|---|---|---|
| newPayoutAddress | address | New payout address. |

### updateProvenanceHash

```solidity
function updateProvenanceHash(bytes32 newProvenanceHash) external nonpayable
```

Updates provenance hash. This function will revert after the first item has been minted.



#### Parameters

| Name | Type | Description |
|---|---|---|
| newProvenanceHash | bytes32 | The new provenance hash to set. |

### updatePublicMintStage

```solidity
function updatePublicMintStage(PublicMintStage publicMintStageData) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| publicMintStageData | PublicMintStage | undefined |

### updateRoyalties

```solidity
function updateRoyalties(address receiver, uint96 feeNumerator) external nonpayable
```

Updates royalties for the collection.



#### Parameters

| Name | Type | Description |
|---|---|---|
| receiver | address | New address of the royalties receiver. |
| feeNumerator | uint96 | Royalties amount %. |

### updateTokenGatedMintStage

```solidity
function updateTokenGatedMintStage(address nftContract, TokenGatedMintStage tokenGatedMintStageData) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| nftContract | address | undefined |
| tokenGatedMintStageData | TokenGatedMintStage | undefined |

### withdrawAllFunds

```solidity
function withdrawAllFunds() external nonpayable
```

Withdraws all funds from the contract. This function will revert if contract balance is zero.






## Events

### AdministrationTransferred

```solidity
event AdministrationTransferred(address indexed previousAdmin, address indexed newAdmin)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| previousAdmin `indexed` | address | undefined |
| newAdmin `indexed` | address | undefined |

### AllowedPayerUpdated

```solidity
event AllowedPayerUpdated(address indexed payer, bool indexed allowed)
```



*Emit an event when allowed payer is updated.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| payer `indexed` | address | undefined |
| allowed `indexed` | bool | undefined |

### AllowedSignerUpdated

```solidity
event AllowedSignerUpdated(address indexed signer, bool indexed allowed)
```



*Emit an event when allowed signer is updated.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| signer `indexed` | address | undefined |
| allowed `indexed` | bool | undefined |

### AllowlistMintStageUpdated

```solidity
event AllowlistMintStageUpdated(uint256 indexed allowlistStageId, AllowlistMintStage data)
```



*Emit an event when allowlist mint stage configuration is updated.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| allowlistStageId `indexed` | uint256 | undefined |
| data  | AllowlistMintStage | undefined |

### Approval

```solidity
event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)
```



*Emitted when `owner` enables `approved` to manage the `tokenId` token.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| owner `indexed` | address | undefined |
| approved `indexed` | address | undefined |
| tokenId `indexed` | uint256 | undefined |

### ApprovalForAll

```solidity
event ApprovalForAll(address indexed owner, address indexed operator, bool approved)
```



*Emitted when `owner` enables or disables (`approved`) `operator` to manage all of its assets.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| owner `indexed` | address | undefined |
| operator `indexed` | address | undefined |
| approved  | bool | undefined |

### BaseURIUpdated

```solidity
event BaseURIUpdated(string indexed baseURI)
```



*Emit an event when base URI of the collection is updated.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| baseURI `indexed` | string | undefined |

### BatchMetadataUpdate

```solidity
event BatchMetadataUpdate(uint256 _fromTokenId, uint256 _toTokenId)
```



*Emit an event for token metadata reveals/updates,      according to EIP-4906.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _fromTokenId  | uint256 | The start token id. |
| _toTokenId  | uint256 | The end token id. |

### ConsecutiveTransfer

```solidity
event ConsecutiveTransfer(uint256 indexed fromTokenId, uint256 toTokenId, address indexed from, address indexed to)
```



*Emitted when tokens in `fromTokenId` to `toTokenId` (inclusive) is transferred from `from` to `to`, as defined in the [ERC2309](https://eips.ethereum.org/EIPS/eip-2309) standard. See {_mintERC2309} for more details.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| fromTokenId `indexed` | uint256 | undefined |
| toTokenId  | uint256 | undefined |
| from `indexed` | address | undefined |
| to `indexed` | address | undefined |

### Initialized

```solidity
event Initialized(uint8 version)
```



*Triggered when the contract has been initialized or reinitialized.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| version  | uint8 | undefined |

### MaxSupplyUpdated

```solidity
event MaxSupplyUpdated(uint256 indexed maxSupply)
```



*Emit an event when max supply of the collection is updated.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| maxSupply `indexed` | uint256 | undefined |

### Minted

```solidity
event Minted(address indexed recipient, uint256 indexed quantity, uint256 indexed stageIndex)
```



*Emit an event when token is minted.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| recipient `indexed` | address | undefined |
| quantity `indexed` | uint256 | undefined |
| stageIndex `indexed` | uint256 | undefined |

### OperatorFiltererEnabledUpdated

```solidity
event OperatorFiltererEnabledUpdated(bool indexed enabled)
```



*Emit an event when operator filterer is enabled or disabled.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| enabled `indexed` | bool | undefined |

### OwnershipTransferred

```solidity
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| previousOwner `indexed` | address | undefined |
| newOwner `indexed` | address | undefined |

### PayoutAddressUpdated

```solidity
event PayoutAddressUpdated(address indexed payoutAddress)
```



*Emit an event when payout address is updated*

#### Parameters

| Name | Type | Description |
|---|---|---|
| payoutAddress `indexed` | address | undefined |

### ProvenanceHashUpdated

```solidity
event ProvenanceHashUpdated(bytes32 indexed provenanceHash)
```



*Emit an event when provenance hash is updated.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| provenanceHash `indexed` | bytes32 | undefined |

### PublicMintStageUpdated

```solidity
event PublicMintStageUpdated(PublicMintStage data)
```



*Emit an event when public mint stage configuration is updated.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| data  | PublicMintStage | undefined |

### RoyaltiesUpdated

```solidity
event RoyaltiesUpdated(address indexed receiver, uint96 indexed feeNumerator)
```



*Emit an event when royalties are updated.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| receiver `indexed` | address | undefined |
| feeNumerator `indexed` | uint96 | undefined |

### TokenGatedMintStageUpdated

```solidity
event TokenGatedMintStageUpdated(address indexed nftContract, TokenGatedMintStage data)
```



*Emit an event when token gated mint stage configuration is updated for NFT contract.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| nftContract `indexed` | address | undefined |
| data  | TokenGatedMintStage | undefined |

### Transfer

```solidity
event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)
```



*Emitted when `tokenId` token is transferred from `from` to `to`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from `indexed` | address | undefined |
| to `indexed` | address | undefined |
| tokenId `indexed` | uint256 | undefined |



## Errors

### AllowlistPhaseConfigMismatch

```solidity
error AllowlistPhaseConfigMismatch()
```



*Revert if allowlist multi config part is not valid.*


### AllowlistStageInvalidProof

```solidity
error AllowlistStageInvalidProof()
```



*Revert if supplied merkle proof is not valid for allowlist mint stage.*


### ApprovalCallerNotOwnerNorApproved

```solidity
error ApprovalCallerNotOwnerNorApproved()
```

The caller must own the token or be an approved operator.




### ApprovalQueryForNonexistentToken

```solidity
error ApprovalQueryForNonexistentToken()
```

The token does not exist.




### BalanceQueryForZeroAddress

```solidity
error BalanceQueryForZeroAddress()
```

Cannot query the balance for the zero address.




### CannotExceedMaxSupplyOfUint64

```solidity
error CannotExceedMaxSupplyOfUint64()
```



*Revert if max supply exceeds uint64 max.*


### IncorrectFundsProvided

```solidity
error IncorrectFundsProvided()
```



*Revert if supplied ETH value is not valid for the mint.*


### InvalidAdministratorAddress

```solidity
error InvalidAdministratorAddress()
```






### InvalidPayoutAddress

```solidity
error InvalidPayoutAddress()
```



*Revert if the payout address is zero address.*


### InvalidSignature

```solidity
error InvalidSignature(address recoveredAddress)
```



*Revert if signature is not valid.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| recoveredAddress | address | undefined |

### MintERC2309QuantityExceedsLimit

```solidity
error MintERC2309QuantityExceedsLimit()
```

The `quantity` minted with ERC2309 exceeds the safety limit.




### MintQuantityExceedsMaxSupply

```solidity
error MintQuantityExceedsMaxSupply()
```



*Revert if mint quantity exceeds max supply of the collection.*


### MintQuantityExceedsMaxSupplyForStage

```solidity
error MintQuantityExceedsMaxSupplyForStage()
```



*Revert if mint quantity exceeds max supply for stage.*


### MintQuantityExceedsWalletLimit

```solidity
error MintQuantityExceedsWalletLimit()
```



*Revert if mint quantity exceeds wallet limit for the mint stage.*


### MintToZeroAddress

```solidity
error MintToZeroAddress()
```

Cannot mint to the zero address.




### MintZeroQuantity

```solidity
error MintZeroQuantity()
```

The quantity of tokens minted must be more than zero.




### NothingToWithdraw

```solidity
error NothingToWithdraw()
```



*Revert if the contract balance is zero when withdrawing funds.*


### OnlyAdministrator

```solidity
error OnlyAdministrator()
```






### OnlyOwnerOrAdministrator

```solidity
error OnlyOwnerOrAdministrator()
```






### OperatorNotAllowed

```solidity
error OperatorNotAllowed(address operator)
```

Emitted when an operator is not allowed.



#### Parameters

| Name | Type | Description |
|---|---|---|
| operator | address | undefined |

### OwnerQueryForNonexistentToken

```solidity
error OwnerQueryForNonexistentToken()
```

The token does not exist.




### OwnershipNotInitializedForExtraData

```solidity
error OwnershipNotInitializedForExtraData()
```

The `extraData` cannot be set on an unintialized ownership slot.




### PayerNotAllowed

```solidity
error PayerNotAllowed()
```



*Revert if the payout address is zero address.*


### PayoutAddressCannotBeZeroAddress

```solidity
error PayoutAddressCannotBeZeroAddress()
```



*Revert if payout address is zero address when updating payout address.*


### ProvenanceHashCannotBeUpdatedAfterMintStarted

```solidity
error ProvenanceHashCannotBeUpdatedAfterMintStarted()
```



*Revert if provenance hash is being updated after tokens have been minted.*


### SignatureAlreadyUsed

```solidity
error SignatureAlreadyUsed()
```



*Revert if signature was already used for signed mint.*


### StageNotActive

```solidity
error StageNotActive(uint256 blockTimestamp, uint256 startTime, uint256 endTime)
```



*Revert if called mint stage is not currently yet.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| blockTimestamp | uint256 | undefined |
| startTime | uint256 | undefined |
| endTime | uint256 | undefined |

### TokenGatedNftContractCannotBeZeroAddress

```solidity
error TokenGatedNftContractCannotBeZeroAddress()
```



*Revert if NFT contract is zero address when updating token gated mint stage.*


### TokenGatedNotTokenOwner

```solidity
error TokenGatedNotTokenOwner()
```



*Revert if minter is not token owner for token gated mint stage.*


### TokenGatedPhaseConfigMismatch

```solidity
error TokenGatedPhaseConfigMismatch()
```



*Revert if token gated multi config part is not valid.*


### TokenGatedTokenAlreadyRedeemed

```solidity
error TokenGatedTokenAlreadyRedeemed()
```



*Revert if token id is already redeemed for token gated mint stage.*


### TransferCallerNotOwnerNorApproved

```solidity
error TransferCallerNotOwnerNorApproved()
```

The caller must own the token or be an approved operator.




### TransferFromIncorrectOwner

```solidity
error TransferFromIncorrectOwner()
```

The token must be owned by `from`.




### TransferToNonERC721ReceiverImplementer

```solidity
error TransferToNonERC721ReceiverImplementer()
```

Cannot safely transfer to a contract that does not implement the ERC721Receiver interface.




### TransferToZeroAddress

```solidity
error TransferToZeroAddress()
```

Cannot transfer to the zero address.




### URIQueryForNonexistentToken

```solidity
error URIQueryForNonexistentToken()
```

The token does not exist.





