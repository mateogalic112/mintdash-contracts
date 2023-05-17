# IERC721DropImplementation









## Methods

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

### updateAllowlistMintStage

```solidity
function updateAllowlistMintStage(uint256 allowlistStageId, AllowlistMintStage allowlistMintStageData) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| allowlistStageId | uint256 | undefined |
| allowlistMintStageData | AllowlistMintStage | undefined |

### updateConfiguration

```solidity
function updateConfiguration(IERC721DropImplementation.MultiConfig config) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| config | IERC721DropImplementation.MultiConfig | undefined |

### updatePublicMintStage

```solidity
function updatePublicMintStage(PublicMintStage publicMintStageData) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| publicMintStageData | PublicMintStage | undefined |

### updateTokenGatedMintStage

```solidity
function updateTokenGatedMintStage(address nftContract, TokenGatedMintStage tokenGatedMintStageData) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| nftContract | address | undefined |
| tokenGatedMintStageData | TokenGatedMintStage | undefined |



## Events

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

### PublicMintStageUpdated

```solidity
event PublicMintStageUpdated(PublicMintStage data)
```



*Emit an event when public mint stage configuration is updated.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| data  | PublicMintStage | undefined |

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



