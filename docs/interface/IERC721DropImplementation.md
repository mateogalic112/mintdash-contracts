# IERC721DropImplementation









## Methods

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

### amountMinted

```solidity
function amountMinted(address user) external view returns (uint64)
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

### burn

```solidity
function burn(uint256 tokenId) external nonpayable
```

Burns a token.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | Id of the token to burn. |

### mintAllowlist

```solidity
function mintAllowlist(uint256 quantity, bytes32[] merkleProof) external payable
```

Mint an allowlist stage.



#### Parameters

| Name | Type | Description |
|---|---|---|
| quantity | uint256 | Number of tokens to mint. |
| merkleProof | bytes32[] | Valid Merkle proof. |

### mintPublic

```solidity
function mintPublic(uint256 quantity) external payable
```

Mint a public stage.



#### Parameters

| Name | Type | Description |
|---|---|---|
| quantity | uint256 | Number of tokens to mint. |

### updateAllowlistMintStage

```solidity
function updateAllowlistMintStage(AllowlistMintStage allowlistMintStageData) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
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

### updateProvenanceHash

```solidity
function updateProvenanceHash(bytes32 newProvenanceHash) external nonpayable
```

Updated provenance hash. This function will revert after the first item has been minted.



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

### withdrawAllFunds

```solidity
function withdrawAllFunds() external nonpayable
```

Withdraws all funds from the contract. This function will revert if contract balance is zero.






## Events

### AllowlistMintStageUpdated

```solidity
event AllowlistMintStageUpdated(AllowlistMintStage indexed data)
```



*Emit an event when allowlist mint stage configuration is updated.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| data `indexed` | AllowlistMintStage | undefined |

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
event PublicMintStageUpdated(PublicMintStage indexed data)
```



*Emit an event when public mint stage configuration is updated.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| data `indexed` | PublicMintStage | undefined |

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



## Errors

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



*Revert if the payout address is zero address*


### InvalidProof

```solidity
error InvalidProof()
```



*Revert if supplied merkle proof is not valid for allowlist mint.*


### MintQuantityExceedsMaxSupply

```solidity
error MintQuantityExceedsMaxSupply()
```



*Revert if mint quantity exceeds max supply of the collection.*


### MintQuantityExceedsWalletLimit

```solidity
error MintQuantityExceedsWalletLimit()
```



*Revert if mint quantity exceeds wallet limit for the mint stage.*


### NothingToWithdraw

```solidity
error NothingToWithdraw()
```



*Revert if the contract balance is zero when withdrawing funds*


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


