# ERC1155EditionsImplementation









## Methods

### airdrop

```solidity
function airdrop(address[] to, uint256[] tokenId, uint64[] quantity) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| to | address[] | undefined |
| tokenId | uint256[] | undefined |
| quantity | uint64[] | undefined |

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

### allowlistMintStages

```solidity
function allowlistMintStages(uint256 tokenId, uint256 allowlistStageId) external view returns (uint80 mintPrice, uint48 startTime, uint48 endTime, uint16 mintLimitPerWallet, uint40 maxSupplyForStage, bytes32 merkleRoot)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |
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

### balanceOf

```solidity
function balanceOf(address account, uint256 id) external view returns (uint256)
```



*See {IERC1155-balanceOf}. Requirements: - `account` cannot be the zero address.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| account | address | undefined |
| id | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### balanceOfBatch

```solidity
function balanceOfBatch(address[] accounts, uint256[] ids) external view returns (uint256[])
```



*See {IERC1155-balanceOfBatch}. Requirements: - `accounts` and `ids` must have the same length.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| accounts | address[] | undefined |
| ids | uint256[] | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256[] | undefined |

### burn

```solidity
function burn(address account, uint256 id, uint256 value) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| account | address | undefined |
| id | uint256 | undefined |
| value | uint256 | undefined |

### burnBatch

```solidity
function burnBatch(address account, uint256[] ids, uint256[] values) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| account | address | undefined |
| ids | uint256[] | undefined |
| values | uint256[] | undefined |

### createToken

```solidity
function createToken(string tokenUri) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenUri | string | undefined |

### getAllowlistMintStage

```solidity
function getAllowlistMintStage(uint256 tokenId, uint256 allowlistStageId) external view returns (struct AllowlistMintStage)
```

Returns allowlist mint stage for token and ID.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | The ID of allowlist stage. |
| allowlistStageId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | AllowlistMintStage | undefined |

### getAmountMinted

```solidity
function getAmountMinted(address user, uint256 tokenId) external view returns (uint64)
```

Returns number of tokens minted for address.



#### Parameters

| Name | Type | Description |
|---|---|---|
| user | address | The address of user to check minted amount for. |
| tokenId | uint256 | The token ID to check minted amount for. |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint64 | undefined |

### getPublicMintStage

```solidity
function getPublicMintStage(uint256 tokenId) external view returns (struct PublicMintStage)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | PublicMintStage | undefined |

### getTokenGatedIsRedeemed

```solidity
function getTokenGatedIsRedeemed(uint256 tokenId, address nftContract, uint256 nftContractTokenId) external view returns (bool)
```

Returns if token is redeemed for NFT contract.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token. |
| nftContract | address | The token gated nft contract. |
| nftContractTokenId | uint256 | The token gated token ID to check. |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### getTokenGatedMintStage

```solidity
function getTokenGatedMintStage(uint256 tokenId, address nftContract) external view returns (struct TokenGatedMintStage)
```

Returns token gated mint stage for token and NFT contract address.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | The token ID to check allowlist stage for. |
| nftContract | address | The token gated nft contract. |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | TokenGatedMintStage | undefined |

### initialize

```solidity
function initialize(string _name, string _symbol, address _platformFeesAddress, uint96 _platformFeesNumerator) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _name | string | undefined |
| _symbol | string | undefined |
| _platformFeesAddress | address | undefined |
| _platformFeesNumerator | uint96 | undefined |

### isApprovedForAll

```solidity
function isApprovedForAll(address account, address operator) external view returns (bool)
```



*See {IERC1155-isApprovedForAll}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| account | address | undefined |
| operator | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### latestTokenId

```solidity
function latestTokenId() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### maxSupply

```solidity
function maxSupply(uint256 tokenId) external view returns (uint256 maxSupply)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| maxSupply | uint256 | undefined |

### mintAllowlist

```solidity
function mintAllowlist(uint256 allowlistStageId, uint256 tokenId, address recipient, uint256 quantity, bytes32[] merkleProof, bytes data) external payable
```

Mint an allowlist stage.



#### Parameters

| Name | Type | Description |
|---|---|---|
| allowlistStageId | uint256 | ID of the allowlist stage. |
| tokenId | uint256 | ID of the token to mint. |
| recipient | address | Recipient of tokens. |
| quantity | uint256 | Number of tokens to mint. |
| merkleProof | bytes32[] | Valid Merkle proof. |
| data | bytes | Mint data. |

### mintPublic

```solidity
function mintPublic(address recipient, uint256 tokenId, uint256 quantity, bytes data) external payable
```

Mint a public stage.



#### Parameters

| Name | Type | Description |
|---|---|---|
| recipient | address | Recipient of tokens. |
| tokenId | uint256 | ID of token to mint. |
| quantity | uint256 | Number of tokens to mint. |
| data | bytes | Mint data. |

### mintTokenGated

```solidity
function mintTokenGated(address recipient, uint256 tokenId, address nftContract, uint256[] tokenIds, bytes data) external payable
```

Mint an token gated stage.



#### Parameters

| Name | Type | Description |
|---|---|---|
| recipient | address | Recipient of tokens. |
| tokenId | uint256 | Id of the token to mint. |
| nftContract | address | NFT collection to redeem for. |
| tokenIds | uint256[] | Token Ids to redeem. |
| data | bytes | Mint data. |

### minted

```solidity
function minted(address user, uint256 tokenId) external view returns (uint64 amount)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| user | address | undefined |
| tokenId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| amount | uint64 | undefined |

