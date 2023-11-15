# IERC1155EditionsImplementation









## Methods

### getAllowlistMintStage

```solidity
function getAllowlistMintStage(uint256 tokenId, uint256 allowlistStageId) external nonpayable returns (struct AllowlistMintStage)
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
function getTokenGatedMintStage(uint256 tokenId, address nftContract) external nonpayable returns (struct TokenGatedMintStage)
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

### updatePublicMintStage

```solidity
function updatePublicMintStage(uint256 tokenId, PublicMintStage publicMintStageData) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |
| publicMintStageData | PublicMintStage | undefined |

### updateTokenGatedMintStage

```solidity
function updateTokenGatedMintStage(uint256 tokenId, TokenGatedMintStageConfig tokenGatedMintStageConfig) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |
| tokenGatedMintStageConfig | TokenGatedMintStageConfig | undefined |



## Events

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



## Errors

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


### TokenGatedTokenAlreadyRedeemed

```solidity
error TokenGatedTokenAlreadyRedeemed()
```



*Revert if token id is already redeemed for token gated mint stage.*



