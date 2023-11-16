# ERC721CollectionImplementation









## Methods

### administrator

```solidity
function administrator() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### approve

```solidity
function approve(address to, uint256 tokenId) external nonpayable
```



*See {IERC721-approve}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| to | address | undefined |
| tokenId | uint256 | undefined |

### balanceOf

```solidity
function balanceOf(address owner) external view returns (uint256)
```



*See {IERC721-balanceOf}.*

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

Base URI of the collection. Defaults to ipfs://




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### batchMint

```solidity
function batchMint(string[] tokenCIDs) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenCIDs | string[] | undefined |

### burn

```solidity
function burn(uint256 tokenId) external nonpayable
```



*Burns `tokenId`. See {ERC721-_burn}. Requirements: - The caller must own `tokenId` or be an approved operator.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |

### getApproved

```solidity
function getApproved(uint256 tokenId) external view returns (address)
```



*See {IERC721-getApproved}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### initialize

```solidity
function initialize(string name, string symbol, address _administrator) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| name | string | undefined |
| symbol | string | undefined |
| _administrator | address | undefined |

### isApprovedForAll

```solidity
function isApprovedForAll(address owner, address operator) external view returns (bool)
```



*See {IERC721-isApprovedForAll}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| owner | address | undefined |
| operator | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### latestTokenId

```solidity
function latestTokenId() external view returns (uint256)
```

The tokenId of the most recently minted NFT.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### mint

```solidity
function mint(string tokenCID) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenCID | string | undefined |

### name

```solidity
function name() external view returns (string)
```



*See {IERC721Metadata-name}.*


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

### ownerOf

```solidity
function ownerOf(uint256 tokenId) external view returns (address)
```



*See {IERC721-ownerOf}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

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
function safeTransferFrom(address from, address to, uint256 tokenId) external nonpayable
```



*See {IERC721-safeTransferFrom}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address | undefined |
| to | address | undefined |
| tokenId | uint256 | undefined |

### safeTransferFrom

```solidity
function safeTransferFrom(address from, address to, uint256 tokenId, bytes data) external nonpayable
```



*See {IERC721-safeTransferFrom}.*

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



*See {IERC721-setApprovalForAll}.*

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



*See {IERC721Metadata-symbol}.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### tokenURI

```solidity
function tokenURI(uint256 tokenId) external view returns (string)
```



*See {IERC721Metadata-tokenURI}.*

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
function totalSupply() external view returns (uint256 supply)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| supply | uint256 | undefined |

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
function transferFrom(address from, address to, uint256 tokenId) external nonpayable
```



*See {IERC721-transferFrom}.*

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

### updateBaseURI

```solidity
function updateBaseURI(string newUri) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| newUri | string | undefined |

### updateRoyalties

```solidity
function updateRoyalties(address receiver, uint96 feeNumerator) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| receiver | address | undefined |
| feeNumerator | uint96 | undefined |



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
event BaseURIUpdated(string baseURI)
```



*Emit an event when base URI of the collection is updated.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| baseURI  | string | undefined |

### BatchMinted

```solidity
event BatchMinted(uint256 indexed startTokenId, uint256 indexed endTokenId, address indexed creator, string[] tokenCIDs)
```

Emitted when batch of NFTs is minted



#### Parameters

| Name | Type | Description |
|---|---|---|
| startTokenId `indexed` | uint256 | The tokenId of the first minted NFT in the batch |
| endTokenId `indexed` | uint256 | The tokenId of the last minted NFT in the batch |
| creator `indexed` | address | The address of the token creator |
| tokenCIDs  | string[] | Token CIDs |

### Initialized

```solidity
event Initialized(uint8 version)
```



*Triggered when the contract has been initialized or reinitialized.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| version  | uint8 | undefined |

### Minted

```solidity
event Minted(address indexed creator, uint256 indexed tokenId, string tokenCID)
```

Emitted when token is created



#### Parameters

| Name | Type | Description |
|---|---|---|
| creator `indexed` | address | The address of the token creator |
| tokenId `indexed` | uint256 | The tokenId of the newly minted NFT. |
| tokenCID  | string | Token CID |

### OwnershipTransferred

```solidity
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| previousOwner `indexed` | address | undefined |
| newOwner `indexed` | address | undefined |

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

### CallerNotTokenOwner

```solidity
error CallerNotTokenOwner()
```






### InvalidAdministratorAddress

```solidity
error InvalidAdministratorAddress()
```






### OnlyAdministrator

```solidity
error OnlyAdministrator()
```






### OnlyOwnerOrAdministrator

```solidity
error OnlyOwnerOrAdministrator()
```






### URIQueryForNonexistentToken

```solidity
error URIQueryForNonexistentToken()
```