### multicall

```solidity
function multicall(bytes[] data) external nonpayable returns (bytes[] results)
```



*Receives and executes a batch of function calls on this contract.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| data | bytes[] | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| results | bytes[] | undefined |

### name

```solidity
function name() external view returns (string)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### owner

```solidity
function owner() external view returns (address)
```



*Returns the address of the current owner.*


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

### platformFeesAddress

```solidity
function platformFeesAddress() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### platformFeesNumerator

```solidity
function platformFeesNumerator() external view returns (uint96)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint96 | undefined |

### provenanceHash

```solidity
function provenanceHash() external view returns (bytes32)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

### publicMintStages

```solidity
function publicMintStages(uint256 tokenId) external view returns (uint144 mintPrice, uint48 startTime, uint48 endTime, uint16 mintLimitPerWallet)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| mintPrice | uint144 | undefined |
| startTime | uint48 | undefined |
| endTime | uint48 | undefined |
| mintLimitPerWallet | uint16 | undefined |

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

### safeBatchTransferFrom

```solidity
function safeBatchTransferFrom(address from, address to, uint256[] ids, uint256[] amounts, bytes data) external nonpayable
```



*See {IERC1155-safeBatchTransferFrom}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address | undefined |
| to | address | undefined |
| ids | uint256[] | undefined |
| amounts | uint256[] | undefined |
| data | bytes | undefined |

### safeTransferFrom

```solidity
function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data) external nonpayable
```



*See {IERC1155-safeTransferFrom}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address | undefined |
| to | address | undefined |
| id | uint256 | undefined |
| amount | uint256 | undefined |
| data | bytes | undefined |

### setApprovalForAll

```solidity
function setApprovalForAll(address operator, bool approved) external nonpayable
```



*See {IERC1155-setApprovalForAll}.*

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






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### tokenGatedMintStages

```solidity
function tokenGatedMintStages(uint256 tokenId, address nftContract) external view returns (uint104 mintPrice, uint48 startTime, uint48 endTime, uint16 mintLimitPerWallet, uint40 maxSupplyForStage)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |
| nftContract | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| mintPrice | uint104 | undefined |
| startTime | uint48 | undefined |
| endTime | uint48 | undefined |
| mintLimitPerWallet | uint16 | undefined |
| maxSupplyForStage | uint40 | undefined |

### tokenURIs

```solidity
function tokenURIs(uint256 tokenid) external view returns (string tokenURI)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenid | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| tokenURI | string | undefined |

### totalSupply

```solidity
function totalSupply(uint256 tokenId) external view returns (uint256 totalSupply)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| totalSupply | uint256 | undefined |

### transferOwnership

```solidity
function transferOwnership(address newOwner) external nonpayable
```



*Transfers ownership of the contract to a new account (`newOwner`). Can only be called by the current owner.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newOwner | address | undefined |

### updateAllowlistMintStage

```solidity
function updateAllowlistMintStage(uint256 tokenId, AllowlistMintStageConfig allowlistMintStageConfig) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |
| allowlistMintStageConfig | AllowlistMintStageConfig | undefined |

### updateConfiguration

```solidity
function updateConfiguration(uint256 tokenId, IERC1155EditionsImplementation.MultiConfig config) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |
| config | IERC1155EditionsImplementation.MultiConfig | undefined |

### updateMaxSupply

```solidity
function updateMaxSupply(uint256 tokenId, uint256 newMaxSupply) external nonpayable
```

Updates configuration for allowlist mint stage.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | The token ID to update max supply for. |
| newMaxSupply | uint256 | The new max supply to set. |

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
function updatePublicMintStage(uint256 tokenId, PublicMintStage publicMintStageData) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |
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
function updateTokenGatedMintStage(uint256 tokenId, TokenGatedMintStageConfig tokenGatedMintStageConfig) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |
| tokenGatedMintStageConfig | TokenGatedMintStageConfig | undefined |

### updateTokenURI

```solidity
function updateTokenURI(uint256 tokenId, string newUri) external nonpayable
```

Updates token URI for the token.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | The token ID to update max supply for. |
| newUri | string | The URI to set for the token ID. |

### uri

```solidity
function uri(uint256 tokenId) external view returns (string)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### withdrawAllFunds

```solidity
function withdrawAllFunds() external nonpayable
```

Withdraws all funds from the contract. This function will revert if contract balance is zero.






## Events

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

### AllowlistMintStageUpdated

```solidity
event AllowlistMintStageUpdated(uint256 indexed tokenId, uint256 indexed allowlistStageId, AllowlistMintStage data)
```



*Emit an event when allowlist mint stage configuration is updated.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| allowlistStageId `indexed` | uint256 | undefined |
| data  | AllowlistMintStage | undefined |

### ApprovalForAll

```solidity
event ApprovalForAll(address indexed account, address indexed operator, bool approved)
```



*Emitted when `account` grants or revokes permission to `operator` to transfer their tokens, according to `approved`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| account `indexed` | address | undefined |
| operator `indexed` | address | undefined |
| approved  | bool | undefined |

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
event MaxSupplyUpdated(uint256 indexed tokenId, uint256 indexed maxSupply)
```



*Emit an event when max supply of the token is updated.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| maxSupply `indexed` | uint256 | undefined |

### Minted

```solidity
event Minted(address indexed recipient, uint256 indexed tokenId, uint256 indexed quantity, uint256 stageIndex)
```



*Emit an event when token is minted.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| recipient `indexed` | address | undefined |
| tokenId `indexed` | uint256 | undefined |
| quantity `indexed` | uint256 | undefined |
| stageIndex  | uint256 | undefined |

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

### PlatformFeesUpdated

```solidity
event PlatformFeesUpdated(address indexed platformFeesAddress, uint256 indexed platformFeesNumerator)
```



*Emit an event when platform fees are updated.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| platformFeesAddress `indexed` | address | undefined |
| platformFeesNumerator `indexed` | uint256 | undefined |

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
event PublicMintStageUpdated(uint256 indexed tokenId, PublicMintStage data)
```



*Emit an event when public mint stage configuration is updated.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
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
event TokenGatedMintStageUpdated(uint256 indexed tokenId, address indexed nftContract, TokenGatedMintStage data)
```



*Emit an event when token gated mint stage configuration is updated for NFT contract.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| nftContract `indexed` | address | undefined |
| data  | TokenGatedMintStage | undefined |

### TokenURIUpdated

```solidity
event TokenURIUpdated(uint256 indexed tokenId, string tokenURI)
```



*Emit an event when base URI of the collection is updated.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| tokenURI  | string | undefined |

### TransferBatch

```solidity
event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values)
```



*Equivalent to multiple {TransferSingle} events, where `operator`, `from` and `to` are the same for all transfers.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| operator `indexed` | address | undefined |
| from `indexed` | address | undefined |
| to `indexed` | address | undefined |
| ids  | uint256[] | undefined |
| values  | uint256[] | undefined |

### TransferSingle

```solidity
event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)
```



*Emitted when `value` tokens of token type `id` are transferred from `from` to `to` by `operator`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| operator `indexed` | address | undefined |
| from `indexed` | address | undefined |
| to `indexed` | address | undefined |
| id  | uint256 | undefined |
| value  | uint256 | undefined |

### URI

```solidity
event URI(string value, uint256 indexed id)
```



*Emitted when the URI for token type `id` changes to `value`, if it is a non-programmatic URI. If an {URI} event was emitted for `id`, the standard https://eips.ethereum.org/EIPS/eip-1155#metadata-extensions[guarantees] that `value` will equal the value returned by {IERC1155MetadataURI-uri}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| value  | string | undefined |
| id `indexed` | uint256 | undefined |



## Errors

### AllowlistStageInvalidProof

```solidity
error AllowlistStageInvalidProof()
```



*Revert if supplied merkle proof is not valid for allowlist mint stage.*


### BurnAmountExceedsTotalSupply

```solidity
error BurnAmountExceedsTotalSupply()
```



*Revert if burn amount exceeds total supply.*


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


### InvalidPayoutAddress

```solidity
error InvalidPayoutAddress()
```



*Revert if the payout address is zero address.*


### InvalidPlatformFeesAddress

```solidity
error InvalidPlatformFeesAddress()
```



*Revert if the platform fees address is zero address.*


### InvalidTokenId

```solidity
error InvalidTokenId(uint256 tokenId)
```



*Revert if invalid token is provided.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |

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


### NothingToWithdraw

```solidity
error NothingToWithdraw()
```



*Revert if the contract balance is zero when withdrawing funds.*


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


### PayoutTransferFailed

```solidity
error PayoutTransferFailed()
```



*Revert if the payout transfer fails.*


### PlatformFeesAddressCannotBeZeroAddress

```solidity
error PlatformFeesAddressCannotBeZeroAddress()
```



*Revert if platform fees address is zero address when updating platform fees.*


### PlatformFeesNumeratorTooHigh

```solidity
error PlatformFeesNumeratorTooHigh()
```



*Revert if the new platform fees numerator exceeds the maximum allowed value.*


### PlatformFeesTransferFailed

```solidity
error PlatformFeesTransferFailed()
```



*Revert if the platform fees transfer fails.*


### ProvenanceHashCannotBeUpdatedAfterMintStarted

```solidity
error ProvenanceHashCannotBeUpdatedAfterMintStarted()
```



*Revert if provenance hash is being updated after tokens have been minted.*


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


### TokenGatedTokenAlreadyRedeemed

```solidity
error TokenGatedTokenAlreadyRedeemed()
```



*Revert if token id is already redeemed for token gated mint stage.*



